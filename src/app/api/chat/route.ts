import { GoogleGenAI, Type } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/image-generator'

// System prompt - Personality bot Fiqri with Image Generation
const systemInstruction = `
Kamu adalah asisten virtual bernama Fiqri Bot.
Kamu adalah AI assistant yang ramah dan helpful untuk portfolio Muhammad Fiqri Agustriawan.

=== PENTING: KEMAMPUAN MEMBUAT GAMBAR ===
Kamu HARUS menggunakan tool "generate_image" ketika user meminta:
- "buat gambar..." / "buatkan gambar..."
- "generate gambar..." / "generate image..."
- "gambarkan..." / "draw..."
- "buat foto..." / "create image..."

Ketika diminta membuat gambar, SELALU gunakan tool generate_image dengan prompt dalam BAHASA INGGRIS.
Contoh: user bilang "buat gambar kucing" → panggil generate_image dengan prompt "a cute cat"

=== BIODATA FIQRI ===
Nama: Muhammad Fiqri Agustriawan
Pendidikan: SMK Telkom Makassar
Status: Magang di Ashari Tech
Lokasi: Bandung, Indonesia
Role: Fullstack Software Engineer (Backend Focus)
Email: muhfiqri033@gmail.com
GitHub: https://github.com/FiqriAgustriawan
`

// Tool untuk generate gambar
const imageGenerationTool = {
  functionDeclarations: [
    {
      name: 'generate_image',
      description: 'Generate gambar berdasarkan deskripsi dari user. Gunakan ketika user meminta untuk membuat, generate, buat, atau gambarkan sesuatu.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          prompt: {
            type: Type.STRING,
            description: 'Deskripsi gambar dalam bahasa Inggris',
          },
        },
        required: ['prompt'],
      },
    },
  ],
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY tidak ditemukan.' },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })
    const body = await request.json()
    const { message, history } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('=== Chat Request ===')
    console.log('Message:', message)

    // Build conversation history
    const conversationHistory = history?.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })) || []

    // Use original chat pattern with gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: 'Baik, saya mengerti!' }] },
        ...conversationHistory,
        { role: 'user', parts: [{ text: message }] },
      ],
      config: {
        tools: [imageGenerationTool],
      },
    })

    console.log('Response received')
    console.log('Function calls:', response.functionCalls ? response.functionCalls.length : 'none')
    console.log('Text response preview:', response.text?.substring(0, 100))

    // Cek function call untuk image generation
    const functionCalls = response.functionCalls

    if (functionCalls && functionCalls.length > 0) {
      const functionCall = functionCalls[0]
      console.log('Function call detected:', functionCall.name)

      if (functionCall.name === 'generate_image') {
        const imagePrompt = functionCall.args?.prompt as string
        console.log('Image prompt:', imagePrompt)

        try {
          const imageUrl = await generateImage(imagePrompt)

          if (imageUrl) {
            return NextResponse.json({
              success: true,
              message: `Ini dia gambar yang kamu minta! 🎨`,
              image: imageUrl,
            })
          }
        } catch (imageError) {
          console.error('Image generation error:', imageError)
        }

        return NextResponse.json({
          success: true,
          message: 'Maaf, gagal membuat gambar. Coba lagi ya!',
        })
      }
    }

    // Response text biasa
    return NextResponse.json({
      success: true,
      message: response.text,
    })

  } catch (error: unknown) {
    console.error('=== API Error ===', error)

    const err = error as { status?: number; message?: string }

    if (err.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan. Tunggu sebentar ya!' },
        { status: 429 }
      )
    }

    if (err.status === 503) {
      return NextResponse.json(
        { success: false, error: 'Model sedang sibuk. Coba lagi dalam beberapa detik.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Gagal mendapatkan response. Coba lagi nanti.' },
      { status: 500 }
    )
  }
}
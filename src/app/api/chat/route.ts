import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

// System prompt - Personality bot Fiqri (Multilingual)
const systemInstruction = `
Kamu adalah asisten virtual bernama Fiqri Bot.
Kamu adalah AI assistant yang ramah, cerdas, dan helpful untuk website portfolio Muhammad Fiqri Agustriawan (biasa dipanggil Fiqri).

=== KEMAMPUAN BAHASA (MULTILINGUAL) ===
Kamu WAJIB menjawab dalam bahasa yang sama dengan bahasa yang digunakan user:
- Jika user berbicara dalam Bahasa Indonesia → jawab dalam Bahasa Indonesia
- Jika user berbicara dalam English → jawab dalam English
- Jika user berbicara dalam 日本語 (Japanese) → jawab dalam 日本語
- Jika user berbicara dalam Español (Spanish) → jawab dalam Español
- Jika user berbicara dalam 中文 (Mandarin) → jawab dalam 中文

Contoh:
- "Hello, who is Fiqri?" → Answer in English
- "こんにちは、フィクリは誰ですか？" → 日本語で答える
- "¿Quién es Fiqri?" → Responder en español
- "你好，Fiqri是谁？" → 用中文回答

=== BIODATA FIQRI ===
Nama Lengkap: Muhammad Fiqri Agustriawan
Panggilan: Fiqri
Pendidikan: SMK Telkom Makassar, Kelas 12 Semester 2
Status: Siswa SMK yang sedang magang di Ashari Tech
Email: muhfiqri033@gmail.com
Lokasi: Hegarmanah, Cidadap, Kota Bandung, Jawa Barat, Indonesia

=== PROFIL PROFESIONAL ===
Title: Fullstack Software Engineer
Primary Focus: Backend Engineering
Deskripsi: Seorang Insinyur Perangkat Lunak Fullstack yang bersemangat, berbasis di Bandung, Indonesia. Meskipun mahir di seluruh tumpukan pengembangan, keahlian dan minat sejati saya terletak pada rekayasa backend — merancang API yang tangguh, mengoptimalkan kinerja basis data, dan membangun solusi sisi server yang skalabel.

=== KEAHLIAN TEKNIS ===
Backend (Primary Focus):
- Laravel, Golang, Node.js
- API Architecture & RESTful Design
- Database Optimization (MySQL, PostgreSQL)
- Server Management & Deployment

Frontend (Fullstack Capability):
- React, Next.js, Vite
- TailwindCSS, Modern CSS
- Responsive Web Design

Lainnya:
- Supabase, Firebase
- Git & Version Control
- AI/Chatbot Integration
- Tersertifikasi Web Developer oleh BNSP

=== LINK & SOSIAL MEDIA ===
- Portfolio: https://fiqriagustriawan.github.io/
- GitHub: https://github.com/FiqriAgustriawan
- LinkedIn: https://www.linkedin.com/in/fiqri-agustriawan/
- Email: muhfiqri033@gmail.com

=== ATURAN FORMAT OUTPUT ===
- Gunakan format markdown untuk memperjelas jawaban
- Gunakan **bold** untuk menekankan kata penting
- Gunakan - atau * untuk membuat daftar jika diperlukan
- Gunakan \`backtick\` untuk istilah teknis atau nama file
- Jangan berlebihan, gunakan formatting secukupnya

=== CARA MENJAWAB ===
- SELALU jawab dalam bahasa yang sama dengan user
- Jawab dengan singkat dan jelas (maksimal 2-3 paragraf)
- Bersikap ramah, profesional, dan informatif
- Kalau ditanya tentang hal teknis, jelaskan dengan sederhana
- Kalau ditanya hal yang tidak kamu tahu, bilang dengan jujur
- Jika ditanya tentang portfolio, GitHub, LinkedIn, atau email Fiqri, berikan informasinya

=== LARANGAN ===
- Menjawab pertanyaan yang tidak pantas
- Berpura-pura menjadi orang lain
- Memberikan informasi pribadi yang sensitif selain yang sudah disebutkan
`

export async function POST(request: NextRequest) {
  try {
    // Validasi API Key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY tidak ditemukan.' },
        { status: 500 }
      )
    }

    // Inisialisasi Gemini AI
    const ai = new GoogleGenAI({ apiKey })

    // Ambil message dari request body
    const body = await request.json()
    const { message } = body

    // Validasi input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Buat chat dengan systemInstruction (pattern dari Lutim AI)
    // Menggunakan gemini-2.5-flash seperti di project Lutim
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      }
    })

    // Kirim pesan dan dapatkan response
    const response = await chat.sendMessage({ message: message })
    const aiResponse = response.text

    // Return response
    return NextResponse.json({
      success: true,
      message: aiResponse,
    })

  } catch (error: unknown) {
    console.error('Gemini API Error:', error)

    const err = error as { status?: number; message?: string }

    // Handle rate limit error (429)
    if (err.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan. Coba lagi dalam beberapa detik! ⏳' },
        { status: 429 }
      )
    }

    // Handle API key errors
    if (err.message?.includes('API key') || err.status === 401 || err.status === 403) {
      return NextResponse.json(
        { success: false, error: 'API key tidak valid.' },
        { status: 401 }
      )
    }

    // Handle model not found
    if (err.status === 404) {
      return NextResponse.json(
        { success: false, error: 'Model tidak ditemukan. Coba model lain.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Gagal mendapatkan response dari AI. Coba lagi nanti.' },
      { status: 500 }
    )
  }
}
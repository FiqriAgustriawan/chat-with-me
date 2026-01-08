/**
 * Image Generator using Pollinations AI
 * Uses correct image.pollinations.ai endpoint
 */

/**
 * Generate image using Pollinations AI and return as base64
 * @param prompt - Image description in English
 * @returns Base64 data URL of the generated image
 */
export async function generateImage(prompt: string): Promise<string | null> {
  try {
    console.log('=== Image Generation Started ===')
    console.log('Prompt:', prompt)

    // Correct Pollinations Image API URL
    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true`

    console.log('Fetching image from:', imageUrl)

    // Fetch the image with longer timeout for generation
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'image/*',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error('Image fetch failed:', response.status, response.statusText)
      return null
    }

    // Get content type
    const contentType = response.headers.get('content-type') || ''
    console.log('Content-Type:', contentType)

    // Get image as blob
    const blob = await response.blob()
    console.log('Blob received, size:', blob.size, 'type:', blob.type)

    // Check if it's actually an image
    if (!blob.type.startsWith('image/') && !contentType.startsWith('image/')) {
      console.error('Response is not an image. Content-Type:', contentType, 'Blob type:', blob.type)
      return null
    }

    // Convert blob to base64
    const buffer = await blob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = blob.type || contentType || 'image/png'
    const dataUrl = `data:${mimeType};base64,${base64}`

    console.log('SUCCESS! Image converted to base64, size:', dataUrl.length)
    return dataUrl

  } catch (error) {
    console.error('=== Image Generation Error ===')
    console.error('Error:', error)
    return null
  }
}
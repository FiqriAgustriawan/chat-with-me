// Respons matematika/aritmatika untuk chatbot

export const mathKeywords = [
  'calculate', 'hitung', 'math', 'matematika', 'plus', 'minus',
  'tambah', 'kurang', 'kali', 'bagi', 'multiply', 'divide',
  '+', '-', '*', '/', '=', 'berapa', 'hasil',
]

// Parser matematika sederhana
export const calculateMath = (input: string): string | null => {
  // Bersihkan input
  const cleanInput = input.toLowerCase()
    .replace(/calculate|hitung|what is|berapa|math|hasil|sama dengan/gi, '')
    .replace(/tambah|plus|add/gi, '+')
    .replace(/kurang|minus|subtract/gi, '-')
    .replace(/kali|times|multiply|x/gi, '*')
    .replace(/bagi|divide|divided by/gi, '/')
    .replace(/[^0-9+\-*/.()\s]/g, '')
    .trim()

  if (!cleanInput || !/[0-9]/.test(cleanInput)) {
    return null
  }

  try {
    // Hanya izinkan operasi matematika yang aman
    if (!/^[0-9+\-*/.()\s]+$/.test(cleanInput)) {
      return null
    }
    
    // Gunakan Function constructor untuk evaluasi yang aman
    const result = Function(`"use strict"; return (${cleanInput})`)()
    
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return `Hasil dari ${cleanInput} adalah ${result}`
    }
    return null
  } catch {
    return null
  }
}

export const mathResponses = [
  'Saya bisa bantu hitung! Coba ketik seperti "hitung 5 + 3" atau "10 kali 2".',
  'Butuh bantuan matematika? Coba tanya saya, contoh: "berapa 5 + 5" atau "100 bagi 4".',
  'Mau hitung apa? Ketik seperti "hitung 20 tambah 30" atau "50 kurang 15".',
]

// Fakta matematika
export const mathFactKeywords = [
  'math fact', 'fakta matematika', 'fun fact math', 'fakta math',
]

export const mathFacts = [
  'Tahukah kamu? Angka nol tidak bisa ditulis dalam angka Romawi.',
  'Fakta menarik: 111,111,111 x 111,111,111 = 12,345,678,987,654,321',
  'Fakta matematika: "Googol" adalah angka 1 diikuti 100 nol.',
  'Tahukah kamu? Angka 4 adalah satu-satunya angka yang jumlah hurufnya sama dengan nilainya (dalam bahasa Inggris: four = 4 huruf).',
  'Fakta unik: Jika kamu melipat kertas 42 kali, tebalnya akan mencapai bulan!',
]

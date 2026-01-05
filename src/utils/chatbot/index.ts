// Prosesor utama chatbot - menggabungkan semua handler keyword

import { greetingKeywords, greetingResponses, farewellKeywords, farewellResponses } from './greetings'
import { aboutKeywords, aboutResponses, skillsKeywords, skillsResponses, contactKeywords, contactResponses, projectKeywords, projectResponses } from './personal'
import { weatherKeywords, weatherResponses, getTimeResponse, timeKeywords, thankKeywords, thankResponses, helpKeywords, helpResponses, jokeKeywords, jokeResponses, statusKeywords, statusResponses } from './general'
import { mathKeywords, calculateMath, mathResponses, mathFactKeywords, mathFacts } from './math'

// Helper: ambil item random dari array
const getRandomResponse = (responses: string[]): string => {
  return responses[Math.floor(Math.random() * responses.length)]
}

// Helper: cek apakah input mengandung keyword
const containsKeyword = (input: string, keywords: string[]): boolean => {
  const lowerInput = input.toLowerCase()
  return keywords.some(keyword => lowerInput.includes(keyword.toLowerCase()))
}

// Respons default jika tidak ada keyword yang cocok
const defaultResponses = [
  'Hmm, saya kurang mengerti. Bisa diulangi dengan kata lain?',
  'Menarik! Ceritakan lebih lanjut atau coba tanya tentang skills, proyek, atau latar belakang saya.',
  'Saya tidak terlalu paham. Kamu bisa tanya tentang skills Fiqri, proyek, atau info kontak.',
  'Maaf, saya tidak yakin bagaimana merespons itu. Coba tanya hal lain!',
  'Bisa dijelaskan lebih detail? Saya bisa bantu info tentang Fiqri, kalkulasi, atau ngobrol santai.',
  'Hmm, coba tanya yang lain ya. Misalnya tentang skills, proyek, atau mau ngobrol santai.',
]

// Fungsi prosesor utama
export const processMessage = (input: string): string => {
  const trimmedInput = input.trim()
  
  if (!trimmedInput) {
    return 'Ketik pesan ya!'
  }

  // Cek kalkulasi matematika terlebih dahulu (handling khusus)
  if (containsKeyword(trimmedInput, mathKeywords)) {
    const mathResult = calculateMath(trimmedInput)
    if (mathResult) {
      return mathResult
    }
    // Jika tidak ada kalkulasi valid, beri bantuan math
    return getRandomResponse(mathResponses)
  }

  // Cek fakta matematika
  if (containsKeyword(trimmedInput, mathFactKeywords)) {
    return getRandomResponse(mathFacts)
  }

  // Cek waktu (respons dinamis)
  if (containsKeyword(trimmedInput, timeKeywords)) {
    return getTimeResponse()
  }

  // Cek status/kabar
  if (containsKeyword(trimmedInput, statusKeywords)) {
    return getRandomResponse(statusResponses)
  }

  // Cek sapaan
  if (containsKeyword(trimmedInput, greetingKeywords)) {
    return getRandomResponse(greetingResponses)
  }

  // Cek perpisahan
  if (containsKeyword(trimmedInput, farewellKeywords)) {
    return getRandomResponse(farewellResponses)
  }

  // Cek tentang/perkenalan
  if (containsKeyword(trimmedInput, aboutKeywords)) {
    return getRandomResponse(aboutResponses)
  }

  // Cek skills
  if (containsKeyword(trimmedInput, skillsKeywords)) {
    return getRandomResponse(skillsResponses)
  }

  // Cek info kontak
  if (containsKeyword(trimmedInput, contactKeywords)) {
    return getRandomResponse(contactResponses)
  }

  // Cek proyek
  if (containsKeyword(trimmedInput, projectKeywords)) {
    return getRandomResponse(projectResponses)
  }

  // Cek cuaca
  if (containsKeyword(trimmedInput, weatherKeywords)) {
    return getRandomResponse(weatherResponses)
  }

  // Cek terima kasih
  if (containsKeyword(trimmedInput, thankKeywords)) {
    return getRandomResponse(thankResponses)
  }

  // Cek bantuan
  if (containsKeyword(trimmedInput, helpKeywords)) {
    return getRandomResponse(helpResponses)
  }

  // Cek lelucon
  if (containsKeyword(trimmedInput, jokeKeywords)) {
    return getRandomResponse(jokeResponses)
  }

  // Respons default
  return getRandomResponse(defaultResponses)
}

// Export semua modul untuk akses langsung jika diperlukan
export * from './data'
export * from './greetings'
export * from './personal'
export * from './general'
export * from './math'

// Respons info pribadi untuk chatbot

import { personalData, aboutMe } from './data'

export const aboutKeywords = [
  'who are you', 'siapa kamu', 'about you', 'tentang kamu',
  'introduce yourself', 'perkenalkan diri', 'tell me about yourself',
  'ceritakan tentang dirimu', 'who is fiqri', 'siapa fiqri',
  'kamu siapa', 'ini siapa', 'perkenalan', 'kenalan',
]

export const aboutResponses = [
  aboutMe,
  `Saya ${personalData.name}, seorang ${personalData.role} dari ${personalData.location}. Saya suka membangun aplikasi web!`,
  `Nama saya ${personalData.name}. Saat ini saya ${personalData.status} sekaligus ${personalData.role}, sangat tertarik dalam menciptakan pengalaman digital yang keren.`,
  `Perkenalkan, saya ${personalData.nickname}! Seorang ${personalData.role} yang fokus di pengembangan web modern.`,
]

export const skillsKeywords = [
  'skills', 'keahlian', 'kemampuan', 'what can you do',
  'apa yang bisa kamu lakukan', 'technologies', 'teknologi',
  'programming', 'coding', 'tech stack', 'bisa apa',
  'jago apa', 'skill', 'abilities',
]

export const skillsResponses = [
  `Skill saya meliputi: ${personalData.skills.join(', ')}. Saya selalu belajar teknologi baru!`,
  `Saya bekerja dengan ${personalData.skills.slice(0, 3).join(', ')} dan teknologi web modern lainnya.`,
  `Sebagai developer, saya menguasai ${personalData.skills.join(', ')}.`,
  `Keahlian utama saya adalah ${personalData.skills.slice(0, 4).join(', ')}. Selalu semangat untuk terus berkembang!`,
]

export const contactKeywords = [
  'contact', 'kontak', 'hubungi', 'email', 'reach',
  'how to contact', 'bagaimana menghubungi', 'social media',
  'sosmed', 'dm', 'chat', 'kenalan lebih lanjut',
]

export const contactResponses = [
  `Kamu bisa menghubungi saya melalui:\n- GitHub: ${personalData.github}\n- Portfolio: ${personalData.portfolio}`,
  `Silakan connect dengan saya di GitHub: ${personalData.github}`,
  `Cek portfolio saya di ${personalData.portfolio} untuk info lebih lanjut!`,
  `Mau lebih kenal? Kunjungi portfolio saya di ${personalData.portfolio} atau GitHub saya!`,
]

export const projectKeywords = [
  'project', 'proyek', 'portfolio', 'work', 'karya',
  'what have you built', 'apa yang sudah kamu buat',
  'hasil kerja', 'contoh', 'bikin apa', 'buat apa',
]

export const projectResponses = [
  `Kamu bisa lihat proyek dan portfolio saya di ${personalData.portfolio}. Saya fokus membangun aplikasi web menggunakan React dan Next.js.`,
  `Saya sudah mengerjakan berbagai proyek web development. Cek di ${personalData.github}!`,
  'Saya fokus membangun aplikasi web yang modern dan responsif. Kunjungi portfolio saya untuk detail lebih lanjut!',
  `Beberapa proyek saya bisa dilihat di GitHub: ${personalData.github}. Kebanyakan menggunakan React dan Next.js.`,
]

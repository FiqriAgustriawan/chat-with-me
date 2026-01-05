// Respons topik umum untuk chatbot

// Respons cuaca
export const weatherKeywords = [
  'weather', 'cuaca', 'rain', 'hujan', 'sunny', 'cerah',
  'how is the weather', 'bagaimana cuaca', 'is it raining',
  'mendung', 'panas', 'dingin', 'gerimis',
]

export const weatherResponses = [
  'Cuaca hari ini terlihat bagus! Cocok untuk coding.',
  'Sepertinya cerah dan menyenangkan. Hari yang baik untuk produktif!',
  'Cuacanya lumayan nih. Semoga harimu menyenangkan!',
  'Semoga cuaca di tempatmu baik-baik saja hari ini!',
  'Entah hujan atau cerah, yang penting semangat ngoding!',
]

// Respons waktu
export const timeKeywords = [
  'time', 'waktu', 'jam berapa', 'what time', 'tanggal',
  'date', 'hari ini', 'today', 'sekarang jam',
]

export const getTimeResponse = (): string => {
  const now = new Date()
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  return `Sekarang jam ${time}, hari ${date}. Ada yang bisa saya bantu?`
}

// Respons terima kasih
export const thankKeywords = [
  'thank', 'thanks', 'terima kasih', 'makasih', 'thx', 'ty',
  'appreciate', 'grateful', 'tengkyu', 'tks', 'trims',
]

export const thankResponses = [
  'Sama-sama! Senang bisa membantu.',
  'Tidak masalah! Tanya lagi kalau ada yang diperlukan.',
  'Senang bisa membantu! Jangan sungkan untuk bertanya lagi.',
  'Dengan senang hati! Ada lagi yang ingin ditanyakan?',
  'Oke, sama-sama! Semoga bermanfaat ya.',
]

// Respons bantuan
export const helpKeywords = [
  'help', 'bantuan', 'tolong', 'assist', 'guide',
  'what can you do', 'apa yang bisa kamu lakukan', 'how to use',
  'cara pakai', 'bisa apa aja', 'fitur',
]

export const helpResponses = [
  'Saya bisa membantu kamu dengan:\n- Informasi tentang Fiqri\n- Skills dan teknologi\n- Info kontak\n- Kalkulasi sederhana\n- Obrolan umum',
  'Tanya saja tentang latar belakang Fiqri, skills, proyek, atau sekadar ngobrol santai!',
  'Saya di sini untuk memberikan info tentang portfolio ini. Tanya tentang skills, proyek, atau cara menghubungi Fiqri.',
  'Mau tanya apa? Bisa tentang profil, kemampuan, proyek, atau mau ngobrol santai juga boleh!',
]

// Respons lelucon
export const jokeKeywords = [
  'joke', 'funny', 'humor', 'lucu', 'lelucon', 'bercanda',
  'make me laugh', 'tell me a joke', 'jokes', 'lawak',
]

export const jokeResponses = [
  'Kenapa programmer suka dark mode? Karena terang menarik bugs!',
  'Kenapa developer bangkrut? Karena dia kehabisan cache.',
  'SQL statement masuk ke bar, menghampiri dua table dan bertanya "Boleh saya join?"',
  'Ada 10 jenis orang di dunia: yang mengerti binary dan yang tidak.',
  '!false - Lucu karena itu true.',
  'Programmer itu seperti koki. Bedanya, kalau masakan gagal, dia console.log("kenapa sih?").',
]

// Respons status
export const statusKeywords = [
  'how are you', 'apa kabar', 'gimana', 'baik baik',
  'kabar', 'sehat', 'kondisi',
]

export const statusResponses = [
  'Saya baik-baik saja! Terima kasih sudah bertanya. Kamu sendiri gimana?',
  'Alhamdulillah baik! Siap membantu kamu hari ini.',
  'Saya selalu siap! Ada yang bisa saya bantu?',
  'Baik dong! Semoga kamu juga baik-baik saja.',
]

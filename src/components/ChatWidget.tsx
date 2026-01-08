'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'

// ==================== TypeScript Declarations ====================
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance
}

// ==================== Component Types ====================
interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isVoiceInput?: boolean
  isLiked?: boolean
  isSaved?: boolean
  image?: string  // For AI-generated images
}

interface ChatWidgetProps {
  isDarkMode: boolean
}

// ==================== Language Config ====================
const languages = [
  { code: 'id-ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
]

// ==================== Utilities ====================
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const STORAGE_KEY = 'fiqri_chat_messages'
const SAVED_KEY = 'fiqri_saved_messages'
const LANG_KEY = 'fiqri_chat_lang'

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
}

// ==================== Main Component ====================
export default function ChatWidget({ isDarkMode }: ChatWidgetProps) {
  // UI States
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [selectedLang, setSelectedLang] = useState(languages[0])
  const [savedMessages, setSavedMessages] = useState<Message[]>([])
  const [showSaved, setShowSaved] = useState(false)

  // Image Features States
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<{ url: string, prompt: string, timestamp: Date }[]>([])
  const [showGallery, setShowGallery] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  // Voice States
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingId, setSpeakingId] = useState<number | null>(null)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [ttsSupported, setTtsSupported] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const pendingVoiceMessageRef = useRef<string>('')

  // ==================== Initialize Speech APIs ====================
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Load saved language
    const savedLang = localStorage.getItem(LANG_KEY)
    if (savedLang) {
      const lang = languages.find(l => l.code === savedLang)
      if (lang) setSelectedLang(lang)
    }

    // Load saved messages
    const savedMsgs = localStorage.getItem(SAVED_KEY)
    if (savedMsgs) {
      setSavedMessages(JSON.parse(savedMsgs).map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })))
    }

    // Check Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setSpeechSupported(!!SpeechRecognition)

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = selectedLang.code

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        pendingVoiceMessageRef.current = transcript
      }

      recognition.onerror = () => setIsListening(false)

      recognition.onend = () => {
        setIsListening(false)
        if (pendingVoiceMessageRef.current) {
          const voiceText = pendingVoiceMessageRef.current
          pendingVoiceMessageRef.current = ''
          handleVoiceSend(voiceText)
        }
      }

      recognitionRef.current = recognition
    }

    setTtsSupported('speechSynthesis' in window)
    audioRef.current = new Audio('/notification.mp3')
    audioRef.current.volume = 0.5
  }, [])

  // Update recognition language when changed
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLang.code
    }
    localStorage.setItem(LANG_KEY, selectedLang.code)
  }, [selectedLang])

  // ==================== Load/Save Messages ====================
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved).map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
      setMessages(parsed)
    } else {
      setMessages([{
        id: 1,
        text: 'Hello! Welcome to my portfolio. How can I help you today? 😊',
        sender: 'bot',
        timestamp: new Date(),
      }])
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  // Save saved messages
  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedMessages))
  }, [savedMessages])

  // ==================== UI Effects ====================
  useEffect(() => { scrollToBottom() }, [messages, isTyping])
  useEffect(() => { if (isOpen) setHasNewMessage(false) }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopSpeaking()
        if (showSaved) setShowSaved(false)
        else if (isMaximized) setIsMaximized(false)
        else if (isOpen) setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, isMaximized, showSaved])

  // ==================== Handlers ====================
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
    }
  }

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  const playNotification = useCallback(() => {
    audioRef.current?.play().catch(() => { })
  }, [])

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // ==================== Like & Save ====================
  const toggleLike = (id: number) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, isLiked: !msg.isLiked } : msg
    ))
  }

  const toggleSave = (msg: Message) => {
    const exists = savedMessages.some(m => m.id === msg.id)
    if (exists) {
      setSavedMessages(prev => prev.filter(m => m.id !== msg.id))
      setMessages(prev => prev.map(m =>
        m.id === msg.id ? { ...m, isSaved: false } : m
      ))
    } else {
      setSavedMessages(prev => [...prev, { ...msg, isSaved: true }])
      setMessages(prev => prev.map(m =>
        m.id === msg.id ? { ...m, isSaved: true } : m
      ))
    }
  }

  // ==================== Text-to-Speech ====================
  const speakText = useCallback((text: string, messageId?: number) => {
    if (!ttsSupported) return
    window.speechSynthesis.cancel()

    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/#/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = selectedLang.code
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
      if (messageId) setSpeakingId(messageId)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setSpeakingId(null)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setSpeakingId(null)
    }

    window.speechSynthesis.speak(utterance)
  }, [ttsSupported, selectedLang])

  const stopSpeaking = useCallback(() => {
    if (ttsSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setSpeakingId(null)
    }
  }, [ttsSupported])

  // ==================== Voice Input ====================
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.lang = selectedLang.code
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // ==================== Send Message ====================
  const sendMessage = async (text: string, fromVoice: boolean = false) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      isVoiceInput: fromVoice,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      })

      const data = await response.json()
      setIsTyping(false)

      const botResponse = data.success ? data.message : data.error || 'Sorry, an error occurred.'

      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        image: data.image || undefined,  // Include generated image if present
      }

      setMessages(prev => [...prev, botMessage])
      playNotification()
      if (!isOpen) setHasNewMessage(true)

      // Only speak text response if no image (image responses are short)
      if (fromVoice && ttsSupported && !data.image) {
        setTimeout(() => speakText(botResponse, botMessage.id), 500)
      }

    } catch {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'Sorry, failed to connect to server.',
        sender: 'bot',
        timestamp: new Date(),
      }])
    }
  }

  const handleVoiceSend = (text: string) => sendMessage(text, true)
  const handleTextSend = () => sendMessage(inputValue, false)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextSend()
    }
  }

  const clearChat = () => {
    stopSpeaking()
    setMessages([{
      id: Date.now(),
      text: 'Chat cleared. How can I help you? 😊',
      sender: 'bot',
      timestamp: new Date(),
    }])
    localStorage.removeItem(STORAGE_KEY)
  }

  // ==================== Image Features ====================
  const downloadImage = (imageUrl: string) => {
    // Create download link
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `fiqri-bot-image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareImage = async (imageUrl: string) => {
    // Convert base64 to blob for sharing
    try {
      // For base64 images, convert to file and share
      if (imageUrl.startsWith('data:')) {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const file = new File([blob], 'fiqri-bot-image.png', { type: 'image/png' })

        // Try native share with file (mobile)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Image from Fiqri Bot',
            text: 'Check out this AI-generated image!',
            files: [file],
          })
          return
        }
      }

      // Fallback: download the image
      downloadImage(imageUrl)
    } catch (error) {
      console.error('Share failed:', error)
      // Final fallback: download
      downloadImage(imageUrl)
    }
  }

  const addToGallery = (url: string, prompt: string) => {
    // Check if already in gallery
    const exists = generatedImages.some(img => img.url === url)
    if (!exists) {
      setGeneratedImages(prev => [...prev, { url, prompt, timestamp: new Date() }])
      // Show brief notification
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 1500)
    }
  }

  // ==================== Render ====================
  return (
    <>
      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage}
                alt="Full size image"
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                style={{ minWidth: '200px', minHeight: '200px', backgroundColor: '#1a1a1a' }}
              />

              {/* Lightbox Action Buttons */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
                <button
                  onClick={() => downloadImage(lightboxImage)}
                  className="p-2 text-white hover:text-blue-400 transition-colors"
                  title="Download"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={() => shareImage(lightboxImage)}
                  className="p-2 text-white hover:text-green-400 transition-colors"
                  title="Share"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button
                  onClick={() => window.open(lightboxImage, '_blank')}
                  className="p-2 text-white hover:text-purple-400 transition-colors"
                  title="Open in new tab"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setShowGallery(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden ${isDarkMode ? 'bg-neutral-900' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gallery Header */}
              <div className={`p-4 border-b ${isDarkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                    🖼️ Image Gallery ({generatedImages.length})
                  </h3>
                  <button
                    onClick={() => setShowGallery(false)}
                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Gallery Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                {generatedImages.length === 0 ? (
                  <div className={`text-center py-12 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No images saved yet</p>
                    <p className="text-sm mt-1">Click "Gallery" button on generated images to save them here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {generatedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.url}
                          alt={img.prompt}
                          className={`w-full aspect-square object-cover rounded-xl cursor-pointer ${isDarkMode ? 'border border-neutral-700' : 'border border-neutral-200'}`}
                          onClick={() => { setLightboxImage(img.url); setShowGallery(false) }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                          <button
                            onClick={() => downloadImage(img.url)}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setGeneratedImages(prev => prev.filter((_, i) => i !== index))}
                            className="p-2 bg-red-500/80 rounded-lg hover:bg-red-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && isMaximized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            onClick={() => setIsMaximized(false)}
          />
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={springTransition}
            layout
            className={`fixed z-50 flex flex-col overflow-hidden border shadow-2xl
              ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'}
              ${isMaximized
                ? 'inset-4 md:inset-8 lg:inset-12 rounded-2xl'
                : 'inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[420px] md:h-[600px] md:rounded-2xl'
              }`}
          >
            {/* Header */}
            <div className={`p-4 flex justify-between items-center border-b shrink-0
              ${isDarkMode ? 'border-neutral-800 bg-neutral-900/95' : 'border-neutral-100 bg-white/95'}
              backdrop-blur-xl`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => isMaximized ? setIsMaximized(false) : setIsOpen(false)}
                  className={`md:hidden p-2 -ml-1 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="relative">
                  <div className={`w-11 h-11 rounded-full overflow-hidden border-2 ${isDarkMode ? 'border-neutral-600' : 'border-neutral-200'}`}>
                    <Image src="/profile_chatbot.png" alt="Fiqri Bot" width={44} height={44} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-green-500'} ${isDarkMode ? 'border-neutral-900' : 'border-white'}`} />
                </div>

                <div>
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Fiqri Bot</span>
                  <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {isTyping ? 'Typing...' : isSpeaking ? 'Speaking...' : 'Online'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">

                {/* Image Gallery */}
                <button
                  onClick={() => setShowGallery(true)}
                  className={`p-2.5 rounded-xl transition-colors relative ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
                  title="Image Gallery"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {generatedImages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[10px] rounded-full flex items-center justify-center">{generatedImages.length}</span>
                  )}
                </button>

                {/* Saved Messages */}
                <button
                  onClick={() => setShowSaved(!showSaved)}
                  className={`p-2.5 rounded-xl transition-colors relative ${showSaved ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-500') : (isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100')}`}
                  title="Saved Messages"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${showSaved ? 'text-white' : (isDarkMode ? 'text-neutral-400' : 'text-neutral-500')}`} fill={showSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {savedMessages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center">{savedMessages.length}</span>
                  )}
                </button>

                {/* Stop Speaking */}
                {isSpeaking && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={stopSpeaking}
                    className="p-2.5 rounded-xl bg-red-500 text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                  </motion.button>
                )}

                {/* Clear */}
                <button onClick={clearChat} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Maximize */}
                <button onClick={() => setIsMaximized(!isMaximized)} className={`hidden md:flex p-2.5 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMaximized
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v5m0-5h5M15 9l5-5m0 0v5m0-5h-5M9 15l-5 5m0 0v-5m0 5h5M15 15l5 5m0 0v-5m0 5h-5" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    }
                  </svg>
                </button>

                {/* Close */}
                <button onClick={() => { setIsOpen(false); setIsMaximized(false); stopSpeaking() }} className={`hidden md:flex p-2.5 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-neutral-950' : 'bg-gradient-to-b from-neutral-50 to-white'}`}
            >
              {/* Saved Messages View */}
              {showSaved ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      Saved Messages ({savedMessages.length})
                    </h3>
                    <button onClick={() => setShowSaved(false)} className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      Back to Chat
                    </button>
                  </div>
                  {savedMessages.length === 0 ? (
                    <p className={`text-center py-8 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      No saved messages yet
                    </p>
                  ) : (
                    savedMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl ${isDarkMode ? 'bg-neutral-800' : 'bg-white border border-neutral-200'}`}
                      >
                        <p className={`text-sm ${isDarkMode ? 'text-neutral-100' : 'text-neutral-800'}`}>{msg.text}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            {formatTime(msg.timestamp)}
                          </span>
                          <button
                            onClick={() => toggleSave(msg)}
                            className="text-red-500 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <>
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={springTransition}
                        className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 ${isDarkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                          <Image
                            src={msg.sender === 'user' ? '/profile_user.jpg' : '/profile_chatbot.png'}
                            alt={msg.sender === 'user' ? 'You' : 'Bot'}
                            width={32} height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="max-w-[80%] group">
                          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed relative shadow-sm
                            ${msg.sender === 'user'
                              ? isDarkMode
                                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                                : 'bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-br-md'
                              : isDarkMode
                                ? 'bg-neutral-800 text-neutral-100 rounded-bl-md border border-neutral-700'
                                : 'bg-white text-neutral-800 rounded-bl-md border border-neutral-200 shadow-md'
                            }`}
                          >
                            {msg.sender === 'bot' ? (
                              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                              </div>
                            ) : msg.text}

                            {/* Generated Image with Actions */}
                            {msg.image && (
                              <div className="mt-3">
                                <div className="relative group/img">
                                  <img
                                    src={msg.image}
                                    alt="Generated image"
                                    className={`rounded-xl max-w-full cursor-pointer hover:opacity-95 transition-all border-2 ${isDarkMode ? 'border-neutral-600' : 'border-neutral-300'}`}
                                    style={{ maxHeight: '280px', objectFit: 'contain' }}
                                    onClick={() => setLightboxImage(msg.image || null)}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      if (!target.src.includes('retry=')) {
                                        target.src = msg.image + (msg.image?.includes('?') ? '&' : '?') + 'retry=1'
                                      }
                                    }}
                                    loading="lazy"
                                  />

                                  {/* Image Action Buttons */}
                                  <div className={`flex gap-1 mt-2 flex-wrap`}>
                                    {/* Zoom/Lightbox */}
                                    <button
                                      onClick={() => setLightboxImage(msg.image || null)}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'}`}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                      </svg>
                                      Zoom
                                    </button>

                                    {/* Download */}
                                    <button
                                      onClick={() => downloadImage(msg.image!)}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'}`}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      Download
                                    </button>

                                    {/* Share/Copy URL */}
                                    <button
                                      onClick={() => shareImage(msg.image!)}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'}`}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                      </svg>
                                      {copiedUrl ? 'Copied!' : 'Share'}
                                    </button>

                                    {/* Save to Gallery */}
                                    <button
                                      onClick={() => addToGallery(msg.image!, msg.text)}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      Gallery
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions for bot messages - always visible on mobile, hover effect on desktop */}
                          {msg.sender === 'bot' && (
                            <div className="flex items-center gap-1 mt-1.5 opacity-70 hover:opacity-100 transition-opacity">
                              {/* Like */}
                              <button
                                onClick={() => toggleLike(msg.id)}
                                className={`p-1.5 rounded-lg transition-colors ${msg.isLiked ? 'text-red-500' : (isDarkMode ? 'text-neutral-500 hover:text-red-400' : 'text-neutral-400 hover:text-red-500')}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={msg.isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>

                              {/* Save */}
                              <button
                                onClick={() => toggleSave(msg)}
                                className={`p-1.5 rounded-lg transition-colors ${msg.isSaved ? 'text-blue-500' : (isDarkMode ? 'text-neutral-500 hover:text-blue-400' : 'text-neutral-400 hover:text-blue-500')}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={msg.isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              </button>

                              {/* Speak */}
                              {ttsSupported && (
                                <button
                                  onClick={() => speakingId === msg.id ? stopSpeaking() : speakText(msg.text, msg.id)}
                                  className={`p-1.5 rounded-lg transition-colors ${speakingId === msg.id ? 'text-blue-500' : (isDarkMode ? 'text-neutral-500 hover:text-blue-400' : 'text-neutral-400 hover:text-blue-500')}`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                  </svg>
                                </button>
                              )}

                              {/* Copy */}
                              <button
                                onClick={() => copyToClipboard(msg.text, msg.id)}
                                className={`p-1.5 rounded-lg transition-colors ${copiedId === msg.id ? 'text-green-500' : (isDarkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600')}`}
                              >
                                {copiedId === msg.id ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </button>

                              <span className={`text-[10px] ml-1 ${isDarkMode ? 'text-neutral-600' : 'text-neutral-400'}`}>
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          )}

                          {msg.sender === 'user' && (
                            <p className={`text-[10px] mt-1 text-right ${isDarkMode ? 'text-neutral-600' : 'text-neutral-400'}`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2.5">
                        <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${isDarkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                          <Image src="/profile_chatbot.png" alt="Bot" width={32} height={32} className="w-full h-full object-cover" />
                        </div>
                        <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${isDarkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-200 shadow-md'}`}>
                          <div className="flex items-center gap-1.5">
                            {[0, 1, 2].map((i) => (
                              <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-neutral-500' : 'bg-neutral-400'}`} />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll button */}
            <AnimatePresence>
              {showScrollButton && !showSaved && (
                <motion.button initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} onClick={scrollToBottom}
                  className={`absolute bottom-24 left-1/2 -translate-x-1/2 p-2.5 rounded-full shadow-lg z-10 ${isDarkMode ? 'bg-neutral-800 text-white border border-neutral-700' : 'bg-white text-neutral-900 border border-neutral-200'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Input Area */}
            {!showSaved && (
              <div className={`p-4 border-t shrink-0 ${isDarkMode ? 'border-neutral-800 bg-neutral-900/95' : 'border-neutral-100 bg-white/95'} backdrop-blur-xl`}>
                {isListening && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 flex items-center justify-center gap-2 text-sm">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className={isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}>Listening in {selectedLang.name}...</span>
                  </motion.div>
                )}

                <div className="flex gap-2 items-center">
                  {/* Language Selector - in input area */}
                  <div className="relative">
                    <button
                      onClick={() => setShowLangMenu(!showLangMenu)}
                      className={`p-3 rounded-xl transition-colors ${showLangMenu ? (isDarkMode ? 'bg-neutral-700' : 'bg-neutral-200') : (isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200')}`}
                      title="Change Language"
                    >
                      <span className="text-lg">{selectedLang.flag}</span>
                    </button>

                    <AnimatePresence>
                      {showLangMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute bottom-full left-0 mb-2 p-2 rounded-xl min-w-[160px] ${isDarkMode ? 'bg-neutral-800 border border-neutral-600' : 'bg-white border border-neutral-300'}`}
                          style={{ boxShadow: '0 -10px 40px rgba(0,0,0,0.3)' }}
                        >
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => { setSelectedLang(lang); setShowLangMenu(false) }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${selectedLang.code === lang.code ? (isDarkMode ? 'bg-neutral-700' : 'bg-neutral-100') : (isDarkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-50')}`}
                            >
                              <span className="text-lg">{lang.flag}</span>
                              <span style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{lang.name}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {speechSupported && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleVoiceInput}
                      className={`p-3 rounded-xl transition-all ${isListening
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                        : isDarkMode
                          ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </motion.button>
                  )}

                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={isListening ? 'Listening...' : 'Type a message...'}
                    disabled={isListening}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm border-2 focus:outline-none transition-all disabled:opacity-50
                      ${isDarkMode
                        ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-neutral-600'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-300'
                      }`}
                  />

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleTextSend}
                    disabled={!inputValue.trim() || isListening}
                    className={`p-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed
                      ${isDarkMode
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-br from-neutral-800 to-neutral-900 text-white'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={springTransition}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center z-50
          ${isOpen ? 'md:flex hidden' : 'flex'}
          ${isDarkMode
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
            : 'bg-gradient-to-br from-neutral-800 to-neutral-900 text-white'
          }`}
      >
        {hasNewMessage && !isOpen && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">!</motion.span>
        )}

        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </motion.button>
    </>
  )
}

// Global declarations
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}
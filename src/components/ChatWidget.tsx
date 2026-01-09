'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
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

// ==================== Image Generation Config ====================
const stylePresets = [
  { id: 'realistic', name: 'Realistic Photo', icon: 'camera', prompt: 'ultra realistic photo, 8k, professional photography' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: 'lightning', prompt: 'cyberpunk style, neon lights, futuristic, dark atmosphere' },
  { id: 'ghibli', name: 'Ghibli Anime', icon: 'sparkles', prompt: 'studio ghibli style, anime art, soft colors, whimsical' },
  { id: '3d', name: '3D Render', icon: 'cube', prompt: 'pixar style, 3d render, octane render, high quality' },
  { id: 'oil', name: 'Oil Painting', icon: 'brush', prompt: 'oil painting style, classical art, brush strokes, masterpiece' },
  { id: 'retro', name: 'Retro 80s', icon: 'film', prompt: 'retro 80s style, synthwave, vaporwave, vintage aesthetic' },
]

const aspectRatios = [
  { id: 'square', name: 'Square', ratio: '1:1', width: 1024, height: 1024, icon: 'square', desc: 'Instagram Post' },
  { id: 'portrait', name: 'Portrait', ratio: '9:16', width: 768, height: 1344, icon: 'phone', desc: 'Story/TikTok' },
  { id: 'landscape', name: 'Landscape', ratio: '16:9', width: 1344, height: 768, icon: 'monitor', desc: 'Wallpaper PC' },
  { id: 'wide', name: 'Ultrawide', ratio: '21:9', width: 1680, height: 720, icon: 'film', desc: 'Cinematic' },
]

const magicPrompts = [
  { text: 'Kucing lucu', icon: 'sparkles', enhanced: 'buatkan gambar kucing lucu dengan mata besar, berbulu halus, duduk di jendela dengan cahaya matahari terbenam' },
  { text: 'Galaxy wallpaper', icon: 'star', enhanced: 'generate stunning galaxy wallpaper with purple nebula, millions of stars, cosmic dust, vibrant colors' },
  { text: 'Kastil di bukit', icon: 'home', enhanced: 'buatkan gambar kastil megah di atas bukit hijau dengan langit dramatis, awan berarak, suasana fantasi epik' },
  { text: 'Robot futuristik', icon: 'chip', enhanced: 'buatkan gambar robot futuristik yang ramah, desain sleek metalik, mata LED biru, latar belakang kota masa depan' },
  { text: 'Taman Jepang', icon: 'flower', enhanced: 'buatkan gambar taman jepang tradisional dengan bunga sakura mekar, kolam koi, jembatan kayu, suasana damai' },
  { text: 'Naga mistis', icon: 'fire', enhanced: 'buatkan gambar naga mistis terbang di atas pegunungan, dengan sisik berkilau, napas api, langit senja' },
]

// ==================== Utilities ====================
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// Icon renderer for Image Generation Panel
const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
  const icons: Record<string, React.ReactNode> = {
    camera: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    lightning: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    sparkles: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    cube: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    brush: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    film: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
    square: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
      </svg>
    ),
    phone: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    monitor: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    star: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    home: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    chip: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    flower: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    fire: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  }
  return icons[iconName] || <span className={className}></span>
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

  // Image Editor States
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [imageFilters, setImageFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Image Generation Panel States
  const [showImagePanel, setShowImagePanel] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState(stylePresets[0])
  const [selectedRatio, setSelectedRatio] = useState(aspectRatios[0])
  const [imagePrompt, setImagePrompt] = useState('')

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
    const exists = generatedImages.some(img => img.url === url)
    if (!exists) {
      setGeneratedImages(prev => [...prev, { url, prompt, timestamp: new Date() }])
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 1500)
    }
  }

  // ==================== Image Editor Functions ====================
  const openImageEditor = (imageUrl: string) => {
    setEditingImage(imageUrl)
    setImageFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
    })
    setShowImageEditor(true)
    setLightboxImage(null)
  }

  const getFilterString = () => {
    return `brightness(${imageFilters.brightness}%) contrast(${imageFilters.contrast}%) saturate(${imageFilters.saturation}%) blur(${imageFilters.blur}px) grayscale(${imageFilters.grayscale}%) sepia(${imageFilters.sepia}%) hue-rotate(${imageFilters.hueRotate}deg)`
  }

  const resetFilters = () => {
    setImageFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
    })
  }

  const downloadEditedImage = async () => {
    if (!editingImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.filter = getFilterString()
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `edited-image-${Date.now()}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    }
    img.src = editingImage
  }

  // ==================== Generate Styled Image ====================
  const generateStyledImage = () => {
    if (!imagePrompt.trim()) return

    // Combine prompt with style and send as chat message
    const enhancedPrompt = `buatkan gambar: ${imagePrompt}, ${selectedStyle.prompt}, aspect ratio ${selectedRatio.ratio}, width:${selectedRatio.width}, height:${selectedRatio.height}`

    sendMessage(enhancedPrompt, false)
    setImagePrompt('')
    setShowImagePanel(false)
  }

  const applyMagicPrompt = (enhanced: string) => {
    setImagePrompt(enhanced)
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
                <button
                  onClick={() => openImageEditor(lightboxImage)}
                  className="p-2 text-white hover:text-yellow-400 transition-colors"
                  title="Edit Image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

      {/* Image Editor Modal */}
      <AnimatePresence>
        {showImageEditor && editingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-4"
          >
            {/* Hidden canvas for export */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-semibold">🖌️ Image Editor</h2>
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 text-sm"
                >
                  Reset
                </button>
                <button
                  onClick={downloadEditedImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => setShowImageEditor(false)}
                  className="p-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Preview and Controls */}
            <div className="flex-1 flex gap-4 overflow-hidden">
              {/* Image Preview */}
              <div className="flex-1 flex items-center justify-center bg-neutral-900 rounded-xl overflow-hidden">
                <img
                  src={editingImage}
                  alt="Editing"
                  className="max-w-full max-h-full object-contain"
                  style={{ filter: getFilterString() }}
                />
              </div>

              {/* Filter Controls */}
              <div className="w-72 bg-neutral-800 rounded-xl p-4 space-y-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <h3 className="text-white font-semibold mb-4">Adjustments</h3>

                {/* Brightness */}
                <div>
                  <div className="flex justify-between text-sm text-neutral-300 mb-1">
                    <span>☀️ Brightness</span>
                    <span>{imageFilters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={imageFilters.brightness}
                    onChange={(e) => setImageFilters(prev => ({ ...prev, brightness: +e.target.value }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex justify-between text-sm text-neutral-300 mb-1">
                    <span>◐ Contrast</span>
                    <span>{imageFilters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={imageFilters.contrast}
                    onChange={(e) => setImageFilters(prev => ({ ...prev, contrast: +e.target.value }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex justify-between text-sm text-neutral-300 mb-1">
                    <span>🎨 Saturation</span>
                    <span>{imageFilters.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={imageFilters.saturation}
                    onChange={(e) => setImageFilters(prev => ({ ...prev, saturation: +e.target.value }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Blur */}
                <div>
                  <div className="flex justify-between text-sm text-neutral-300 mb-1">
                    <span>💨 Blur</span>
                    <span>{imageFilters.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={imageFilters.blur}
                    onChange={(e) => setImageFilters(prev => ({ ...prev, blur: +e.target.value }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Grayscale */}
                <div>
                  <div className="flex justify-between text-sm text-neutral-300 mb-1">
                    <span>⬛ Grayscale</span>
                    <span>{imageFilters.grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imageFilters.grayscale}
                    onChange={(e) => setImageFilters(prev => ({ ...prev, grayscale: +e.target.value }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Sepia */}
                <div>
                  <div className="flex justify-between text-sm text-neutral-300 mb-1">
                    <span>🟤 Sepia</span>
                    <span>{imageFilters.sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imageFilters.sepia}
                    onChange={(e) => setImageFilters(prev => ({ ...prev, sepia: +e.target.value }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Hue Rotate */}
                <div>
                  <div className="flex justify-between text-sm text-neutral-300 mb-1">
                    <span>🌈 Hue Rotate</span>
                    <span>{imageFilters.hueRotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={imageFilters.hueRotate}
                    onChange={(e) => setImageFilters(prev => ({ ...prev, hueRotate: +e.target.value }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Presets */}
                <div className="pt-4 border-t border-neutral-700">
                  <h4 className="text-white text-sm font-semibold mb-3">Quick Presets</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setImageFilters({ ...imageFilters, grayscale: 100, saturation: 0 })}
                      className="px-3 py-2 bg-neutral-700 text-white text-xs rounded-lg hover:bg-neutral-600"
                    >
                      B&W
                    </button>
                    <button
                      onClick={() => setImageFilters({ ...imageFilters, sepia: 80, saturation: 120 })}
                      className="px-3 py-2 bg-neutral-700 text-white text-xs rounded-lg hover:bg-neutral-600"
                    >
                      Vintage
                    </button>
                    <button
                      onClick={() => setImageFilters({ ...imageFilters, contrast: 150, saturation: 130 })}
                      className="px-3 py-2 bg-neutral-700 text-white text-xs rounded-lg hover:bg-neutral-600"
                    >
                      Vivid
                    </button>
                    <button
                      onClick={() => setImageFilters({ ...imageFilters, brightness: 110, contrast: 90, saturation: 80 })}
                      className="px-3 py-2 bg-neutral-700 text-white text-xs rounded-lg hover:bg-neutral-600"
                    >
                      Soft
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Generation Panel Modal */}
      <AnimatePresence>
        {showImagePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setShowImagePanel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`relative w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden ${isDarkMode ? 'bg-neutral-900' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Header */}
              <div className={`p-4 border-b ${isDarkMode ? 'border-neutral-700' : 'border-neutral-200'} flex items-center justify-between`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                  🎨 AI Image Generator
                </h3>
                <button
                  onClick={() => setShowImagePanel(false)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]" style={{ scrollbarWidth: 'none' }}>
                {/* Magic Prompts */}
                <div className="mb-6">
                  <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                    {renderIcon('sparkles', 'w-4 h-4')}
                    Magic Prompts
                    <span className={`text-xs font-normal ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>(Klik untuk menggunakan)</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {magicPrompts.map((mp, i) => (
                      <button
                        key={i}
                        onClick={() => applyMagicPrompt(mp.enhanced)}
                        className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${isDarkMode
                          ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800'
                          }`}
                      >
                        {renderIcon(mp.icon, 'w-4 h-4')}
                        {mp.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Presets */}
                <div className="mb-6">
                  <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                    {renderIcon('brush', 'w-4 h-4')}
                    Style Presets
                  </h4>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {stylePresets.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${selectedStyle.id === style.id
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                          : isDarkMode
                            ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                      >
                        <span className="w-8 h-8">{renderIcon(style.icon, 'w-8 h-8')}</span>
                        <span className="text-xs text-center font-medium">{style.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="mb-6">
                  <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                    {renderIcon('square', 'w-4 h-4')}
                    Aspect Ratio
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => setSelectedRatio(ratio)}
                        className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${selectedRatio.id === ratio.id
                          ? 'bg-green-600 text-white ring-2 ring-green-400'
                          : isDarkMode
                            ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                      >
                        <span className="w-6 h-6">{renderIcon(ratio.icon, 'w-6 h-6')}</span>
                        <span className="text-sm font-semibold">{ratio.name}</span>
                        <span className={`text-xs ${selectedRatio.id === ratio.id ? 'text-green-200' : isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          {ratio.ratio} • {ratio.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Input */}
                <div className="mb-4">
                  <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Deskripsi Gambar
                  </h4>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Deskripsikan gambar yang ingin dibuat... (contoh: seekor naga terbang di atas pegunungan saat matahari terbenam)"
                    className={`w-full p-4 rounded-xl resize-none h-24 ${isDarkMode
                      ? 'bg-neutral-800 text-white placeholder-neutral-500 border-neutral-700'
                      : 'bg-neutral-100 text-neutral-800 placeholder-neutral-400 border-neutral-200'
                      } border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  />
                </div>

                {/* Selected Summary */}
                <div className={`p-3 rounded-xl mb-4 ${isDarkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'}`}>
                  <p className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    <span className="font-semibold">Style:</span>
                    <span className="inline-flex w-4 h-4">{renderIcon(selectedStyle.icon, 'w-4 h-4')}</span>
                    {selectedStyle.name} •
                    <span className="font-semibold ml-2">Size:</span>
                    <span className="inline-flex w-4 h-4">{renderIcon(selectedRatio.icon, 'w-4 h-4')}</span>
                    {selectedRatio.width}x{selectedRatio.height}
                  </p>
                </div>
              </div>

              {/* Generate Button */}
              <div className={`p-4 border-t ${isDarkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                <button
                  onClick={generateStyledImage}
                  disabled={!imagePrompt.trim()}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${imagePrompt.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg'
                    : isDarkMode
                      ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                      : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Image
                </button>
              </div>
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

                {/* AI Image Generator */}
                <button
                  onClick={() => setShowImagePanel(true)}
                  className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
                  title="AI Image Generator"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </button>

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
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
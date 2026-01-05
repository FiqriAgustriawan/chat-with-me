'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { processMessage } from '@/utils/chatbot'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatWidgetProps {
  isDarkMode: boolean
}

// Format timestamp
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Local storage key
const STORAGE_KEY = 'fiqri_chat_messages'

export default function ChatWidget({ isDarkMode }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY)
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages).map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
      setMessages(parsed)
    } else {
      const welcomeMessage: Message = {
        id: 1,
        text: 'Halo! Selamat datang di portfolio saya. Ada yang bisa saya bantu?',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }

    audioRef.current = new Audio('/notification.mp3')
    audioRef.current.volume = 0.5
  }, [])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  // Auto scroll
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Reset notification when opened
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false)
    }
  }, [isOpen])

  // Handle scroll to show/hide scroll button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollButton(false)
  }

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => { })
    }
  }

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const userInput = inputValue
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const botReply = processMessage(userInput)
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botReply,
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])

      if (!isOpen) {
        playNotificationSound()
        setHasNewMessage(true)
      } else {
        playNotificationSound()
      }
    }, 800 + Math.random() * 700)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    const welcomeMessage: Message = {
      id: Date.now(),
      text: 'Chat dibersihkan. Ada yang bisa saya bantu?',
      sender: 'bot',
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <>
      {/* Chat Window - Fullscreen on mobile, popup on desktop */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-out flex flex-col overflow-hidden
          ${isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }
          ${isDarkMode
            ? 'bg-neutral-900'
            : 'bg-white'
          }
          /* Mobile: Fullscreen */
          inset-0
          /* Desktop: Popup */
          md:inset-auto md:bottom-20 md:right-5 md:w-[380px] md:h-[520px] md:rounded-xl md:border md:shadow-2xl
          ${isDarkMode ? 'md:border-neutral-800' : 'md:border-neutral-200'}
        `}
      >
        {/* Header */}
        <div
          className={`p-4 flex justify-between items-center border-b shrink-0 ${isDarkMode ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-white'
            }`}
        >
          <div className="flex items-center gap-3">
            {/* Back button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className={`md:hidden p-1.5 -ml-1 rounded-md transition-colors ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full overflow-hidden border ${isDarkMode ? 'border-neutral-700' : 'border-neutral-200'
                  }`}
              >
                <Image
                  src="/profile_chatbot.png"
                  alt="Fiqri Bot"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 ${isDarkMode ? 'border-neutral-900' : 'border-white'
                  }`}
              ></div>
            </div>
            <div>
              <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                Fiqri Bot
              </span>
              <p className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                {isTyping ? 'Mengetik...' : 'Online'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className={`p-2 rounded-md transition-colors ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
                }`}
              title="Hapus chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            {/* Close button - desktop only */}
            <button
              onClick={() => setIsOpen(false)}
              className={`hidden md:block p-2 rounded-md transition-colors ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto p-4 space-y-4 relative ${isDarkMode ? 'bg-neutral-950' : 'bg-neutral-50'
            }`}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border ${isDarkMode ? 'border-neutral-700' : 'border-neutral-200'
                  }`}
              >
                <Image
                  src={msg.sender === 'user' ? '/profile_user.jpg' : '/profile_chatbot.png'}
                  alt={msg.sender === 'user' ? 'You' : 'Bot'}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Message */}
              <div className={`max-w-[75%] md:max-w-[70%]`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                      ? isDarkMode
                        ? 'bg-white text-black rounded-br-sm'
                        : 'bg-neutral-900 text-white rounded-br-sm'
                      : isDarkMode
                        ? 'bg-neutral-800 text-neutral-200 rounded-bl-sm'
                        : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-sm'
                    }`}
                >
                  {msg.text}
                </div>
                <p
                  className={`text-[10px] mt-1 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'
                    } ${isDarkMode ? 'text-neutral-600' : 'text-neutral-400'}`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5">
              <div
                className={`w-8 h-8 rounded-full overflow-hidden border ${isDarkMode ? 'border-neutral-700' : 'border-neutral-200'
                  }`}
              >
                <Image
                  src="/profile_chatbot.png"
                  alt="Bot"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`px-4 py-3 rounded-2xl rounded-bl-sm ${isDarkMode ? 'bg-neutral-800' : 'bg-white border border-neutral-200'
                  }`}
              >
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] ${isDarkMode ? 'bg-neutral-500' : 'bg-neutral-400'}`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${isDarkMode ? 'bg-neutral-500' : 'bg-neutral-400'}`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-neutral-500' : 'bg-neutral-400'}`}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className={`absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 p-2 rounded-full shadow-lg transition-all z-10 ${isDarkMode
                ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                : 'bg-white text-neutral-900 hover:bg-neutral-100 border border-neutral-200'
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}

        {/* Input */}
        <div
          className={`p-3 md:p-4 border-t shrink-0 ${isDarkMode ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-white'
            }`}
        >
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ketik pesan..."
              className={`flex-1 px-4 py-3 rounded-full text-sm border focus:outline-none focus:ring-2 transition-colors ${isDarkMode
                  ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:ring-neutral-600'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:ring-neutral-300'
                }`}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`p-3 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isDarkMode
                  ? 'bg-white text-black hover:bg-neutral-200'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button - Hidden when chat is open on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-5 right-5 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-50 ${isOpen ? 'md:flex hidden' : 'flex'
          } ${isDarkMode
            ? 'bg-white text-black hover:bg-neutral-200'
            : 'bg-neutral-900 text-white hover:bg-neutral-800'
          }`}
      >
        {hasNewMessage && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
            !
          </span>
        )}

        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </>
  )
}
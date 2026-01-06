'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Portfolio from '../components/Portfolio'
import ChatWidget from '../components/ChatWidget'

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isHogwartsMode, setIsHogwartsMode] = useState(false)

  // Load preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const savedMode = localStorage.getItem('hogwartsMode')

    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(prefersDark)
    }

    if (savedMode) {
      setIsHogwartsMode(savedMode === 'true')
    }
  }, [])

  // Save preferences
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    localStorage.setItem('hogwartsMode', isHogwartsMode.toString())
  }, [isHogwartsMode])

  return (
    <>
      <Portfolio isDarkMode={isDarkMode} isHogwartsMode={isHogwartsMode} />
      <ChatWidget isDarkMode={isDarkMode} />

      {/* Top Right Controls - z-40 so it doesn't block chat header */}
      <div className="fixed top-5 right-5 flex items-center gap-2 z-40">
        {/* Mode Toggle - Shows destination icon */}
        <button
          onClick={() => setIsHogwartsMode(!isHogwartsMode)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all overflow-hidden ${isHogwartsMode
            ? isDarkMode
              ? 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700'
              : 'bg-white border border-neutral-200 hover:bg-neutral-100 shadow-sm'
            : 'bg-[#1a472a] border-2 border-[#2a623d] shadow-lg shadow-green-900/30'
            }`}
          title={isHogwartsMode ? 'Switch to Professional Mode' : 'Switch to Hogwarts Mode'}
        >
          {isHogwartsMode ? (
            // Show briefcase icon (go to Professional)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ) : (
            // Show Hogwarts logo (go to Hogwarts)
            <Image
              src="/logo_hogwarts.png"
              alt="Hogwarts"
              width={26}
              height={26}
              className="object-contain"
            />
          )}
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${isDarkMode
            ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
            : 'bg-white text-neutral-900 hover:bg-neutral-100 border border-neutral-200 shadow-sm'
            }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface PortfolioProps {
  isDarkMode: boolean
  isHogwartsMode: boolean
}

// Slytherin color palette
const slytherinColors = {
  primary: '#1a472a',
  secondary: '#2a623d',
  silver: '#aaaaaa',
}

// Skills data - Professional
const professionalSkills = {
  backend: ['Laravel', 'Golang', 'Node.js', 'MySQL', 'PostgreSQL', 'API Design'],
  frontend: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Vite'],
  tools: ['Git', 'Supabase', 'Firebase', 'Docker', 'Linux'],
}

// Skills data - Hogwarts (Spells)
const magicalSkills = {
  defensive: [
    { name: 'Expecto Patronum', desc: 'Summons a Patronus' },
    { name: 'Protego', desc: 'Shield Charm' },
    { name: 'Expelliarmus', desc: 'Disarming Charm' },
  ],
  utility: [
    { name: 'Wingardium Leviosa', desc: 'Levitation Charm' },
    { name: 'Alohomora', desc: 'Unlocking Charm' },
    { name: 'Lumos', desc: 'Light Spell' },
  ],
  forbidden: [
    { name: 'Crucio', desc: 'Cruciatus Curse' },
    { name: 'Imperio', desc: 'Imperius Curse' },
    { name: 'Avada Kedavra', desc: 'Killing Curse' },
  ],
}

// Experience data - Professional
const professionalExperience = [
  {
    title: 'Internship at Ashari Tech',
    period: '2024 - Present',
    description: 'Developing web applications with Next.js and modern technologies',
  },
  {
    title: 'BNSP Certified Web Developer',
    period: '2024',
    description: 'Professional certification in web development',
  },
]

// Experience data - Hogwarts
const magicalExperience = [
  {
    title: 'Slytherin House Member',
    period: 'Current',
    description: 'Demonstrating ambition, cunning, and resourcefulness in all magical endeavors',
  },
  {
    title: 'Defense Against the Dark Arts',
    period: 'Advanced',
    description: 'Mastered both defensive spells and understanding of dark magic',
  },
]

export default function Portfolio({ isDarkMode, isHogwartsMode }: PortfolioProps) {
  const [hasGlasses, setHasGlasses] = useState(false)
  const [showSkinMenu, setShowSkinMenu] = useState(false)

  // Theme colors
  const getColors = () => {
    if (isHogwartsMode) {
      return {
        bg: isDarkMode ? '#0a0f0a' : '#f0f5f0',
        card: isDarkMode ? slytherinColors.primary : '#ffffff',
        cardBorder: isDarkMode ? slytherinColors.secondary : slytherinColors.primary,
        text: isDarkMode ? '#e8e8e8' : '#1a1a1a',
        textMuted: isDarkMode ? slytherinColors.silver : '#666666',
        accent: slytherinColors.secondary,
        // Inner containers - darker for better contrast
        innerBg: isDarkMode ? '#0f1a0f' : '#e8f5e9',
        innerBorder: isDarkMode ? '#1a3a1a' : slytherinColors.secondary + '40',
      }
    }
    // Professional monochrome
    return {
      bg: isDarkMode ? '#000000' : '#ffffff',
      card: isDarkMode ? '#0a0a0a' : '#ffffff',
      cardBorder: isDarkMode ? '#262626' : '#e5e5e5',
      text: isDarkMode ? '#ffffff' : '#000000',
      textMuted: isDarkMode ? '#737373' : '#525252',
      accent: isDarkMode ? '#ffffff' : '#000000',
      innerBg: isDarkMode ? '#171717' : '#f5f5f5',
      innerBorder: isDarkMode ? '#262626' : '#e5e5e5',
    }
  }

  const colors = getColors()
  const currentProfile = isHogwartsMode
    ? (hasGlasses ? '/profile_slytherin_glasses.png' : '/profile_slytherin.png')
    : '/profile_Fiqri.jpeg'

  return (
    <div
      className="min-h-screen py-16 px-6 transition-all duration-500"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-8 transition-all duration-500 relative overflow-hidden"
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.cardBorder}`,
            boxShadow: isHogwartsMode
              ? `0 25px 50px -12px ${slytherinColors.primary}60`
              : isDarkMode
                ? '0 25px 50px -12px rgba(0,0,0,0.5)'
                : '0 25px 50px -12px rgba(0,0,0,0.08)',
          }}
        >
          {/* Slytherin Logo Watermark */}
          {isHogwartsMode && (
            <div className="absolute top-4 right-4 opacity-15">
              <Image
                src="/logo_slytherin.png"
                alt="Slytherin"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
          )}

          {/* Header Section - Horizontal Layout */}
          <div className="flex flex-col lg:flex-row gap-8 mb-10">
            {/* Profile Image - Large Square */}
            <div className="flex-shrink-0 relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative w-48 h-48 lg:w-56 lg:h-56 mx-auto lg:mx-0"
              >
                <Image
                  src={currentProfile}
                  alt="Fiqri Agustriawan"
                  fill
                  className="rounded-2xl object-cover transition-all duration-300"
                  style={{
                    border: `3px solid ${colors.cardBorder}`,
                  }}
                  priority
                />

                {/* Online Status */}
                <div
                  className="absolute bottom-3 left-3 w-4 h-4 rounded-full border-2"
                  style={{
                    backgroundColor: '#22c55e',
                    borderColor: colors.card,
                  }}
                />

                {/* Skin Changer Button - Hogwarts Mode Only */}
                {isHogwartsMode && (
                  <div className="absolute -bottom-2 -right-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowSkinMenu(!showSkinMenu)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg"
                      style={{
                        backgroundColor: isDarkMode ? '#0f0f0f' : '#ffffff',
                        border: `2px solid ${slytherinColors.secondary}`,
                      }}
                      title="Change Appearance"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        style={{ color: slytherinColors.secondary }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </motion.button>

                    {/* Skin Menu Dropdown */}
                    <AnimatePresence>
                      {showSkinMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute top-full right-0 mt-2 p-3 rounded-xl z-30 min-w-[140px]"
                          style={{
                            backgroundColor: isDarkMode ? '#0f0f0f' : '#ffffff',
                            border: `2px solid ${slytherinColors.secondary}`,
                            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.4)',
                          }}
                        >
                          <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: colors.textMuted }}>
                            Appearance
                          </p>
                          <div className="space-y-2">
                            <button
                              onClick={() => { setHasGlasses(false); setShowSkinMenu(false) }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${!hasGlasses ? 'bg-green-900/30' : 'hover:bg-white/5'}`}
                              style={{ color: colors.text }}
                            >
                              <span className="w-7 h-7 rounded-full overflow-hidden border border-current flex-shrink-0" style={{ aspectRatio: '1/1' }}>
                                <Image src="/profile_slytherin.png" alt="" width={28} height={28} className="w-full h-full object-cover" />
                              </span>
                              Standard
                            </button>
                            <button
                              onClick={() => { setHasGlasses(true); setShowSkinMenu(false) }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${hasGlasses ? 'bg-green-900/30' : 'hover:bg-white/5'}`}
                              style={{ color: colors.text }}
                            >
                              <span className="w-7 h-7 rounded-full overflow-hidden border border-current flex-shrink-0" style={{ aspectRatio: '1/1' }}>
                                <Image src="/profile_slytherin_glasses.png" alt="" width={28} height={28} className="w-full h-full object-cover" />
                              </span>
                              With Glasses
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: colors.text }}>
                {isHogwartsMode ? 'Fiqri Agustriawan' : 'Muhammad Fiqri Agustriawan'}
              </h1>

              <p className="text-lg mb-4" style={{ color: colors.textMuted }}>
                {isHogwartsMode ? 'Slytherin Wizard' : 'Fullstack Software Engineer'}
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-2 mb-5 flex-wrap">
                <span
                  className="px-4 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: isHogwartsMode ? slytherinColors.primary : (isDarkMode ? '#ffffff' : '#000000'),
                    color: isHogwartsMode ? '#ffffff' : (isDarkMode ? '#000000' : '#ffffff'),
                  }}
                >
                  {isHogwartsMode ? 'House Slytherin' : 'Backend Focus'}
                </span>
                <span
                  className="px-4 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.textMuted,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  {isHogwartsMode ? 'Pure-blood' : 'Fullstack Capability'}
                </span>
              </div>

              {/* Location & Education */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm mb-6" style={{ color: colors.textMuted }}>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {isHogwartsMode ? 'Hogwarts Castle' : 'Bandung, Indonesia'}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {isHogwartsMode ? 'Hogwarts School' : 'SMK Telkom Makassar'}
                </span>
              </div>

              {/* About */}
              <p className="leading-relaxed text-sm lg:text-base" style={{ color: colors.text }}>
                {isHogwartsMode ? (
                  <>
                    A cunning and ambitious wizard sorted into <strong style={{ color: slytherinColors.secondary }}>Slytherin House</strong>.
                    Known for resourcefulness and determination in mastering both defensive and dark arts.
                  </>
                ) : (
                  <>
                    Seorang Insinyur Perangkat Lunak Fullstack yang bersemangat, berbasis di Bandung.
                    Keahlian utama pada <strong style={{ color: colors.accent }}>rekayasa backend</strong> —
                    merancang API, mengoptimalkan database, dan membangun solusi server yang skalabel.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Skills / Spells */}
          <div className="mb-10">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ color: colors.textMuted }}
            >
              {isHogwartsMode ? 'Spells Mastered' : 'Technical Skills'}
            </h2>

            {isHogwartsMode ? (
              // Magical Spells
              <div className="space-y-6">
                {/* Defensive Spells */}
                <div>
                  <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: slytherinColors.secondary }}>
                    Defensive Spells
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {magicalSkills.defensive.map((spell) => (
                      <div
                        key={spell.name}
                        className="p-4 rounded-xl transition-all"
                        style={{
                          backgroundColor: colors.innerBg,
                          border: `1px solid ${colors.innerBorder}`,
                        }}
                      >
                        <p className="font-medium text-sm" style={{ color: colors.text }}>{spell.name}</p>
                        <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{spell.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Utility Spells */}
                <div>
                  <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: slytherinColors.secondary }}>
                    Utility Spells
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {magicalSkills.utility.map((spell) => (
                      <div
                        key={spell.name}
                        className="p-4 rounded-xl transition-all"
                        style={{
                          backgroundColor: colors.innerBg,
                          border: `1px solid ${colors.innerBorder}`,
                        }}
                      >
                        <p className="font-medium text-sm" style={{ color: colors.text }}>{spell.name}</p>
                        <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{spell.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Forbidden Curses - High Contrast */}
                <div>
                  <p className="text-xs font-medium mb-3 uppercase tracking-wider text-red-500">
                    Forbidden Curses (Knowledge Only)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {magicalSkills.forbidden.map((spell) => (
                      <div
                        key={spell.name}
                        className="p-4 rounded-xl transition-all"
                        style={{
                          backgroundColor: isDarkMode ? '#0a0a0a' : '#fef2f2',
                          border: isDarkMode ? '1px solid #7f1d1d' : '1px solid #fca5a5',
                        }}
                      >
                        <p className="font-medium text-sm" style={{ color: isDarkMode ? '#fca5a5' : '#dc2626' }}>{spell.name}</p>
                        <p className="text-xs mt-1" style={{ color: isDarkMode ? '#a3a3a3' : '#991b1b' }}>{spell.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Professional Skills
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: colors.textMuted }}>Backend (Primary)</p>
                  <div className="flex flex-wrap gap-2">
                    {professionalSkills.backend.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: isDarkMode ? '#ffffff' : '#000000',
                          color: isDarkMode ? '#000000' : '#ffffff',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: colors.textMuted }}>Frontend</p>
                  <div className="flex flex-wrap gap-2">
                    {professionalSkills.frontend.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: colors.innerBg,
                          color: colors.text,
                          border: `1px solid ${colors.innerBorder}`,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: colors.textMuted }}>Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {professionalSkills.tools.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: colors.innerBg,
                          color: colors.text,
                          border: `1px solid ${colors.innerBorder}`,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="mb-10">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ color: colors.textMuted }}
            >
              {isHogwartsMode ? 'Magical Background' : 'Experience'}
            </h2>

            <div className="space-y-4">
              {(isHogwartsMode ? magicalExperience : professionalExperience).map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-xl"
                  style={{
                    backgroundColor: colors.innerBg,
                    borderLeft: `3px solid ${isHogwartsMode ? slytherinColors.secondary : colors.accent}`,
                  }}
                >
                  <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <h3 className="font-semibold" style={{ color: colors.text }}>{exp.title}</h3>
                    <span className="text-xs px-2 py-1 rounded" style={{
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      color: colors.textMuted
                    }}>{exp.period}</span>
                  </div>
                  <p className="text-sm" style={{ color: colors.textMuted }}>{exp.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Links */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <a
              href="https://github.com/FiqriAgustriawan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-80"
              style={{
                backgroundColor: isHogwartsMode ? slytherinColors.primary : (isDarkMode ? '#ffffff' : '#000000'),
                color: isHogwartsMode ? '#ffffff' : (isDarkMode ? '#000000' : '#ffffff'),
                border: isHogwartsMode ? `1px solid ${slytherinColors.secondary}` : 'none',
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>

            <a
              href="https://linkedin.com/in/fiqri-agustriawan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-80"
              style={{
                backgroundColor: isHogwartsMode ? slytherinColors.secondary : '#0077b5',
                color: '#ffffff',
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>

            <a
              href="mailto:muhfiqri033@gmail.com"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-80"
              style={{
                backgroundColor: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>

            <a
              href="https://fiqriagustriawan.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-80"
              style={{
                backgroundColor: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Portfolio
            </a>
          </div>
        </motion.div>

        {/* Footer with Hogwarts Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center mt-10 gap-3"
        >
          <AnimatePresence mode="wait">
            {isHogwartsMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Image
                  src="/logo_hogwarts.png"
                  alt="Hogwarts"
                  width={48}
                  height={48}
                  className="opacity-40"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-center text-xs" style={{ color: colors.textMuted }}>
            {isHogwartsMode
              ? 'Draco Dormiens Nunquam Titillandus'
              : 'Built with Next.js, TypeScript & Framer Motion'
            }
          </p>
        </motion.div>
      </div>
    </div>
  )
}

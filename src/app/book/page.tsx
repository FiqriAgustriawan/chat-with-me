'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import '@/styles/hogwarts.css'

import profileSlytherin from '@/assets/images/profile_fiqri_slytherin.png'
import logoHogwarts from '@/assets/images/logo hogwarts.png'
import logoSlytherin from '@/assets/images/logo slytherin.png'

// Book Pages Data
const bookPages = [
  {
    id: 'cover',
    title: 'The Chronicles of',
    subtitle: 'Muhammad Fiqri Agustriawan',
    type: 'cover',
  },
  {
    id: 'about',
    title: 'About The Wizard',
    type: 'content',
    content: {
      image: true,
      name: 'Muhammad Fiqri Agustriawan',
      role: 'Software Engineer',
      bio: 'A cunning and ambitious wizard, currently serving as an intern at Ashari Tech in Bandung. Sorted into House Slytherin, known for mastering the dark arts of Backend Development and the mystical powers of AI Engineering.',
      location: 'Hegarmanah, Cidadap, Bandung',
      school: 'SMK Telkom Makassar',
    }
  },
  {
    id: 'skills',
    title: 'Spells Mastered',
    type: 'content',
    content: {
      skills: [
        { name: 'Backend Development', level: 90, spells: ['Laravel', 'Node.js', 'Golang', 'Python'] },
        { name: 'Frontend Development', level: 85, spells: ['React', 'Next.js', 'Vue', 'TailwindCSS'] },
        { name: 'AI Engineering', level: 80, spells: ['LangChain', 'OpenAI', 'Gemini', 'RAG'] },
        { name: 'DevOps', level: 75, spells: ['Docker', 'Linux', 'CI/CD', 'Cloud'] },
        { name: 'Database', level: 85, spells: ['PostgreSQL', 'MySQL', 'MongoDB', 'Supabase'] },
      ]
    }
  },
  {
    id: 'experience',
    title: 'Quests Completed',
    type: 'content',
    content: {
      experiences: [
        {
          title: 'Software Engineer Intern',
          company: 'Ashari Tech',
          period: '2024 - Present',
          location: 'Bandung, Indonesia',
          description: 'Mastering the arts of fullstack development, specializing in backend engineering and AI integration spells.',
        }
      ]
    }
  },
  {
    id: 'achievements',
    title: 'Achievements Unlocked',
    type: 'content',
    content: {
      achievements: [
        { title: 'BNSP Certified Web Developer', issuer: 'BNSP', year: '2024' },
        { title: 'LKS Participant', issuer: 'SMK Telkom', year: '2024' },
      ]
    }
  },
  {
    id: 'projects',
    title: 'Artifacts Created',
    type: 'content',
    content: {
      projects: [
        { title: 'Geometri App', description: 'A magical tool for learning mathematical geometry' },
        { title: 'Jurnal Digital', description: 'An enchanted journal management system' },
        { title: 'Lutim AI', description: 'An AI-powered oracle for Luwu Timur' },
      ]
    }
  },
  {
    id: 'contact',
    title: 'Send An Owl',
    type: 'content',
    content: {
      email: 'muhfiqri033@gmail.com',
      links: [
        { label: 'GitHub', url: 'https://github.com/FiqriAgustriawan' },
        { label: 'LinkedIn', url: 'https://www.linkedin.com/in/fiqri-agustriawan/' },
      ]
    }
  },
]

// Loading Screen with Hogwarts Logo
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const leftPageRef = useRef<HTMLDivElement>(null)
  const rightPageRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ onComplete })

    // Logo fade in with glow
    tl.fromTo(logoRef.current,
      { scale: 0, opacity: 0, rotation: -180 },
      { scale: 1, opacity: 1, rotation: 0, duration: 1.2, ease: 'elastic.out(1, 0.6)' }
    )
      // Text fade in
      .fromTo(textRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.5'
      )
      // Logo glow pulse
      .to(logoRef.current, {
        filter: 'drop-shadow(0 0 60px rgba(196,167,71,0.8))',
        duration: 0.4,
        yoyo: true,
        repeat: 1,
      })
      // Pages close from sides with 3D effect
      .to(leftPageRef.current, {
        rotateY: 0,
        duration: 1,
        ease: 'power3.inOut'
      }, '+=0.2')
      .to(rightPageRef.current, {
        rotateY: 0,
        duration: 1,
        ease: 'power3.inOut'
      }, '<')
      // Fade out
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.4
      }, '+=0.2')

  }, [onComplete])

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%)',
        perspective: '2000px',
      }}
    >
      {/* Left parchment page - 3D closing */}
      <div
        ref={leftPageRef}
        className="absolute left-0 top-0 w-1/2 h-full origin-right"
        style={{
          transform: 'rotateY(90deg)',
          transformStyle: 'preserve-3d',
          background: `linear-gradient(90deg, #D4C8A8 0%, #E8D4A8 50%, #F0E6D0 100%)`,
          boxShadow: 'inset -30px 0 60px rgba(139,90,43,0.4)',
        }}
      >
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Aging stains */}
        <div className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 30% 30%, rgba(139,90,43,0.5) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Right parchment page - 3D closing */}
      <div
        ref={rightPageRef}
        className="absolute right-0 top-0 w-1/2 h-full origin-left"
        style={{
          transform: 'rotateY(-90deg)',
          transformStyle: 'preserve-3d',
          background: `linear-gradient(-90deg, #D4C8A8 0%, #E8D4A8 50%, #F0E6D0 100%)`,
          boxShadow: 'inset 30px 0 60px rgba(139,90,43,0.4)',
        }}
      >
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Hogwarts Logo */}
      <div ref={logoRef} className="relative z-10 text-center opacity-0">
        <div
          className="w-48 h-48 mx-auto mb-8 relative"
          style={{ filter: 'drop-shadow(0 0 30px rgba(196,167,71,0.5))' }}
        >
          <Image
            src={logoHogwarts}
            alt="Hogwarts"
            fill
            className="object-contain"
          />
        </div>
        <div ref={textRef} className="opacity-0">
          <h2
            className="text-3xl text-[#C4A747] tracking-[0.4em] uppercase mb-2"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Opening
          </h2>
          <p className="text-[#888] tracking-[0.2em] text-sm">The Book of Chronicles</p>
        </div>
      </div>
    </motion.div>
  )
}

// 3D Page Component with realistic flip
function BookPage3D({
  page,
  isLeft,
  isFlipping,
  flipDirection,
}: {
  page: typeof bookPages[0]
  isLeft: boolean
  isFlipping: boolean
  flipDirection: 'next' | 'prev' | null
}) {
  // Render content based on page type
  const renderContent = () => {
    if (page.type === 'cover') {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-10">
          <div className="w-24 h-24 md:w-32 md:h-32 relative mb-4 md:mb-6">
            <Image src={logoSlytherin} alt="Slytherin" fill className="object-contain" />
          </div>
          <p className="text-[#5D4930] text-base md:text-lg tracking-widest uppercase mb-2">{page.title}</p>
          <h1
            className="text-2xl md:text-4xl font-bold text-[#3D2914] leading-tight"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {page.subtitle}
          </h1>
          <div className="mt-6 md:mt-8 w-20 md:w-24 h-0.5 bg-gradient-to-r from-transparent via-[#8B5A2B] to-transparent" />
          <p className="mt-3 md:mt-4 text-[#8B5A2B] text-xs md:text-sm tracking-wider">Software Engineer</p>
          <p className="mt-1 text-[#8B5A2B]/60 text-[10px] md:text-xs">House Slytherin</p>
        </div>
      )
    }

    const content = page.content as Record<string, unknown>

    // About page
    if (page.id === 'about' && content) {
      return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
          <h2 className="text-xl md:text-2xl font-bold text-[#3D2914] mb-4 md:mb-6 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
            {page.title}
          </h2>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 md:w-28 md:h-28 relative rounded-full overflow-hidden border-4 border-[#C4A747] mb-3 md:mb-4 shadow-lg">
              <Image src={profileSlytherin} alt="Profile" fill className="object-cover" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#3D2914]">{content.name as string}</h3>
            <p className="text-[#8B5A2B] font-semibold text-sm md:text-base">{content.role as string}</p>
            <p className="text-[#5D4930] text-xs md:text-sm mt-3 md:mt-4 text-center leading-relaxed px-2">{content.bio as string}</p>
            <div className="mt-3 md:mt-4 text-[10px] md:text-xs text-[#8B5A2B] text-center">
              <p>{content.location as string}</p>
              <p>{content.school as string}</p>
            </div>
          </div>
        </div>
      )
    }

    // Skills page
    if (page.id === 'skills' && content.skills) {
      const skills = content.skills as Array<{ name: string; level: number; spells: string[] }>
      return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
          <h2 className="text-xl md:text-2xl font-bold text-[#3D2914] mb-3 md:mb-4 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
            {page.title}
          </h2>
          <div className="space-y-3 md:space-y-4">
            {skills.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs md:text-sm mb-1">
                  <span className="font-semibold text-[#3D2914]">{skill.name}</span>
                  <span className="text-[#8B5A2B]">{skill.level}%</span>
                </div>
                <div className="h-2 md:h-3 bg-[#8B5A2B]/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#1A472A] to-[#2A623D] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                  />
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {skill.spells.map((spell, j) => (
                    <span key={j} className="text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 bg-[#1A472A] text-[#C4A747] rounded-full">
                      {spell}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Experience page
    if (page.id === 'experience' && content.experiences) {
      const experiences = content.experiences as Array<{ title: string; company: string; period: string; location: string; description: string }>
      return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
          <h2 className="text-xl md:text-2xl font-bold text-[#3D2914] mb-3 md:mb-4 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
            {page.title}
          </h2>
          {experiences.map((exp, i) => (
            <div key={i} className="p-3 md:p-4 bg-[#5D4930]/10 rounded-lg">
              <h3 className="font-bold text-[#3D2914] text-sm md:text-base">{exp.title}</h3>
              <p className="text-[#8B5A2B] font-semibold text-xs md:text-sm">{exp.company}</p>
              <p className="text-[10px] md:text-xs text-[#5D4930]">{exp.period}</p>
              <p className="text-[10px] md:text-xs text-[#5D4930]">{exp.location}</p>
              <p className="text-[10px] md:text-sm text-[#3D2914] mt-2">{exp.description}</p>
            </div>
          ))}
        </div>
      )
    }

    // Achievements page
    if (page.id === 'achievements' && content.achievements) {
      const achievements = content.achievements as Array<{ title: string; issuer: string; year: string }>
      return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
          <h2 className="text-xl md:text-2xl font-bold text-[#3D2914] mb-3 md:mb-4 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
            {page.title}
          </h2>
          <div className="space-y-2 md:space-y-3">
            {achievements.map((ach, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-[#5D4930]/10 rounded-lg">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#C4A747] to-[#8B7535] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#3D2914]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3h14v2h2v4a4 4 0 01-2.17 3.55A6 6 0 0113 17.92V20h4v2H7v-2h4v-2.08A6 6 0 015.17 12.55 4 4 0 013 9V5h2V3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#3D2914] text-xs md:text-sm">{ach.title}</h3>
                  <p className="text-[10px] md:text-xs text-[#8B5A2B]">{ach.issuer} - {ach.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Projects page
    if (page.id === 'projects' && content.projects) {
      const projects = content.projects as Array<{ title: string; description: string }>
      return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
          <h2 className="text-xl md:text-2xl font-bold text-[#3D2914] mb-3 md:mb-4 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
            {page.title}
          </h2>
          <div className="space-y-2 md:space-y-3">
            {projects.map((proj, i) => (
              <div key={i} className="p-2 md:p-3 bg-[#5D4930]/10 rounded-lg border border-[#8B5A2B]/20">
                <h3 className="font-bold text-[#3D2914] text-sm md:text-base">{proj.title}</h3>
                <p className="text-[10px] md:text-sm text-[#5D4930]">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Contact page
    if (page.id === 'contact' && content) {
      return (
        <div className="p-4 md:p-8 h-full flex flex-col items-center justify-center">
          <h2 className="text-xl md:text-2xl font-bold text-[#3D2914] mb-4 md:mb-6 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
            {page.title}
          </h2>
          <p className="text-[#5D4930] mb-3 md:mb-4 text-center text-xs md:text-sm">I would love to hear from you!</p>
          <a
            href={`mailto:${content.email}`}
            className="px-4 md:px-6 py-2 md:py-3 bg-[#1A472A] text-[#C4A747] rounded-lg font-semibold hover:bg-[#2A623D] transition-colors text-xs md:text-sm"
          >
            {content.email as string}
          </a>
          <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
            {(content.links as Array<{ label: string; url: string }>)?.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 md:px-4 py-1.5 md:py-2 bg-[#8B5A2B]/20 text-[#3D2914] rounded hover:bg-[#8B5A2B]/40 transition-colors text-[10px] md:text-xs"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <motion.div
      className={`absolute top-0 ${isLeft ? 'left-0' : 'right-0'} w-1/2 h-full`}
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin: isLeft ? 'right center' : 'left center',
      }}
      animate={{
        rotateY: isFlipping
          ? (flipDirection === 'next' && isLeft ? -180 : flipDirection === 'prev' && !isLeft ? 180 : 0)
          : 0,
      }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Page front */}
      <div
        className="absolute inset-0"
        style={{
          backfaceVisibility: 'hidden',
          background: `linear-gradient(${isLeft ? '90deg' : '-90deg'}, 
            #F5E6C8 0%, 
            #ECD9B0 30%, 
            #E8D4A8 60%, 
            #DFC89A 100%
          )`,
          boxShadow: isLeft
            ? 'inset -8px 0 30px rgba(139,90,43,0.25)'
            : 'inset 8px 0 30px rgba(139,90,43,0.25)',
        }}
      >
        {/* Paper texture */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Age spots */}
        <div className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 15% 20%, rgba(139,90,43,0.6) 0%, transparent 35%),
              radial-gradient(ellipse at 85% 75%, rgba(139,90,43,0.4) 0%, transparent 30%),
              radial-gradient(ellipse at 50% 90%, rgba(139,90,43,0.3) 0%, transparent 25%)
            `,
          }}
        />

        {/* Center fold shadow */}
        <div
          className={`absolute top-0 ${isLeft ? 'right-0' : 'left-0'} w-6 md:w-10 h-full pointer-events-none`}
          style={{
            background: isLeft
              ? 'linear-gradient(to left, rgba(0,0,0,0.2), transparent)'
              : 'linear-gradient(to right, rgba(0,0,0,0.2), transparent)',
          }}
        />

        {/* Content */}
        <div className="relative h-full" style={{ fontFamily: 'Crimson Text, Georgia, serif' }}>
          {renderContent()}
        </div>
      </div>
    </motion.div>
  )
}

// Main Book Component
export default function BookPortfolio() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentSpread, setCurrentSpread] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null)
  const bookRef = useRef<HTMLDivElement>(null)

  const totalSpreads = Math.ceil(bookPages.length / 2)
  const leftPageIndex = currentSpread * 2
  const rightPageIndex = currentSpread * 2 + 1

  const leftPage = bookPages[leftPageIndex]
  const rightPage = bookPages[rightPageIndex]

  const handlePrevPage = () => {
    if (currentSpread > 0 && !isFlipping) {
      setFlipDirection('prev')
      setIsFlipping(true)

      setTimeout(() => {
        setCurrentSpread(prev => prev - 1)
        setIsFlipping(false)
        setFlipDirection(null)
      }, 800)
    }
  }

  const handleNextPage = () => {
    if (currentSpread < totalSpreads - 1 && !isFlipping) {
      setFlipDirection('next')
      setIsFlipping(true)

      setTimeout(() => {
        setCurrentSpread(prev => prev + 1)
        setIsFlipping(false)
        setFlipDirection(null)
      }, 800)
    }
  }

  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {/* Book View */}
      <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d1510] to-[#0a0a0a] flex flex-col items-center justify-center p-4 md:p-8">
        {/* Back button */}
        <Link href="/" className="fixed top-4 left-4 z-50">
          <motion.button
            className="px-3 md:px-4 py-2 bg-[#1a1a1a]/90 border border-[#C4A747]/50 text-[#C4A747] rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </motion.button>
        </Link>

        {/* Page indicator */}
        <motion.div
          className="mb-4 md:mb-6 text-[#C4A747] text-xs md:text-sm tracking-widest"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Page {currentSpread + 1} of {totalSpreads}
        </motion.div>

        {/* Big Book with 3D perspective */}
        <motion.div
          ref={bookRef}
          className="relative w-full max-w-6xl"
          style={{
            aspectRatio: '16/10',
            perspective: '2500px',
            transformStyle: 'preserve-3d',
          }}
          initial={{ opacity: 0, scale: 0.8, rotateX: 10 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        >
          {/* Book container with shadow */}
          <div
            className="relative w-full h-full rounded-lg overflow-hidden"
            style={{
              boxShadow: `
                0 40px 80px rgba(0,0,0,0.6),
                0 0 0 1px rgba(139,90,43,0.4),
                0 0 100px rgba(196,167,71,0.1)
              `,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Book spine */}
            <div
              className="absolute left-1/2 top-0 w-3 md:w-5 h-full -translate-x-1/2 z-20"
              style={{
                background: 'linear-gradient(90deg, #2A1810 0%, #4A3020 30%, #3D2914 50%, #4A3020 70%, #2A1810 100%)',
                boxShadow: '0 0 30px rgba(0,0,0,0.8)',
              }}
            />

            {/* Pages */}
            {leftPage && (
              <BookPage3D
                page={leftPage}
                isLeft={true}
                isFlipping={isFlipping && flipDirection === 'prev'}
                flipDirection={flipDirection}
              />
            )}

            {rightPage && (
              <BookPage3D
                page={rightPage}
                isLeft={false}
                isFlipping={isFlipping && flipDirection === 'next'}
                flipDirection={flipDirection}
              />
            )}
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="flex items-center gap-4 md:gap-8 mt-6 md:mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            onClick={handlePrevPage}
            disabled={currentSpread === 0 || isFlipping}
            className={`px-4 md:px-8 py-2 md:py-3 rounded-lg font-semibold transition-all text-xs md:text-base ${currentSpread === 0 || isFlipping
                ? 'bg-[#333] text-[#666] cursor-not-allowed'
                : 'bg-[#1A472A] text-[#C4A747] hover:bg-[#2A623D] shadow-lg hover:shadow-[#1A472A]/30'
              }`}
            whileHover={currentSpread > 0 && !isFlipping ? { scale: 1.05 } : {}}
            whileTap={currentSpread > 0 && !isFlipping ? { scale: 0.95 } : {}}
          >
            Previous
          </motion.button>

          {/* Page dots */}
          <div className="flex gap-1.5 md:gap-2">
            {Array.from({ length: totalSpreads }, (_, i) => (
              <button
                key={i}
                onClick={() => !isFlipping && setCurrentSpread(i)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${i === currentSpread
                    ? 'bg-[#C4A747] scale-125 shadow-lg shadow-[#C4A747]/50'
                    : 'bg-[#555] hover:bg-[#888]'
                  }`}
              />
            ))}
          </div>

          <motion.button
            onClick={handleNextPage}
            disabled={currentSpread === totalSpreads - 1 || isFlipping}
            className={`px-4 md:px-8 py-2 md:py-3 rounded-lg font-semibold transition-all text-xs md:text-base ${currentSpread === totalSpreads - 1 || isFlipping
                ? 'bg-[#333] text-[#666] cursor-not-allowed'
                : 'bg-[#1A472A] text-[#C4A747] hover:bg-[#2A623D] shadow-lg hover:shadow-[#1A472A]/30'
              }`}
            whileHover={currentSpread < totalSpreads - 1 && !isFlipping ? { scale: 1.05 } : {}}
            whileTap={currentSpread < totalSpreads - 1 && !isFlipping ? { scale: 0.95 } : {}}
          >
            Next
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="mt-6 md:mt-8 text-[#444] text-[10px] md:text-xs tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          House Slytherin | Ambition leads to greatness
        </motion.p>
      </main>
    </>
  )
}

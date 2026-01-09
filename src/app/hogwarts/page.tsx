'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import '@/styles/hogwarts.css'
import ChatWidget from '@/components/ChatWidget'

// Import images
import profileSlytherin from '@/assets/images/profile_fiqri_slytherin.png'
import logoSlytherin from '@/assets/images/logo slytherin.png'

// Dynamic import for 3D scene (client-only)
const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,
  loading: () => null
})

// Menu items
const menuItems = [
  { id: 'achievements', label: 'Achievements', icon: 'trophy' },
  { id: 'talents', label: 'Talents', icon: 'wand' },
  { id: 'book', label: 'The Book', icon: 'book', isLink: true, href: '/book' },
  { id: 'quests', label: 'Experience', icon: 'scroll' },
  { id: 'challenges', label: 'Stats', icon: 'shield' },
  { id: 'owlpost', label: 'Contact', icon: 'owl' },
]

// SVG Icons
const Icons: Record<string, () => React.ReactNode> = {
  trophy: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#C4A747]">
      <path d="M5 3h14v2h2v4a4 4 0 01-2.17 3.55A6 6 0 0113 17.92V20h4v2H7v-2h4v-2.08A6 6 0 015.17 12.55 4 4 0 013 9V5h2V3zm14 4h-2v4.28A2 2 0 0019 10V7zM5 7v3a2 2 0 002 1.28V7H5z" />
    </svg>
  ),
  wand: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#C4A747]">
      <path d="M7.5 5.6L5 7l1.4-2.5L5 2l2.5 1.4L10 2 8.6 4.5 10 7 7.5 5.6zm12 9.8L22 14l-1.4 2.5L22 19l-2.5-1.4L17 19l1.4-2.5L17 14l2.5 1.4zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5L22 2zM9.5 12l-8 8 3 3 8-8-3-3z" />
    </svg>
  ),
  book: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#C4A747]">
      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
    </svg>
  ),
  scroll: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#C4A747]">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  ),
  shield: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#C4A747]">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
  ),
  owl: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#C4A747]">
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
    </svg>
  ),
}

// Data
const skills = [
  { name: 'Backend Development', level: 90, items: ['Laravel', 'Node.js', 'Golang', 'Python'] },
  { name: 'Frontend Development', level: 85, items: ['React', 'Next.js', 'Vue', 'TailwindCSS'] },
  { name: 'AI Engineering', level: 80, items: ['LangChain', 'OpenAI', 'Gemini', 'RAG'] },
  { name: 'DevOps', level: 75, items: ['Docker', 'Linux', 'CI/CD', 'Cloud'] },
  { name: 'Database', level: 85, items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Supabase'] },
]

const experiences = [
  {
    title: 'Software Engineer Intern',
    company: 'Ashari Tech',
    period: '2024 - Present',
    location: 'Bandung, Indonesia',
    description: 'Developing fullstack applications with focus on backend engineering and AI integration.',
  },
]

const achievements = [
  { title: 'BNSP Certified Web Developer', issuer: 'BNSP', year: '2024' },
  { title: 'LKS Participant', issuer: 'SMK Telkom', year: '2024' },
]

const projects = [
  { title: 'Geometri App', description: 'Mathematical geometry learning application' },
  { title: 'Jurnal Digital', description: 'Digital journal management system' },
  { title: 'Lutim AI', description: 'AI-powered assistant for Luwu Timur' },
]

// Magic Particles - Client Only with GSAP
function MagicParticles() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const particles = useMemo(() => {
    if (typeof window === 'undefined') return []
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: 60 + Math.random() * 40,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 6,
      size: 3 + Math.random() * 4,
    }))
  }, [])

  useEffect(() => {
    setMounted(true)

    // GSAP animation for particles
    if (containerRef.current) {
      const particleElements = containerRef.current.querySelectorAll('.magic-particle-gsap')
      particleElements.forEach((particle, i) => {
        gsap.to(particle, {
          y: -80 - Math.random() * 60,
          opacity: 0,
          duration: 8 + Math.random() * 4,
          repeat: -1,
          ease: 'none',
          delay: i * 0.3,
        })
      })
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="magic-particle-gsap absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: 'radial-gradient(circle, #C4A747 0%, transparent 70%)',
            boxShadow: '0 0 15px #C4A747, 0 0 30px #C4A74770',
          }}
        />
      ))}
    </div>
  )
}

// Diamond Menu Card with GSAP hover
function DiamondCard({
  item,
  onClick,
  isCenter = false,
  delay = 0,
}: {
  item?: typeof menuItems[0]
  onClick?: () => void
  isCenter?: boolean
  delay?: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const IconComponent = item?.icon ? Icons[item.icon] : null

  useEffect(() => {
    if (cardRef.current) {
      // GSAP entrance animation
      gsap.fromTo(cardRef.current,
        { scale: 0, rotation: 45, opacity: 0 },
        { scale: 1, rotation: 45, opacity: 1, duration: 0.8, delay, ease: 'elastic.out(1, 0.5)' }
      )
    }
  }, [delay])

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { scale: 1.15, duration: 0.3, ease: 'power2.out' })
      gsap.to(cardRef.current.querySelector('.card-glow'), { opacity: 1, duration: 0.3 })
    }
  }

  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' })
      gsap.to(cardRef.current.querySelector('.card-glow'), { opacity: 0, duration: 0.3 })
    }
  }

  return (
    <div
      ref={cardRef}
      className={`relative cursor-pointer ${isCenter ? 'w-32 h-32 md:w-40 md:h-40' : 'w-20 h-20 md:w-24 md:h-24'}`}
      style={{ transform: 'rotate(45deg)' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Glow effect */}
      <div className="card-glow absolute -inset-4 rounded-lg opacity-0 transition-opacity"
        style={{
          background: 'radial-gradient(circle, rgba(196,167,71,0.4) 0%, transparent 70%)',
          filter: 'blur(10px)'
        }}
      />

      {/* Card Background */}
      <div className={`absolute inset-0 rounded-lg overflow-hidden ${isCenter
        ? 'bg-gradient-to-br from-[#1A472A] via-[#2A623D] to-[#1A472A] border-2 border-[#C4A747]'
        : 'bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0d0d0d] border border-[#C4A747]/60'
        }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#C4A747]/10 to-transparent" />

        {/* Ornate corners */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#C4A747]" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#C4A747]" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#C4A747]" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#C4A747]" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'rotate(-45deg)' }}>
        {isCenter ? (
          <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-[#C4A747] shadow-lg shadow-[#C4A747]/30">
            <Image src={profileSlytherin} alt="Fiqri" fill className="object-cover" />
          </div>
        ) : (
          <>
            {IconComponent && <IconComponent />}
            <span className="text-[#C4A747] text-[8px] md:text-[10px] font-semibold mt-1 uppercase tracking-wider text-center">
              {item?.label}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

// Realistic Parchment Modal with GSAP
function ParchmentModal({
  isOpen,
  onClose,
  title,
  children
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && modalRef.current && contentRef.current) {
      // GSAP entrance animation
      gsap.fromTo(modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      )
      gsap.fromTo(contentRef.current,
        { scale: 0.8, y: 50, opacity: 0, rotationX: -15 },
        { scale: 1, y: 0, opacity: 1, rotationX: 0, duration: 0.5, ease: 'back.out(1.7)' }
      )
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div
        ref={contentRef}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        {/* Parchment Paper - Ultra Realistic */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            background: `
              linear-gradient(135deg, 
                #F5E6C8 0%, 
                #ECD9B0 15%, 
                #E8D4A8 30%, 
                #DFC89A 50%, 
                #D4BC8A 70%, 
                #C9B080 85%, 
                #BEA575 100%
              )`,
            boxShadow: `
              0 20px 60px rgba(0,0,0,0.6),
              0 0 0 1px rgba(139,90,43,0.3),
              inset 0 0 100px rgba(139,90,43,0.15),
              inset 0 0 30px rgba(0,0,0,0.1)
            `,
          }}
        >
          {/* Paper grain texture */}
          <div
            className="absolute inset-0 opacity-30 mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Aged stains */}
          <div className="absolute inset-0 opacity-20"
            style={{
              background: `
                radial-gradient(ellipse at 20% 30%, rgba(139,90,43,0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, rgba(139,90,43,0.3) 0%, transparent 40%),
                radial-gradient(ellipse at 50% 90%, rgba(139,90,43,0.2) 0%, transparent 30%)
              `,
            }}
          />

          {/* Burned/worn edges */}
          <div className="absolute inset-0"
            style={{
              boxShadow: `
                inset 0 0 80px rgba(139,69,19,0.4),
                inset 0 0 40px rgba(0,0,0,0.15)
              `,
            }}
          />

          {/* Top decorative border */}
          <div className="h-16 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#8B5A2B] to-transparent" />
            <div className="absolute inset-x-0 top-2 h-px bg-gradient-to-r from-transparent via-[#8B5A2B]/50 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center pt-4">
              <h2
                className="text-2xl md:text-3xl font-bold tracking-widest uppercase"
                style={{
                  fontFamily: 'Cinzel, serif',
                  color: '#4A3728',
                  textShadow: '1px 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                {title}
              </h2>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#8B5A2B]/20 transition-colors"
            style={{ color: '#4A3728' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content area */}
          <div
            className="px-8 py-6 max-h-[55vh] overflow-y-auto"
            style={{
              fontFamily: 'Crimson Text, Georgia, serif',
              color: '#3D2914',
            }}
          >
            {children}
          </div>

          {/* Bottom decorative border */}
          <div className="h-8 relative">
            <div className="absolute inset-x-0 bottom-2 h-px bg-gradient-to-r from-transparent via-[#8B5A2B]/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#8B5A2B] to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function HogwartsPortfolio() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    setMounted(true)

    // Hide intro after 4 seconds (faster for image-based)
    const introTimer = setTimeout(() => {
      setShowIntro(false)
    }, 4000)

    // GSAP title animation - delayed until after intro
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 5, ease: 'power3.out' }
      )
    }

    return () => clearTimeout(introTimer)
  }, [])

  const renderModalContent = () => {
    switch (activeSection) {
      case 'achievements':
        return (
          <div className="space-y-4">
            {achievements.map((ach, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-4 p-4 bg-[#4A3728]/10 rounded-lg border border-[#8B5A2B]/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#C4A747] to-[#8B7535] rounded-full flex items-center justify-center flex-shrink-0">
                  <Icons.trophy />
                </div>
                <div>
                  <h3 className="font-bold text-[#3D2914] text-lg">{ach.title}</h3>
                  <p className="text-[#5D4930]">{ach.issuer} - {ach.year}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )

      case 'talents':
        return (
          <div className="space-y-6">
            {skills.map((skill, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-[#3D2914]">{skill.name}</span>
                  <span className="font-bold text-[#8B5A2B]">{skill.level}%</span>
                </div>
                <div className="h-4 bg-[#8B5A2B]/20 rounded-full overflow-hidden border border-[#8B5A2B]/30">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #1A472A, #2A623D)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skill.items.map((item, j) => (
                    <span key={j} className="px-3 py-1 text-sm bg-[#1A472A] text-[#C4A747] rounded-full font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )

      case 'quests':
        return (
          <div className="space-y-4">
            {experiences.map((exp, i) => (
              <motion.div
                key={i}
                className="p-5 bg-[#4A3728]/10 rounded-lg border border-[#8B5A2B]/30"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h3 className="font-bold text-[#3D2914] text-xl">{exp.title}</h3>
                <p className="text-[#8B5A2B] font-semibold text-lg">{exp.company}</p>
                <p className="text-[#5D4930] mt-1">{exp.period} | {exp.location}</p>
                <p className="mt-3 text-[#3D2914] leading-relaxed">{exp.description}</p>
              </motion.div>
            ))}
          </div>
        )

      case 'collections':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj, i) => (
              <motion.div
                key={i}
                className="p-4 bg-[#4A3728]/10 rounded-lg border border-[#8B5A2B]/30 hover:border-[#C4A747]/50 transition-all cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -2 }}
              >
                <h3 className="font-bold text-[#3D2914] text-lg">{proj.title}</h3>
                <p className="text-[#5D4930] mt-1">{proj.description}</p>
              </motion.div>
            ))}
          </div>
        )

      case 'challenges':
        return (
          <div className="text-center space-y-6">
            <motion.div
              className="text-7xl font-bold"
              style={{ color: '#1A472A' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              5+
            </motion.div>
            <p className="text-[#5D4930] text-xl">Years of Coding Experience</p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { value: '10+', label: 'Projects' },
                { value: '8+', label: 'Technologies' },
                { value: '2+', label: 'Certifications' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="p-4 bg-[#4A3728]/10 rounded-lg border border-[#8B5A2B]/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="text-2xl font-bold text-[#8B5A2B]">{stat.value}</div>
                  <p className="text-[#3D2914]">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'owlpost':
        return (
          <div className="text-center space-y-6">
            <p className="text-[#5D4930] text-lg">Send me an owl! I would love to hear from you.</p>
            <motion.a
              href="mailto:muhfiqri033@gmail.com"
              className="inline-block px-8 py-4 bg-[#1A472A] text-[#C4A747] rounded-lg font-bold text-lg hover:bg-[#2A623D] transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              muhfiqri033@gmail.com
            </motion.a>
            <div className="flex justify-center gap-4 mt-6">
              {[
                { label: 'GitHub', url: 'https://github.com/FiqriAgustriawan' },
                { label: 'LinkedIn', url: 'https://www.linkedin.com/in/fiqri-agustriawan/' },
              ].map((link, i) => (
                <motion.a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#8B5A2B]/20 text-[#3D2914] rounded-lg font-semibold hover:bg-[#8B5A2B]/40 transition-colors border border-[#8B5A2B]/50"
                  whileHover={{ scale: 1.05 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </div>
        )

      case 'profile':
        return (
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <motion.div
              className="w-36 h-36 relative rounded-full overflow-hidden border-4 border-[#C4A747] flex-shrink-0 shadow-xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <Image src={profileSlytherin} alt="Fiqri" fill className="object-cover" />
            </motion.div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-[#3D2914]">Muhammad Fiqri Agustriawan</h3>
              <p className="text-[#8B5A2B] font-semibold text-lg">Software Engineer</p>
              <p className="text-[#3D2914] mt-3 leading-relaxed">
                Currently interning at Ashari Tech, Bandung. Specializing in backend development,
                AI integration, and fullstack application development.
              </p>
              <p className="text-[#3D2914] mt-2 leading-relaxed">
                Student at SMK Telkom Makassar, passionate about creating innovative solutions
                using modern technologies.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      achievements: 'Achievements',
      talents: 'Technical Skills',
      quests: 'Experience',
      collections: 'Projects',
      challenges: 'Stats',
      owlpost: 'Owl Post',
      profile: 'About Me',
    }
    return titles[activeSection || ''] || ''
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Intro Animation Overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: '#0a0a0a' }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Hogwarts Castle Image Background */}
            <div className="absolute inset-0">
              <Image
                src="/hogwarts_castle.jpg"
                alt="Hogwarts Castle"
                fill
                className="object-cover opacity-30"
                priority
              />
            </div>

            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 20%, rgba(10,10,10,0.9) 100%)',
              }}
            />

            {/* Intro Text */}
            <motion.div
              className="relative z-10 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <motion.div
                className="w-32 h-32 mx-auto mb-6 relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 1.5, type: 'spring' }}
              >
                <Image
                  src={logoSlytherin}
                  alt="Slytherin"
                  fill
                  className="object-contain drop-shadow-[0_0_40px_rgba(196,167,71,0.6)]"
                />
              </motion.div>
              <motion.h2
                className="text-3xl md:text-4xl text-[#C4A747] tracking-[0.3em] uppercase mb-4"
                style={{ fontFamily: 'Cinzel, serif', textShadow: '0 0 30px rgba(196,167,71,0.5)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
              >
                Welcome to Hogwarts
              </motion.h2>
              <motion.p
                className="text-[#888] tracking-wider text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
              >
                The portfolio of a Slytherin wizard
              </motion.p>

              {/* Loading indicator */}
              <motion.div
                className="mt-8 flex justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.5 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-[#C4A747] rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background with Hogwarts Castle Image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(to bottom, #0a0a0a 0%, #0d1a0d 50%, #0a0a0a 100%)',
        }}
      >
        {/* Hogwarts Castle Image */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl opacity-25 pointer-events-none">
          <Image
            src="/hogwarts_castle.jpg"
            alt="Hogwarts Castle"
            width={1920}
            height={1080}
            className="object-contain"
            priority
          />
        </div>

        {/* Fog/Mist overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, transparent 50%, rgba(10,10,10,0.8) 100%)',
          }}
        />
      </div>

      {/* 3D Scene with Book */}
      {mounted && !showIntro && <Scene3D />}

      {/* Magic Particles */}
      {!showIntro && <MagicParticles />}

      {/* ChatWidget */}
      <ChatWidget isDarkMode={true} />

      {/* Navigation - visible after intro */}
      <AnimatePresence>
        {!showIntro && (
          <motion.nav
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/portfolio">
              <motion.button
                className="px-4 py-2 bg-[#1a1a1a]/90 border border-[#C4A747]/60 text-[#C4A747] rounded-lg text-sm font-semibold hover:bg-[#1a1a1a] hover:border-[#C4A747] transition-all flex items-center gap-2 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Minimalist
              </motion.button>
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">

        {/* Title Badge */}
        <motion.div
          className="mb-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="px-6 py-2 bg-[#1A1A1A]/90 border border-[#C4A747]/50 rounded-full backdrop-blur-sm">
            <span className="text-[#C4A747] text-sm uppercase tracking-[0.25em] font-semibold">
              Software Engineer
            </span>
          </div>
        </motion.div>

        {/* Slytherin Logo */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, type: 'spring', stiffness: 80 }}
        >
          <div className="relative w-24 h-24 md:w-32 md:h-32">
            <Image
              src={logoSlytherin}
              alt="Slytherin"
              fill
              className="object-contain drop-shadow-[0_0_30px_rgba(196,167,71,0.4)]"
            />
          </div>
        </motion.div>

        {/* Diamond Menu Grid */}
        <div className="relative flex flex-col items-center gap-2 md:gap-4">
          {/* Row 1 */}
          <div className="flex gap-16 md:gap-28">
            <DiamondCard item={menuItems[0]} onClick={() => setActiveSection('achievements')} delay={0.2} />
            <DiamondCard item={menuItems[4]} onClick={() => setActiveSection('challenges')} delay={0.3} />
          </div>

          {/* Row 2 - with center profile */}
          <div className="flex items-center gap-6 md:gap-12 -my-2">
            <DiamondCard item={menuItems[1]} onClick={() => setActiveSection('talents')} delay={0.4} />
            <DiamondCard isCenter onClick={() => setActiveSection('profile')} delay={0.1} />
            <DiamondCard item={menuItems[3]} onClick={() => setActiveSection('quests')} delay={0.5} />
          </div>

          {/* Row 3 */}
          <div className="flex gap-16 md:gap-28 -mt-2">
            <Link href="/book">
              <DiamondCard item={menuItems[2]} delay={0.6} />
            </Link>
            <DiamondCard item={menuItems[5]} onClick={() => setActiveSection('owlpost')} delay={0.7} />
          </div>
        </div>

        {/* Name and Title */}
        <div ref={titleRef} className="mt-10 text-center opacity-0">
          <h1
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#C4A747] tracking-wide"
            style={{
              fontFamily: 'Cinzel, serif',
              textShadow: '0 0 40px rgba(196, 167, 71, 0.6), 0 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Muhammad Fiqri Agustriawan
          </h1>
          <p className="text-[#888] mt-3 tracking-[0.3em] uppercase text-xs md:text-sm">
            Fullstack Developer | AI Engineer | DevOps
          </p>
          <p className="text-[#555] mt-2 text-xs tracking-wider">
            Hegarmanah, Cidadap, Bandung
          </p>
        </div>
      </div>

      {/* Parchment Modal */}
      <AnimatePresence>
        {activeSection && (
          <ParchmentModal
            isOpen={true}
            onClose={() => setActiveSection(null)}
            title={getSectionTitle()}
          >
            {renderModalContent()}
          </ParchmentModal>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-[#444] text-xs z-10">
        <p className="tracking-wider">House Slytherin | Ambition leads to greatness</p>
      </footer>
    </main>
  )
}

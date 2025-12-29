"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <main className="relative min-h-screen flex items-center justify-center p-4">
        <div 
          className={`max-w-4xl w-full transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Card Container */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8 md:p-12 lg:p-16">
              
              {/* Profile Section */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  <div className="relative">
                    <Image
                      src="/profile.jpg"
                      alt="Fiqri Agustriawan"
                      width={200}
                      height={200}
                      className="rounded-full border-4 border-white/20 object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Name and Title */}
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
                    Fiqri Agustriawan
                  </h1>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                    <span className="px-4 py-2 bg-purple-500/30 backdrop-blur-sm rounded-full text-purple-200 text-sm font-medium border border-purple-400/30">
                      💻 Web Developer
                    </span>
                    <span className="px-4 py-2 bg-pink-500/30 backdrop-blur-sm rounded-full text-pink-200 text-sm font-medium border border-pink-400/30">
                      🎓 Student
                    </span>
                    <span className="px-4 py-2 bg-blue-500/30 backdrop-blur-sm rounded-full text-blue-200 text-sm font-medium border border-blue-400/30">
                      🚀 Tech Enthusiast
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-3xl">👋</span> About Me
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Hello! I'm Fiqri Agustriawan, a passionate web developer and student with a keen interest in creating 
                    beautiful and functional web applications. I love exploring new technologies and building projects that 
                    make a difference. Currently focused on mastering modern web development frameworks like Next.js, React, 
                    and TypeScript.
                  </p>
                </div>

                {/* Skills & Interests */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-3xl">⚡</span> What I Do
                  </h2>
                  <ul className="space-y-3 text-gray-300 text-lg">
                    <li className="flex items-center gap-3 group cursor-pointer">
                      <span className="text-2xl group-hover:scale-125 transition-transform">🎨</span>
                      <span className="group-hover:text-white transition-colors">Building responsive and modern web interfaces</span>
                    </li>
                    <li className="flex items-center gap-3 group cursor-pointer">
                      <span className="text-2xl group-hover:scale-125 transition-transform">⚛️</span>
                      <span className="group-hover:text-white transition-colors">Developing with React, Next.js, and TypeScript</span>
                    </li>
                    <li className="flex items-center gap-3 group cursor-pointer">
                      <span className="text-2xl group-hover:scale-125 transition-transform">🎯</span>
                      <span className="group-hover:text-white transition-colors">Learning new technologies and best practices</span>
                    </li>
                    <li className="flex items-center gap-3 group cursor-pointer">
                      <span className="text-2xl group-hover:scale-125 transition-transform">🌟</span>
                      <span className="group-hover:text-white transition-colors">Creating impactful digital experiences</span>
                    </li>
                  </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a
                    href="https://github.com/FiqriAgustriawan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    View GitHub
                  </a>
                  <a
                    href="https://fiqriagustriawan.github.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-300"
                  >
                    <span className="text-xl">🌐</span>
                    Visit Portfolio
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-white/60 mt-8 text-sm">
            Built with Next.js, TypeScript & Tailwind CSS ✨
          </p>
        </div>
      </main>
    </div>
  );
}

'use client'

import Image from 'next/image'

interface PortfolioProps {
  isDarkMode: boolean
}

export default function Portfolio({ isDarkMode }: PortfolioProps) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-white'
        }`}
    >
      <div className="max-w-2xl w-full">
        {/* Profile Card */}
        <div
          className={`rounded-lg border p-8 transition-colors duration-300 ${isDarkMode
              ? 'bg-neutral-900 border-neutral-800'
              : 'bg-white border-neutral-200 shadow-sm'
            }`}
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <Image
                src="/profile_Fiqri.jpeg"
                alt="Fiqri Agustriawan"
                width={120}
                height={120}
                className={`rounded-full object-cover border-2 transition-colors duration-300 ${isDarkMode ? 'border-neutral-700' : 'border-neutral-200'
                  }`}
                priority
              />
              {/* Online Status */}
              <div
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 ${isDarkMode
                    ? 'bg-green-500 border-neutral-900'
                    : 'bg-green-500 border-white'
                  }`}
              ></div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h1
                className={`text-2xl font-bold mb-1 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-neutral-900'
                  }`}
              >
                Fiqri Agustriawan
              </h1>
              <p
                className={`text-base mb-3 transition-colors duration-300 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                  }`}
              >
                Web Developer • Student
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${isDarkMode
                      ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                    }`}
                >
                  React
                </span>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${isDarkMode
                      ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                    }`}
                >
                  Next.js
                </span>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${isDarkMode
                      ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                    }`}
                >
                  TypeScript
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <h2
              className={`text-sm font-semibold uppercase tracking-wider mb-3 transition-colors duration-300 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'
                }`}
            >
              About
            </h2>
            <p
              className={`text-sm leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}
            >
              Passionate web developer focused on creating clean, functional
              web applications. Currently exploring modern frameworks and best
              practices in frontend development.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://github.com/FiqriAgustriawan"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${isDarkMode
                  ? 'bg-white text-black hover:bg-neutral-200'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </a>
            <a
              href="https://fiqriagustriawan.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm border transition-all duration-200 ${isDarkMode
                  ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Portfolio
            </a>
          </div>
        </div>

        {/* Footer */}
        <p
          className={`text-center text-xs mt-6 transition-colors duration-300 ${isDarkMode ? 'text-neutral-600' : 'text-neutral-400'
            }`}
        >
          Built with Next.js and TypeScript
        </p>
      </div>
    </div>
  )
}

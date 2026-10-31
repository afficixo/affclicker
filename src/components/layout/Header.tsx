'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Sun, Moon, Bell, Search } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default function Header() {
  const [username, setUsername] = useState('')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setUsername(data.username || 'Admin')
        }
      } catch { /* User not logged in */ }
    }
    fetchUser()

    const dark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  return (
    <header className="sticky top-0 z-20 overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,rgba(2,6,23,0.96),rgba(8,15,35,0.9))] px-4 py-3 shadow-[0_12px_40px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:px-6 sm:py-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.12),transparent_26%)]" />
      <div className="relative flex flex-wrap items-center justify-between gap-3 pl-12 md:pl-0">
        <div className="flex items-center gap-3 min-w-0">
          <Logo variant="compact" size="sm" />
          <span className="text-white/10 hidden sm:inline">|</span>
          <div className="hidden sm:block">
            <h2 className="text-base sm:text-lg font-semibold text-white truncate">
              Welcome back, <span className="gradient-text">{username || 'Admin'}</span>!
            </h2>
            <p className="mt-0.5 text-xs text-emerald-300/80">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live session verified
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Search..."
              className="w-40 rounded-xl border border-white/10 bg-white/8 py-1.5 pl-9 pr-4 text-sm text-white placeholder:text-white/20 transition focus:border-cyan-400/35 focus:ring-2 focus:ring-cyan-400/20 lg:w-56"
            />
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-white/35 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:bg-cyan-400/10 hover:text-cyan-200"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-white/35 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:bg-cyan-400/10 hover:text-cyan-200" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 shadow-[0_10px_24px_rgba(99,102,241,0.28)] flex-shrink-0 ring-1 ring-white/10">
              <Image
                src="/affclicker-favicon-20261031.png"
                alt="AffClicker logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>
        </div>
      </div>
    </header>
  )
}
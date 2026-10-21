'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Menu, Moon, Sun, X } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  const clockTime = now?.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).split(':')

  useEffect(() => {
    const updateTime = () => setNow(new Date())
    updateTime()
    const timer = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const syncTheme = () => {
      const storedTheme = window.localStorage.getItem('theme')
      setIsDark(storedTheme
        ? storedTheme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches)
    }

    syncTheme()
    window.addEventListener('storage', syncTheme)
    window.addEventListener('themechange', syncTheme)
    return () => {
      window.removeEventListener('storage', syncTheme)
      window.removeEventListener('themechange', syncTheme)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })

        if (!isActive) return

        if (!response.ok) {
          router.push('/login')
        }
      } catch (error) {
        if (!isActive) return

        console.error('Dashboard auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()

    return () => {
      isActive = false
    }
  }, [router])

  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains('dark')
    const applyTheme = () => {
      document.documentElement.classList.toggle('dark', nextIsDark)
      window.localStorage.setItem('theme', nextIsDark ? 'dark' : 'light')
      window.dispatchEvent(new Event('themechange'))
      setIsDark(nextIsDark)
    }
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => unknown
    }

    if (
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      transitionDocument.startViewTransition
    ) {
      transitionDocument.startViewTransition(applyTheme)
    } else {
      applyTheme()
    }
  }

  return (
    <div className="dashboard-shell flex h-dvh flex-col overflow-hidden bg-[var(--page-bg)]">
      <header className="relative z-[60] flex h-14 w-full shrink-0 border-b border-[#263238]/10 bg-white shadow-[0_2px_8px_rgba(38,50,56,0.05)] dark:border-white/10 dark:bg-[#202b2f] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
        <div className={`hidden h-full shrink-0 items-center border-r border-[#263238]/10 bg-[#f3f6f5] px-3 transition-[width] duration-300 dark:border-white/10 dark:bg-[#192326] lg:flex ${sidebarCollapsed ? 'w-16 justify-center' : 'w-52 justify-between'}`}>
          {!sidebarCollapsed && (
            <Image
              src="/afficixo-logo.png"
              alt="Afficixo logo"
              width={128}
              height={40}
              className="h-10 w-32 object-contain"
              priority
            />
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#263238]/15 bg-white text-[#455964] transition-colors hover:border-[#4dd935]/60 hover:bg-[#efffec] hover:text-[#24651d] dark:border-white/15 dark:bg-[#263238] dark:text-slate-200 dark:hover:border-[#5ff442]/50 dark:hover:bg-[#5ff442]/10 dark:hover:text-[#a2fa8e]"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/afficixo-logo.png"
              alt="Afficixo logo"
              width={112}
              height={36}
              className="h-8 w-28 object-contain lg:hidden"
              priority
            />
            {now && (
              <time aria-label={`Current time ${clockTime?.join(':')}`} dateTime={now.toISOString()} className="hidden items-center gap-2 font-sans text-[26px] font-medium leading-none tracking-tight text-slate-800 tabular-nums dark:text-slate-100 sm:flex">
                {clockTime?.map((part, index) => (
                  <span key={index} className="flex items-center gap-2">
                    {index > 0 && <span className="text-slate-400 dark:text-slate-500">:</span>}
                    <span>{part}</span>
                  </span>
                ))}
              </time>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#263238]/15 bg-white text-[#455964] shadow-sm transition-colors hover:border-[#4dd935]/60 hover:bg-[#efffec] hover:text-[#24651d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#359f25] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/15 dark:bg-[#263238] dark:text-[#a2fa8e] dark:shadow-black/20 dark:hover:border-[#5ff442]/50 dark:hover:bg-[#5ff442]/10 dark:hover:text-[#c4ffb4] dark:focus-visible:ring-[#8aff70] dark:focus-visible:ring-offset-[#202b2f]"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#263238]/15 bg-white text-[#455964] transition-colors hover:border-[#4dd935]/60 hover:bg-[#efffec] hover:text-[#24651d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#359f25] dark:border-white/15 dark:bg-[#263238] dark:text-slate-200 dark:hover:border-[#5ff442]/50 dark:hover:bg-[#5ff442]/10 dark:hover:text-[#a2fa8e] lg:hidden"
              aria-label={mobileMenuOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={mobileMenuOpen}
              aria-controls="dashboard-mobile-sidebar"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onMobileOpenChange={setMobileMenuOpen}
          mobileOpen={mobileMenuOpen}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto px-2 py-3 sm:px-3 sm:py-5 lg:px-3 lg:py-6">
            <div className="w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
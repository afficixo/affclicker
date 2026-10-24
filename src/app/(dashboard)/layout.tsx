'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Menu, MessageCircle, Moon, Settings, Sun, X } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { getDashboardBasePath } from '@/lib/auth/dashboard-path'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [now, setNow] = useState<Date | null>(null)

  const clockTime = now?.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).split(':')
  const clockDate = now?.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })

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
          return
        }
        const data = await response.json()
        setUserRole(data?.role ?? null)
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
              src="/afficixlogo.png"
              alt="Afficix logo"
              width={2171}
              height={724}
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
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <Image
              src="/afficixlogo.png"
              alt="Afficix logo"
              width={2171}
              height={724}
              className="h-8 w-[88px] shrink-0 object-contain min-[360px]:w-[106px] sm:h-9 sm:w-[124px] lg:hidden"
              priority
            />
            {now && (
              <time
                aria-label={`Current local time ${clockTime?.join(':')} on ${clockDate}`}
                dateTime={now.toISOString()}
                className="flex h-8 shrink-0 items-center rounded-lg border border-[#24651d]/25 bg-white px-2 shadow-sm shadow-slate-900/[0.06] ring-1 ring-inset ring-white sm:h-10 sm:gap-3 sm:px-3 dark:border-[#5ff442]/40 dark:bg-[#192326] dark:shadow-black/20 dark:ring-white/[0.06]"
              >
                <span className="flex items-baseline font-mono leading-none tabular-nums">
                  <span className="text-[16px] font-bold tracking-tight text-slate-900 sm:text-[20px] dark:text-white">{clockTime?.[0]}:{clockTime?.[1]}</span>
                  <span className="ml-1 hidden text-[12px] font-semibold text-slate-600 sm:inline dark:text-slate-300">{clockTime?.[2]}</span>
                </span>
                <span className="hidden h-5 w-px bg-[#24651d]/30 sm:block dark:bg-[#5ff442]/35" aria-hidden="true" />
                <span className="hidden text-xs font-semibold tracking-wide text-slate-700 sm:inline dark:text-slate-200">{clockDate}</span>
              </time>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5 rounded-xl border border-[#263238]/10 bg-slate-50/80 p-1 shadow-sm dark:border-white/10 dark:bg-[#192326]/70">
            <nav aria-label="Quick links" className="flex shrink-0 items-center gap-0.5">
              <Link
                href={`${getDashboardBasePath(userRole)}/settings`}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-[#24651d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#359f25] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-[#a2fa8e] min-[360px]:h-8 min-[360px]:w-8 sm:h-9 sm:w-9"
                aria-label="Settings"
                title="Settings"
              >
                <Settings className="h-4 w-4 sm:h-[17px] sm:w-[17px]" aria-hidden="true" />
              </Link>
              {userRole === 'OWNER' && (
                <Link
                  href="/owner/support"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-[#24651d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#359f25] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-[#a2fa8e] min-[360px]:h-8 min-[360px]:w-8 sm:h-9 sm:w-9"
                  aria-label="Support Inbox"
                  title="Support Inbox"
                >
                  <MessageCircle className="h-4 w-4 sm:h-[17px] sm:w-[17px]" aria-hidden="true" />
                </Link>
              )}
            </nav>
            <span className="mx-0.5 h-5 w-px bg-slate-300/80 dark:bg-white/15" aria-hidden="true" />
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#455964] transition-colors hover:bg-white hover:text-[#24651d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#359f25] dark:text-[#a2fa8e] dark:hover:bg-white/[0.08] dark:hover:text-[#c4ffb4] min-[360px]:h-8 min-[360px]:w-8 sm:h-9 sm:w-9"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun className="h-[18px] w-[18px] sm:h-5 sm:w-5" /> : <Moon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#455964] transition-colors hover:bg-white hover:text-[#24651d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#359f25] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-[#a2fa8e] min-[360px]:h-8 min-[360px]:w-8 lg:hidden sm:h-9 sm:w-9"
              aria-label={mobileMenuOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={mobileMenuOpen}
              aria-controls="dashboard-mobile-sidebar"
            >
              {mobileMenuOpen ? <X className="h-[18px] w-[18px] sm:h-5 sm:w-5" /> : <Menu className="h-[18px] w-[18px] sm:h-5 sm:w-5" />}
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
          <main data-page-loader-region className="relative flex min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto px-2 py-3 sm:px-3 sm:py-5 lg:px-3 lg:py-6">
            <div className="w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
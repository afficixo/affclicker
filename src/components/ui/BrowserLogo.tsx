'use client'

import { useId } from 'react'
import { Globe2 } from 'lucide-react'

export function BrowserLogo({ name }: { name: string }) {
  const browser = name.toLowerCase()
  const gradientId = useId().replace(/:/g, '')
  const iconProps = {
    className: 'h-4 w-4 shrink-0',
    role: 'img' as const,
    'aria-label': `${name} logo`,
  }

  if (browser.includes('chrome') || browser.includes('chromium')) {
    return (
      <svg viewBox="0 0 48 48" {...iconProps}>
        <path fill="#EA4335" d="M24 24h24A24 24 0 0 0 5.7 11.9l12 20.8A12 12 0 0 1 24 24Z" />
        <path fill="#34A853" d="M24 24 12 44.8A24 24 0 0 0 48 24H24a12 12 0 0 1-10.4 6Z" />
        <path fill="#FBBC05" d="M24 24H0a24 24 0 0 0 12 20.8l12-20.8a12 12 0 0 1 0-12Z" />
        <circle cx="24" cy="24" r="10.5" fill="#4285F4" stroke="white" strokeWidth="2" />
      </svg>
    )
  }

  if (browser.includes('firefox')) {
    return (
      <svg viewBox="0 0 48 48" {...iconProps}>
        <defs>
          <linearGradient id={`${gradientId}-firefox`} x1="8%" y1="10%" x2="85%" y2="90%">
            <stop stopColor="#FFCA55" />
            <stop offset=".48" stopColor="#FF7139" />
            <stop offset="1" stopColor="#D63269" />
          </linearGradient>
        </defs>
        <path fill={`url(#${gradientId}-firefox)`} d="M39.8 10.2c-2.4 1-4.7 1.4-6.7 1.1 1.8-2.5 2.2-5.1 1.2-7.8-2.2 2-4.2 3.4-6.1 4.2-3.4-1.8-7-2.4-10.8-1.6.5 1.2.7 2.4.6 3.5-3.5.8-6.5 2.6-8.8 5.3l-3.4-1.5c.2 2.2.9 4 2.1 5.5-2.6 5.6-2 11.9 1.8 17 4.1 5.5 11.5 8.5 19 7.5 8.8-1.2 15.1-8.2 15.1-16.7 0-6.6-3.3-12-9-16.5Z" />
        <path fill="#6D3CC3" d="M36.8 23.4c-2.8-2.7-6.3-3.7-9.4-2.9 1.3-2.4 3.7-4.1 6.7-4.7-5.8-2.4-12.1-.2-14.6 5.1-2.2 4.8-.3 10.4 4.3 12.7 4.6 2.3 10.4.6 12.9-3.9 1.3-2.3 1.2-4.6.1-6.3Z" />
      </svg>
    )
  }

  if (browser.includes('safari')) {
    return (
      <svg viewBox="0 0 48 48" {...iconProps}>
        <circle cx="24" cy="24" r="22" fill="#2AA7E8" />
        <circle cx="24" cy="24" r="18" fill="none" stroke="#DDF5FF" strokeWidth="1.5" />
        <path d="m29 18-4 9-6 4 4-9 6-4Z" fill="#F04452" stroke="white" strokeLinejoin="round" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="2" fill="white" />
      </svg>
    )
  }

  if (browser.includes('edge')) {
    return (
      <svg viewBox="0 0 48 48" {...iconProps}>
        <defs>
          <linearGradient id={`${gradientId}-edge`} x1="10%" y1="15%" x2="90%" y2="85%">
            <stop stopColor="#0CBAA5" />
            <stop offset=".55" stopColor="#0877D1" />
            <stop offset="1" stopColor="#1746A2" />
          </linearGradient>
        </defs>
        <path fill={`url(#${gradientId}-edge)`} d="M43.5 29.4c-1.8 8.1-9 14-17.8 14-10.5 0-18.9-7.8-18.9-18.1 0-7.8 5.1-14.5 12.3-16.9-5.7 3.9-7.9 9.4-6.4 14.1 1.8-4.8 6.4-8 12.2-8 8.2 0 13.6 5.4 13.6 12.3 0 .9-.1 1.8-.3 2.6H20c1.5 3.1 4.7 4.9 8.7 4.9 4.7 0 8.2-1.8 10.4-5.4l4.4.5Z" />
        <path fill="#35D0B5" d="M6.9 23.1c.5-8.2 7.3-15 16.4-15 6.4 0 11.7 3.3 14.4 8.5-3.2-2.1-6.4-3.1-10.1-3.1-8.1 0-14.7 4.2-18.1 10.8l-2.6-1.2Z" />
      </svg>
    )
  }

  if (browser.includes('opera')) {
    return (
      <svg viewBox="0 0 48 48" {...iconProps}>
        <path fill="#FF1B2D" d="M24 2a22 22 0 1 0 0 44 22 22 0 0 0 0-44Zm0 6c5.2 0 8.5 7 8.5 16s-3.3 16-8.5 16-8.5-7-8.5-16S18.8 8 24 8Z" />
      </svg>
    )
  }

  if (browser.includes('facebook')) {
    return (
      <svg viewBox="0 0 48 48" {...iconProps}>
        <circle cx="24" cy="24" r="22" fill="#0866FF" />
        <path fill="white" d="M27.5 40V26h4.7l.7-5.5h-5.4V17c0-1.6.5-2.7 2.8-2.7h2.9v-5a38 38 0 0 0-4.2-.2c-4.2 0-7.1 2.6-7.1 7.4v4h-4.8V26h4.8v14h5.6Z" />
      </svg>
    )
  }

  return (
    <Globe2
      className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
      role="img"
      aria-label={`${name} logo unavailable`}
    />
  )
}

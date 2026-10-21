'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getCountryLabel } from '@/lib/utils/country'
import { BrowserLogo } from '@/components/ui/BrowserLogo'
import { CountryFlag } from '@/components/ui/CountryFlag'
import {
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  Check,
  X,
  ExternalLink,
  MousePointerClick,
  Activity,
  Clock,
} from 'lucide-react'

interface Click {
  id: string
  ipAddress: string | null
  country: string | null
  city: string | null
  region?: string | null
  isp: string | null
  referrer: string | null
  browser: string | null
  browserVersion: string | null
  os: string | null
  deviceType: string | null
  deviceBrand: string | null
  userAgent: string | null
  isUnique: boolean
  isBot: boolean
  botScore: number | null
  createdAt: string
  linkAccount: {
    accountName: string
    slug: string
  }
}

interface ClickLogsProps {
  filter: string
}

export default function ClickLogs({ filter }: ClickLogsProps) {
  const router = useRouter()
  const [clicks, setClicks] = useState<Click[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showBrowserVersion, setShowBrowserVersion] = useState<string | null>(null)
  const [showDeviceInfo, setShowDeviceInfo] = useState<string | null>(null)
  const [showGeoInfo, setShowGeoInfo] = useState<string | null>(null)

  const limit = 100

  const fetchClicks = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      const response = await fetch(`/api/analytics/clicks?${params}`)
      if (response.status === 401) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setClicks(data.clicks || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch clicks:', error)
    } finally {
      setLoading(false)
    }
  }, [page, router])

  useEffect(() => {
    fetchClicks(true)
  }, [fetchClicks])

  const getDeviceIcon = (deviceType: string | null) => {
    if (!deviceType) return <Monitor className="w-4 h-4" />
    const device = deviceType.toLowerCase()
    if (device.includes('mobile') || device.includes('phone')) {
      return <Smartphone className="w-4 h-4" />
    }
    if (device.includes('tablet')) {
      return <Tablet className="w-4 h-4" />
    }
    return <Monitor className="w-4 h-4" />
  }

  const formatDateTwoLines = (date: string) => {
    const dateObj = new Date(date)
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    return { date: dateStr, time: timeStr }
  }

  const getReferrerInfo = (referrer: string | null) => {
    if (!referrer) return { hostname: 'Direct', href: null }
    const trimmed = referrer.trim()
    if (!trimmed) return { hostname: 'Direct', href: null }
    const normalizedHref = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    try {
      const parsed = new URL(normalizedHref)
      return { hostname: parsed.hostname || 'Referrer', href: parsed.toString() }
    } catch {
      return { hostname: trimmed.split('/')[0] || 'Referrer', href: null }
    }
  }

  const getBrowserLabel = (click: Click) => click.browser || 'Unknown Browser'
  const getBrowserVersion = (click: Click) => click.browserVersion || 'Version not available'
  const getDeviceLabel = (click: Click) => `${click.os || click.deviceType || 'Unknown OS'} • ${click.deviceBrand || click.deviceType || 'Unknown Device'}`

  const getLocationSummary = (click: Click) => {
    const countryLabel = getCountryLabel(click.country)
    const decodedCity = click.city ? decodeURIComponent(click.city) : null
    const decodedRegion = click.region ? decodeURIComponent(click.region) : null
    const locationText = [decodedCity, decodedRegion].filter(Boolean).join(', ')
    const ispText = click.isp?.trim() && click.isp !== 'Unknown' && click.isp !== 'Proxy Geo Header' ? click.isp.trim() : null
    if (showGeoInfo === click.id) {
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5"><CountryFlag country={click.country} /><span className="font-medium text-slate-800 dark:text-white/80">{countryLabel}</span></div>
          {(locationText || ispText) && <div className="text-xs text-slate-600 dark:text-slate-300">{locationText}{locationText && ispText ? ` • ${ispText}` : ispText}</div>}
        </div>
      )
    }
    return <CountryFlag country={click.country} />
  }

  if (loading) {
    return (
      <div className="border-0 bg-transparent p-0">
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-4"><div className="w-8 h-8 skeleton rounded" /><div className="flex-1"><div className="h-4 w-48 skeleton rounded" /><div className="h-3 w-32 skeleton rounded mt-2" /></div><div className="h-3 w-20 skeleton rounded" /></div>)}</div>
      </div>
    )
  }

  return (
    <div className="border-0 bg-transparent overflow-hidden transition-colors duration-200">
      <div className="border-0 bg-transparent p-0">
      <div className="mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-[var(--primary-700)] dark:text-[var(--primary-300)]" strokeWidth={1.5} />
        <span className="text-base font-semibold text-slate-900 dark:text-white/90">Click Activity</span>
      </div>
      <div className="space-y-2 lg:hidden">
        {clicks.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-10 text-center">
            <MousePointerClick className="h-7 w-7 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
            <p className="text-sm text-slate-600 dark:text-slate-300">No clicks match your filters</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Share a link and the first clicks will appear here with campaign, device, and location insights.
            </p>
          </div>
        ) : (
          clicks.map((click) => {
            return (
              <div
                key={click.id}
                className={`rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-3 shadow-[var(--shadow-sm)] ${click.isUnique ? '' : 'border-amber-400/40 bg-amber-50 dark:bg-amber-500/5'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Time</div>
                    <div className="flex flex-col gap-0">
                      {(() => {
                        const { date, time } = formatDateTwoLines(click.createdAt)
                        return (
                          <>
                            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{date}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-300">{time}</div>
                          </>
                        )
                      })()}
                    </div>
                    <div className="mt-1 max-w-[220px] truncate text-xs font-semibold text-slate-900 dark:text-white" title={click.linkAccount.accountName}>
                      {click.linkAccount.accountName}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      aria-label={click.isUnique ? 'Unique click' : 'Repeated click'}
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${click.isUnique ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-300' : 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-300'}`}
                    >
                      {click.isUnique ? 'Unique' : 'Repeated'}
                    </span>
                  </div>
                </div>

                <div className="mt-2 space-y-0 divide-y divide-[var(--surface-border)] text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600 dark:text-slate-300">IP:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{click.ipAddress}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600 dark:text-slate-300">Campaign:</span>
                    <span className="truncate text-[var(--primary-700)] dark:text-[var(--primary-300)]">{click.linkAccount.slug}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600 dark:text-slate-300">Device:</span>
                    <button onClick={() => setShowDeviceInfo(showDeviceInfo === click.id ? null : click.id)} className="truncate text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer transition" title="More details">
                      {getDeviceLabel(click)}
                    </button>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600 dark:text-slate-300">Browser:</span>
                    <button onClick={() => setShowBrowserVersion(showBrowserVersion === click.id ? null : click.id)} className="flex max-w-[70%] items-center gap-1.5 text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-200 cursor-pointer transition" title="More details">
                      <BrowserLogo name={getBrowserLabel(click)} />
                      <span className="truncate">{showBrowserVersion === click.id ? getBrowserVersion(click) : getBrowserLabel(click)}</span>
                    </button>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600 dark:text-slate-300">Referrer:</span>
                    <span className="max-w-[75%] break-all text-right text-slate-600 dark:text-slate-300">
                      {click.referrer || 'Direct'}
                    </span>
                  </div>
                  <button onClick={() => setShowGeoInfo(showGeoInfo === click.id ? null : click.id)} className="flex justify-between w-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer transition py-1.5" title="More details">
                    <span className="text-slate-600 dark:text-slate-300">Location:</span>
                    <span className="flex items-center gap-1">
                      <CountryFlag country={click.country} />
                      {showGeoInfo === click.id && <span className="text-slate-800 dark:text-white/80">{getCountryLabel(click.country)}</span>}
                    </span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)] lg:block" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className={`${clicks.length > 0 ? 'w-full min-w-[980px] table-auto' : 'w-full table-fixed'}`}>
          <thead className={`${clicks.length === 0 ? 'hidden lg:table-header-group' : ''} border-b border-[var(--surface-border)] bg-[var(--surface-elevated)]`}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-600 dark:text-slate-300">Campaign</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-600 dark:text-slate-300">Location</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-600 dark:text-slate-300">Device</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-600 dark:text-slate-300">Browser</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-600 dark:text-slate-300">Referrer</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-600 dark:text-slate-300">IP Address</th>
              <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-600 dark:text-slate-300">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-border)]">
            {clicks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <MousePointerClick className="h-7 w-7 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                    <p className="text-sm text-slate-600 dark:text-slate-300">No clicks match your filters</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Share a link and the first clicks will appear here with campaign, device, and location insights.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              clicks.map((click, index) => (
                <tr
                  key={click.id}
                  className={`transition-all duration-200 ${click.isUnique ? 'hover:bg-[var(--primary-50)] dark:hover:bg-[#5ff442]/10' : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/5 dark:hover:bg-amber-500/10'}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex flex-col gap-0">
                      <span className="font-medium text-[var(--primary-700)] dark:text-[var(--primary-300)]">{click.linkAccount.accountName}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-300">/{click.linkAccount.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                    <button onClick={() => setShowGeoInfo(showGeoInfo === click.id ? null : click.id)} className="hover:opacity-70 cursor-pointer transition" title="Click to see geo details">
                      {getLocationSummary(click)}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                    <button onClick={() => setShowDeviceInfo(showDeviceInfo === click.id ? null : click.id)} className="flex items-center gap-1 hover:text-[var(--primary-700)] dark:hover:text-[var(--primary-300)] cursor-pointer transition" title="Click for more details">
                      {getDeviceIcon(click.deviceType)}
                      <span className="truncate max-w-[140px]">{getDeviceLabel(click)}</span>
                    </button>
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <BrowserLogo name={getBrowserLabel(click)} />
                      <button onClick={() => setShowBrowserVersion(showBrowserVersion === click.id ? null : click.id)} className="truncate max-w-[140px] text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-200 cursor-pointer transition" title="Click to see version">
                        {showBrowserVersion === click.id ? getBrowserVersion(click) : getBrowserLabel(click)}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-[var(--primary-700)] dark:text-[var(--primary-300)]">
                    {click.referrer ? (() => {
                      const referrerInfo = getReferrerInfo(click.referrer)
                      return (
                        <a
                          href={referrerInfo.href || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-slate-500 hover:text-[var(--primary-700)] hover:underline transition dark:text-slate-400 dark:hover:text-[var(--primary-300)]"
                          title={click.referrer}
                          onClick={(event) => {
                            if (!referrerInfo.href) event.preventDefault()
                          }}
                        >
                          <span className="truncate">{referrerInfo.hostname}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      )
                    })() : (
                      <span className="text-slate-600 dark:text-slate-300">Direct</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm font-mono text-slate-600 dark:text-slate-400">{click.ipAddress}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center">
                      {click.isUnique ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center text-emerald-400 transition-transform hover:scale-110" aria-label="Unique click" title="Unique click">
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center text-amber-400 transition-transform hover:scale-110" aria-label="Repeated click" title="Repeated click">
                          <X className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs whitespace-nowrap text-slate-700 dark:text-slate-300">
                    <div className="flex flex-col items-start gap-0">
                      {(() => {
                        const { date, time } = formatDateTwoLines(click.createdAt)
                        return (
                          <>
                            <div className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5 text-slate-600 dark:text-slate-300" />
                              <span>{date}</span>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-300">{time}</span>
                          </>
                        )
                      })()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      </div>
    </div>
  )
}
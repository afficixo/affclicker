'use client'

import { Flame, Globe2, Link2, Monitor, MonitorSmartphone, Smartphone, Tablet } from 'lucide-react'
import { formatNumber } from '@/lib/utils/helpers'
import { BrowserLogo } from '@/components/ui/BrowserLogo'
import { CountryFlag } from '@/components/ui/CountryFlag'

interface BreakdownItem {
  name: string
  clicks: number
  uniqueClicks: number
}

interface TrafficBreakdownProps {
  referrerBreakdown?: BreakdownItem[]
  browserBreakdown?: BreakdownItem[]
  deviceBreakdown?: BreakdownItem[]
  countryBreakdown?: BreakdownItem[]
  isLoading?: boolean
}

const palette = ['bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-[var(--primary-600)]']

function getSafeReferrerHref(value: string) {
  try {
    const candidate = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`
    const url = new URL(candidate)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

function DeviceIcon({ name }: { name: string }) {
  const device = name.toLowerCase()
  const className = 'h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300'

  if (device.includes('tablet') || device.includes('ipad')) {
    return <Tablet className={className} aria-hidden="true" />
  }
  if (device.includes('mobile') || device.includes('phone') || device.includes('android') || device.includes('iphone')) {
    return <Smartphone className={className} aria-hidden="true" />
  }
  if (device.includes('desktop') || device.includes('computer') || device.includes('laptop') || device.includes('windows') || device.includes('mac')) {
    return <Monitor className={className} aria-hidden="true" />
  }

  return <MonitorSmartphone className={className} aria-hidden="true" />
}

function BreakdownSection({
  title,
  icon: Icon,
  items,
  accent,
  titleColor,
  iconColor,
  valueColor,
  isLoading,
}: {
  title: string
  icon: typeof Globe2
  items: BreakdownItem[]
  accent: string
  titleColor?: string
  iconColor?: string
  valueColor?: string
  isLoading: boolean
}) {
  // Filter out items with empty names or "Unknown"
  const filteredItems = items.filter(item => item.name && item.name.trim() !== '' && item.name.toLowerCase() !== 'unknown')
  const maxValue = Math.max(...filteredItems.map(item => Math.max(0, item.clicks)), 1)

  return (
    <section aria-busy={isLoading} className="flex h-full flex-col rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-elevated)] ring-1 ring-inset ring-[var(--surface-border)]">
          <Icon className={`h-4 w-4 ${iconColor ?? 'text-slate-500 dark:text-slate-400'}`} aria-hidden="true" />
        </span>
        <h4 className={`min-w-0 flex-1 text-sm font-semibold ${titleColor ?? 'text-slate-900 dark:text-white'}`}>{title}</h4>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Clicks</span>
      </div>

      {isLoading ? (
        <div aria-hidden="true" className="flex flex-col space-y-3.5">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="border-b border-[var(--surface-border)] pb-3.5 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div className="dashboard-skeleton h-4 w-4 shrink-0" />
                  <div className="dashboard-skeleton h-3.5 w-28 max-w-[70%]" />
                </div>
                <div className="dashboard-skeleton h-3.5 w-10 shrink-0" />
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-elevated)]">
                <div className="dashboard-skeleton h-full w-2/3 rounded-full" />
              </div>
              <div className="dashboard-skeleton mt-1.5 h-2.5 w-24 max-w-[50%]" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--surface-border)] px-4 py-6 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No data to display</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Traffic details will appear here when available.</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-3.5">
          {filteredItems.slice(0, 4).map((item, index) => {
            const clicks = Math.max(0, item.clicks)
            const pct = Math.min(100, Math.round((clicks / maxValue) * 100))
            const isReferrer = title === 'Top Referrers'
            const referrerHref = isReferrer ? getSafeReferrerHref(item.name) : null
            return (
              <div key={`${title}-${item.name}-${index}`} className="border-b border-[var(--surface-border)] pb-3.5 last:border-0 last:pb-0">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="flex min-w-0 flex-1 items-start gap-2.5 text-slate-800 dark:text-slate-100">
                    {title === 'Devices' && <DeviceIcon name={item.name} />}
                    {title === 'Browsers' && <BrowserLogo name={item.name} />}
                    {title === 'Top Countries' && <CountryFlag country={item.name} />}
                    {isReferrer && <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />}
                    {referrerHref ? (
                      <a href={referrerHref} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 break-all text-[13px] leading-5 text-slate-700 underline decoration-slate-400/40 underline-offset-2 hover:text-[var(--primary-700)] dark:text-slate-200 dark:hover:text-[var(--primary-300)]">
                        {item.name}
                      </a>
                    ) : (
                      <span className="min-w-0 break-words text-sm font-medium">{item.name}</span>
                    )}
                  </span>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold tabular-nums ${valueColor ?? 'text-slate-700 dark:text-slate-200'}`}>
                    {isReferrer && <Flame className="h-3.5 w-3.5 fill-orange-400/20 text-orange-500" aria-hidden="true" />}
                    {formatNumber(clicks)}
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-elevated)]" role="meter" aria-label={`${item.name} clicks compared with the top entry`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                  <div
                    className={`${accent} h-full rounded-full transition-[width] duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">{formatNumber(item.uniqueClicks)} unique visitors</div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function TrafficBreakdown({
  referrerBreakdown = [],
  browserBreakdown = [],
  deviceBreakdown = [],
  countryBreakdown = [],
  isLoading = false,
}: TrafficBreakdownProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3 min-[1728px]:grid-cols-4 min-[1728px]:gap-2">
        <BreakdownSection
          title="Devices"
          icon={MonitorSmartphone}
          items={deviceBreakdown}
          accent={palette[2]}
          titleColor="text-emerald-700 dark:text-emerald-300"
          iconColor="text-emerald-600 dark:text-emerald-300"
          valueColor="text-slate-700 dark:text-slate-200"
          isLoading={isLoading}
        />
        <BreakdownSection
          title="Top Countries"
          icon={Globe2}
          items={countryBreakdown}
          accent={palette[3]}
          titleColor="text-amber-700 dark:text-amber-300"
          iconColor="text-amber-600 dark:text-amber-300"
          valueColor="text-slate-700 dark:text-slate-200"
          isLoading={isLoading}
        />
        <BreakdownSection
          title="Browsers"
          icon={Globe2}
          items={browserBreakdown}
          accent={palette[1]}
          titleColor="text-violet-700 dark:text-violet-300"
          iconColor="text-violet-600 dark:text-violet-300"
          valueColor="text-slate-700 dark:text-slate-200"
          isLoading={isLoading}
        />
        <BreakdownSection
          title="Top Referrers"
          icon={Globe2}
          items={referrerBreakdown}
          accent={palette[0]}
          titleColor="text-[var(--primary-700)] dark:text-[var(--primary-300)]"
          iconColor="text-[var(--primary-700)] dark:text-[var(--primary-300)]"
          valueColor="text-slate-700 dark:text-slate-200"
          isLoading={isLoading}
        />
    </div>
  )
}

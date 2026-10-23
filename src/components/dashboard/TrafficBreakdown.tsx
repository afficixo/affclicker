'use client'

import { Globe2, Monitor, MonitorSmartphone, Smartphone, Tablet, MousePointerClick } from 'lucide-react'
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
}

const palette = ['bg-[var(--primary-600)]', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500']

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
}: {
  title: string
  icon: typeof Globe2
  items: BreakdownItem[]
  accent: string
  titleColor?: string
  iconColor?: string
  valueColor?: string
}) {
  // Filter out items with empty names or "Unknown"
  const filteredItems = items.filter(item => item.name && item.name.trim() !== '' && item.name.toLowerCase() !== 'unknown')
  const maxValue = Math.max(...filteredItems.map(item => item.clicks), 1)

  return (
    <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-3 shadow-[var(--shadow-sm)] sm:p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary-50)] dark:bg-[#5ff442]/10">
          <Icon className={`h-4 w-4 ${iconColor ?? 'text-slate-500 dark:text-slate-400'}`} />
        </span>
        <h4 className={`text-sm font-semibold ${titleColor ?? 'text-slate-900 dark:text-white'}`}>{title}</h4>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">No breakdown data yet.</p>
      ) : (
        <div className="space-y-3">
          {filteredItems.slice(0, 4).map((item, index) => {
            const pct = Math.round((item.clicks / Math.max(...filteredItems.map(i => i.clicks), 1)) * 100)
            return (
              <div key={`${title}-${item.name}-${index}`}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-slate-800 dark:text-slate-100">
                    {title === 'Browsers' && <BrowserLogo name={item.name} />}
                    {title === 'Devices' && <DeviceIcon name={item.name} />}
                    {title === 'Top Countries' && <CountryFlag country={item.name} />}
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className={`${valueColor ?? 'text-slate-600 dark:text-slate-300'}`}>{formatNumber(item.clicks)}</span>
                </div>

                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--surface-elevated)]">
                  <div
                    className={`${accent} h-1 rounded-full opacity-95`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{formatNumber(item.uniqueClicks)} unique</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function TrafficBreakdown({
  referrerBreakdown = [],
  browserBreakdown = [],
  deviceBreakdown = [],
  countryBreakdown = [],
}: TrafficBreakdownProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BreakdownSection
          title="Devices"
          icon={MonitorSmartphone}
          items={deviceBreakdown}
          accent={palette[2]}
          titleColor="text-emerald-700 dark:text-emerald-300"
          iconColor="text-emerald-600 dark:text-emerald-300"
          valueColor="text-slate-700 dark:text-slate-200"
        />
        <BreakdownSection
          title="Top Countries"
          icon={Globe2}
          items={countryBreakdown}
          accent={palette[3]}
          titleColor="text-amber-700 dark:text-amber-300"
          iconColor="text-amber-600 dark:text-amber-300"
          valueColor="text-slate-700 dark:text-slate-200"
        />
        <BreakdownSection
          title="Browsers"
          icon={Globe2}
          items={browserBreakdown}
          accent={palette[1]}
          titleColor="text-violet-700 dark:text-violet-300"
          iconColor="text-violet-600 dark:text-violet-300"
          valueColor="text-slate-700 dark:text-slate-200"
        />
        <BreakdownSection
          title="Top Referrers"
          icon={Globe2}
          items={referrerBreakdown}
          accent={palette[0]}
          titleColor="text-[var(--primary-700)] dark:text-[var(--primary-300)]"
          iconColor="text-[var(--primary-700)] dark:text-[var(--primary-300)]"
          valueColor="text-slate-700 dark:text-slate-200"
        />
    </div>
  )
}

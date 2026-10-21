'use client'

import { motion } from 'framer-motion'
import { MapPinned } from 'lucide-react'
import { formatNumber } from '@/lib/utils/helpers'
import { getCountryFlag, getCountryLabel, normalizeCountryCode } from '@/lib/utils/country'

interface GeoInsightItem {
  country: string
  clicks: number
  uniqueClicks: number
}

interface GeoInsightsProps {
  geoData: GeoInsightItem[]
  countryBreakdown?: GeoInsightItem[]
}

export function GeoInsights({ geoData, countryBreakdown }: GeoInsightsProps) {
  const marketData = [...(countryBreakdown?.length ? countryBreakdown : geoData)].sort((a, b) => b.clicks - a.clicks)
  const maxClicks = Math.max(...marketData.map(item => item.clicks), 1)
  const topCountries = marketData.slice(0, 4)

  const regionMap: Record<string, string> = {
    US: 'North America',
    CA: 'North America',
    MX: 'North America',
    GB: 'Europe',
    DE: 'Europe',
    FR: 'Europe',
    ES: 'Europe',
    IT: 'Europe',
    RU: 'Europe',
    IN: 'Asia',
    CN: 'Asia',
    JP: 'Asia',
    KR: 'Asia',
    BR: 'South America',
    AU: 'Oceania',
    ZA: 'Africa',
  }

  const regionIntensity = Object.entries({
    'North America': 0,
    Europe: 0,
    Asia: 0,
    'South America': 0,
    Oceania: 0,
    Africa: 0,
  }).map(([region, value]) => ({
    region,
    value,
  }))

  marketData.forEach((item) => {
    const normalizedCountry = normalizeCountryCode(item.country) || item.country.toUpperCase()
    const region = regionMap[normalizedCountry] || 'Other'
    const regionIndex = regionIntensity.findIndex((entry) => entry.region === region)
    if (regionIndex >= 0) {
      regionIntensity[regionIndex].value += item.clicks
    }
  })

  const heatMax = Math.max(...regionIntensity.map(item => item.value), 1)

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex items-center justify-between gap-3 mb-5"
      >
        <div className="flex items-center gap-2">
          <MapPinned className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Geo Heat Map</h3>
            <p className="text-sm text-white/30">Country leaderboard and attention heat</p>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/40">
          {marketData.length} countries
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05, ease: 'easeOut' }}
        className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-3"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.24em] text-white/35">Geo heat board</p>
          <span className="text-xs text-white/60">Region intensity</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {regionIntensity.map((region, index) => {
            const intensity = Math.max(12, (region.value / heatMax) * 100)
            return (
              <motion.div
                key={region.region}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.08 + index * 0.05, ease: 'easeOut' }}
                className="rounded-xl border border-white/10 bg-white/5 p-2"
              >
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${intensity}%` }}
                    transition={{ duration: 0.75, delay: 0.12 + index * 0.06, ease: 'easeOut' }}
                  />
                </div>
                <div className="text-xs font-medium text-white">{region.region}</div>
                <div className="text-xs text-white/60">{formatNumber(region.value)} clicks</div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {topCountries.map((item, index) => {
          const percentage = Math.max(12, (item.clicks / maxClicks) * 100)
          const gradient = [
            'from-cyan-500/70 to-indigo-500/70',
            'from-violet-500/70 to-fuchsia-500/70',
            'from-emerald-500/70 to-teal-500/70',
            'from-amber-500/70 to-orange-500/70',
          ][index % 4]

          return (
            <motion.div
              key={item.country}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.06, ease: 'easeOut' }}
              className={`rounded-xl border border-white/10 bg-gradient-to-r ${gradient} p-[1px]`}
            >
              <div className="rounded-[11px] bg-slate-950/80 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg shadow-lg shadow-black/20">
                      {getCountryFlag(item.country)}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-white">{getCountryLabel(item.country)}</div>
                      <div className="text-xs text-white/60">{getCountryLabel(item.country)}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-cyan-300">{formatNumber(item.clicks)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-white/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.15 + index * 0.08, ease: 'easeOut' }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/60">{formatNumber(item.uniqueClicks)} unique</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="space-y-3">
        {marketData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center text-sm text-white/40">
            No geo activity yet. Publish a link and wait for the first visitor event.
          </div>
        ) : (
          marketData.map((item, index) => (
            <motion.div
              key={item.country}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.05 + index * 0.04, ease: 'easeOut' }}
              className="rounded-xl border border-white/10 bg-black/20 p-3 sm:p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl shadow-lg shadow-black/20">
                    {getCountryFlag(item.country)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{getCountryLabel(item.country)}</p>
                    <p className="text-xs text-white/35">{getCountryLabel(item.country)} • {formatNumber(item.uniqueClicks)} unique visitors</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-cyan-300">{formatNumber(item.clicks)}</p>
                  <p className="text-xs text-white/60">clicks</p>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(8, (item.clicks / maxClicks) * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.15 + index * 0.05, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

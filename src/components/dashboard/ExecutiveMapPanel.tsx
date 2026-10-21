'use client'

import { Globe2 } from 'lucide-react'
import { formatNumber } from '@/lib/utils/helpers'

interface CountryItem {
  country: string
  clicks: number
  uniqueClicks: number
}

interface ExecutiveMapPanelProps {
  countryBreakdown?: CountryItem[]
}

const mapMarkerMap: Record<string, { x: number; y: number }> = {
  US: { x: 175, y: 130 },
  CA: { x: 145, y: 115 },
  MX: { x: 165, y: 160 },
  GB: { x: 315, y: 105 },
  DE: { x: 340, y: 115 },
  FR: { x: 330, y: 125 },
  ES: { x: 315, y: 142 },
  IT: { x: 345, y: 138 },
  RU: { x: 420, y: 95 },
  IN: { x: 470, y: 165 },
  CN: { x: 520, y: 135 },
  JP: { x: 595, y: 130 },
  KR: { x: 575, y: 145 },
  BR: { x: 235, y: 238 },
  AU: { x: 585, y: 258 },
  ZA: { x: 370, y: 250 },
}

const continentPaths = [
  'M121 102C142 89 176 83 198 95C214 105 214 119 226 127C247 139 274 137 283 154C289 165 296 171 304 172C317 174 329 168 331 160C334 149 328 133 326 120C324 103 303 94 284 89C267 85 248 77 236 63C226 51 207 50 194 57C180 66 178 78 164 82C150 85 137 92 121 102Z',
  'M233 172C245 164 265 164 281 171C295 177 301 191 310 201C319 212 334 215 343 228C352 242 349 254 333 260C320 265 307 259 293 259C276 259 267 268 250 267C233 266 223 254 218 239C213 224 217 210 223 198C225 188 228 180 233 172Z',
  'M324 85C334 76 349 75 364 77C379 79 391 93 400 102C410 113 422 120 432 130C440 138 439 149 428 153C409 161 391 150 382 141C371 129 359 122 347 125C338 128 333 136 324 138C315 141 305 137 300 127C295 116 302 95 324 85Z',
  'M429 112C447 98 470 97 488 99C503 101 516 116 523 130C530 144 533 162 527 176C521 190 503 199 486 201C476 203 466 194 454 188C444 183 432 182 424 173C412 159 408 143 410 130C412 122 419 119 429 112Z',
  'M532 182C548 174 571 176 588 186C602 194 606 209 602 223C596 243 570 257 553 250C536 243 530 223 522 211C516 202 524 188 532 182Z',
  'M556 260C565 251 578 249 590 252C603 255 614 264 620 277C624 285 617 297 605 300C592 303 580 300 570 295C558 289 547 281 542 272C539 266 548 268 556 260Z',
]

const getMarkerColor = (index: number) => {
  const colors = ['#38BDF8', '#A78BFA', '#34D399', '#F59E0B', '#FB7185', '#22D3EE']
  return colors[index % colors.length]
}

export function ExecutiveMapPanel({ countryBreakdown = [] }: ExecutiveMapPanelProps) {
  const sortedBreakdown = [...countryBreakdown].sort((a, b) => b.clicks - a.clicks)
  const markers = sortedBreakdown.slice(0, 6).map((item, index) => ({
    ...item,
    marker: mapMarkerMap[item.country] || { x: 340 + index * 15, y: 150 + index * 12 },
    color: getMarkerColor(index),
  }))

  const maxClicks = Math.max(...sortedBreakdown.map((item) => item.clicks), 1)
  const totalClicks = sortedBreakdown.reduce((sum, item) => sum + item.clicks, 0)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
          <Globe2 className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">World Reach Map</h3>
          <p className="text-sm text-white/30">Executive geo visibility and market intensity</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(15,23,42,0.45)]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.22),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.9))]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute right-3 top-3 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Live traffic
          </div>
          <svg viewBox="0 0 760 380" className="relative h-[250px] w-full">
            <defs>
              <linearGradient id="worldGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(34,211,238,0.38)" />
                <stop offset="55%" stopColor="rgba(96,165,250,0.26)" />
                <stop offset="100%" stopColor="rgba(129,140,248,0.16)" />
              </linearGradient>
              <radialGradient id="markerGlow" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                <stop offset="40%" stopColor="rgba(56,189,248,0.55)" />
                <stop offset="100%" stopColor="rgba(56,189,248,0)" />
              </radialGradient>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect x="0" y="0" width="760" height="380" fill="transparent" rx="16" />
            <g opacity="0.26" stroke="rgba(255,255,255,0.12)" strokeWidth="1">
              {Array.from({ length: 12 }).map((_, index) => (
                <line key={`h-${index}`} x1="0" y1={index * 30 + 20} x2="760" y2={index * 30 + 20} />
              ))}
              {Array.from({ length: 15 }).map((_, index) => (
                <line key={`v-${index}`} x1={index * 48 + 12} y1="0" x2={index * 48 + 12} y2="380" />
              ))}
            </g>

            <g fill="url(#worldGradient)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.3">
              {continentPaths.map((path, index) => (
                <path key={`continent-${index}`} d={path} opacity={index === 0 ? 0.95 : 0.78} />
              ))}
            </g>

            <g opacity="0.85">
              {markers.map((marker, index) => {
                const pulseRadius = 16 + index * 4
                return (
                  <g key={`${marker.country}-${index}`}>
                    <circle cx={marker.marker.x} cy={marker.marker.y} r={pulseRadius} fill={marker.color} fillOpacity="0.08" />
                    <circle cx={marker.marker.x} cy={marker.marker.y} r="11" fill="url(#markerGlow)" fillOpacity="0.85" />
                    <circle cx={marker.marker.x} cy={marker.marker.y} r="5" fill={marker.color} filter="url(#softGlow)" />
                    <line
                      x1={marker.marker.x}
                      y1={marker.marker.y}
                      x2={marker.marker.x + (index % 2 === 0 ? 26 : -26)}
                      y2={marker.marker.y - (index % 2 === 0 ? 18 : 24)}
                      stroke={marker.color}
                      strokeWidth="1.5"
                      strokeDasharray="4 5"
                      opacity="0.8"
                    />
                    <text x={marker.marker.x + (index % 2 === 0 ? 12 : -12)} y={marker.marker.y - (index % 2 === 0 ? 22 : 30)} fill="white" fontSize="13" fontWeight="700" textAnchor={index % 2 === 0 ? 'start' : 'end'}>
                      {marker.country}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-sm">
          <div className="text-xs uppercase tracking-wider text-cyan-300">Active markets</div>
          <div className="mt-2 text-2xl font-semibold text-white">{markers.length}</div>
          <div className="text-xs text-white/60">high-intensity countries on the map</div>
        </div>
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-sm">
          <div className="text-xs uppercase tracking-wider text-violet-300">Share volume</div>
          <div className="mt-2 text-2xl font-semibold text-white">{formatNumber(totalClicks)}</div>
          <div className="text-xs text-white/60">clicks from visible markets</div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {markers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/40 sm:col-span-2">
            No geo markers yet. Publish a link and wait for the first visitor event.
          </div>
        ) : (
          markers.map((marker) => (
            <div key={marker.country} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-white">{marker.country}</span>
                <span className="text-cyan-300">{formatNumber(marker.clicks)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                  style={{ width: `${Math.max(10, (marker.clicks / maxClicks) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/60">{formatNumber(marker.uniqueClicks)} unique visitors</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

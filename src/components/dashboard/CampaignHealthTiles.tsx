'use client'

import { Activity, ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react'
import { formatNumber } from '@/lib/utils/helpers'

interface CampaignTileProps {
  label: string
  value: string
  detail: string
  tone: string
}

function CampaignTile({ label, value, detail, tone }: CampaignTileProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wider text-white/60">{label}</span>
        <Sparkles className="h-4 w-4 text-amber-300" />
      </div>
      <div className={`mt-3 text-xl font-bold ${tone}`}>{value}</div>
      <p className="mt-1 text-sm text-white/60">{detail}</p>
    </div>
  )
}

interface CampaignHealthTilesProps {
  totalClicks: number
  uniqueClicks: number
  totalLinks: number
  botClicks: number
}

export function CampaignHealthTiles({ totalClicks, uniqueClicks, totalLinks, botClicks }: CampaignHealthTilesProps) {
  const healthScore = Math.min(100, Math.round((uniqueClicks / Math.max(totalClicks, 1)) * 100 + (totalLinks * 8)))
  const qualityScore = Math.max(0, Math.min(100, 92 - Math.round(botClicks / Math.max(totalClicks, 1) * 100)))

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Campaign Health Tiles</h3>
          <p className="text-sm text-white/60">Ranked operational performance at a glance</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CampaignTile
          label="Visibility"
          value={`${healthScore}%`}
          detail={`${formatNumber(uniqueClicks)} unique visitors from ${formatNumber(totalClicks)} total clicks`}
          tone="text-cyan-300"
        />
        <CampaignTile
          label="Quality"
          value={`${qualityScore}%`}
          detail={`${formatNumber(botClicks)} bot interactions detected`}
          tone="text-emerald-300"
        />
        <CampaignTile
          label="Reach"
          value={`${formatNumber(totalLinks)}`}
          detail="active campaign links currently in rotation"
          tone="text-violet-300"
        />
        <CampaignTile
          label="Momentum"
          value="Strong"
          detail="geo spread and quality score remain stable"
          tone="text-amber-300"
        />
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
          <Activity className="h-4 w-4 text-indigo-300" />
          Executive summary
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2">
          <span className="text-sm text-white/60">Operating posture</span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-300">
            <ArrowUpRight className="h-4 w-4" />
            Healthy
          </span>
        </div>
      </div>
    </div>
  )
}

'use client'

import { LucideIcon } from 'lucide-react'
import { formatNumber } from '@/lib/utils/helpers'
import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend?: number
  color?: 'indigo' | 'green' | 'purple' | 'red' | 'blue' | 'orange'
  subtitle?: string
  prefix?: string
  decimalPlaces?: number
  delay?: number
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'indigo',
  subtitle,
  prefix = '',
  decimalPlaces,
  delay = 0,
  className = '',
}: StatsCardProps) {
  const colorClasses = {
    indigo: 'text-indigo-700 dark:text-indigo-200',
    green: 'text-emerald-700 dark:text-emerald-200',
    purple: 'text-violet-700 dark:text-violet-200',
    red: 'text-rose-700 dark:text-rose-200',
    blue: 'text-sky-700 dark:text-sky-200',
    orange: 'text-amber-700 dark:text-amber-200',
  }

  const isPositive = trend !== undefined && trend >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: delay / 1000 }}
      className={`h-full min-h-[94px] min-w-0 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-sm)] transition-colors duration-200 hover:border-[var(--primary-600)] hover:bg-[var(--primary-50)] dark:hover:border-[var(--primary-500)] dark:hover:bg-[#5ff442]/10 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase leading-[14px] tracking-[0.08em] text-slate-600 dark:text-slate-300 sm:text-xs sm:leading-5 sm:tracking-[0.12em]">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {prefix}{decimalPlaces !== undefined
              ? value === 0
                ? '0'
                : value.toFixed(decimalPlaces)
              : formatNumber(value)}
          </p>
          {subtitle && (
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          )}
        </div>
        <div aria-hidden="true" className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-300">vs last month</span>
        </div>
      )}
    </motion.div>
  )
}
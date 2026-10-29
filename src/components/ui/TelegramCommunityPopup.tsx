'use client'

import type { MouseEvent } from 'react'
import { X } from 'lucide-react'

interface TelegramCommunityPopupProps {
  onClose: () => void
}

export default function TelegramCommunityPopup({ onClose }: TelegramCommunityPopupProps) {
  const handleCloseClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onClose()
  }

  return (
    <div
      className="relative z-20 w-full max-w-[520px] sm:w-[760px] sm:max-w-[760px] lg:w-[960px] lg:max-w-[960px] overflow-hidden rounded-[20px] border border-cyan-200/80 bg-white/95 p-3 shadow-[0_18px_50px_rgba(14,116,144,0.16)] backdrop-blur-sm dark:border-cyan-400/25 dark:bg-[linear-gradient(145deg,#171d31,#0f172a)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.72)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(0,136,204,0.14),transparent_70%)] dark:bg-[radial-gradient(circle_at_top,rgba(0,136,204,0.22),transparent_70%)]" />

      <button
        type="button"
        onClick={handleCloseClick}
        aria-label="Close popup"
        className="absolute right-2.5 top-2.5 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 backdrop-blur-sm transition-all hover:-rotate-90 hover:bg-slate-100 hover:text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:bg-slate-900/70 dark:hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="relative z-10 mb-2 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0088cc,#005f8a)] shadow-[0_8px_24px_rgba(0,136,204,0.3)]">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        <h2 className="mb-1 text-center text-[18px] sm:text-[20px] font-semibold tracking-[-0.3px] text-slate-900 dark:text-white">
          Join <span className="bg-[linear-gradient(135deg,#0088cc,#00b4ff)] bg-clip-text text-transparent">AffClicker</span> Community
        </h2>

        <p className="mb-3 text-center text-[13px] sm:text-[14px] leading-6 text-slate-600 dark:text-slate-400">
          Get <span className="font-semibold text-slate-700 dark:text-slate-200">weekly reports</span>, <span className="font-semibold text-slate-700 dark:text-slate-200">payment updates</span> and <span className="font-semibold text-slate-700 dark:text-slate-200">direct support</span>
        </p>

        <div className="mb-3 grid grid-cols-2 gap-3">
          {[
            { icon: '📊', title: 'Weekly Reports', subtitle: 'Detailed analytics' },
            { icon: '💰', title: 'Payment Updates', subtitle: 'Earnings & payouts' },
            { icon: '💬', title: 'Direct Support', subtitle: '24/7 help & guidance' },
            { icon: '🚀', title: 'Exclusive Updates', subtitle: 'New features & offers' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-white/10 dark:bg-white/10 dark:shadow-none">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-100 text-sm text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[11px] sm:text-[12px] font-semibold text-slate-800 dark:text-slate-200">{item.title}</div>
                <div className="truncate text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">{item.subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        <a
          href="https://t.me/affclicker"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0088cc,#006699)] px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_6px_18px_rgba(0,136,204,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#0099dd,#0077aa)] hover:shadow-[0_8px_22px_rgba(0,136,204,0.3)]"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          Join Telegram Channel
        </a>
      </div>
    </div>
  )
}

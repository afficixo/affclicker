'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Gift, UsersRound } from 'lucide-react'

type ReferralData = {
  referralCode: string | null
  commissionRate: number
  referredPublishers: Array<{
    id: string
    username: string
    createdAt: string
    status: string
  }>
  commissions: Array<{
    id: string
    amount: number
    publisherPayoutAmount: number
    createdAt: string
    paidAt: string | null
    status: 'paid' | 'pending'
    referredUser: { username: string }
    invoice: { invoiceNumber: string }
  }>
  summary: {
    referrals: number
    pendingAmount: number
    paidAmount: number
    totalAmount: number
  }
}

const formatMoney = (amount: number) => `$${amount.toFixed(2)}`

export default function PublisherReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    const loadReferrals = async () => {
      try {
        const response = await fetch('/api/referrals', { credentials: 'include', cache: 'no-store' })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to load referrals.')
        if (active) setData(result)
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load referrals.')
      }
    }

    loadReferrals()
    return () => { active = false }
  }, [])

  const referralLink = data?.referralCode
    ? `${window.location.origin}/signup?ref=${encodeURIComponent(data.referralCode)}`
    : ''

  const copyReferralLink = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (copyError) {
      console.error('Copy referral link failed:', copyError)
      setError('Unable to copy the referral link. Please copy it manually.')
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#359f25]">Publisher program</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)]">Referrals</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          Invite publishers and earn {data?.commissionRate ?? 5}% of each eligible payout they receive.
        </p>
      </header>

      {error && <p role="alert" className="rounded-lg border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">{error}</p>}

      <section className="rounded-xl border border-[#359f25]/20 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#202b2f] sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#5ff442]/15 text-[#24651d] dark:text-[#a2fa8e]">
            <Gift className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-[var(--text-primary)]">Your referral link</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Your referral rate is set by the owner and credited when a referred publisher is paid.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                aria-label="Your referral link"
                value={referralLink}
                placeholder="Loading your referral link…"
                className="min-h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-[#192326] dark:text-slate-200"
              />
              <button
                type="button"
                onClick={copyReferralLink}
                disabled={!referralLink}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#5ff442] px-4 text-sm font-semibold text-[#263238] transition hover:bg-[#4dd935] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Referral summary" className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Publishers referred', value: data?.summary.referrals.toLocaleString() ?? '—', icon: UsersRound },
          { label: 'Available commission', value: data ? formatMoney(data.summary.pendingAmount) : '—', icon: Gift },
          { label: 'Commission paid', value: data ? formatMoney(data.summary.paidAmount) : '—', icon: Check },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#202b2f]">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Icon className="h-4 w-4 text-[#359f25] dark:text-[#a2fa8e]" aria-hidden="true" />
                {stat.label}
              </div>
              <p className="mt-2 text-xl font-bold tabular-nums text-[var(--text-primary)]">{stat.value}</p>
            </article>
          )
        })}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#202b2f]">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <h2 className="font-semibold text-[var(--text-primary)]">Commission history</h2>
        </div>
        {!data ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--text-secondary)]">Loading referral activity…</p>
        ) : data.commissions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--text-secondary)]">Your referral commissions will appear here after an invited publisher receives a payout.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-[#192326] dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Publisher</th>
                  <th className="px-5 py-3 font-semibold">Payout date</th>
                  <th className="px-5 py-3 font-semibold">Publisher payout</th>
                  <th className="px-5 py-3 font-semibold">Your rate</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {data.commissions.map((commission) => (
                  <tr key={commission.id}>
                    <td className="px-5 py-3.5 font-medium text-[var(--text-primary)]">{commission.referredUser.username}</td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">{new Date(commission.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 tabular-nums text-[var(--text-secondary)]">{formatMoney(commission.publisherPayoutAmount)}</td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums text-[var(--text-primary)]">{formatMoney(commission.amount)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${commission.status === 'paid' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                        {commission.status === 'paid' ? 'Paid' : 'Available'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

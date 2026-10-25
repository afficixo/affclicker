'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Check, ChevronDown, LoaderCircle, Search, UserRound, X } from 'lucide-react'

type ManagerOption = {
  id: string
  username: string
  fullName: string | null
  clickRate: number
  commissionRate: number
  referralCommissionRate: number
  status?: 'PENDING' | 'ACTIVE' | 'DISABLED' | 'REJECTED'
}

type RateField = 'clickRate' | 'commissionRate' | 'referralCommissionRate'
type ManagerSort = 'name' | 'clickRate' | 'commissionRate' | 'referralCommissionRate'
type ManagerRateDraft = {
  clickRate: string
  commissionRate: string
  referralCommissionRate: string
}

function getDirtyFields(manager: ManagerOption, draft: ManagerRateDraft): Record<RateField, boolean> {
  return {
    clickRate:
      draft.clickRate.trim() !== '' &&
      Number.isFinite(Number(draft.clickRate)) &&
      Number(draft.clickRate) !== manager.clickRate,
    commissionRate:
      draft.commissionRate.trim() !== '' &&
      Number.isFinite(Number(draft.commissionRate)) &&
      Number(draft.commissionRate) !== manager.commissionRate,
    referralCommissionRate:
      draft.referralCommissionRate.trim() !== '' &&
      Number.isFinite(Number(draft.referralCommissionRate)) &&
      Number(draft.referralCommissionRate) !== manager.referralCommissionRate,
  }
}

function formatRateDraft(value: string, decimalPlaces?: number): string {
  const parsedValue = Number(value)
  if (value.trim() === '' || !Number.isFinite(parsedValue)) return '—'
  return decimalPlaces === undefined ? String(parsedValue) : parsedValue.toFixed(decimalPlaces)
}

export default function ManagerControlsSection() {
  const [managers, setManagers] = useState<ManagerOption[]>([])
  const [managerDrafts, setManagerDrafts] = useState<Record<string, ManagerRateDraft>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savingField, setSavingField] = useState<{ managerId: string; field: RateField } | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedManagerId, setExpandedManagerId] = useState<string | null>(null)
  const [managerSort, setManagerSort] = useState<ManagerSort>('name')

  useEffect(() => {
    const controller = new AbortController()

    const fetchManagers = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const response = await fetch('/api/owner/managers', {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Unable to load manager accounts.')

        const data = await response.json()
        const managerOptions = Array.isArray(data.managers)
          ? data.managers
              .filter((manager: ManagerOption) => manager.status === 'ACTIVE' || !manager.status)
              .map((manager: ManagerOption) => ({
                id: manager.id,
                username: manager.username,
                fullName: manager.fullName || null,
                clickRate: Number(manager.clickRate ?? 0),
                commissionRate: Number(manager.commissionRate ?? 20),
                referralCommissionRate: Number(manager.referralCommissionRate ?? 5),
                status: manager.status || 'ACTIVE',
              }))
          : []

        setManagers(managerOptions)
        setManagerDrafts(
          Object.fromEntries(
            managerOptions.map((manager: ManagerOption) => [
              manager.id,
              {
                clickRate: String(manager.clickRate),
                commissionRate: String(manager.commissionRate),
                referralCommissionRate: String(manager.referralCommissionRate),
              },
            ]),
          ),
        )
      } catch (error) {
        if (controller.signal.aborted) return
        setLoadError(error instanceof Error ? error.message : 'Unable to load manager accounts.')
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void fetchManagers()

    return () => controller.abort()
  }, [loadAttempt])

  const updateManagerDraft = (
    managerId: string,
    field: 'clickRate' | 'commissionRate' | 'referralCommissionRate',
    value: string,
  ) => {
    setManagerDrafts((current) => ({
      ...current,
      [managerId]: { ...current[managerId], [field]: value },
    }))
  }

  const handleManagerClickRateSubmit = async (event: FormEvent<HTMLFormElement>, managerId: string) => {
    event.preventDefault()
    const draft = managerDrafts[managerId]
    if (!draft) return

    setIsSubmitting(true)
    setSavingField({ managerId, field: 'clickRate' })
    setFeedback(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-manager-click-rate', managerId, clickRate: Number(draft.clickRate) }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to update manager click rate')

      setManagers((current) => current.map((manager) =>
        manager.id === managerId ? { ...manager, clickRate: Number(data.clickRate) } : manager,
      ))
      updateManagerDraft(managerId, 'clickRate', String(data.clickRate))
      setFeedback({ type: 'success', message: data.message || 'Manager click rate updated successfully.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to update manager click rate',
      })
    } finally {
      setIsSubmitting(false)
      setSavingField(null)
    }
  }

  const handleManagerCommissionSubmit = async (event: FormEvent<HTMLFormElement>, managerId: string) => {
    event.preventDefault()
    const draft = managerDrafts[managerId]
    if (!draft) return

    setIsSubmitting(true)
    setSavingField({ managerId, field: 'commissionRate' })
    setFeedback(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-manager-commission-rate', managerId, commissionRate: Number(draft.commissionRate) }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to update commission share')

      setManagers((current) => current.map((manager) =>
        manager.id === managerId ? { ...manager, commissionRate: Number(data.commissionRate) } : manager,
      ))
      updateManagerDraft(managerId, 'commissionRate', String(data.commissionRate))
      setFeedback({ type: 'success', message: data.message || 'Commission share updated successfully.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to update commission share',
      })
    } finally {
      setIsSubmitting(false)
      setSavingField(null)
    }
  }

  const handleManagerReferralCommissionSubmit = async (event: FormEvent<HTMLFormElement>, managerId: string) => {
    event.preventDefault()
    const draft = managerDrafts[managerId]
    if (!draft) return

    setIsSubmitting(true)
    setSavingField({ managerId, field: 'referralCommissionRate' })
    setFeedback(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-manager-referral-commission-rate', managerId, referralCommissionRate: Number(draft.referralCommissionRate) }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to update referral share')

      setManagers((current) => current.map((manager) =>
        manager.id === managerId ? { ...manager, referralCommissionRate: Number(data.referralCommissionRate) } : manager,
      ))
      updateManagerDraft(managerId, 'referralCommissionRate', String(data.referralCommissionRate))
      setFeedback({ type: 'success', message: data.message || 'Referral share updated successfully.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to update referral share',
      })
    } finally {
      setIsSubmitting(false)
      setSavingField(null)
    }
  }

  const inputClassName =
    'h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm tabular-nums text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400'
  const saveButtonClassName =
    'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950'
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase()
  const filteredManagers = managers
    .filter((manager) =>
      `${manager.fullName ?? ''} ${manager.username}`.toLocaleLowerCase().includes(normalizedSearchQuery),
    )
    .sort((first, second) => {
      if (managerSort === 'name') {
        return (first.fullName || first.username).localeCompare(second.fullName || second.username)
      }

      const rateDifference = second[managerSort] - first[managerSort]
      return rateDifference || (first.fullName || first.username).localeCompare(second.fullName || second.username)
    })
  const unsavedManagerCount = managers.filter((manager) => {
    const draft = managerDrafts[manager.id]
    return draft && Object.values(getDirtyFields(manager, draft)).some(Boolean)
  }).length

  return (
    <section className="w-full min-w-0 space-y-6 bg-transparent">
      {unsavedManagerCount > 0 && (
        <p
          role="status"
          className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200"
        >
          {unsavedManagerCount} manager{unsavedManagerCount === 1 ? '' : 's'} with unsaved edits
        </p>
      )}

      {!isLoading && !loadError && managers.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or username"
              aria-label="Search managers by name or username"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear manager search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </label>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
                {normalizedSearchQuery
                  ? `${filteredManagers.length} of ${managers.length} managers`
                  : `Showing all ${managers.length} managers`}
            </p>
            <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                Sort
                <select
                  value={managerSort}
                  onChange={(event) => setManagerSort(event.target.value as ManagerSort)}
                  aria-label="Sort managers"
                  className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400"
                >
                  <option value="name">Name</option>
                  <option value="clickRate">Click rate</option>
                  <option value="commissionRate">Commission</option>
                  <option value="referralCommissionRate">Referral</option>
                </select>
            </label>
          </div>
        </div>
      )}

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss message"
            className="shrink-0 text-lg leading-none text-current opacity-70 transition hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-3 py-10 text-sm text-slate-500 dark:text-slate-400" role="status">
          <LoaderCircle className="h-5 w-5 animate-spin text-emerald-500" />
          Loading manager accounts…
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-start gap-3 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
          <button
            type="button"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Try again
          </button>
        </div>
      ) : filteredManagers.length > 0 ? (
        <div className="w-full min-w-0">
          {filteredManagers.map((manager) => {
            const draft = managerDrafts[manager.id] || {
              clickRate: String(manager.clickRate),
              commissionRate: String(manager.commissionRate),
              referralCommissionRate: String(manager.referralCommissionRate),
            }
            const isExpanded = expandedManagerId === manager.id
            const dirtyFields = getDirtyFields(manager, draft)
            const dirtyFieldCount = Object.values(dirtyFields).filter(Boolean).length

            return (
              <article
                key={manager.id}
                className={`min-w-0 border-b border-slate-200/80 py-3 transition-colors last:border-b-0 dark:border-slate-700/80 ${
                  isExpanded ? 'bg-slate-50/70 dark:bg-slate-900/40' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/25'
                }`}
              >
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <UserRound className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {manager.fullName || manager.username}
                        </h2>
                        {dirtyFieldCount > 0 && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
                            Unsaved
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        @{manager.username}
                      </p>
                      <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <span>
                          {dirtyFields.clickRate && (
                            <span className="text-slate-400 line-through dark:text-slate-500">
                              ${manager.clickRate.toFixed(3)}{' '}
                            </span>
                          )}
                          <span className={dirtyFields.clickRate ? 'font-semibold text-amber-800 dark:text-amber-200' : ''}>
                            ${formatRateDraft(draft.clickRate, 3)}
                          </span>{' '}
                          per click
                        </span>
                        <span>
                          {dirtyFields.commissionRate && (
                            <span className="text-slate-400 line-through dark:text-slate-500">
                              {manager.commissionRate}%{' '}
                            </span>
                          )}
                          <span className={dirtyFields.commissionRate ? 'font-semibold text-amber-800 dark:text-amber-200' : ''}>
                            {formatRateDraft(draft.commissionRate)}%
                          </span>{' '}
                          commission
                        </span>
                        <span>
                          {dirtyFields.referralCommissionRate && (
                            <span className="text-slate-400 line-through dark:text-slate-500">
                              {manager.referralCommissionRate}%{' '}
                            </span>
                          )}
                          <span className={dirtyFields.referralCommissionRate ? 'font-semibold text-amber-800 dark:text-amber-200' : ''}>
                            {formatRateDraft(draft.referralCommissionRate)}%
                          </span>{' '}
                          referral
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`manager-rates-${manager.id}`}
                    onClick={() => setExpandedManagerId(isExpanded ? null : manager.id)}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                  >
                    {isExpanded ? 'Close' : 'Edit rates'}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {isExpanded && (
                <div
                  id={`manager-rates-${manager.id}`}
                  className="mt-4 min-w-0 border-t border-slate-200/70 pt-4 dark:border-slate-700/70"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {dirtyFieldCount > 0
                        ? `${dirtyFieldCount} unsaved rate${dirtyFieldCount === 1 ? '' : 's'} for this account`
                        : 'All rates are up to date'}
                    </p>
                    {dirtyFieldCount > 0 && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          setManagerDrafts((current) => ({
                            ...current,
                            [manager.id]: {
                              clickRate: String(manager.clickRate),
                              commissionRate: String(manager.commissionRate),
                              referralCommissionRate: String(manager.referralCommissionRate),
                            },
                          }))
                        }
                        className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        Discard edits
                      </button>
                    )}
                  </div>
                  <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                  <form
                    onSubmit={(event) => void handleManagerClickRateSubmit(event, manager.id)}
                    className="min-w-0"
                  >
                    <label
                      htmlFor={`click-rate-${manager.id}`}
                      className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      Click rate <span className="font-normal text-slate-400">(USD)</span>
                    </label>
                    <div className="flex min-w-0 gap-2">
                      <input
                        id={`click-rate-${manager.id}`}
                        aria-label={`Click rate for ${manager.username}`}
                        type="number"
                        min="0"
                        step="0.001"
                        value={draft.clickRate}
                        onChange={(event) => updateManagerDraft(manager.id, 'clickRate', event.target.value)}
                        required
                        className={`${inputClassName} ${
                          dirtyFields.clickRate
                            ? 'border-amber-400 bg-amber-50/60 focus:border-amber-500 dark:border-amber-500/70 dark:bg-amber-500/5'
                            : ''
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !dirtyFields.clickRate}
                        aria-label={`Save click rate for ${manager.username}`}
                        className={`${saveButtonClassName} ${
                          dirtyFields.clickRate ? '' : 'bg-emerald-700 hover:bg-emerald-700'
                        }`}
                      >
                        {savingField?.managerId === manager.id && savingField.field === 'clickRate' ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : dirtyFields.clickRate ? (
                          null
                        ) : (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {savingField?.managerId === manager.id && savingField.field === 'clickRate'
                          ? 'Saving'
                          : dirtyFields.clickRate
                            ? 'Save'
                            : 'Saved'}
                      </button>
                    </div>
                  </form>

                  <form
                    onSubmit={(event) => void handleManagerCommissionSubmit(event, manager.id)}
                    className="min-w-0"
                  >
                    <label
                      htmlFor={`commission-rate-${manager.id}`}
                      className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      Commission share <span className="font-normal text-slate-400">(%)</span>
                    </label>
                    <div className="flex min-w-0 gap-2">
                      <input
                        id={`commission-rate-${manager.id}`}
                        aria-label={`Commission rate for ${manager.username}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={draft.commissionRate}
                        onChange={(event) => updateManagerDraft(manager.id, 'commissionRate', event.target.value)}
                        required
                        className={`${inputClassName} ${
                          dirtyFields.commissionRate
                            ? 'border-amber-400 bg-amber-50/60 focus:border-amber-500 dark:border-amber-500/70 dark:bg-amber-500/5'
                            : ''
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !dirtyFields.commissionRate}
                        aria-label={`Save commission for ${manager.username}`}
                        className={`${saveButtonClassName} ${
                          dirtyFields.commissionRate ? '' : 'bg-emerald-700 hover:bg-emerald-700'
                        }`}
                      >
                        {savingField?.managerId === manager.id && savingField.field === 'commissionRate' ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : dirtyFields.commissionRate ? (
                          null
                        ) : (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {savingField?.managerId === manager.id && savingField.field === 'commissionRate'
                          ? 'Saving'
                          : dirtyFields.commissionRate
                            ? 'Save'
                            : 'Saved'}
                      </button>
                    </div>
                  </form>

                  <form
                    onSubmit={(event) => void handleManagerReferralCommissionSubmit(event, manager.id)}
                    className="min-w-0"
                  >
                    <label
                      htmlFor={`referral-rate-${manager.id}`}
                      className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      Referral reward <span className="font-normal text-slate-400">(%)</span>
                    </label>
                    <div className="flex min-w-0 gap-2">
                      <input
                        id={`referral-rate-${manager.id}`}
                        aria-label={`Referral commission rate for ${manager.username}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={draft.referralCommissionRate}
                        onChange={(event) => updateManagerDraft(manager.id, 'referralCommissionRate', event.target.value)}
                        required
                        className={`${inputClassName} ${
                          dirtyFields.referralCommissionRate
                            ? 'border-amber-400 bg-amber-50/60 focus:border-amber-500 dark:border-amber-500/70 dark:bg-amber-500/5'
                            : ''
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !dirtyFields.referralCommissionRate}
                        aria-label={`Save referral commission for ${manager.username}`}
                        className={`${saveButtonClassName} ${
                          dirtyFields.referralCommissionRate ? '' : 'bg-emerald-700 hover:bg-emerald-700'
                        }`}
                      >
                        {savingField?.managerId === manager.id && savingField.field === 'referralCommissionRate' ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : dirtyFields.referralCommissionRate ? (
                          null
                        ) : (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {savingField?.managerId === manager.id && savingField.field === 'referralCommissionRate'
                          ? 'Saving'
                          : dirtyFields.referralCommissionRate
                            ? 'Save'
                            : 'Saved'}
                      </button>
                    </div>
                  </form>
                  </div>
                </div>
                )}
              </article>
            )
          })}
        </div>
      ) : managers.length > 0 ? (
        <div className="py-10 text-center">
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No managers match that search</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Try another name or username, or clear the search.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No active manager accounts</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Approved manager accounts will appear here when they are available.
          </p>
        </div>
      )}
    </section>
  )
}

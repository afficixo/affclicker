'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_LANDING_PAGE_DOMAIN_SETTINGS,
  formatLandingPageUrl,
  type LandingPageDomainSetting,
} from '@/lib/utils/landing-page-host'
import {
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  Globe,
  Link as LinkIcon,
  Zap,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Search,
  CalendarDays,
  Users,
} from 'lucide-react'

interface Template {
  id: string
  name: string
  description?: string
  thumbnail?: string
  customText?: string
  htmlContent: string
}

interface LandingPage {
  id: string
  subdomain: string
  trackingUrl: string
  userId: string
  user?: {
    id: string
    username: string
    email: string
    role: string
  }
  headline?: string
  description?: string
  imageUrl?: string
  primaryColor: string
  secondaryColor: string
  buttonText: string
  isPublished: boolean
  totalClicks: number
  template: Template
  createdAt: string
}

interface DeleteConfirmation {
  pageIds: string[]
  pages: LandingPage[]
}

const getDomain = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host.startsWith('127.')) {
      return process.env.NEXT_PUBLIC_LANDING_PAGE_DOMAIN || 'localhost:3000'
    }
    const parts = host.split('.')
    if (parts.length > 2) {
      return parts.slice(-2).join('.')
    }
    return host
  }
  return process.env.NEXT_PUBLIC_LANDING_PAGE_DOMAIN || 'afficixo.com'
}

export default function LandingPageBuilder() {
  const [currentStep, setCurrentStep] = useState<'list' | 'builder'>('list')
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [landingPageDomain, setLandingPageDomain] = useState('')
  const [landingPageDomains, setLandingPageDomains] = useState<LandingPageDomainSetting[]>(DEFAULT_LANDING_PAGE_DOMAIN_SETTINGS)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [managerFilter, setManagerFilter] = useState('all')
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([])
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Builder form state
  const [subdomain, setSubdomain] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templateIndex, setTemplateIndex] = useState(0)
  const [subdomainError, setSubdomainError] = useState('')

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setUserId(data.id)
        setUserRole(data.role)
      } else {
        setError('Failed to authenticate user')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('Authentication error')
    }
  }, [])

  const fetchLandingPages = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      const response = await fetch('/api/landing-pages', {
        headers: { 'x-user-id': userId },
      })
      if (response.ok) {
        setLandingPages(await response.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/landing-pages/templates')
      if (response.ok) {
        const availableTemplates: Template[] = await response.json()
        setTemplates(availableTemplates)
        setTemplateIndex(0)
        setSelectedTemplate(availableTemplates[0] || null)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchLandingPageDomains = useCallback(async () => {
    try {
      const response = await fetch('/api/landing-pages/domains')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data.domains) && data.domains.length > 0) {
          setLandingPageDomains(data.domains)
        }
      }
    } catch (err) {
      console.error('Failed to load landing page domains:', err)
    }
  }, [])

  const selectTemplateAt = (index: number) => {
    const template = templates[index]
    if (!template) return
    setTemplateIndex(index)
    setSelectedTemplate(template)
  }

  useEffect(() => {
    setLandingPageDomain(getDomain())
    fetchCurrentUser()
    fetchTemplates()
    fetchLandingPageDomains()
  }, [fetchCurrentUser, fetchTemplates, fetchLandingPageDomains])

  useEffect(() => {
    if (userId) {
      fetchLandingPages()
    }
  }, [fetchLandingPages, userId])

  useEffect(() => {
    if (!deleteConfirmation) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) setDeleteConfirmation(null)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [deleteConfirmation, isDeleting])

  const validateSubdomain = async (value: string) => {
    setSubdomain(value)
    if (!value.trim()) {
      setSubdomainError('')
      return
    }

    if (landingPages.some(page => page.subdomain === value)) {
      setSubdomainError('This subdomain is already taken')
    } else if (!/^[a-z0-9-]+$/.test(value)) {
      setSubdomainError('Only lowercase letters, numbers, and hyphens allowed')
    } else if (value.length < 3) {
      setSubdomainError('Subdomain must be at least 3 characters')
    } else {
      setSubdomainError('')
    }
  }

  const createLandingPage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subdomain || !trackingUrl || !selectedTemplate || !userId) {
      setError('Please fill in all required fields')
      return
    }

    if (subdomainError) {
      setError('Please fix subdomain issues')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          subdomain,
          trackingUrl,
          templateId: selectedTemplate.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create landing page')
      }

      setSuccess('Landing page created successfully!')
      setCurrentStep('list')
      
      setSubdomain('')
      setTrackingUrl('')
      setSelectedTemplate(null)
      
      setTimeout(() => {
        fetchLandingPages()
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create landing page')
    } finally {
      setLoading(false)
    }
  }

  const copyLandingPageLink = async (
    page: LandingPage,
    domain = landingPageDomain,
    includeProtocol = false,
  ) => {
    const url = `${includeProtocol ? 'https://' : ''}${page.subdomain}.${domain}`
    const textToCopy = page.template?.customText
      ? page.template.customText.replace(/\{link\}/gi, `${url}_`)
      : url

    try {
      await navigator.clipboard.writeText(textToCopy)
      setSuccess(`Copied: ${textToCopy}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Copy failed:', err)
      setError('Failed to copy link')
      setTimeout(() => setError(''), 2000)
    }
  }

  const requestDeleteLandingPage = (id: string) => {
    const page = landingPages.find((item) => item.id === id)
    if (page) setDeleteConfirmation({ pageIds: [id], pages: [page] })
  }

  const managerGroups = landingPages.reduce<Record<string, LandingPage[]>>((groups, page) => {
    const groupName = page.user?.username || 'Unknown user'
    groups[groupName] = groups[groupName] || []
    groups[groupName].push(page)
    return groups
  }, {})
  const managerOptions = Object.entries(managerGroups)
    .map(([username, pages]) => ({ username, userId: pages[0]?.user?.id || '' }))
    .sort((left, right) => left.username.localeCompare(right.username))
  const normalizedSearch = searchFilter.trim().toLowerCase()
  const filteredPages = landingPages.filter((page) => {
    const matchesManager = managerFilter === 'all' || page.user?.id === managerFilter || page.user?.username === managerFilter
    const searchableText = [
      page.subdomain,
      page.trackingUrl,
      page.headline,
      page.description,
      page.user?.username,
      page.user?.email,
    ].filter(Boolean).join(' ').toLowerCase()
    return matchesManager && (!normalizedSearch || searchableText.includes(normalizedSearch))
  })
  const visibleGroups = filteredPages.reduce<Record<string, LandingPage[]>>((groups, page) => {
    const groupName = page.user?.username || 'Unknown user'
    groups[groupName] = groups[groupName] || []
    groups[groupName].push(page)
    return groups
  }, {})
  const visiblePageIds = filteredPages.map((page) => page.id)
  const allVisibleSelected = visiblePageIds.length > 0 && visiblePageIds.every((id) => selectedPageIds.includes(id))

  const togglePageSelection = (id: string) => {
    setSelectedPageIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id])
  }

  const toggleAllVisiblePages = () => {
    setSelectedPageIds((current) => allVisibleSelected
      ? current.filter((id) => !visiblePageIds.includes(id))
      : [...new Set([...current, ...visiblePageIds])])
  }

  const selectedPages = landingPages.filter((page) => selectedPageIds.includes(page.id))
  const canDeleteSelected = selectedPages.length > 0 && (userRole === 'OWNER' || selectedPages.every((page) => page.userId === userId))

  const copySelectedLinks = async () => {
    const domain = landingPageDomains[0]
    const links = selectedPages.map((page) => domain
      ? formatLandingPageUrl(page.subdomain, domain)
      : `${page.subdomain}.${landingPageDomain}`)
    try {
      await navigator.clipboard.writeText(links.join('\n'))
      setSuccess(`Copied ${links.length} landing page link${links.length === 1 ? '' : 's'}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to copy selected links')
    }
  }

  const requestDeleteSelectedPages = () => {
    if (canDeleteSelected) setDeleteConfirmation({ pageIds: selectedPages.map((page) => page.id), pages: selectedPages })
  }

  const deleteConfirmedPages = async () => {
    if (!deleteConfirmation || !userId) return

    setIsDeleting(true)
    try {
      const results = await Promise.all(deleteConfirmation.pageIds.map((id) => fetch(`/api/landing-pages/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      })))
      if (results.every((response) => response.ok)) {
        const deletedIds = new Set(deleteConfirmation.pageIds)
        setLandingPages((pages) => pages.filter((page) => !deletedIds.has(page.id)))
        setSelectedPageIds((ids) => ids.filter((id) => !deletedIds.has(id)))
        setSuccess(`${deleteConfirmation.pageIds.length === 1 ? 'Landing page' : `${deleteConfirmation.pageIds.length} landing pages`} deleted`)
        setTimeout(() => setSuccess(''), 3000)
        setDeleteConfirmation(null)
      } else {
        setError('Some selected pages could not be deleted')
      }
    } catch {
      setError('Failed to delete selected pages')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full px-1 py-2 text-[var(--text-primary)] sm:px-2">
      <div className="w-full">
        {/* Alerts */}
        {error && (
          <div role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            <span>{error}</span>
            <button onClick={() => setError('')} aria-label="Dismiss error" className="text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {success && (
          <div role="status" className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 items-start justify-between gap-3 rounded-xl border border-emerald-500/25 bg-white/95 px-4 py-3 text-sm text-emerald-800 shadow-xl shadow-slate-950/10 backdrop-blur-sm dark:bg-[#0b1b38]/95 dark:text-emerald-200">
            <span className="min-w-0 break-words">{success}</span>
            <button onClick={() => setSuccess('')} aria-label="Dismiss notification" className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {currentStep === 'list' ? (
          <>
            {/* List View Header */}
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] px-5 py-5 shadow-sm sm:px-7 sm:py-6">
              <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">Campaign workspace</p>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">Landing pages</h1>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {userRole === 'OWNER' ? 'Review and manage pages created by your team.' : 'Create and manage pages for your campaigns.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep('builder')}
                  className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-900/15 transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-400 dark:text-[#06142d] dark:hover:bg-emerald-300 sm:self-center"
                >
                  <Plus className="h-4 w-4" />
                  New Page
                </button>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-4 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"><LinkIcon className="h-5 w-5" /></span>
                <div><p className="text-xs font-medium text-[var(--text-secondary)]">Total pages</p><p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--text-primary)]">{landingPages.length}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-4 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><Zap className="h-5 w-5" /></span>
                <div><p className="text-xs font-medium text-[var(--text-secondary)]">Total views</p><p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--text-primary)]">{landingPages.reduce((total, page) => total + page.totalClicks, 0).toLocaleString()}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-4 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-700 dark:text-violet-300"><Globe className="h-5 w-5" /></span>
                <div><p className="text-xs font-medium text-[var(--text-secondary)]">Available domains</p><p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--text-primary)]">{landingPageDomains.length}</p></div>
              </div>
            </div>

            <div className="mb-5 grid gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(160px,1fr)_auto] lg:grid-cols-4">
              <label className="relative block min-w-0">
                <span className="sr-only">Search landing pages</span>
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="search"
                  value={searchFilter}
                  onChange={(event) => setSearchFilter(event.target.value)}
                  placeholder="Search URL, destination, creator..."
                  aria-label="Search landing pages"
                  className="h-10 w-full min-w-0 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-elevated)] pl-9 pr-3 text-sm font-medium text-[var(--text-primary)] outline-none placeholder:font-normal placeholder:text-[var(--text-muted)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                />
              </label>
              {userRole === 'OWNER' && (
                <select
                  aria-label="Filter by manager"
                  value={managerFilter}
                  onChange={(event) => setManagerFilter(event.target.value)}
                  className="h-10 min-w-0 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                >
                  <option value="all">All managers</option>
                  {managerOptions.map((manager) => (
                    <option key={manager.userId || manager.username} value={manager.userId || manager.username}>
                      {manager.username}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={toggleAllVisiblePages}
                disabled={visiblePageIds.length === 0}
                className="h-10 whitespace-nowrap rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-700 disabled:opacity-100 dark:text-emerald-300 dark:disabled:border-slate-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-300"
              >
                {allVisibleSelected ? 'Clear visible selection' : 'Select all visible'}
              </button>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)] sm:col-span-3 lg:col-span-4">
                <span>Showing <strong className="font-semibold text-[var(--text-primary)]">{filteredPages.length}</strong> of {landingPages.length} pages</span>
                {selectedPageIds.length > 0 && (
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 font-semibold text-cyan-800 dark:text-cyan-200">
                    {selectedPageIds.length} selected
                  </span>
                )}
              </div>
              {selectedPageIds.length > 0 && (
                <div className="flex flex-wrap gap-2 sm:col-span-3 lg:col-span-4">
                  <button
                    type="button"
                    onClick={copySelectedLinks}
                    className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:opacity-80"
                  >
                    Copy selected links
                  </button>
                  <button
                    type="button"
                    onClick={requestDeleteSelectedPages}
                    disabled={!canDeleteSelected}
                    title={!canDeleteSelected ? 'You can only delete pages you own' : 'Delete selected pages'}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-300"
                  >
                    Delete selected
                  </button>
                </div>
              )}
              {deleteConfirmation && deleteConfirmation.pageIds.length > 1 && (
                <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between lg:col-span-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        Delete {deleteConfirmation.pageIds.length} selected pages?
                      </p>
                      <p className="text-xs text-amber-700/80 dark:text-amber-300/80">This action cannot be undone.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmation(null)}
                      disabled={isDeleting}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={deleteConfirmedPages}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-amber-600/20 hover:bg-amber-700 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isDeleting ? 'Deleting...' : 'Confirm delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Landing Pages Grid */}
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading landing pages">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="animate-pulse rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-4">
                    <div className="mb-5 h-4 w-28 rounded bg-slate-300/70 dark:bg-slate-700/70" />
                    <div className="mb-3 h-9 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                    <div className="mb-2 h-3 w-2/3 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                    <div className="h-3 w-1/2 rounded bg-slate-200/80 dark:bg-slate-800/80" />
                  </div>
                ))}
              </div>
            ) : landingPages.length === 0 || filteredPages.length === 0 ? (
              <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] px-6 py-14 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                  <Globe className="h-6 w-6" />
                </div>
                <p className="text-base font-semibold text-[var(--text-primary)]">
                  {landingPages.length === 0 ? 'No landing pages yet' : 'No pages match these filters'}
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {landingPages.length === 0 ? 'Create your first landing page to get started.' : 'Try changing the search or filter options.'}
                </p>
                {landingPages.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep('builder')}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 dark:bg-emerald-400 dark:text-[#06142d] dark:hover:bg-emerald-300"
                  >
                    <Plus className="h-4 w-4" />
                    Create landing page
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-7">
                {Object.entries(visibleGroups).map(([groupName, pages]) => (
                  <section key={groupName}>
                    {userRole === 'OWNER' && (
                      <div className="mb-3 flex items-center justify-between border-b border-[var(--surface-border)] pb-2">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                          <Users className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                          {groupName}
                        </h2>
                        <span className="rounded-full bg-[var(--surface-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
                          {pages.length} {pages.length === 1 ? 'page' : 'pages'}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {pages.map((page) => (
                        <div
                          key={page.id}
                          className="flex h-full flex-col rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
                        >
                    {/* Subdomain & Copy URL */}
                    <div className="mb-3 min-w-0">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <label className="flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              checked={selectedPageIds.includes(page.id)}
                              onChange={() => togglePageSelection(page.id)}
                              className="h-4 w-4 accent-cyan-500"
                              aria-label={`Select ${page.subdomain}`}
                            />
                          </label>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Landing URLs</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${page.isPublished ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-500/10 text-slate-600 dark:text-slate-300'}`}>
                            <span aria-hidden="true" className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${page.isPublished ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {page.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        {(page.userId === userId || userRole === 'OWNER') && (
                          <button
                            type="button"
                            onClick={() => requestDeleteLandingPage(page.id)}
                            className="flex shrink-0 items-center justify-center rounded-md p-1.5 text-amber-600 transition-colors hover:bg-amber-500/10 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 dark:text-amber-300 dark:hover:text-amber-200"
                            aria-label={`Delete ${page.subdomain}`}
                            title="Delete landing page"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="divide-y divide-[var(--surface-border)] border-y border-[var(--surface-border)]">
                        {landingPageDomains.map((domain) => (
                          <div key={domain.domain} className="flex min-h-9 min-w-0 items-center justify-between gap-2 py-1">
                            <h3
                              className="min-w-0 flex-1 truncate font-mono text-sm font-medium text-emerald-700 dark:text-emerald-300"
                              title={formatLandingPageUrl(page.subdomain, domain)}
                            >
                              {formatLandingPageUrl(page.subdomain, domain)}
                            </h3>
                            <button
                              type="button"
                              onClick={() => copyLandingPageLink(page, domain.domain, domain.includeProtocol)}
                              className="flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-cyan-500/10 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/70 dark:hover:text-cyan-200"
                              aria-label={`Copy URL for ${page.subdomain}.${domain.domain}`}
                              title="Copy link"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Copy</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(page.headline || page.description) && (
                      <div className="mb-3">
                        {page.headline && (
                          <p className="truncate text-sm font-semibold text-[var(--text-primary)]" title={page.headline}>
                            {page.headline}
                          </p>
                        )}
                        {page.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]" title={page.description}>
                            {page.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tracking & Views */}
                    <div className="mb-3 flex-1 border-t border-[var(--surface-border)] pt-3">
                      <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-3">
                      <div className="min-w-0">
                        <p className="mb-0.5 text-xs text-[var(--text-secondary)]">Redirects to</p>
                        <p className="truncate font-mono text-xs text-[var(--text-primary)]" title={page.trackingUrl}>
                          {page.trackingUrl}
                        </p>
                      </div>
                      <div className="border-l border-[var(--surface-border)] pl-3 text-left">
                        <p className="mb-0.5 text-xs text-[var(--text-secondary)]">Views</p>
                        <p className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">{page.totalClicks.toLocaleString()}</p>
                      </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 border-t border-[var(--surface-border)] pt-3 text-xs text-[var(--text-secondary)]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>Created {new Date(page.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                          {deleteConfirmation?.pageIds.length === 1 && deleteConfirmation.pageIds[0] === page.id && (
                            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Delete this landing page?</p>
                                  <p className="mt-0.5 truncate text-[11px] text-amber-700/80 dark:text-amber-300/80">This cannot be undone.</p>
                                </div>
                              </div>
                              <div className="mt-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmation(null)}
                                  disabled={isDeleting}
                                  className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={deleteConfirmedPages}
                                  disabled={isDeleting}
                                  className="flex-1 rounded-md bg-amber-600 px-2 py-1.5 text-xs font-semibold text-white shadow-sm shadow-amber-600/20 hover:bg-amber-700 disabled:opacity-60"
                                >
                                  {isDeleting ? 'Deleting...' : 'Confirm delete'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Builder View */}
            <div className="mb-6 flex flex-wrap items-start gap-4 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-5 shadow-sm sm:p-6">
              <button
                onClick={() => setCurrentStep('list')}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
                aria-label="Back to landing pages"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">New landing page</h1>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Choose a URL, destination, and template for your page.</p>
              </div>
            </div>

            <div className="w-full">
              <form onSubmit={createLandingPage} className="grid items-start gap-5 lg:grid-cols-2">
                {/* Step 1 */}
                <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Globe className="h-4 w-4 shrink-0 text-indigo-400" />
                      <h3 className="truncate text-lg font-semibold text-[var(--text-primary)]">Basic Information</h3>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !selectedTemplate}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-900/15 transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-400 dark:text-[#06142d] dark:hover:bg-emerald-300"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Create
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Subdomain *</label>
                      <div className="flex items-center gap-2 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
                        <input
                          type="text"
                          value={subdomain}
                          onChange={(e) => validateSubdomain(e.target.value)}
                          placeholder="your-campaign"
                          aria-label="Subdomain"
                          autoComplete="off"
                          className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                        />
                      </div>
                      {subdomainError && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                          <X className="h-3 w-3" /> {subdomainError}
                        </p>
                      )}
                      {!subdomainError && subdomain && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-400">
                          <Check className="h-3 w-3" /> Looks good!
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Tracking Link *</label>
                      <div className="flex items-center gap-2 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
                        <LinkIcon className="h-4 w-4 shrink-0 text-slate-500" />
                        <input
                          type="url"
                          value={trackingUrl}
                          onChange={(e) => setTrackingUrl(e.target.value)}
                          placeholder="https://example.com/offer"
                          required
                          aria-label="Tracking link"
                          className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Choose a template</h3>
                  </div>

                  {templates.length === 0 ? (
                    <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
                      No templates available. Contact your administrator.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-[var(--text-secondary)]">
                        Use the arrows to browse and change the template.
                      </p>
                      <div className="flex items-center justify-center gap-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-2 py-1.5">
                        <button
                          type="button"
                          aria-label="Previous template"
                          disabled={templates.length <= 1}
                          onClick={() => selectTemplateAt((templateIndex - 1 + templates.length) % templates.length)}
                          className="rounded-md border border-[var(--surface-border)] bg-[var(--surface-card)] p-1.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="min-w-28 text-center text-sm font-medium text-[var(--text-primary)]">
                          Template {templateIndex + 1} of {templates.length}
                        </span>
                        <button
                          type="button"
                          aria-label="Next template"
                          disabled={templates.length <= 1}
                          onClick={() => selectTemplateAt((templateIndex + 1) % templates.length)}
                          className="rounded-md border border-[var(--surface-border)] bg-[var(--surface-card)] p-1.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      {(() => {
                        const template = templates[templateIndex]
                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => selectTemplateAt(templateIndex)}
                            className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-3 text-left transition-colors hover:border-cyan-500/50"
                          >
                            {template.thumbnail && (
                              <Image
                                src={template.thumbnail}
                                alt={template.name}
                                width={400}
                                height={96}
                                className="mb-3 h-48 w-full rounded-md bg-slate-100 object-contain dark:bg-slate-950/40"
                              />
                            )}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="break-words text-sm font-semibold text-[var(--text-primary)]">{template.name}</h4>
                                {template.description && (
                                  <p
                                    onPointerDown={(event) => event.stopPropagation()}
                                    className="mt-2 cursor-text select-text break-words rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1.5 text-xs font-medium leading-5 text-amber-200"
                                  >
                                    {template.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })()}
                    </div>
                  )}
                </div>

              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Check, Copy, Dices, ExternalLink, Link2, Plus, Search, Trash2 } from 'lucide-react'

type ShortUrl = {
  id: string
  subdomain: string
  trackingUrl: string
  userId: string
  totalClicks: number
  createdAt: string
}

const shortUrlDomain = 'weebly.pro'

export default function UrlShortenerPage() {
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([])
  const [shortUrlBase, setShortUrlBase] = useState(`https://${shortUrlDomain}`)
  const [subdomain, setSubdomain] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [filterText, setFilterText] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [isOwnerRoute, setIsOwnerRoute] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const getShortUrl = (subdomain: string) => {
    const url = new URL(shortUrlBase)
    url.hostname = `${subdomain}.${url.hostname}`
    return url.toString().replace(/\/$/, '')
  }

  const loadShortUrls = async () => {
    const response = await fetch('/api/url-shortener', { credentials: 'include' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Unable to load short URLs')
    const pages = data as ShortUrl[]
    setShortUrls(pages)
  }

  useEffect(() => {
    setIsOwnerRoute(window.location.pathname.startsWith('/owner/'))
    if (window.location.hostname === 'localhost' || window.location.hostname.startsWith('127.')) {
      setShortUrlBase(`${window.location.protocol}//localhost:${window.location.port || '3000'}`)
    }
    loadShortUrls().catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load short URLs')).finally(() => setLoading(false))
  }, [])

  const createShortUrl = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const hostname = new URL(trackingUrl).hostname.toLowerCase().replace(/\.$/, '')
      if (hostname === 'weebly.pro' || hostname.endsWith('.weebly.pro')) {
        setError('weebly.pro URLs cannot be used as short URL destinations.')
        return
      }
    } catch {
      setError('Enter a valid destination URL')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/url-shortener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subdomain, trackingUrl }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create short URL')
      setShortUrls((current) => [data, ...current])
      setSubdomain('')
      setTrackingUrl('')
      setMessage('Short URL created')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to create short URL')
    } finally {
      setSaving(false)
    }
  }

  const copyUrl = async (shortUrl: ShortUrl) => {
    try {
      await navigator.clipboard.writeText(getShortUrl(shortUrl.subdomain))
      setMessage('Short URL copied')
    } catch {
      setError('Unable to copy the short URL')
    }
  }

  const generateShortCode = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const code = Array.from({ length: 6 }, () => characters[Math.floor(Math.random() * characters.length)]).join('')
    setSubdomain(code)
  }

  const deleteUrl = async (id: string) => {
    const response = await fetch(`/api/url-shortener/${id}`, { method: 'DELETE', credentials: 'include' })
    if (response.ok) {
      setShortUrls((current) => current.filter((shortUrl) => shortUrl.id !== id))
      setSelectedIds((current) => current.filter((selectedId) => selectedId !== id))
      setConfirmDeleteId(null)
    } else {
      const data = await response.json().catch(() => null)
      setError(data?.error || 'Failed to delete short URL')
    }
  }

  const filteredShortUrls = shortUrls.filter((shortUrl) => {
    const query = filterText.trim().toLowerCase()
    const matchesUser = userFilter === 'all' || shortUrl.userId === userFilter
    return matchesUser && (!query || `${shortUrl.subdomain} ${shortUrl.trackingUrl}`.toLowerCase().includes(query))
  })
  const userOptions = [...new Set(shortUrls.map((shortUrl) => shortUrl.userId).filter(Boolean))]
  const allVisibleSelected = filteredShortUrls.length > 0 && filteredShortUrls.every((shortUrl) => selectedIds.includes(shortUrl.id))
  const totalClicks = shortUrls.reduce((total, shortUrl) => total + shortUrl.totalClicks, 0)
  const shortUrlHost = new URL(shortUrlBase).host

  const toggleAllVisible = () => {
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !filteredShortUrls.some((shortUrl) => shortUrl.id === id))
      : [...new Set([...current, ...filteredShortUrls.map((shortUrl) => shortUrl.id)])])
  }

  const copySelected = async () => {
    const selectedUrls = shortUrls.filter((shortUrl) => selectedIds.includes(shortUrl.id))
    try {
      await navigator.clipboard.writeText(selectedUrls.map((shortUrl) => getShortUrl(shortUrl.subdomain)).join('\n'))
      setMessage(`${selectedUrls.length} short URL${selectedUrls.length === 1 ? '' : 's'} copied`)
    } catch {
      setError('Unable to copy the selected short URLs')
    }
  }

  return (
    <main className="url-shortener-page w-full px-1 py-2 sm:px-2">
      <div className="w-full space-y-6 pb-8 md:space-y-7">
        <header className="url-shortener-header">
          <div className="flex items-start gap-3">
            <span className="url-shortener-icon"><Link2 className="h-5 w-5" /></span>
            <div>
              <p className="url-shortener-kicker">Link management</p>
              <h1 className="url-shortener-title">URL Shortener</h1>
              <p className="url-shortener-muted mt-1">Create branded short links and manage your destinations.</p>
            </div>
          </div>
        </header>

        {message && <div role="status" aria-live="polite" className="url-shortener-alert is-success"><Check className="h-4 w-4 shrink-0" />{message}</div>}
        {error && <div role="alert" aria-live="assertive" className="url-shortener-alert is-error">{error}</div>}

        <section className="url-shortener-create">
          <div className="url-shortener-section-heading">
            <div>
              <h2 className="url-shortener-section-title">Create a short URL</h2>
              <p className="url-shortener-muted mt-1 text-sm">Choose a memorable name and the destination it should open.</p>
            </div>
          </div>
          <form onSubmit={createShortUrl} className="url-shortener-form">
            <label className="url-shortener-label">
              Short name
              <span className="url-shortener-field">
                <input required value={subdomain} onChange={(event) => setSubdomain(event.target.value)} pattern="[a-zA-Z0-9]+([a-zA-Z0-9-]*[a-zA-Z0-9])?" minLength={3} maxLength={63} aria-describedby="short-url-host" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
                <button type="button" onClick={generateShortCode} title="Generate six-character code" aria-label="Generate six-character code" className="url-shortener-generate"><Dices className="h-4 w-4" /></button>
                <span id="short-url-host" className="url-shortener-host">.{shortUrlHost}</span>
              </span>
              <span className="url-shortener-hint">3–63 characters; letters, numbers, and hyphens.</span>
            </label>
            <label className="url-shortener-label">
              Destination URL
              <input required type="url" value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} placeholder="https://example.com/page" className="url-shortener-input" />
              <span className="url-shortener-hint">Visitors will be redirected to this address.</span>
            </label>
            <button type="submit" disabled={saving} className="url-shortener-primary"><Plus className="h-4 w-4" />{saving ? 'Creating...' : 'Create short URL'}</button>
          </form>
          {subdomain && (
            <p className="url-shortener-preview">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              Preview: <span>{getShortUrl(subdomain)}</span>
            </p>
          )}
        </section>

        <section className="url-shortener-list">
          <div className="url-shortener-list-heading">
            <div>
              <h2 className="url-shortener-section-title">Your short URLs</h2>
              <p className="url-shortener-muted mt-1 text-sm">{shortUrls.length} links · {totalClicks.toLocaleString()} total clicks</p>
            </div>
            <div className="url-shortener-controls">
              <label className="url-shortener-search">
                <Search className="h-4 w-4 shrink-0" />
                <input value={filterText} onChange={(event) => setFilterText(event.target.value)} placeholder="Filter short URLs" aria-label="Filter short URLs" />
              </label>
              {isOwnerRoute && <select value={userFilter} onChange={(event) => setUserFilter(event.target.value)} aria-label="Filter by user" className="url-shortener-select">
                <option value="all">All users</option>
                {userOptions.map((userId) => <option key={userId} value={userId}>{userId}</option>)}
              </select>}
              <button type="button" onClick={toggleAllVisible} disabled={filteredShortUrls.length === 0} className="url-shortener-secondary">{allVisibleSelected ? 'Clear visible' : 'Select visible'}</button>
              {selectedIds.length > 0 && <button type="button" onClick={copySelected} className="url-shortener-secondary is-copy"><Copy className="h-3.5 w-3.5" />Copy selected ({selectedIds.length})</button>}
            </div>
          </div>
          {loading ? (
            <div className="url-shortener-empty">Loading short URLs…</div>
          ) : shortUrls.length === 0 ? (
            <div className="url-shortener-empty"><Link2 className="mx-auto mb-3 h-7 w-7" /><strong>No short URLs yet</strong><span>Create your first short URL above to get started.</span></div>
          ) : filteredShortUrls.length === 0 ? (
            <div className="url-shortener-empty"><Search className="mx-auto mb-3 h-7 w-7" /><strong>No matching links</strong><span>Try a different search or user filter.</span></div>
          ) : (
            <div className="url-shortener-cards">
              {filteredShortUrls.map((shortUrl) => (
                <article key={shortUrl.id} className={`url-shortener-card ${selectedIds.includes(shortUrl.id) ? 'is-selected' : ''}`}>
                  <div className="flex min-w-0 items-start gap-3">
                    <input type="checkbox" checked={selectedIds.includes(shortUrl.id)} onChange={() => setSelectedIds((current) => current.includes(shortUrl.id) ? current.filter((id) => id !== shortUrl.id) : [...current, shortUrl.id])} aria-label={`Select ${shortUrl.subdomain}`} className="url-shortener-checkbox" />
                    <div className="min-w-0 flex-1">
                      <a href={getShortUrl(shortUrl.subdomain)} target="_blank" rel="noreferrer" className="url-shortener-link">{getShortUrl(shortUrl.subdomain).replace(/^https?:\/\//, '')}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a>
                      <p className="url-shortener-destination" title={shortUrl.trackingUrl}>{shortUrl.trackingUrl}</p>
                      <div className="url-shortener-meta">
                        <span>{shortUrl.totalClicks.toLocaleString()} {shortUrl.totalClicks === 1 ? 'click' : 'clicks'}</span>
                        <span>Created {new Date(shortUrl.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="url-shortener-actions">
                    <button type="button" onClick={() => copyUrl(shortUrl)} className="url-shortener-secondary"><Copy className="h-3.5 w-3.5" />Copy</button>
                    <button type="button" onClick={() => setConfirmDeleteId(shortUrl.id)} aria-label={`Delete ${shortUrl.subdomain}`} className="url-shortener-delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  {confirmDeleteId === shortUrl.id && (
                    <div className="url-shortener-confirm">
                      <span>Delete this short URL? This cannot be undone.</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setConfirmDeleteId(null)} className="url-shortener-secondary">Cancel</button>
                        <button type="button" onClick={() => deleteUrl(shortUrl.id)} className="url-shortener-delete-confirm">Delete</button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
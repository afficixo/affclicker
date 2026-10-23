'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, X, ArrowLeft, Image as ImageIcon, Check, Globe, Search } from 'lucide-react'
import {
  DEFAULT_LANDING_PAGE_DOMAIN_SETTINGS,
  type LandingPageDomainSetting,
} from '@/lib/utils/landing-page-host'

interface Template {
  id: string
  name: string
  description?: string
  thumbnail?: string
  customText?: string
  htmlContent: string
  isActive: boolean
  createdAt: string
}

export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [templateSearch, setTemplateSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [landingPageDomains, setLandingPageDomains] = useState<LandingPageDomainSetting[]>(DEFAULT_LANDING_PAGE_DOMAIN_SETTINGS)
  const [newLandingPageDomain, setNewLandingPageDomain] = useState('')
  const [isSavingDomains, setIsSavingDomains] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: '',
    customText: '',
    htmlContent: '',
  })

  const checkUserRole = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.role || 'OWNER')
        setUserId(data.id || 'current-user')
      } else {
        setUserRole('OWNER')
        setUserId('current-user')
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      setUserRole('OWNER')
      setUserId('current-user')
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/landing-pages/templates')
      if (response.ok) {
        setTemplates(await response.json())
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

  useEffect(() => {
    checkUserRole()
    fetchTemplates()
    fetchLandingPageDomains()
    setError('')
    setSuccess('')
  }, [checkUserRole, fetchTemplates, fetchLandingPageDomains])

  const addLandingPageDomain = () => {
    const domain = newLandingPageDomain.trim().toLowerCase()
    if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
      setError('Enter a valid root domain without https:// or a path')
      return
    }
    if (landingPageDomains.some((item) => item.domain === domain)) {
      setError('This landing page domain is already configured')
      return
    }
    if (landingPageDomains.length >= 10) {
      setError('You can configure up to 10 landing page domains')
      return
    }
    setLandingPageDomains((domains) => [...domains, { domain, includeProtocol: false }])
    setNewLandingPageDomain('')
    setError('')
  }

  const saveLandingPageDomains = async () => {
    setIsSavingDomains(true)
    setError('')
    try {
      const response = await fetch('/api/landing-pages/domains', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains: landingPageDomains }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to save landing page domains')
      setLandingPageDomains(data.domains)
      setSuccess('Landing page domains saved')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save landing page domains')
    } finally {
      setIsSavingDomains(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (userRole !== 'OWNER') {
      setError('Only owners can add templates')
      return
    }

    if (!formData.name || !formData.htmlContent) {
      setError('Please fill in name and HTML content')
      return
    }

    try {
      setLoading(true)
      setError('')

      const url = editingId
        ? `/api/landing-pages/templates/${editingId}`
        : '/api/landing-pages/templates'

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          userRole,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.details || data.error || 'Failed to save template')
      }

      setSuccess(editingId ? 'Template updated successfully!' : 'Template created successfully!')
      setFormData({
        name: '',
        description: '',
        thumbnail: '',
        customText: '',
        htmlContent: '',
      })
      setShowForm(false)
      setEditingId(null)
      setTimeout(() => {
        fetchTemplates()
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/landing-pages/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': userRole || '',
          'x-user-id': userId || '',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      setSuccess('Template deleted successfully!')
      setTimeout(() => {
        fetchTemplates()
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template')
    } finally {
      setLoading(false)
    }
  }

  const editTemplate = (template: Template) => {
    setFormData({
      name: template.name,
      description: template.description || '',
      thumbnail: template.thumbnail || '',
      customText: template.customText || '',
      htmlContent: template.htmlContent,
    })
    setEditingId(template.id)
    setShowForm(true)
  }

  const cancelEdit = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      thumbnail: '',
      customText: '',
      htmlContent: '',
    })
  }

  const searchTerm = templateSearch.trim().toLocaleLowerCase()
  const filteredTemplates = searchTerm
    ? templates.filter((template) =>
        [template.name, template.description, template.customText]
          .some((value) => value?.toLocaleLowerCase().includes(searchTerm)),
      )
    : templates

  if (authLoading) {
    return null
  }

  if (userRole !== 'OWNER') {
    return (
      <div className="template-manager-access">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">Only owners can manage templates</p>
        </div>
      </div>
    )
  }

  return (
    <div className="template-manager-page">
      <div className="template-manager-content">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="template-manager-back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Alerts */}
        {error && (
          <div role="alert" className="template-manager-alert is-error">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {success && (
          <div role="status" className="template-manager-alert is-success">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="template-manager-header">
          <div className="template-manager-heading">
            <span className="template-manager-heading-icon"><ImageIcon className="h-5 w-5" /></span>
            <div>
              <p className="template-manager-kicker">Landing pages</p>
              <h1 className="template-manager-title">Templates</h1>
              <p className="template-manager-subtitle">Manage and organize your landing page templates.</p>
            </div>
          </div>
          <div className="template-manager-header-actions">
            <Link
              href="/owner/media"
              className="template-manager-secondary"
            >
              <span className="template-manager-media-icon">
                <ImageIcon className="h-3 w-3" />
              </span>
              Media Source
            </Link>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="template-manager-primary"
              >
                <Plus className="h-4 w-4" />
                New Template
              </button>
            )}
          </div>
        </div>

        <section className="template-manager-domains">
          <div className="template-manager-domain-heading">
            <span className="template-manager-domain-icon"><Globe className="h-5 w-5" /></span>
            <div>
              <h2 className="template-manager-section-title">Landing page domains</h2>
              <p className="template-manager-section-description">Choose which root domains appear in generated landing page links. Each domain must point to this app.</p>
            </div>
          </div>
          <div className="template-manager-domain-add">
            <input
              type="text"
              value={newLandingPageDomain}
              onChange={(event) => setNewLandingPageDomain(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addLandingPageDomain()
                }
              }}
              placeholder="example.com"
              aria-label="New landing page root domain"
              className="template-manager-domain-input"
            />
            <button
              type="button"
              onClick={addLandingPageDomain}
              className="template-manager-secondary template-manager-add-domain"
            >
              <Plus className="h-4 w-4" />
              Add domain
            </button>
          </div>
          <ul className="template-manager-domain-list">
            {landingPageDomains.map((domain) => (
              <li key={domain.domain} className="template-manager-domain-row">
                <span className="template-manager-domain-name">{domain.domain}</span>
                <div className="template-manager-domain-options">
                  <label className="template-manager-protocol-option">
                    <input
                      type="checkbox"
                      checked={domain.includeProtocol}
                      onChange={(event) => setLandingPageDomains((domains) => domains.map((item) => item.domain === domain.domain
                        ? { ...item, includeProtocol: event.target.checked }
                        : item))}
                      disabled={isSavingDomains}
                      className="h-4 w-4 accent-emerald-600"
                      aria-label={`Show https:// for ${domain.domain}`}
                    />
                    <span>Show https://</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setLandingPageDomains((domains) => domains.filter((item) => item.domain !== domain.domain))}
                    disabled={landingPageDomains.length <= 1 || isSavingDomains}
                    className="template-manager-remove-domain"
                    aria-label={`Remove ${domain.domain}`}
                    title="Remove domain"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="template-manager-domain-footer">
            <p className="template-manager-footnote">Changes apply to generated links and host routing after you save.</p>
            <button
              type="button"
              onClick={saveLandingPageDomains}
              disabled={isSavingDomains}
              className="template-manager-save"
            >
              <Check className="h-4 w-4" />
              {isSavingDomains ? 'Saving...' : 'Save domains'}
            </button>
          </div>
        </section>

        {/* Form */}
        {showForm && (
          <div className="template-manager-form-panel">
            <h2 className="template-manager-section-title">
              {editingId ? 'Edit Template' : 'New Template'}
            </h2>

            <form onSubmit={handleSubmit} className="template-manager-form">
              <div>
                <label htmlFor="template-name" className="template-manager-form-label">
                  Template Name *
                </label>
                <input
                  id="template-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="template-manager-form-input"
                />
              </div>

              <div>
                <label htmlFor="template-description" className="template-manager-form-label">Description</label>
                <textarea
                  id="template-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="template-manager-form-input"
                />
              </div>

              <div>
                <label htmlFor="template-thumbnail" className="template-manager-form-label">Thumbnail URL</label>
                <input
                  id="template-thumbnail"
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="template-manager-form-input"
                />
              </div>

              <div>
                <label htmlFor="template-copy-text" className="template-manager-form-label">Copy Text</label>
                <textarea
                  id="template-copy-text"
                  value={formData.customText}
                  onChange={(e) => setFormData({ ...formData, customText: e.target.value })}
                  rows={3}
                  className="template-manager-form-input"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Use <code className="rounded bg-slate-800 px-1.5 py-0.5">{`{link}`}</code> as a placeholder for the landing page URL.
                </p>
              </div>

              <div className="template-manager-html-field">
                <label htmlFor="template-html-content" className="template-manager-form-label">HTML Content *</label>
                <textarea
                  id="template-html-content"
                  value={formData.htmlContent}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  rows={10}
                  className="template-manager-form-input is-code"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Use <code className="rounded bg-slate-800 px-1.5 py-0.5">{'{link.url}'}</code> where the tracking URL should appear, e.g. in <code className="rounded bg-slate-800 px-1.5 py-0.5">&lt;a href=&quot;{'{link.url}'}&quot;&gt;</code>.
                </p>
              </div>

              <div className="template-manager-form-actions">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="template-manager-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="template-manager-primary"
                >
                  {loading ? 'Saving…' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Templates Grid */}
        {templates.length > 0 && (
          <div className="template-manager-library-header">
            <div className="template-manager-library-heading">
              <h2 className="template-manager-section-title">Template library</h2>
              <span className="template-manager-count">
                {searchTerm
                  ? `${filteredTemplates.length} of ${templates.length} templates`
                  : `${templates.length} template${templates.length === 1 ? '' : 's'}`}
              </span>
            </div>
            <label className="template-manager-search">
              <Search className="h-4 w-4" aria-hidden="true" />
              <input
                type="search"
                value={templateSearch}
                onChange={(event) => setTemplateSearch(event.target.value)}
                placeholder="Search templates"
                aria-label="Search templates"
              />
              {templateSearch && (
                <button
                  type="button"
                  onClick={() => setTemplateSearch('')}
                  aria-label="Clear template search"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
          </div>
        )}
        {templates.length === 0 ? (
          <div className="template-manager-empty">
            <ImageIcon className="h-7 w-7" />
            <p className="template-manager-empty-title">No templates yet</p>
            <p>Create your first template to get started.</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="template-manager-empty">
            <Search className="h-7 w-7" />
            <p className="template-manager-empty-title">No matching templates</p>
            <p>Try a different name or search term.</p>
          </div>
        ) : (
          <div className="template-manager-grid">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="template-manager-card"
              >
                {template.thumbnail && (
                  <div className="template-manager-thumbnail">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="template-manager-thumbnail-image"
                    />
                  </div>
                )}
                <div className="template-manager-card-heading">
                  <h3 className="template-manager-card-title">{template.name}</h3>
                  <span className={`template-manager-status ${template.isActive ? 'is-active' : 'is-inactive'}`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {template.description && (
                  <p className="template-manager-card-description">{template.description}</p>
                )}
                <p className="template-manager-card-meta">
                  {template.htmlContent.length.toLocaleString()} HTML characters
                </p>
                {template.customText && (
                  <p className="template-manager-card-copy" title={template.customText}>
                    Copy text: {template.customText}
                  </p>
                )}
                <div className="template-manager-card-actions">
                  <button
                    onClick={() => editTemplate(template)}
                    className="template-manager-secondary"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    disabled={loading}
                    className="template-manager-delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
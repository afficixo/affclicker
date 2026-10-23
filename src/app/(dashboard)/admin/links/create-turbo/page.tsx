"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Copy,
  Globe2,
  Hash,
  Rocket,
  Users,
} from "lucide-react";
import { buildOfferGroupList } from "@/lib/utils/offer-groups";
import { coerceArray } from "@/lib/utils/array-response";

interface Domain {
  id: string;
  domain: string;
  verified: boolean;
  isActive: boolean;
}

interface CreatedTurboLink {
  accountName: string;
  slug: string;
  trackingUrl: string;
  publicStatsUrl: string;
}

export default function CreateLinkTurboPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [baseName, setBaseName] = useState("");
  const [startNumber, setStartNumber] = useState("1");
  const [endNumber, setEndNumber] = useState("10");
  const [customDomainId, setCustomDomainId] = useState("");
  const [offerGroupName, setOfferGroupName] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [offerGroups, setOfferGroups] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdLinks, setCreatedLinks] = useState<CreatedTurboLink[]>([]);
  const [copyAllLabel, setCopyAllLabel] = useState("Copy all");
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const createdLinksRef = useRef<HTMLElement>(null);

  const copyText = useCallback(async (text: string) => {
    if (!text) return false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    } catch (error) {
      console.error("Failed to copy text:", error);
      return false;
    }
  }, []);

  const fetchDomains = useCallback(async () => {
    try {
      const response = await fetch("/api/domains", { credentials: "include" });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setDomains(coerceArray<Domain>(data));
    } catch (error) {
      console.error("Failed to fetch domains:", error);
    }
  }, [router]);

  const fetchOfferGroups = useCallback(async () => {
    try {
      const response = await fetch("/api/offers", { credentials: "include" });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setOfferGroups(buildOfferGroupList(data));
    } catch (error) {
      console.error("Failed to fetch offer groups:", error);
    }
  }, [router]);

  useEffect(() => {
    void fetchDomains();
    void fetchOfferGroups();
  }, [fetchDomains, fetchOfferGroups]);

  useEffect(() => {
    if (createdLinks.length === 0) return;

    const frame = window.requestAnimationFrame(() => {
      createdLinksRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [createdLinks]);

  const selectableDomains = domains.filter((domain) => domain.verified && domain.isActive);
  const selectedDomain = selectableDomains.find((domain) => domain.id === customDomainId);
  const dashboardBasePath = pathname.startsWith("/owner/")
    ? "/owner"
    : pathname.startsWith("/publisher/")
      ? "/publisher"
      : "/admin";
  const previewStart = Number(startNumber);
  const previewEnd = Number(endNumber);
  const previewCount = Number.isInteger(previewStart) && Number.isInteger(previewEnd) && previewStart > 0 && previewEnd >= previewStart
    ? previewEnd - previewStart + 1
    : 0;
  const previewNames = previewCount > 0 && baseName.trim()
    ? [1, 2, 3].slice(0, Math.min(previewCount, 3)).map((offset) => `${baseName}${previewStart + offset - 1}`)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreatedLinks([]);
    setLoading(true);

    const start = Number(startNumber);
    const end = Number(endNumber);

    if (!baseName.trim()) {
      setError("Account name is required.");
      setLoading(false);
      return;
    }

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1 || start > end) {
      setError("Please enter a valid number range starting from 1, with start less than or equal to end.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/links/turbo", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseName: baseName.trim(),
          start,
          end,
          customDomainId: customDomainId || null,
          offerGroupName: offerGroupName || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to create turbo links");
      }

      setCreatedLinks(data.createdLinks || []);
      setBaseName("");
      setStartNumber("1");
      setEndNumber("10");
      setCustomDomainId("");
      setOfferGroupName("");
    } catch (err: any) {
      setError(err.message || "Failed to create turbo links");
    } finally {
      setLoading(false);
    }
  };

  const createdTemplate = createdLinks.length
    ? createdLinks
        .map((link) => `Account Name: \`${link.accountName}\`\nPublic Analytics: ${link.publicStatsUrl}\nTracking URL: \`${link.trackingUrl}\``)
        .join("\n\n")
    : "";

  const handleCopyAll = async () => {
    const copied = await copyText(createdTemplate);
    setCopyAllLabel(copied ? "Copied!" : "Copy failed");
    window.setTimeout(() => setCopyAllLabel("Copy all"), 1600);
  };

  const handleCopyValue = async (value: string, key: string) => {
    const copied = await copyText(value);
    if (!copied) return;

    setCopiedValue(key);
    window.setTimeout(() => setCopiedValue((current) => (current === key ? null : current)), 1600);
  };

  return (
    <div className="bulk-link-page min-h-full w-full px-2 py-3 sm:px-3 sm:py-5">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Main Grid */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] xl:gap-6">
          {/* Form Card */}
          <div className="bulk-link-card w-full min-w-0 rounded-2xl p-5 shadow-sm sm:p-7">
            {error && (
              <div role="alert" className="bulk-link-error mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="campaign-builder-step-heading mb-2">
                  <span className="bulk-link-step-badge" aria-hidden="true">1</span>
                  <label htmlFor="bulk-account-name" className="bulk-link-label text-sm font-semibold">
                    Account Label
                  </label>
                </div>
                <input
                  id="bulk-account-name"
                  type="text"
                  value={baseName}
                  onChange={(e) => setBaseName(e.target.value.replace(/\s+/g, ""))}
                  placeholder="e.g. Campaign"
                  required
                  disabled={loading}
                  className="bulk-link-input w-full rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:ring-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bulk-start" className="bulk-link-range-label">Start number</label>
                  <input
                    id="bulk-start"
                    type="number"
                    min="1"
                    value={startNumber}
                    onChange={(e) => setStartNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="1"
                    required
                    disabled={loading}
                    className="bulk-link-input w-full rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label htmlFor="bulk-end" className="bulk-link-range-label">End number</label>
                  <input
                    id="bulk-end"
                    type="number"
                    min="1"
                    value={endNumber}
                    onChange={(e) => setEndNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="10"
                    required
                    disabled={loading}
                    className="bulk-link-input w-full rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <div className="campaign-builder-step-heading mb-2">
                  <span className="bulk-link-step-badge" aria-hidden="true">2</span>
                  <label htmlFor="bulk-domain" className="bulk-link-label text-sm font-semibold">Custom domain</label>
                </div>
                <select
                  id="bulk-domain"
                  value={customDomainId}
                  onChange={(e) => setCustomDomainId(e.target.value)}
                  disabled={loading || selectableDomains.length === 0}
                  className="bulk-link-input w-full rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">{selectableDomains.length ? "Select a custom domain" : "No verified domains available"}</option>
                  {selectableDomains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.domain}
                    </option>
                  ))}
                </select>
                {selectableDomains.length === 0 && (
                  <Link href={`${dashboardBasePath}/domains`} className="bulk-link-action mt-2 inline-flex items-center text-xs font-semibold">
                    Add or verify a domain <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                )}
              </div>

              <div>
                <div className="campaign-builder-step-heading mb-2">
                  <span className="bulk-link-step-badge" aria-hidden="true">3</span>
                  <label htmlFor="bulk-offer" className="bulk-link-label text-sm font-semibold">Offer group</label>
                </div>
                <select
                  id="bulk-offer"
                  value={offerGroupName}
                  onChange={(e) => setOfferGroupName(e.target.value)}
                  disabled={loading}
                  className="bulk-link-input w-full rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Select an offer</option>
                  {offerGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bulk-link-submit inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating accounts…
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Create {previewCount > 0 ? `${previewCount} ${previewCount === 1 ? "link" : "links"}` : "batch"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar / Results */}
          {createdLinks.length > 0 ? (
            <section
              ref={createdLinksRef}
              className="bulk-link-results campaign-builder-created"
              role="status"
              aria-live="polite"
            >
              <div className="campaign-builder-created-heading">
                <span className="campaign-builder-created-icon">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="campaign-builder-created-eyebrow">Success</p>
                  <h2 className="bulk-link-title text-base font-semibold">Links created successfully</h2>
                  <p className="bulk-link-muted mt-1 text-sm">{createdLinks.length.toLocaleString()} link accounts are ready to use.</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyAll()}
                  className="bulk-link-copy-all inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2"
                  aria-label="Copy all created links"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copyAllLabel}</span>
                </button>
              </div>

              <div className="mt-5 space-y-6">
                {createdLinks.map((link, index) => (
                  <div
                    key={`${link.accountName}-${index}`}
                    className="bulk-link-result-item"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="bulk-link-title flex items-center gap-2 text-sm font-semibold"><Hash className="bulk-link-accent h-3.5 w-3.5" />{link.accountName}</div>
                    </div>
                    <div className="mt-2 space-y-2 text-xs">
                      <div>
                        <div className="bulk-link-muted mb-1 flex items-center justify-between gap-2 text-xs"><span>Tracking URL</span><button type="button" onClick={() => void handleCopyValue(link.trackingUrl, `tracking-${link.accountName}`)} className={`bulk-link-copy-button inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition ${copiedValue === `tracking-${link.accountName}` ? "is-copied" : ""}`} aria-label={`Copy tracking URL for ${link.accountName}`} title="Copy tracking URL">{copiedValue === `tracking-${link.accountName}` ? "Copied" : "Copy"}</button></div>
                      </div>
                      <div>
                        <div className="bulk-link-muted mb-1 flex items-center justify-between gap-2 text-xs"><span>Public analytics</span><button type="button" onClick={() => void handleCopyValue(link.publicStatsUrl, `stats-${link.accountName}`)} className={`bulk-link-copy-button inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition ${copiedValue === `stats-${link.accountName}` ? "is-copied" : ""}`} aria-label={`Copy public stats for ${link.accountName}`} title="Copy public stats URL">{copiedValue === `stats-${link.accountName}` ? "Copied" : "Copy"}</button></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <div className="bulk-link-preview">
              <div className="bulk-link-preview-header">
                <p className="bulk-link-accent text-xs font-semibold uppercase tracking-[0.12em]">Batch preview</p>
              </div>
              <div className="bulk-link-preview-content">
                <div className="bulk-link-preview-stat">
                  <div>
                    <p className="bulk-link-preview-count">{previewCount.toLocaleString()}</p>
                    <p className="bulk-link-muted text-xs font-medium">accounts to create</p>
                  </div>
                  <Users className="bulk-link-icon h-5 w-5" aria-hidden="true" />
                </div>
                <div className="bulk-link-preview-details">
                  <div className="bulk-link-preview-row">
                    <span className="bulk-link-muted">Account range</span>
                    <span className="bulk-link-title min-w-0 truncate font-mono font-medium">{baseName || "Account"}{startNumber || "1"} – {baseName || "Account"}{endNumber || "10"}</span>
                  </div>
                  <div className="bulk-link-preview-row">
                    <span className="bulk-link-muted">Domain</span>
                    <span className="bulk-link-title flex min-w-0 items-center gap-1.5 truncate font-medium"><Globe2 className="bulk-link-accent h-3.5 w-3.5 shrink-0" />{selectedDomain?.domain || "Default domain"}</span>
                  </div>
                </div>
                {previewNames.length > 0 && (
                  <div className="bulk-link-preview-examples">
                    <p className="bulk-link-muted text-xs font-medium">Sample names</p>
                    <div className="bulk-link-example-list">
                      {previewNames.map((name) => <span key={name} className="bulk-link-example font-mono text-xs">{name}</span>)}
                      {previewCount > previewNames.length && <span className="bulk-link-muted text-xs">+{(previewCount - previewNames.length).toLocaleString()} more</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
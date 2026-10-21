"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
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
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdLinks, setCreatedLinks] = useState<CreatedTurboLink[]>([]);
  const [copyAllLabel, setCopyAllLabel] = useState("Copy all");
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

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
    setSuccess("");
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
      setSuccess(`Created ${data.createdCount || 0} link(s) successfully.`);
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
        <header className="mb-6 flex flex-col gap-4 border-b border-[var(--surface-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="bulk-link-icon mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Rocket className="h-5 w-5" />
            </span>
            <div>
              <p className="bulk-link-accent mb-1 text-xs font-semibold uppercase tracking-[0.16em]">Link management</p>
              <h1 className="bulk-link-title text-2xl font-bold tracking-tight sm:text-3xl">Bulk create links</h1>
              <p className="bulk-link-muted mt-1 max-w-2xl text-sm">Create a numbered series of link accounts from one shared configuration.</p>
            </div>
          </div>
          <Link
            href={`${dashboardBasePath}/links`}
            className="bulk-link-secondary inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 sm:self-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            All link accounts
          </Link>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] xl:gap-6">
          {/* Form Card */}
          <div className="bulk-link-card w-full min-w-0 rounded-2xl p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-3 border-b border-[var(--surface-border)] pb-5">
              <div>
                <p className="bulk-link-muted text-xs font-semibold uppercase tracking-[0.12em]">Batch configuration</p>
                <h2 className="bulk-link-title mt-1 text-lg font-semibold">Shared link settings</h2>
                <p className="bulk-link-muted mt-1 text-sm">Choose a naming range and optional routing defaults.</p>
              </div>
              <span className="bulk-link-secure hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:inline-flex">
                <Users className="h-3.5 w-3.5" />
                Bulk workflow
              </span>
            </div>

            {error && (
              <div role="alert" className="bulk-link-error mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div role="status" className="bulk-link-success mb-4 rounded-lg border px-4 py-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="bulk-account-name" className="bulk-link-label mb-2 block text-sm font-semibold">Account name base <span className="text-red-500">*</span></label>
                <p className="bulk-link-muted mb-2 text-xs">The number is appended to this name for each account.</p>
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
                  <label htmlFor="bulk-start" className="bulk-link-label mb-2 block text-sm font-semibold">Start number</label>
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
                  <label htmlFor="bulk-end" className="bulk-link-label mb-2 block text-sm font-semibold">End number</label>
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
                <label htmlFor="bulk-domain" className="bulk-link-label mb-2 block text-sm font-semibold">Custom domain <span className="bulk-link-muted font-normal">(optional)</span></label>
                <p className="bulk-link-muted mb-2 text-xs">Use one verified domain for the whole batch.</p>
                <select
                  id="bulk-domain"
                  value={customDomainId}
                  onChange={(e) => setCustomDomainId(e.target.value)}
                  disabled={loading || selectableDomains.length === 0}
                  className="bulk-link-input w-full rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">{selectableDomains.length ? "Use the default domain" : "No verified domains available"}</option>
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
                <label htmlFor="bulk-offer" className="bulk-link-label mb-2 block text-sm font-semibold">Offer group <span className="bulk-link-muted font-normal">(optional)</span></label>
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
              <p className="bulk-link-muted text-center text-xs">All accounts will use the selected domain and offer group.</p>
            </form>
          </div>

          {/* Sidebar / Results */}
          {createdLinks.length > 0 ? (
            <div className="bulk-link-results rounded-2xl border p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3 border-b border-[var(--surface-border)] pb-4">
                <div className="flex items-start gap-2.5">
                  <div className="bulk-link-result-icon mt-0.5 rounded-lg border p-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="bulk-link-title text-base font-semibold">Batch complete</h2>
                    <p className="bulk-link-muted mt-0.5 text-xs">{createdLinks.length} link accounts are ready to use.</p>
                  </div>
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

              <div className="mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-1">
                {createdLinks.map((link, index) => (
                  <div
                    key={`${link.accountName}-${index}`}
                    className="bulk-link-result-item rounded-xl border p-3.5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="bulk-link-title flex items-center gap-2 text-sm font-semibold"><Hash className="bulk-link-accent h-3.5 w-3.5" />{link.accountName}</div>
                    </div>
                    <div className="mt-2 space-y-2 text-xs">
                      <div>
                        <div className="bulk-link-muted mb-1 flex items-center justify-between gap-2 text-xs"><span>Tracking URL</span><button type="button" onClick={() => void handleCopyValue(link.trackingUrl, `tracking-${link.accountName}`)} className={`bulk-link-copy-button inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition ${copiedValue === `tracking-${link.accountName}` ? "is-copied" : ""}`} aria-label={`Copy tracking URL for ${link.accountName}`} title="Copy tracking URL">{copiedValue === `tracking-${link.accountName}` ? "Copied" : "Copy"}</button></div>
                        <a href={link.trackingUrl} target="_blank" rel="noreferrer" className="bulk-link-result-url block rounded-md border px-2.5 py-2 font-mono text-xs leading-5 break-all transition">{link.trackingUrl}</a>
                      </div>
                      <div>
                        <div className="bulk-link-muted mb-1 flex items-center justify-between gap-2 text-xs"><span>Public analytics</span><button type="button" onClick={() => void handleCopyValue(link.publicStatsUrl, `stats-${link.accountName}`)} className={`bulk-link-copy-button inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition ${copiedValue === `stats-${link.accountName}` ? "is-copied" : ""}`} aria-label={`Copy public stats for ${link.accountName}`} title="Copy public stats URL">{copiedValue === `stats-${link.accountName}` ? "Copied" : "Copy"}</button></div>
                        <a href={link.publicStatsUrl} target="_blank" rel="noreferrer" className="bulk-link-result-url block rounded-md border px-2.5 py-2 font-mono text-xs leading-5 break-all transition">{link.publicStatsUrl}</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bulk-link-preview rounded-2xl border p-5 shadow-sm sm:p-6">
              <div className="mb-5 border-b border-[var(--surface-border)] pb-4">
                <p className="bulk-link-accent text-xs font-semibold uppercase tracking-[0.12em]">Batch preview</p>
                <h2 className="bulk-link-title mt-1 text-base font-semibold">Review before creating</h2>
              </div>
              <div className="space-y-4">
                <div className="bulk-link-preview-stat flex items-center gap-3 rounded-xl border p-4">
                  <span className="bulk-link-icon flex h-10 w-10 items-center justify-center rounded-lg"><Users className="h-5 w-5" /></span>
                  <div><p className="bulk-link-muted text-xs">Accounts to create</p><p className="bulk-link-title text-2xl font-bold tabular-nums">{previewCount.toLocaleString()}</p></div>
                </div>
                <div className="bulk-link-preview-row flex items-center justify-between gap-3 border-b py-2 text-sm">
                  <span className="bulk-link-muted">Name pattern</span>
                  <span className="bulk-link-title truncate font-mono font-medium">{baseName || "Account"}{startNumber || "1"} – {baseName || "Account"}{endNumber || "10"}</span>
                </div>
                <div className="bulk-link-preview-row flex items-center justify-between gap-3 border-b py-2 text-sm">
                  <span className="bulk-link-muted">Domain</span>
                  <span className="bulk-link-title flex min-w-0 items-center gap-1.5 truncate font-medium"><Globe2 className="bulk-link-accent h-3.5 w-3.5 shrink-0" />{selectedDomain?.domain || "Default domain"}</span>
                </div>
                {previewNames.length > 0 && (
                  <div>
                    <p className="bulk-link-muted mb-2 text-xs font-semibold uppercase tracking-wide">Example accounts</p>
                    <div className="flex flex-wrap gap-2">
                      {previewNames.map((name) => <span key={name} className="bulk-link-example rounded-md border px-2.5 py-1.5 font-mono text-xs">{name}</span>)}
                      {previewCount > previewNames.length && <span className="bulk-link-muted self-center text-xs">+{(previewCount - previewNames.length).toLocaleString()} more</span>}
                    </div>
                  </div>
                )}
                {createdLinks.length === 0 && (
                  <p className="bulk-link-muted rounded-lg bg-[var(--surface-elevated)] p-3 text-xs leading-5">
                    Configure the name and number range. The preview updates as you make changes.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
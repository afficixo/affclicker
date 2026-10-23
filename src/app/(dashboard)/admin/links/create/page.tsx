"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Rocket,
  X,
} from "lucide-react";
import { buildOfferGroupList } from "@/lib/utils/offer-groups";
import { coerceArray } from "@/lib/utils/array-response";

// ========== TYPES ==========
interface Domain {
  id: string;
  domain: string;
  verified: boolean;
  isActive: boolean;
}

interface CreatedAccount {
  trackingUrl: string;
  publicStatsUrl: string;
}

const ResultCopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="campaign-builder-result-copy inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
};

// ========== MAIN PAGE ==========
export default function CreateLinkPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [accountName, setAccountName] = useState("");
  const [customSlugEnabled, setCustomSlugEnabled] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [customDomainId, setCustomDomainId] = useState("");
  const [offerGroupName, setOfferGroupName] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [offerGroups, setOfferGroups] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);
  const createdAccountRef = useRef<HTMLDivElement>(null);

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin.replace(/\/$/, "");
    }
    return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  };

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
      const groups = buildOfferGroupList(data);
      setOfferGroups(groups);
    } catch (error) {
      console.error("Failed to fetch offer groups:", error);
    }
  }, [router]);

  useEffect(() => {
    void fetchDomains();
    void fetchOfferGroups();
  }, [fetchDomains, fetchOfferGroups]);

  useEffect(() => {
    if (!createdAccount) return;

    const frame = window.requestAnimationFrame(() => {
      createdAccountRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [createdAccount]);

  const selectableDomains = domains.filter((domain) => domain.verified && domain.isActive);
  const dashboardBasePath = pathname.startsWith("/owner/")
    ? "/owner"
    : pathname.startsWith("/publisher/")
      ? "/publisher"
      : "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (customSlugEnabled && !customSlug.trim()) {
      setError("Enter a custom slug or turn off the custom slug option.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountName,
          customSlug: customSlugEnabled ? customSlug : null,
          customDomainId: customDomainId || null,
          offerGroupName: offerGroupName || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create link");
      }

      const createdTrackingUrl = data.customDomain?.domain
        ? `https://${data.customDomain.domain}/${data.slug}`
        : `${getBaseUrl()}/${data.slug}`;

      const createdPublicStatsUrl = `${getBaseUrl()}/stats/${data.publicDashboard?.publicId}`;

      setCreatedAccount({
        trackingUrl: createdTrackingUrl,
        publicStatsUrl: createdPublicStatsUrl,
      });
      setAccountName("");
      setCustomSlug("");
      setCustomDomainId("");
      setOfferGroupName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-builder-page min-h-full w-full px-2 py-3 sm:px-3 sm:py-5">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid w-full min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] xl:gap-6">
          {/* Form Card */}
          <div className="campaign-builder-card w-full min-w-0 p-2 sm:p-4 lg:p-6">
            {error && (
              <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
                <X className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="campaign-builder-step-heading">
                <span className="campaign-builder-step-index" aria-hidden="true">01</span>
                <span>Account details</span>
              </div>
              <div className="campaign-builder-field">
                <label htmlFor="account-name" className="campaign-builder-label mb-2 block text-sm font-semibold">Account name</label>
                <input
                  id="account-name"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Enter account name"
                  aria-label="Account name"
                  required
                  disabled={loading}
                  className="campaign-builder-input w-full rounded-lg px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2"
                />
              </div>

              <div className="campaign-builder-step-heading">
                <span className="campaign-builder-step-index" aria-hidden="true">02</span>
                <span>Link settings</span>
              </div>

              <div className="campaign-builder-slug-setting campaign-builder-slug-setting-form">
                <div className="min-w-0">
                  <div className="campaign-builder-slug-setting-label">
                    <span>Custom URL slug</span>
                    <span className="campaign-builder-optional-tag">Optional</span>
                  </div>
                  <div className="campaign-builder-slug-setting-help">
                    {customSlugEnabled ? "Set a custom path for your tracking link." : "Leave off to use an automatic slug."}
                  </div>
                </div>
                <div className="campaign-builder-slug-setting-control">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={customSlugEnabled}
                    aria-controls="custom-slug-field"
                    aria-label="Use custom URL slug (optional)"
                    onClick={() => setCustomSlugEnabled((enabled) => !enabled)}
                    disabled={loading}
                    className={`campaign-builder-slug-toggle transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:cursor-not-allowed disabled:opacity-60 ${customSlugEnabled ? "is-active" : ""}`}
                  >
                    <span className="campaign-builder-slug-toggle-track" aria-hidden="true">
                      <span className="campaign-builder-slug-toggle-thumb" />
                    </span>
                  </button>
                </div>
              </div>

              <div
                id="custom-slug-field"
                aria-hidden={!customSlugEnabled}
                className={`campaign-builder-custom-slug campaign-builder-field ${customSlugEnabled ? "is-open" : ""}`}
              >
                  <label htmlFor="custom-slug" className="sr-only">
                    Custom slug
                  </label>
                  <div className="relative">
                    <span className="campaign-builder-slug-prefix" aria-hidden="true">/</span>
                    <input
                      id="custom-slug"
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.replace(/[^A-Za-z0-9-]/g, "").replace(/-+/g, "-").slice(0, 64))}
                      placeholder="my-campaign"
                      required={customSlugEnabled}
                      disabled={!customSlugEnabled || loading}
                      className="campaign-builder-input w-full rounded-lg py-3 pl-8 pr-3.5 text-sm transition focus:outline-none focus:ring-2"
                    />
                  </div>
              </div>

              <div className="campaign-builder-field">
                <label htmlFor="custom-domain" className="campaign-builder-label mb-2 block text-sm font-semibold">Custom domain</label>
                <p className="campaign-builder-muted mb-2 text-xs">Choose a verified domain for a branded tracking URL.</p>
                <select
                  id="custom-domain"
                  value={customDomainId}
                  onChange={(e) => setCustomDomainId(e.target.value)}
                  disabled={loading || selectableDomains.length === 0}
                  className="campaign-builder-input w-full rounded-lg px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">{selectableDomains.length ? "Select a custom domain" : "No verified domains available"}</option>
                  {selectableDomains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.domain}
                    </option>
                  ))}
                </select>
                {selectableDomains.length === 0 && (
                  <a href={`${dashboardBasePath}/domains`} className="campaign-builder-inline-link mt-2 inline-flex text-xs font-semibold">
                    Add or verify a domain <ArrowRight className="ml-1 h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="campaign-builder-field">
                <label htmlFor="offer-group" className="campaign-builder-label mb-2 flex items-center gap-2 text-sm font-semibold">
                  <span className="campaign-builder-step-index" aria-hidden="true">03</span>
                  <span className="campaign-builder-label-normal">Offer group</span>
                </label>
                <select
                  id="offer-group"
                  value={offerGroupName}
                  onChange={(e) => setOfferGroupName(e.target.value)}
                  disabled={loading}
                  className="campaign-builder-input w-full rounded-lg px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="campaign-builder-submit inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating account…
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    <span>Create link account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <aside className="campaign-builder-preview lg:sticky lg:top-5">
            <section className="campaign-builder-preview-help px-2 py-2 sm:px-4 lg:px-6 lg:pt-2">
              {createdAccount ? (
                <div ref={createdAccountRef} className="campaign-builder-created" role="status" aria-live="polite">
                  <div className="campaign-builder-created-heading">
                    <span className="campaign-builder-created-icon">
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="campaign-builder-created-eyebrow">Success</p>
                      <h2 className="campaign-builder-title text-base font-semibold tracking-tight">Link created successfully</h2>
                    </div>
                  </div>
                  <p className="campaign-builder-created-copy">Your link is ready. Copy a link below to continue.</p>
                  <div className="campaign-builder-created-actions">
                    <ResultCopyButton text={createdAccount.trackingUrl} label="Copy tracking link" />
                    <ResultCopyButton text={createdAccount.publicStatsUrl} label="Copy public analytics link" />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="campaign-builder-title text-base font-semibold tracking-tight">What happens next?</h2>
                  <ol className="campaign-builder-muted mt-4 space-y-4 text-[13px] leading-5">
                    <li className="flex items-start gap-3">
                      <span className="campaign-builder-step-number">1</span>
                      <span>Your link account is created with the routing options above.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="campaign-builder-step-number">2</span>
                      <span>Copy the tracking URL and connect it to a landing page or campaign.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="campaign-builder-step-number">3</span>
                      <span>Use the public analytics link to monitor performance.</span>
                    </li>
                  </ol>
                </>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
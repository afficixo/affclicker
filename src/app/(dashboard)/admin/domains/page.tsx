"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  CheckCircle,
  RefreshCw,
  XCircle,
  Copy,
  AlertTriangle,
  ShieldCheck,
  Globe,
  Zap,
  X,
} from "lucide-react";
import { coerceArray } from "@/lib/utils/array-response";

interface DomainRecord {
  host: string;
  value: string;
}

interface Domain {
  id: string;
  domain: string;
  verified: boolean;
  verifiedAt: string | null;
  sslEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  verificationInstructions?: {
    a?: DomainRecord[];
    cname?: DomainRecord[];
    txt?: DomainRecord[];
  };
}

interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel: string;
  tone: "danger" | "warning";
  onConfirm: () => Promise<void> | void;
}

export default function DomainsPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [latestInstructions, setLatestInstructions] =
    useState<Domain["verificationInstructions"] | null>(null);
  const [latestStatusMessage, setLatestStatusMessage] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const fetchDomains = useCallback(async () => {
    try {
      const response = await fetch("/api/domains", {
        cache: "no-store",
        credentials: "include",
      });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setDomains(coerceArray<Domain>(data));
    } catch (error) {
      console.error("Failed to fetch domains:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchDomains();
  }, [fetchDomains]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add domain");
      }

      const data = await response.json();
      setLatestInstructions(data.verificationInstructions ?? null);
      setLatestStatusMessage(
        data.vercelVerification?.error || data.vercelBinding?.error || ""
      );
      setNewDomain("");
      setShowForm(true);
      await fetchDomains();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      title: "Delete this domain?",
      message:
        "This will remove the custom domain mapping and its linked verification state from the workspace.",
      confirmLabel: "Delete domain",
      tone: "danger",
      onConfirm: async () => {
        setDeleteError("");
        setDeletingId(id);

        try {
          const response = await fetch(`/api/domains/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.error || "Failed to delete domain");
          }

          await fetchDomains();
        } catch (error) {
          console.error("Error deleting domain:", error);
          setDeleteError(
            error instanceof Error ? error.message : "Failed to delete domain"
          );
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const response = await fetch(`/api/domains/verify`, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify domain");
      }

      await fetchDomains();
    } catch (error) {
      console.error("Error verifying domain:", error);
    } finally {
      setVerifyingId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const copyDnsInstructions = async (
    instructions?: Domain["verificationInstructions"]
  ) => {
    if (!instructions) return;

    const lines = [
      ...(instructions.a?.map((record) => `A ${record.host} ${record.value}`) ?? []),
      ...(instructions.cname?.map((record) => `CNAME ${record.host} ${record.value}`) ?? []),
      ...(instructions.txt?.map((record) => `TXT ${record.host} ${record.value}`) ?? []),
    ];

    await copyToClipboard(lines.join("\n"));
  };

  if (loading) {
    return null;
  }

  const verifiedCount = domains.filter((d) => d.verified).length;
  const activeCount = domains.filter((d) => d.isActive).length;

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                  confirmDialog.tone === "danger"
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {confirmDialog.title}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmDialog(null);
                  void confirmDialog.onConfirm();
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  confirmDialog.tone === "danger"
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-amber-600 hover:bg-amber-500"
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Error */}
      {deleteError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {deleteError}
        </div>
      )}

      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Domain Management
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-white">Custom Domains</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Connect your own domains with DNS verification
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            {showForm ? (
              <>
                <XCircle className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Domain
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      {domains.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Domains", value: domains.length, icon: Globe, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Verified", value: verifiedCount, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Active", value: activeCount, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Pending", value: domains.length - verifiedCount, icon: RefreshCw, color: "text-rose-400", bg: "bg-rose-500/10" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`rounded-md ${stat.bg} p-1.5`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {formError}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Domain Name
              </label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                placeholder="example.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
                disabled={formLoading}
              />
            </div>

            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">
              <p className="text-sm font-medium text-indigo-300">DNS Setup Guide</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">
                <li>Open your DNS provider settings and add the exact DNS values shown below.</li>
                <li>
                  For apex domains (e.g., <span className="font-mono text-indigo-300">example.com</span>), add two A records pointing to{' '}
                  <span className="font-mono text-indigo-300">76.76.21.21</span> and{' '}
                  <span className="font-mono text-indigo-300">76.76.21.22</span>.
                </li>
                <li>
                  For subdomains (e.g., <span className="font-mono text-indigo-300">go.example.com</span>), add a CNAME record with the host shown below.
                </li>
                <li>
                  After adding the records, click the <strong>Verify</strong> button on the domain card.
                </li>
              </ol>
            </div>

            {latestInstructions && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-sm font-medium text-emerald-300">📋 DNS Records to Add</p>
                {latestStatusMessage && (
                  <div className="mt-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                    {latestStatusMessage}
                  </div>
                )}
                <div className="mt-3 space-y-3">
                  {(latestInstructions.a?.length ?? 0) > 0 && (
                    <div className="rounded-md bg-slate-800 p-3">
                      <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-400">A Records</p>
                      {latestInstructions.a?.map((record, idx) => (
                        <div key={`a-${idx}`} className="flex items-center justify-between gap-2 border-b border-slate-700 py-1 last:border-0">
                          <code className="flex-1 break-all font-mono text-xs text-emerald-400">
                            {record.host} → {record.value}
                          </code>
                          <button onClick={() => copyToClipboard(`A ${record.host} ${record.value}`)} className="p-1 text-slate-400 hover:text-white">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {(latestInstructions.cname?.length ?? 0) > 0 && (
                    <div className="rounded-md bg-slate-800 p-3">
                      <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-400">CNAME Records</p>
                      {latestInstructions.cname?.map((record, idx) => (
                        <div key={`cname-${idx}`} className="flex items-center justify-between gap-2 border-b border-slate-700 py-1 last:border-0">
                          <code className="flex-1 break-all font-mono text-xs text-emerald-400">
                            {record.host} → {record.value}
                          </code>
                          <button onClick={() => copyToClipboard(`CNAME ${record.host} ${record.value}`)} className="p-1 text-slate-400 hover:text-white">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {(latestInstructions.txt?.length ?? 0) > 0 && (
                    <div className="rounded-md bg-slate-800 p-3">
                      <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-400">TXT Records</p>
                      {latestInstructions.txt?.map((record, idx) => (
                        <div key={`txt-${idx}`} className="flex items-center justify-between gap-2 border-b border-slate-700 py-1 last:border-0">
                          <code className="flex-1 break-all font-mono text-xs text-emerald-400">
                            {record.host} → {record.value}
                          </code>
                          <button onClick={() => copyToClipboard(`TXT ${record.host} ${record.value}`)} className="p-1 text-slate-400 hover:text-white">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => copyDnsInstructions(latestInstructions)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                  <Copy className="h-3 w-3" />
                  Copy all DNS records
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Domain
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Domains List */}
      {domains.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
          <p className="text-4xl">🌐</p>
          <h3 className="mt-2 text-lg font-semibold text-white">No domains added</h3>
          <p className="mt-1 text-sm text-slate-400">
            Add your first custom domain to start using branded tracking links.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className={`rounded-xl border bg-slate-900/60 p-4 ${
                domain.verified && domain.isActive
                  ? "border-l-2 border-l-emerald-500 border-slate-800"
                  : domain.verified
                  ? "border-l-2 border-l-amber-500 border-slate-800"
                  : "border-l-2 border-l-rose-500 border-slate-800"
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold text-white">{domain.domain}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                          domain.verified
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {domain.verified ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3" />
                            Pending
                          </>
                        )}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                          domain.isActive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            domain.isActive ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        {domain.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Added {new Date(domain.createdAt).toLocaleDateString()}
                      {domain.verifiedAt &&
                        ` • Verified ${new Date(domain.verifiedAt).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!domain.verified && (
                      <button
                        onClick={() => handleVerify(domain.id)}
                        disabled={verifyingId === domain.id}
                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                      >
                        {verifyingId === domain.id ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Verifying…
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3" />
                            Verify
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(domain.id)}
                      disabled={deletingId === domain.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-60"
                    >
                      {deletingId === domain.id ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                          Deleting…
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* DNS Instructions (inline) */}
                {domain.verificationInstructions && !domain.verified && (
                  <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-indigo-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        DNS Verification Instructions
                      </p>
                      <button
                        onClick={() => copyDnsInstructions(domain.verificationInstructions)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200"
                      >
                        <Copy className="h-3 w-3" />
                        Copy all
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(domain.verificationInstructions?.a?.length ?? 0) > 0 && (
                        <div className="rounded-md bg-slate-800 p-3">
                          <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-400">A Records</p>
                          {domain.verificationInstructions?.a?.map((record, idx) => (
                            <div key={`a-${idx}`} className="flex items-center justify-between gap-2 border-b border-slate-700 py-1 last:border-0">
                              <code className="flex-1 break-all font-mono text-xs text-indigo-300">
                                {record.host} → {record.value}
                              </code>
                              <button onClick={() => copyToClipboard(`A ${record.host} ${record.value}`)} className="p-1 text-slate-400 hover:text-white">
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {(domain.verificationInstructions?.cname?.length ?? 0) > 0 && (
                        <div className="rounded-md bg-slate-800 p-3">
                          <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-400">CNAME Records</p>
                          {domain.verificationInstructions?.cname?.map((record, idx) => (
                            <div key={`cname-${idx}`} className="flex items-center justify-between gap-2 border-b border-slate-700 py-1 last:border-0">
                              <code className="flex-1 break-all font-mono text-xs text-indigo-300">
                                {record.host} → {record.value}
                              </code>
                              <button onClick={() => copyToClipboard(`CNAME ${record.host} ${record.value}`)} className="p-1 text-slate-400 hover:text-white">
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {(domain.verificationInstructions?.txt?.length ?? 0) > 0 && (
                        <div className="rounded-md bg-slate-800 p-3">
                          <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-400">TXT Records</p>
                          {domain.verificationInstructions?.txt?.map((record, idx) => (
                            <div key={`txt-${idx}`} className="flex items-center justify-between gap-2 border-b border-slate-700 py-1 last:border-0">
                              <code className="flex-1 break-all font-mono text-xs text-indigo-300">
                                {record.host} → {record.value}
                              </code>
                              <button onClick={() => copyToClipboard(`TXT ${record.host} ${record.value}`)} className="p-1 text-slate-400 hover:text-white">
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
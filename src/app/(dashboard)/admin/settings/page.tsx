"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  User,
  CheckCircle2,
  XCircle,
  Mail,
  CircleDollarSign,
  Copy,
} from "lucide-react";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{
    username?: string;
    email?: string;
    fullName?: string | null;
    role?: string;
    status?: string;
    id?: string;
    createdAt?: string;
    lastLogin?: string | null;
    googleProfilePicture?: string | null;
    googleEmailVerified?: boolean;
    googleEmailVerifiedAt?: string | null;
  } | null>(null);
  const [clickRate, setClickRate] = useState("0");
  const [showClickRateForm, setShowClickRateForm] = useState(false);
  const [googleResetReady, setGoogleResetReady] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setUserInfo({
            username: data.username || "admin",
            email: data.email || "",
            fullName: data.fullName || null,
            role: data.role,
            status: data.status,
            id: data.id,
            createdAt: data.createdAt,
            lastLogin: data.lastLogin || null,
            googleProfilePicture: data.googleProfilePicture || null,
            googleEmailVerified: data.googleEmailVerified === true,
            googleEmailVerifiedAt: data.googleEmailVerifiedAt || null,
          });
          setEmailDraft(data.email || "");
          setClickRate(String(data.clickRate ?? 0));
        } else {
          setUserInfo({ username: "admin", email: "" });
          setEmailDraft("");
        }
      } catch {
        setUserInfo({ username: "admin", email: "" });
        setEmailDraft("");
      } finally {
        const params = new URLSearchParams(window.location.search);
        if (params.get("google_verified") === "1") {
          setFeedback({ type: "success", message: "Your Google account is verified and connected." });
        } else if (params.get("google_verify_error") === "account_mismatch") {
          setFeedback({ type: "error", message: "Choose the Google account that matches your profile email." });
        } else if (params.get("google_verify_error") === "email_unverified") {
          setFeedback({ type: "error", message: "Google did not confirm that this email address is verified." });
        } else if (params.get("google_verify_error") === "setup_required") {
          setFeedback({ type: "error", message: "Google verification is not set up in the database yet. Apply the pending database migration and try again." });
        } else if (params.get("google_verify_error") === "cancelled") {
          setFeedback({ type: "error", message: "Google email verification was cancelled." });
        }
        setLoading(false);
      }
    };

    fetchAccount();
    if (new URLSearchParams(window.location.search).get("google_reset") === "1") {
      setGoogleResetReady(true);
    }

  }, []);

  const handleClickRateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-click-rate", clickRate: Number(clickRate) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to update USA click rate");
      setClickRate(String(data.clickRate));
      setFeedback({ type: "success", message: data.message || "USA click rate updated successfully." });
      setShowClickRateForm(false);
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update USA click rate" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: googleResetReady ? "reset-password-google" : "change-password",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({ message: "Password updated" }));
      if (!response.ok) {
        throw new Error(data.error || "Unable to update password");
      }

      setFeedback({ type: "success", message: data.message || "Password updated successfully." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setGoogleResetReady(false);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return null;
  }

  const profileInitials = (userInfo?.fullName || userInfo?.username || "A")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "A";
  const displayName = userInfo?.fullName || userInfo?.username || "Admin";
  const memberSince = userInfo?.createdAt
    ? new Date(userInfo.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "Unavailable";
  const lastLogin = userInfo?.lastLogin
    ? new Date(userInfo.lastLogin).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "Not available";

  const handleCopyAccountId = async () => {
    if (!userInfo?.id) return;
    try {
      await navigator.clipboard.writeText(userInfo.id);
      setFeedback({ type: "success", message: "Account ID copied to clipboard." });
    } catch {
      setFeedback({ type: "error", message: "Unable to copy the account ID. Please select and copy it manually." });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8 md:space-y-8">
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-80">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-4">
          <div className="relative isolate overflow-hidden bg-gradient-to-r from-slate-50 via-white to-indigo-50/60 px-4 py-4 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 sm:px-5 sm:py-5">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_58%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_58%)]" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-4 sm:text-left">
            <div className="relative h-16 w-16 shrink-0 rounded-full bg-white/90 p-1 ring-1 ring-white/80 shadow-md shadow-indigo-900/10 backdrop-blur-sm dark:bg-slate-800/90 dark:ring-white/10 dark:shadow-black/30">
              {userInfo?.googleProfilePicture ? (
                <Image
                  src={userInfo.googleProfilePicture}
                  alt={`${userInfo.username || "Google"} profile`}
                  width={64}
                  height={64}
                  unoptimized
                  className="h-full w-full rounded-full bg-slate-100 object-cover dark:bg-slate-800"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-lg font-semibold tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  {profileInitials}
                </div>
              )}
              <div aria-label="Google account" className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-white shadow-sm dark:border-slate-900">
                <span className="bg-gradient-to-br from-blue-600 via-red-500 to-yellow-500 bg-clip-text text-sm font-bold text-transparent">G</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{displayName}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">@{userInfo?.username || "admin"}{userInfo?.role ? ` · ${userInfo.role.toLowerCase()}` : ""}</p>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
              <span className="inline-flex max-w-full items-center gap-1.5 truncate text-xs text-slate-600 dark:text-slate-300">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                {userInfo?.email || "No email added yet"}
              </span>
              {userInfo?.googleEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => window.location.assign(`/api/auth/google/start?redirect=${encodeURIComponent(window.location.pathname)}&purpose=email-verification`)}
                  disabled={!userInfo?.email}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-300"
                >
                  {userInfo?.email ? "Verify with Google" : "Add an email first"}
                </button>
              )}
            </div>
            </div>
            </div>
          </div>

          <section aria-labelledby="profile-details-heading" className="px-2 py-3 sm:px-5">
            <div className="mb-2">
              <div>
                <h3 id="profile-details-heading" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Account details</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-5 sm:grid-cols-3">
              <div className="min-w-0 border-b border-slate-200/80 py-2.5 dark:border-slate-800">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Full name</p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{userInfo?.fullName || "Not provided"}</p>
              </div>
              <div className="min-w-0 border-b border-slate-200/80 py-2.5 dark:border-slate-800">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Access role</p>
                <p className="mt-1 text-xs font-semibold capitalize text-slate-800 dark:text-slate-100">{(userInfo?.role || "Member").toLowerCase()}</p>
              </div>
              <div className="min-w-0 border-b border-slate-200/80 py-2.5 dark:border-slate-800">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Account status</p>
                <p className="mt-1 text-xs font-semibold capitalize text-slate-800 dark:text-slate-100">{(userInfo?.status || "Unknown").toLowerCase()}</p>
              </div>
              <div className="min-w-0 border-b border-slate-200/80 py-2.5 dark:border-slate-800">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Member since</p>
                <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-100">{memberSince}</p>
              </div>
              <div className="min-w-0 border-b border-slate-200/80 py-2.5 dark:border-slate-800">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Account ID</p>
                <div className="mt-1 flex items-center gap-1">
                  <p className="min-w-0 truncate font-mono text-[11px] font-medium text-slate-700 dark:text-slate-200" title={userInfo?.id}>{userInfo?.id || "Unavailable"}</p>
                  <button type="button" onClick={() => void handleCopyAccountId()} disabled={!userInfo?.id} aria-label="Copy account ID" title="Copy account ID" className="shrink-0 rounded p-1 text-slate-400 transition hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-indigo-300">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="min-w-0 border-b border-slate-200/80 py-2.5 dark:border-slate-800">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Last sign-in</p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{lastLogin}</p>
              </div>
              <div className="col-span-2 flex min-w-0 items-center justify-between gap-3 border-b border-slate-200/80 py-2.5 dark:border-slate-800 sm:col-span-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Google email verification</p>
                  <p className={`text-xs font-semibold ${userInfo?.googleEmailVerified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {userInfo?.googleEmailVerified ? "Verified" : "Not verified"}
                  </p>
              </div>
            </div>
          </section>

          <div className="px-2 pt-1 sm:px-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Account settings</h3>
              <div className="flex items-center gap-2" role="group" aria-label="Account settings actions">
                {userInfo?.role !== "MANAGER" && (
                  <button
                    type="button"
                    aria-label={userInfo?.email ? "Update email" : "Add email"}
                    title={userInfo?.email ? "Update email" : "Add email"}
                    aria-expanded={showEmailForm}
                    onClick={() => {
                      setShowEmailForm((prev) => !prev);
                      if (!showEmailForm) setEmailDraft(userInfo?.email || "");
                    }}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                      showEmailForm
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    }`}
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                {(userInfo?.role === "OWNER" || userInfo?.role === "ADMIN") && (
                  <button
                    type="button"
                    aria-label={`Edit USA click rate, currently $${Number(clickRate).toFixed(3)}`}
                    title={`USA click rate: $${Number(clickRate).toFixed(3)}`}
                    aria-expanded={showClickRateForm}
                    onClick={() => setShowClickRateForm((prev) => !prev)}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                      showClickRateForm
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    }`}
                  >
                    <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* Email Form */}
              {showClickRateForm && (userInfo?.role === "OWNER" || userInfo?.role === "ADMIN") && (
                <div className="mt-3 space-y-3">
                  <form onSubmit={handleClickRateSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">{userInfo.role === "ADMIN" ? "Your default USA click rate per unique referrer click" : "Default USA click rate per unique referrer click"}</label>
                      <input type="number" min="0" step="0.001" value={clickRate} onChange={(event) => setClickRate(event.target.value)} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-indigo-50 shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900">{isSubmitting ? "Saving..." : "Save default click rate"}</button>
                  </form>
                </div>
              )}

              {showEmailForm && userInfo?.role !== "MANAGER" && (
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setIsSubmitting(true);
                    setFeedback(null);

                    try {
                      const response = await fetch("/api/settings", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "update-email", email: emailDraft.trim() }),
                      });

                      const data = await response.json().catch(() => ({ message: "Email updated" }));
                      if (!response.ok) {
                        throw new Error(data.error || "Unable to update email");
                      }

                      setUserInfo((prev) => (prev ? {
                        ...prev,
                        email: emailDraft.trim(),
                        ...(emailDraft.trim().toLowerCase() !== (prev.email || "").toLowerCase()
                          ? { googleProfilePicture: null, googleEmailVerified: false, googleEmailVerifiedAt: null }
                          : {}),
                      } : prev));
                      setFeedback({ type: "success", message: data.message || "Email updated successfully." });
                      setShowEmailForm(false);
                    } catch (error) {
                      setFeedback({
                        type: "error",
                        message: error instanceof Error ? error.message : "Unable to update email",
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30"
                >
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Email address</label>
                    <input
                      type="email"
                      value={emailDraft}
                      onChange={(event) => setEmailDraft(event.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? "Saving…" : "Save email"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800"
              >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">Change password</h4>
                  </div>
                  {googleResetReady && (
                    <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-700 dark:text-cyan-200">
                      Google verified your account. Choose a new password below.
                    </div>
                  )}
                  <div className="space-y-3">
                    {!googleResetReady && (
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                          Current password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                          }
                          required
                          className="w-full rounded-none border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 dark:border-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
                        />
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        New password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        required
                        minLength={8}
                        className="w-full rounded-none border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 dark:border-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Repeat password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        required
                        minLength={8}
                        className="w-full rounded-none border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 dark:border-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-indigo-50 shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950"
                    >
                      {isSubmitting ? "Changing…" : "Change"}
                    </button>
                    <button
                      type="button"
                      title="Reset your password using your Google account"
                      onClick={() => window.location.assign(`/api/auth/google/start?redirect=${encodeURIComponent(window.location.pathname)}&purpose=password-reset`)}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300 dark:focus-visible:ring-offset-slate-900"
                    >
                      Forgot password?
                    </button>
                  </div>
              </form>

            </div>
          </div>
      </div>
    </div>
  );
}
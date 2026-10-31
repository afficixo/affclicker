"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { markManagerTelegramPopupPending } from "@/lib/utils/telegram-popup";
import { getDashboardPath } from "@/lib/auth/dashboard-path";
import PublicLayout from "@/components/layout/PublicLayout";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, LockKeyhole, LogIn, Mail } from "lucide-react";

const APPROVAL_SUPPORT_TELEGRAM = "affclicker";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [supportTelegram, setSupportTelegram] = useState("");
  const [approvalPendingNotice, setApprovalPendingNotice] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!isActive || !response.ok) return;

        const user = await response.json();
        router.replace(getDashboardPath(user.role));
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    void restoreSession();
    return () => {
      isActive = false;
    };
  }, [router]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const successParam = searchParams.get("success");
    const approvalPending = searchParams.get("approval_pending") === "1";
    setApprovalPendingNotice(approvalPending);

    if (errorParam === "google_auth_failed") {
      setError("Google sign-in could not be completed. Try again or sign in with your username and password.");
    } else if (errorParam === "missing_code") {
      setError("Google returned an incomplete sign-in response. Please try again.");
    } else if (errorParam === "google_account_not_found") {
      setError("No approved account was found for that Google email. Sign up first or use another sign-in method.");
    } else if (approvalPending) {
      setError("Your manager account is pending contract approval. You can sign in once the contract is approved.");
    } else {
      setError("");
    }

    if (successParam === "google-authenticated") {
      setSuccess("Google sign-in complete. Redirecting you to your dashboard...");
      const redirectPath = searchParams.get("redirect") || getDashboardPath(null);
      const timer = window.setTimeout(() => {
        router.replace(redirectPath);
      }, 1000);
      return () => window.clearTimeout(timer);
    }

    setSuccess("");
  }, [router, searchParams]);

  useEffect(() => {
    if (!showPasswordResetDialog) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowPasswordResetDialog(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showPasswordResetDialog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSupportTelegram("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const loginError = new Error(data.error || "Login failed") as Error & { supportTelegram?: string };
        loginError.supportTelegram = data.supportTelegram;
        throw loginError;
      }

      if (data?.user?.role === "MANAGER") {
        markManagerTelegramPopupPending(window);
      }

      setSuccess("Welcome back. Redirecting you to your dashboard...");
      window.setTimeout(() => {
        router.push(getDashboardPath(data?.user?.role));
      }, 500);
    } catch (err: any) {
      setSuccess("");
      setError(err.message || "We could not sign you in. Check your details and try again.");
      setSupportTelegram(err.supportTelegram || "");
    } finally {
      setLoading(false);
    }
  };

  const contactTelegram = supportTelegram || (approvalPendingNotice ? APPROVAL_SUPPORT_TELEGRAM : "");

  return (
    <PublicLayout className="!bg-white">
      <main className="flex-1 bg-[#f5f7f9] px-4 pb-12 pt-24 sm:px-6 md:pb-16 md:pt-28">
        <div className="mx-auto w-full max-w-[520px]">
          <section className="rounded-2xl border border-[#e7eaed] bg-white p-5 shadow-[0_16px_48px_-32px_rgba(36,41,45,0.24)] sm:p-8">
            <header className="mb-7 text-center">
              <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#e7eaed] bg-[#f8fafc] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#066ac9]">
                <LogIn aria-hidden="true" className="h-3.5 w-3.5" />
                Welcome back
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#24292d] sm:text-4xl">
                Affiliate Login
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#747579] sm:text-base">
                Sign in to continue to your AffClicker account.
              </p>
            </header>

            {error && (
              <div
                role="alert"
                className={`mb-4 overflow-hidden rounded-xl border ${
                  approvalPendingNotice || supportTelegram
                    ? "border-[#b9e2d5] bg-[#eff9f5] text-[#31584e]"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className="mt-0.5">
                    {approvalPendingNotice ? (
                      <Clock3 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {approvalPendingNotice || supportTelegram ? (
                      <>
                        <p className="text-sm font-semibold">Approval Pending</p>
                        <p className="mt-1 text-sm leading-5">
                          Your manager account is awaiting approval. Contact the account owner on Telegram to continue.
                        </p>
                      </>
                    ) : (
                      <p className="text-sm leading-5">{error}</p>
                    )}

                    {contactTelegram && (
                      <a
                        href="https://t.me/affclicker"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#24292d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#343b40] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066ac9] focus-visible:ring-offset-2"
                      >
                        Contact Account Owner
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div role="status" aria-live="polite" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span className="leading-5">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className={`space-y-4 ${supportTelegram ? "pointer-events-none opacity-55" : ""}`}>
                <div className="space-y-1.5">
                  <label htmlFor="login-username" className="block text-sm font-semibold text-[#343b40]">Email or username</label>
                  <div className="relative">
                    <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9299]" />
                    <input
                      id="login-username"
                      name="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="min-h-12 w-full rounded-lg border border-[#d9e0e5] bg-[#f8fafc] py-2.5 pl-10 pr-3.5 text-base text-[#24292d] placeholder-[#8a9299] outline-none transition focus:border-[#066ac9] focus:bg-white focus:ring-2 focus:ring-[#066ac9]/15 disabled:cursor-not-allowed"
                      placeholder="you@example.com"
                      autoComplete="username"
                      required
                      disabled={loading || !!supportTelegram}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="login-password" className="block text-sm font-semibold text-[#343b40]">Password</label>
                  <div className="relative">
                    <LockKeyhole aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9299]" />
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="min-h-12 w-full rounded-lg border border-[#d9e0e5] bg-[#f8fafc] py-2.5 pl-10 pr-3.5 text-base text-[#24292d] placeholder-[#8a9299] outline-none transition focus:border-[#066ac9] focus:bg-white focus:ring-2 focus:ring-[#066ac9]/15 disabled:cursor-not-allowed"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      disabled={loading || !!supportTelegram}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !!supportTelegram}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-[#ed4c00] border-b-4 bg-[#ff4c00] px-5 py-3 text-sm font-bold uppercase italic tracking-wide text-white shadow-[0_5px_12px_rgba(255,76,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#ed4c00] hover:shadow-[0_8px_18px_rgba(255,76,0,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066ac9] focus-visible:ring-offset-2 active:translate-y-0.5 active:border-b-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : <>Login <ArrowRight aria-hidden="true" className="h-4 w-4" /></>}
              </button>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-sm">
                <Link href="/signup" className="font-semibold text-[#066ac9] underline-offset-4 hover:underline">
                  Don&apos;t have an account?
                </Link>
                <button
                  type="button"
                  onClick={() => setShowPasswordResetDialog(true)}
                  className="font-semibold text-[#066ac9] underline-offset-4 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="button"
                disabled={googleLoading || loading || !!supportTelegram}
                onClick={() => {
                  setGoogleLoading(true);
                  window.location.assign("/api/auth/google/start?redirect=/admin/dashboard");
                }}
                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#d9e0e5] bg-white px-3 py-2.5 text-sm font-semibold text-[#343b40] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066ac9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {googleLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#066ac9] border-t-transparent" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M21.6 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.53Z" />
                    <path fill="#34A853" d="M12 22c2.7 0 4.96-.89 6.62-2.41l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H2.9v2.58A10 10 0 0 0 12 22Z" />
                    <path fill="#FBBC05" d="M6.41 13.94A6.02 6.02 0 0 1 6.41 10.06V7.48H2.9A10 10 0 0 0 2 12c0 1.62.39 3.15 1.09 4.52l3.32-2.58Z" />
                    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.49l2.87-2.87A9.96 9.96 0 0 0 12 2A10 10 0 0 0 2.9 7.48l3.51 2.58c.79-2.36 2.99-4.11 5.59-4.11Z" />
                  </svg>
                )}
                <span>{googleLoading ? "Redirecting to Google..." : "Continue with Google"}</span>
              </button>

              {supportTelegram && (
                <p className="text-center text-sm text-[#747579]">
                  Already approved? Refresh this page or try signing in again.
                </p>
              )}
            </form>
          </section>
        </div>

        {showPasswordResetDialog && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowPasswordResetDialog(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="password-reset-title"
              aria-describedby="password-reset-description"
              className="w-full max-w-md rounded-2xl border border-[#e7eaed] bg-white p-5 text-[#343b40] shadow-2xl sm:p-6"
            >
              <h2 id="password-reset-title" className="text-xl font-bold tracking-tight text-[#24292d]">
                Reset your password?
              </h2>
              <p id="password-reset-description" className="mt-2 text-base leading-6">
                To reset your password, first verify your account with Google. You&apos;ll then go to Account Settings, where you can choose a new password.
              </p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowPasswordResetDialog(false)}
                  className="rounded-lg border border-[#d9e0e5] bg-white px-4 py-2.5 text-sm font-semibold text-[#343b40] transition-colors hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={googleLoading || loading || !!supportTelegram}
                  onClick={() => {
                    setGoogleLoading(true);
                    window.location.assign("/api/auth/google/start?redirect=%2Fadmin%2Fsettings&purpose=password-reset");
                  }}
                  className="rounded-lg border border-[#ed4c00] border-b-4 bg-[#ff4c00] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#ed4c00] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {googleLoading ? "Connecting to Google..." : "Continue with Google"}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

    </PublicLayout>
  );
}
import PublicLayout from '@/components/layout/PublicLayout'

export const metadata = {
  title: "Privacy Policy | Afficix",
  description: "Read Afficix's privacy policy for data usage, cookies, and user protection.",
}

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)]">
          <div className="border-b border-white/10 px-6 py-10 sm:px-10">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Privacy Policy</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Afficix Privacy Policy</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              This Privacy Policy explains how Afficix collects, uses, and protects information when you visit our site and use our services.
            </p>
          </div>

          <div className="space-y-10 px-6 py-10 sm:px-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
              <p className="text-slate-300 leading-7">
                We may collect contact information, usage data, analytics, and other information needed to provide a secure and performant affiliate management experience.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">How We Use Data</h2>
              <p className="text-slate-300 leading-7">
                We use data to operate the platform, improve service quality, personalize user experience, and protect against fraud.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Cookies and Tracking</h2>
              <p className="text-slate-300 leading-7">
                We may use cookies and analytics tools to monitor activity, understand traffic patterns, and enhance the website experience.
              </p>
            </section>
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}

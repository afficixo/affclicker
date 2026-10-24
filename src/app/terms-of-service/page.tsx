import PublicLayout from '@/components/layout/PublicLayout'

export const metadata = {
  title: "Terms of Service | Afficix",
  description: "Review Afficix's terms of service for platform usage and account responsibilities.",
}

export default function TermsOfServicePage() {
  return (
    <PublicLayout>
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)]">
          <div className="border-b border-white/10 px-6 py-10 sm:px-10">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Terms of Service</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Afficix Terms of Service</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              These terms govern your use of Afficix's services, platform features, and any accounts you create.
            </p>
          </div>

          <div className="space-y-10 px-6 py-10 sm:px-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Platform Access</h2>
              <p className="text-slate-300 leading-7">
                Access to Afficix is provided under these terms. You agree to use the platform lawfully and respect our usage policies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">User Responsibilities</h2>
              <p className="text-slate-300 leading-7">
                You are responsible for maintaining account security, providing accurate information, and complying with applicable laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Changes to Terms</h2>
              <p className="text-slate-300 leading-7">
                Afficix may update these terms from time to time. Continued use of the platform after updates means you accept the changes.
              </p>
            </section>
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}

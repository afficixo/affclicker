'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, BriefcaseBusiness, Check, Globe, ShieldCheck, Sparkles, TrendingUp, WalletCards } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';

const stats = [
  { icon: Globe, value: '21K+', label: 'Publishers' },
  { icon: BarChart3, value: '10+', label: 'Verticals' },
  { icon: WalletCards, value: '1K+', label: 'Offers' },
];

const countries = [
  { name: 'Canada', flag: 'https://affroyal.com/images/flags/cn.svg', offer: 'Health & Fitness', tag: 'High Conversion' },
  { name: 'Germany', flag: 'https://affroyal.com/images/flags/gr.svg', offer: 'Survey, Finance', tag: 'Top' },
  { name: 'New Zealand', flag: 'https://affroyal.com/images/flags/nz.svg', offer: 'Finance', tag: 'Trending' },
  { name: 'United Kingdom', flag: 'https://affroyal.com/images/flags/uk.svg', offer: 'Rewards', tag: 'Top' },
  { name: 'USA', flag: 'https://affroyal.com/images/flags/us.svg', offer: 'Jobs, Credit Score', tag: 'High Conversion' },
  { name: 'Australia', flag: 'https://affroyal.com/images/flags/au.svg', offer: 'Rewards, Sweeps', tag: 'Trending' },
];

const highlights = [
  {
    title: 'Offer Management',
    icon: BriefcaseBusiness,
    text: 'Access carefully selected offers across multiple high-converting verticals with pricing built for performance.',
    bullets: ['High payouts', 'Fresh campaigns', 'Optimized recommendations'],
  },
  {
    title: 'Real-Time Tracking',
    icon: TrendingUp,
    text: 'Track clicks, conversions, and revenue in one place with clean reporting for smarter growth decisions.',
    bullets: ['Live metrics', 'Traffic visibility', 'Faster optimization'],
  },
  {
    title: 'Affiliate Support',
    icon: ShieldCheck,
    text: 'Work with a team that understands scale, conversion strategy, and long-term partnership growth.',
    bullets: ['Dedicated help', 'Fast response', 'Growth advice'],
  },
];

const categories = [
  { name: 'Finance', count: '70 Offers', icon: '💰' },
  { name: 'Health & Beauty', count: '95 Offers', icon: '✨' },
  { name: 'E-Commerce', count: '85 Offers', icon: '🛒' },
  { name: 'Sweepstakes', count: '110 Offers', icon: '🎁' },
  { name: 'Jobs', count: '75 Offers', icon: '💼' },
  { name: 'Gaming', count: '60 Offers', icon: '🎮' },
  { name: 'Insurance', count: '50 Offers', icon: '🛡️' },
  { name: 'Travel', count: '45 Offers', icon: '✈️' },
];

const faqs = [
  'Signing up is simple. Share your traffic profile and we review your application quickly so you can start working with high-performing offers.',
  'AffClicker supports reliable payouts and a smooth partner experience with focused campaign support and clear reporting.',
  'We work across popular sectors including finance, health, rewards, jobs, e-commerce, gaming, sweepstakes, and more.',
  'Our system is built for real-time visibility so you can track performance and improve campaigns with better data.',
];

const revealEase = [0.22, 1, 0.36, 1] as const;
const sectionReveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.7, ease: revealEase },
} as const;

export default function HomePage() {
  return (
    <PublicLayout>
      <main className="bg-[#f3f1ee] text-[#1d2228]">
        <motion.section
          id="home"
          {...sectionReveal}
          className="relative overflow-hidden bg-[#f3f1ee] pb-10 pt-20 md:pb-16 md:pt-24"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,79,136,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(243,106,45,0.08),transparent_28%)]" />
          <div className="absolute -left-16 top-8 h-64 w-64 rounded-full bg-[#9ad0ea]/25 blur-3xl" />
          <div className="absolute -right-16 bottom-4 h-72 w-72 rounded-full bg-[#f1d268]/25 blur-3xl" />

          <div className="relative mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: revealEase }}
              className="flex items-center gap-3 rounded-[18px] bg-[#0d4f88] px-4 py-3 text-white shadow-[0_8px_18px_rgba(13,79,136,0.18)] md:px-6"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-base">◆</div>
              <div className="text-[0.8rem] font-bold leading-[1.2] tracking-[-0.03em] sm:text-sm md:text-xl">
                Elevate Your Earnings with Premium Offers – The Ultimate CPA Platform
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: revealEase, delay: 0.08 }}
              className="mt-7 max-w-[780px] md:mt-10"
            >
              <div className="hidden max-w-[760px] text-[2.3rem] font-black leading-[0.98] tracking-[-0.065em] text-[#111827] md:text-[4.2rem]">
                AffClicker: Where Top Affiliates Meet Premium Offers
              </div>

              <p className="mt-4 text-[0.96rem] leading-7 text-[#4a5565] sm:text-base md:mt-5 md:text-[1.15rem] md:leading-8">
                “Join AffClicker’s Global Premium Affiliate Network and unlock unparalleled opportunities with high-converting offers, seamless traffic monetization, and the highest payouts — all in one dynamic, unified platform.”
              </p>
            </motion.div>

            <div className="hidden mt-8 space-y-5 md:mt-10">
              {stats.map(({ icon: Icon, value, label }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + index * 0.08, ease: 'easeOut' }}
                  className="flex items-center gap-4 rounded-[18px] bg-transparent"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#dfe7ef] bg-[#eaf2f7] text-[#0d4f88] shadow-[0_8px_18px_rgba(13,79,136,0.08)] md:h-20 md:w-20">
                    <Icon className="h-7 w-7 md:h-8 md:w-8" />
                  </div>
                  <div className="flex items-baseline gap-2 md:gap-3">
                    <span className="text-[2.1rem] font-black tracking-[-0.07em] text-[#111827] md:text-[2.8rem]">{value}</span>
                    <span className="text-lg font-medium text-[#495669] md:text-2xl">{label}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: revealEase }}
              className="mt-8 grid max-w-[760px] gap-3 sm:grid-cols-2"
            >
              <motion.a
                href="/signup"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2, ease: revealEase }}
                className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#f36a2d] px-5 py-4 text-sm font-black text-white shadow-[0_12px_20px_rgba(243,106,45,0.25)] transition hover:bg-[#f67a3f] sm:text-base"
              >
                <span className="text-lg">✦</span>
                SIGN UP NOW
              </motion.a>
              <motion.a
                href="/login"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2, ease: revealEase }}
                className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#f4cf5d] px-5 py-4 text-sm font-black text-[#111827] shadow-[0_12px_20px_rgba(244,207,93,0.22)] transition hover:bg-[#f7d774] sm:text-base"
              >
                <span className="text-lg">◔</span>
                SIGN IN
              </motion.a>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="countries"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: revealEase }}
          className="hidden relative overflow-hidden bg-[#f6f3ef] py-8 md:py-16"
          style={{
            backgroundImage: "url('https://affroyal.com/images/element/map.svg')",
            backgroundPosition: 'center left',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-[2.1rem] font-black leading-none tracking-[-0.065em] text-[#111827] md:text-[3.2rem]">
              Top Countries for Leads
            </h2>

            <div className="mt-7 rounded-[22px] border border-slate-200 bg-white/80 p-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)] md:p-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-[14px] border border-slate-200 bg-[#f3f8ff]">
                  <img src="https://affroyal.com/images/flags/cn.svg" alt="Canada" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[2rem] font-black tracking-[-0.06em] text-[#111827] md:text-[2.5rem]">Canada</div>
                  <div className="mt-1 text-base text-[#495669] md:text-lg">Top Offer: Health &amp; Fitness</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section id="services" className="bg-[#f7f7f4] py-12 md:py-20" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: revealEase }}>
          <div id="about" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#657489] sm:text-xs">Why AffClicker</p>
              <h2 className="mt-2 text-[2.2rem] font-black tracking-[-0.06em] text-[#16212d] sm:text-4xl md:text-[3.2rem]">Built for publishers who want serious growth</h2>
            </div>

            <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
              {highlights.map(({ title, icon: Icon, text, bullets }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: revealEase }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_30px_rgba(15,23,42,0.04)] sm:rounded-[28px] sm:p-5"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#edf7ef] text-[#0a2540]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[1.7rem] font-black tracking-[-0.05em] text-[#15212f] sm:text-2xl">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{text}</p>
                  <ul className="mt-5 space-y-3">
                    {bullets.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700 sm:text-base">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700">
                          <Check className="h-3 w-3" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section id="verticals" className="bg-[#f4f1ec] py-12 md:py-20" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: revealEase }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#657489] sm:text-xs">Popular verticals</p>
              <h2 className="mt-2 text-[2.15rem] font-black tracking-[-0.06em] text-[#16212d] sm:text-4xl md:text-[3.2rem]">High-converting offers that move</h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: revealEase }}
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_30px_rgba(15,23,42,0.04)] sm:rounded-[28px] sm:p-5 md:p-8"
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
                <motion.div
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.08, ease: revealEase }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#edf6f0] px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-emerald-700 sm:text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Best performers
                  </div>
                  <h3 className="mt-5 text-[2.1rem] font-black tracking-[-0.06em] text-[#16212d] sm:text-4xl">Jobs</h3>
                  <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                    Access high-converting job offers from recruitment and gig platforms. Ideal for audiences seeking employment and growth opportunities.
                  </p>
                  <ul className="mt-6 space-y-4 text-sm text-slate-700 sm:text-base">
                    {['High-paying campaigns', 'Strong conversion potential', 'Great fit for broad audiences'].map((item, index) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.35, delay: 0.12 + index * 0.08, ease: revealEase }}
                        className="flex items-center gap-3"
                      >
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700">
                          <Check className="h-3 w-3" />
                        </span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 16, scale: 0.96 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.7, delay: 0.12, ease: revealEase }}
                  className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-[#f7f2ea] sm:rounded-[24px]"
                >
                  <img src="https://affroyal.com/images/verticals/job-offers.png" alt="Jobs" className="h-full w-full object-cover" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section className="bg-[#f3f1ee] py-12 md:py-20" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: revealEase }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#657489] sm:text-xs">Offer categories</p>
              <h2 className="mt-2 text-[2.15rem] font-black tracking-[-0.06em] text-[#16212d] sm:text-4xl md:text-[3.2rem]">Explore top-performing verticals</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
              {categories.map(({ name, count, icon }, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.05, ease: revealEase }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="rounded-[18px] border border-slate-200 bg-white/80 p-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)] sm:rounded-[20px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf7ef] text-2xl">{icon}</div>
                    <div>
                      <h3 className="text-base font-black tracking-[-0.04em] text-[#16212d] sm:text-lg">{name}</h3>
                      <p className="text-sm text-slate-500">{count}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section className="bg-[#f3f1ee] pb-12 md:pb-16" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: revealEase }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#657489] sm:text-xs">FAQ</p>
              <h2 className="mt-2 text-[2.15rem] font-black tracking-[-0.06em] text-[#16212d] sm:text-4xl md:text-[3.2rem]">Everything you need to know</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.06, ease: revealEase }}
                  whileHover={{ y: -2 }}
                  className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_24px_rgba(15,23,42,0.02)] sm:rounded-[20px] sm:px-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0a2540] text-sm font-bold text-white">{index + 1}</div>
                    <p className="text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">{faq}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

      </main>
    </PublicLayout>
  );
}

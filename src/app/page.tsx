'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, BarChart3, BriefcaseBusiness, Check, ChevronDown, CircleDollarSign, Gamepad2, Gift, Globe, Handshake, HeartPulse, Mail, Plane, Power, ShieldCheck, ShoppingBag, Sparkles, TrendingUp, Trophy, UserRoundPlus, WalletCards } from 'lucide-react';
import { AU, CA, DE, GB, NZ, US } from 'country-flag-icons/react/3x2';
import { useEffect, useRef, useState } from 'react';
import PublicLayout from '@/components/layout/PublicLayout';

const stats = [
  { icon: Globe, value: '21K+', label: 'Publishers' },
  { icon: BarChart3, value: '10+', label: 'Verticals' },
  { icon: WalletCards, value: '1K+', label: 'Offers' },
];

const countries = [
  { name: 'Canada', flag: CA, offer: 'Health & Fitness', tag: 'High Conversion', color: 'bg-emerald-500' },
  { name: 'Germany', flag: DE, offer: 'Survey, Finance', tag: 'Top', color: 'bg-rose-500' },
  { name: 'New Zealand', flag: NZ, offer: 'Finance', tag: 'Trending', color: 'bg-sky-600' },
  { name: 'United Kingdom', flag: GB, offer: 'Rewards', tag: 'Top', color: 'bg-rose-500' },
  { name: 'USA', flag: US, offer: 'Jobs, Credit Score', tag: 'High Conversion', color: 'bg-emerald-500' },
  { name: 'Australia', flag: AU, offer: 'Rewards, Sweeps', tag: 'Trending', color: 'bg-sky-600' },
];

const highlights = [
  {
    title: 'For Publishers',
    icon: BriefcaseBusiness,
    text: 'Boost your earnings with high-converting, exclusive offers.',
    bullets: ['Highest payouts with top commissions', 'Dedicated campaign guidance', 'Real-time tracking and reporting'],
  },
  {
    title: 'For Advertisers',
    icon: TrendingUp,
    text: 'Expand your reach with an engaged network of quality publishers.',
    bullets: ['Targeted traffic from verified sources', 'Campaigns tailored to your objectives', 'Dedicated account support'],
  },
];

const categories = [
  { name: 'Finance', count: '70 Offers', detail: 'Loans, credit cards, and investment offers', icon: CircleDollarSign },
  { name: 'Health & Beauty', count: '95 Offers', detail: 'Supplements, skincare, and fitness', icon: HeartPulse },
  { name: 'E-Commerce', count: '85 Offers', detail: 'Popular products and online stores', icon: ShoppingBag },
  { name: 'Sweepstakes', count: '110 Offers', detail: 'Giveaways, prizes, and lead generation', icon: Gift },
  { name: 'Jobs', count: '75 Offers', detail: 'Career opportunities and gig platforms', icon: BriefcaseBusiness },
  { name: 'Gaming', count: '60 Offers', detail: 'Games, apps, and entertainment', icon: Gamepad2 },
  { name: 'Insurance', count: '50 Offers', detail: 'Coverage and insurance comparison', icon: ShieldCheck },
  { name: 'Travel', count: '45 Offers', detail: 'Travel bookings and trip services', icon: Plane },
];

const faqs = [
  { question: 'How do I sign up as an affiliate with AffClicker?', answer: 'Complete the publisher registration form and share details about your traffic sources. Our team will review your application and, once approved, help you find offers that fit your audience.' },
  { question: 'What payment methods do you offer?', answer: 'Available payment methods and schedules depend on your account and region. Contact your account manager for the current options and eligibility.' },
  { question: 'What types of offers are available?', answer: 'Explore a variety of campaigns across finance, health and beauty, e-commerce, sweepstakes, gaming, rewards, insurance, travel, and more.' },
  { question: 'How do I track conversions and earnings?', answer: 'Your publisher dashboard provides performance reporting for clicks, conversions, and earnings so you can monitor and optimize your campaigns.' },
  { question: 'Do you offer support to affiliates?', answer: 'Yes. Our team can help with campaign setup, optimization, and account questions. Reach us by email or through your dashboard.' },
  { question: 'How can I promote offers effectively?', answer: 'Choose offers that fit your audience, review the campaign requirements, and use your tracking links to measure results across your traffic sources.' },
];

const verticals = [
  { name: 'Jobs', image: 'job-offers.png', text: 'Explore career and gig-economy campaigns suited to audiences looking for their next opportunity.', bullets: ['Competitive campaigns', 'Strong audience relevance', 'Clear conversion tracking'] },
  { name: 'Rewards', image: 'rewards.webp', text: 'Engage audiences with reward programs, cashback, and loyalty offers.', bullets: ['Cashback and gift card offers', 'Audience-friendly campaigns', 'Wide range of promotions'] },
  { name: 'Credit Score', image: 'credit-score.png', text: 'Connect finance-minded audiences with credit monitoring and score services.', bullets: ['Useful finance resources', 'Relevant audience targeting', 'Trackable campaign results'] },
  { name: 'Sweepstakes', image: 'sweepstakes.png', text: 'Promote giveaways and prize campaigns built to drive interest and engagement.', bullets: ['Popular prize campaigns', 'Broad audience appeal', 'Lead-generation focused'] },
];

const earningServices = [
  { title: 'Offer Management', icon: BriefcaseBusiness, summary: 'Optimize campaigns with quality offers.', bullets: ['Exclusive offers across niches', 'Fresh high-payout campaigns', 'Recommendations for growth'] },
  { title: 'Advanced Tracking', icon: TrendingUp, summary: 'Actionable analytics for better performance.', bullets: ['Real-time performance metrics', 'Clear conversion reports', 'Traffic source insights'] },
  { title: 'Affiliate Support', icon: Handshake, summary: 'Get guidance from a team that knows performance.', bullets: ['Dedicated account support', 'Campaign optimization help', 'Timely answers to questions'] },
];
const partners = [
  { name: 'Affpaying', image: 'affpaying.png' },
  { name: 'AffPlus', image: 'affplus.png' },
  { name: 'Post Affiliate Pro', image: 'Post-Affiliate-Pro.png' },
  { name: 'Affverify', image: 'affverify.png' },
  { name: 'Affwebsite', image: 'affwebsite.png' },
  { name: 'Trustpilot', image: 'trustpilot.png' },
];
const revealEase = [0.22, 1, 0.36, 1] as const;
type RevealDirection = 'up' | 'left' | 'right' | 'scale';

function scrollReveal(
  reduceMotion: boolean,
  direction: RevealDirection = 'up',
  delay = 0,
  duration = 0.55,
) {
  const offset = direction === 'left'
    ? { x: -18 }
    : direction === 'right'
      ? { x: 18 }
      : direction === 'scale'
        ? { scale: 0.97 }
        : { y: 16 };

  return {
    initial: { opacity: 0, ...offset },
    animate: reduceMotion ? { opacity: 1, x: 0, y: 0, scale: 1 } : undefined,
    whileInView: { opacity: 1, x: 0, y: 0, scale: 1 },
    viewport: { once: true, amount: 0.15 },
    transition: {
      duration: reduceMotion ? 0 : duration,
      delay: reduceMotion ? 0 : delay,
      ease: revealEase,
    },
  };
}

function AnimatedStat({ value, reduceMotion }: { value: string; reduceMotion: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [count, setCount] = useState(0);
  const match = /^(\d+)(.*)$/.exec(value);
  const end = match ? Number(match[1]) : 0;
  const suffix = match?.[2] ?? '';

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setCount(end);
      return;
    }

    const duration = 900;
    let frame = 0;
    let startTime: number | undefined;
    const updateCount = (time: number) => {
      startTime ??= time;
      const progress = Math.min((time - startTime) / duration, 1);
      setCount(Math.round(end * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(updateCount);
    };

    frame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(frame);
  }, [end, inView, reduceMotion]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function HomePage() {
  const [activeVertical, setActiveVertical] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');
  const prefersReducedMotion = useReducedMotion();
  const [hasHydrated, setHasHydrated] = useState(false);
  const reduceMotion = hasHydrated && prefersReducedMotion === true;

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const submitContactForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setContactError('');
    setContactSuccess('');
    setContactSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          message: formData.get('message'),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setContactError(typeof result.error === 'string' ? result.error : 'Unable to send your message. Please try again.');
        return;
      }

      setContactSuccess('Thanks for reaching out. Our team will be in touch soon.');
      form.reset();
    } catch (error) {
      setContactError(error instanceof Error ? error.message : 'Unable to send your message. Please try again.');
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <main className="bg-white text-[#24292d]">
        <motion.section
          id="home"
          {...scrollReveal(Boolean(reduceMotion), 'up', 0, 0.55)}
          className="relative isolate overflow-hidden bg-white pb-12 pt-24 sm:pt-32 md:pb-16"
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 border-b-2 border-dotted border-slate-100" />
          <img
            src="/images/element/rocket.svg"
            alt=""
            aria-hidden="true"
            className="home-hero-rocket pointer-events-none absolute bottom-0 left-0 hidden w-[159px] rotate-[74deg] md:block"
            style={reduceMotion ? undefined : { animation: 'rocket-enter-left 1.8s ease-out both' }}
          />
          <img
            src="/images/element/rocket.svg"
            alt=""
            aria-hidden="true"
            className="home-hero-rocket pointer-events-none absolute bottom-0 right-0 hidden w-[159px] -rotate-[74deg] scale-x-[-1] md:block"
            style={reduceMotion ? undefined : { animation: 'rocket-enter-right 1.8s ease-out both' }}
          />

          <div className="relative mx-auto max-w-[1180px] px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: revealEase }}
              className="mx-auto inline-flex max-w-full items-center gap-3 rounded-md bg-[#1d5a82] px-4 py-2.5 text-left text-white shadow-[0_5px_14px_rgba(29,59,83,0.18)] sm:px-6"
            >
              <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0" />
              <div className="text-xs font-bold leading-5 sm:text-sm">
                Elevate Your Earnings with Premium Offers – The Ultimate CPA Platform
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.7, ease: revealEase, delay: reduceMotion ? 0 : 0.08 }}
              className="mx-auto mt-5 max-w-[1000px] md:mt-6"
            >
              <motion.h1
                initial={{ scale: 0.88, opacity: 0 }}
                animate={reduceMotion
                  ? { scale: 1, opacity: 1 }
                  : {
                  scale: [0.88, 1.06, 0.96, 1.02, 1],
                  opacity: 1,
                }}
                transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : 0.15, ease: 'easeOut' }}
                className="text-[2rem] font-extrabold leading-[1.12] tracking-[-0.04em] text-[#24292d] sm:text-5xl sm:leading-[1.08] sm:tracking-[-0.045em] md:text-[3rem]"
              >
                AffClicker: Where Top Affiliates Meet
                <br className="hidden sm:block" /> Premium Offers
              </motion.h1>

              <p className="mx-auto mt-4 max-w-[760px] text-sm leading-6 text-[#747579] sm:text-base sm:leading-7 md:mt-5">
                Join AffClicker’s global affiliate network and unlock high-converting offers, seamless traffic monetization, and reliable support — all in one platform.
              </p>
            </motion.div>

            <div className="mx-auto mt-7 grid max-w-[740px] grid-cols-2 gap-x-2 gap-y-4 sm:mt-8 sm:gap-x-10 sm:gap-y-6 md:mt-10">
              {stats.map(({ icon: Icon, value, label }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.1 + index * 0.08, ease: 'easeOut' }}
                  className={`flex items-center justify-center gap-2.5 text-left sm:gap-3 ${index === 2 ? 'col-span-2 justify-self-center sm:col-span-2' : ''}`}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#edf2f8] text-[#1d5a82] shadow-[0_4px_14px_rgba(29,59,83,0.08)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold leading-7 text-[#24292d]">
                      <AnimatedStat value={value} reduceMotion={Boolean(reduceMotion)} />
                    </div>
                    <div className="mt-1 text-sm text-[#747579]">{label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.2, ease: revealEase }}
              className="mt-8 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center"
            >
              <motion.a
                href="/signup"
                initial={{ opacity: 0, x: -80 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01, transition: { duration: 0.2 } }}
                whileTap={reduceMotion ? undefined : { scale: 0.99, transition: { duration: 0.1 } }}
                transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.2, ease: revealEase }}
                className="home-hero-cta inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl border border-[#ed4c00] border-b-4 bg-[#ff4c00] px-7 py-3 text-sm font-bold uppercase italic tracking-wide text-white shadow-[0_5px_12px_rgba(255,76,0,0.2)] transition hover:-translate-y-0.5 hover:bg-[#ed4c00] hover:shadow-[0_8px_18px_rgba(255,76,0,0.25)] active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066ac9] focus-visible:ring-offset-2 sm:w-auto sm:text-base"
              >
                <UserRoundPlus aria-hidden="true" className="h-4 w-4" />
                Signup now
              </motion.a>
              <motion.a
                href="/login"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01, transition: { duration: 0.2 } }}
                whileTap={reduceMotion ? undefined : { scale: 0.99, transition: { duration: 0.1 } }}
                transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.32, ease: revealEase }}
                className="home-hero-cta inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl border border-[#e7b820] border-b-4 bg-[#ffcc2b] px-7 py-3 text-sm font-bold uppercase italic tracking-wide text-[#24292d] shadow-[0_5px_12px_rgba(247,195,46,0.2)] transition hover:-translate-y-0.5 hover:bg-[#f1bd16] hover:shadow-[0_8px_18px_rgba(247,195,46,0.26)] active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066ac9] focus-visible:ring-offset-2 sm:w-auto sm:text-base"
              >
                <Power aria-hidden="true" className="h-4 w-4" />
                Sign In
              </motion.a>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="countries"
          {...scrollReveal(Boolean(reduceMotion), 'left', 0, 0.55)}
          className="relative overflow-hidden bg-[#fafbfd] py-10 md:py-14"
          style={{
            backgroundImage: "url('/images/element/map.svg')",
            backgroundPosition: 'center left',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="mx-auto grid max-w-[1180px] gap-7 px-4 sm:px-6 lg:grid-cols-[0.72fr_2.28fr] lg:items-center lg:px-8">
            <h2 className="max-w-[240px] text-4xl font-extrabold leading-tight tracking-[-0.045em] text-[#24292d] sm:text-5xl">
              Top Countries for Leads
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {countries.map(({ name, flag: Flag, offer, tag, color }, index) => (
                <motion.article
                  key={name}
                  {...scrollReveal(Boolean(reduceMotion), 'scale', Math.min(index * 0.06, 0.3), 0.65)}
                  whileInView={reduceMotion
                    ? { opacity: 1, scale: 1, y: 0 }
                    : { opacity: [0, 1], scale: [0.96, 1.02, 1], y: [10, 0, 0] }}
                  whileHover={reduceMotion ? undefined : { y: -4, scale: 1.02 }}
                  className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(36,41,45,0.08)] sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <motion.div
                      initial={{ rotate: -8 }}
                      animate={reduceMotion ? { rotate: 0 } : undefined}
                      whileInView={{ rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: reduceMotion ? 0 : 0.45, delay: Math.min(index * 0.06, 0.3), ease: revealEase }}
                      className="origin-bottom"
                    >
                      <Flag role="img" aria-label={`${name} flag`} className="h-9 w-12 shrink-0 rounded-sm shadow-sm" />
                    </motion.div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-[#24292d] sm:text-lg">{name}</h3>
                      <p className="mt-0.5 text-xs text-[#9a9ea4] sm:text-sm">Top Offer: {offer}</p>
                      <span className={`mt-2 inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-white ${color}`}>
                        {tag === 'Trending' ? <Trophy className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                        {tag}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section id="services" className="bg-white py-12 md:py-16" {...scrollReveal(Boolean(reduceMotion))}>
          <div className="mx-auto grid max-w-[1180px] gap-6 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.2fr_1.2fr] lg:items-stretch lg:px-8">
            <div id="about" className="self-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#066ac9]">Built for growth</p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#24292d] sm:text-4xl">Why Work with Us?</h2>
              <p className="mt-4 text-sm leading-6 text-[#747579] sm:text-base">
                AffClicker connects advertisers and publishers for mutual success with thoughtful tools, quality campaigns, and expert support.
              </p>
            </div>
            <div className="contents">
              {highlights.map(({ title, icon: Icon, text, bullets }, index) => (
                <motion.div
                  key={title}
                  {...scrollReveal(Boolean(reduceMotion), index === 1 ? 'left' : 'up', index * 0.08, 0.5)}
                  whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
                  className="flex flex-col rounded-xl border border-[#eff1f2] bg-white p-5 shadow-[0_8px_24px_rgba(36,41,45,0.08)] sm:p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d4] text-[#c18d08]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#24292d]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#747579]">{text}</p>
                  <ul className="mt-4 flex-1 space-y-3">
                    {bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm leading-5 text-[#404448]">
                        <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-3 w-3" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={title === 'For Publishers' ? '/signup' : 'mailto:hello@affclicker.com'}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f7c32e] px-4 py-2.5 text-sm font-bold text-[#24292d] transition hover:bg-[#eab51f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066ac9] focus-visible:ring-offset-2"
                  >
                    {title === 'For Publishers' ? 'Become a Publisher' : 'Partner with Us'}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section id="verticals" className="relative overflow-hidden bg-[#f5f7f9] py-12 md:py-16" {...scrollReveal(Boolean(reduceMotion))}>
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
            <div className="mb-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#066ac9]">Discover campaigns</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[#24292d] sm:text-4xl">Popular Verticals</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-[#747579] sm:text-base">Explore the categories and campaign types publishers are working with.</p>
            </div>

            <div className="mb-5 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Offer verticals">
              {verticals.map((vertical, index) => (
                <motion.button
                  key={vertical.name}
                  id={`vertical-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={activeVertical === index}
                  aria-controls="vertical-panel"
                  onClick={() => setActiveVertical(index)}
                  whileHover={reduceMotion ? undefined : { y: -2, scale: 1.04 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  className={`min-h-10 rounded-full border px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066ac9] focus-visible:ring-offset-2 ${
                    activeVertical === index
                      ? 'border-[#1d3b53] bg-[#1d3b53] text-white shadow-sm'
                      : 'border-[#dde0e3] bg-white text-[#404448] hover:border-[#9a9ea4] hover:bg-[#eff1f2]'
                  }`}
                >
                  {vertical.name}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {verticals.map((vertical, index) => (
                activeVertical === index && (
                <motion.div
                  key={vertical.name}
                  id="vertical-panel"
                  role="tabpanel"
                  aria-labelledby={`vertical-tab-${index}`}
                  initial={{ opacity: 0, y: 14, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, ease: revealEase }}
                  className="grid overflow-hidden rounded-xl border border-[#eff1f2] bg-white shadow-[0_12px_30px_rgba(36,41,45,0.08)] lg:grid-cols-2"
                >
                  <div className="p-6 sm:p-9">
                    <h3 className="text-2xl font-extrabold text-[#24292d] sm:text-3xl">{vertical.name}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#747579] sm:text-base sm:leading-7">{vertical.text}</p>
                    <ul className="mt-5 space-y-3">
                      {vertical.bullets.map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-sm text-[#404448]">
                          <Check className="h-4 w-4 shrink-0 text-[#0cbc87]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <a href="/signup" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#066ac9] hover:text-[#0555a1]">
                      Browse publisher opportunities <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="min-h-56 bg-[#eef1f4]">
                    <motion.img
                      src={`/images/verticals/${vertical.image}`}
                      alt={`${vertical.name} offers`}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.65, delay: 0.08, ease: revealEase }}
                      className="h-full max-h-[360px] min-h-56 w-full object-cover"
                    />
                  </div>
                </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        <motion.section className="bg-white py-12 md:py-16" {...scrollReveal(Boolean(reduceMotion))}>
          <div className="mx-auto grid max-w-[1180px] gap-5 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
            <div className="self-center md:col-span-2 lg:col-span-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#066ac9]">More ways to grow</p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#24292d]">Services to Boost Your Affiliate Earnings</h2>
              <p className="mt-3 text-sm leading-6 text-[#747579]">Tools and support designed to make it easier to build, track, and improve your campaigns.</p>
            </div>
            {earningServices.map(({ title, icon: Icon, summary, bullets }, index) => (
              <motion.article
                key={title}
                {...scrollReveal(Boolean(reduceMotion), index === 1 ? 'up' : index === 0 ? 'right' : 'left', index * 0.07, 0.55)}
                whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
                className="rounded-xl border border-[#eff1f2] bg-white p-5 shadow-[0_8px_24px_rgba(36,41,45,0.07)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#edf4fa] text-[#1d5a82]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#24292d]">{title}</h3>
                <p className="mt-1 text-sm leading-5 text-[#747579]">{summary}</p>
                <ul className="mt-4 space-y-2.5">
                  {bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-xs leading-5 text-[#404448]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0cbc87]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section className="bg-[#f5f7f9] py-12 md:py-16" {...scrollReveal(Boolean(reduceMotion))}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#066ac9]">A wide range of campaigns</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[#24292d] sm:text-4xl">Find your next opportunity</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
              {categories.map(({ name, count, detail, icon: Icon }, index) => (
                <motion.div
                  key={name}
                  {...scrollReveal(Boolean(reduceMotion), 'scale', Math.min(index * 0.055, 0.3), 0.55)}
                  whileHover={reduceMotion ? undefined : { y: -4, scale: 1.02 }}
                  className="rounded-xl border border-[#eff1f2] bg-white p-4 shadow-[0_8px_24px_rgba(36,41,45,0.06)]"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ rotate: -8, scale: 0.9 }}
                      animate={reduceMotion ? { rotate: 0, scale: 1 } : undefined}
                      whileInView={{ rotate: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: reduceMotion ? 0 : 0.5, delay: Math.min(index * 0.055, 0.3), ease: revealEase }}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff4d4] text-[#c18d08]"
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[#24292d] sm:text-lg">{name}</h3>
                      <p className="text-xs font-medium text-[#066ac9]">{count}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#747579]">{detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section id="contact" className="relative overflow-hidden bg-white py-12 md:py-16" {...scrollReveal(Boolean(reduceMotion))}>
          <div className="mx-auto grid max-w-[1180px] gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <motion.div {...scrollReveal(Boolean(reduceMotion), 'right')}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#066ac9]">We’re here to help</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[#24292d] sm:text-4xl">Get in touch with us!</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#747579] sm:text-base">Have a question or want to explore a partnership? Reach our team and we’ll be glad to help.</p>
              <a href="mailto:hello@affclicker.com" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#066ac9] hover:text-[#0555a1]">
                <Mail className="h-4 w-4" />
                hello@affclicker.com
              </a>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <motion.div {...scrollReveal(Boolean(reduceMotion), 'up', 0.05, 0.45)} className="rounded-lg border border-[#eff1f2] bg-[#f5f7f9] p-4">
                  <h3 className="text-sm font-bold text-[#24292d]">Publisher support</h3>
                  <p className="mt-1 text-xs leading-5 text-[#747579]">Campaign guidance and account setup.</p>
                </motion.div>
                <motion.div {...scrollReveal(Boolean(reduceMotion), 'up', 0.12, 0.45)} className="rounded-lg border border-[#eff1f2] bg-[#f5f7f9] p-4">
                  <h3 className="text-sm font-bold text-[#24292d]">Advertiser inquiries</h3>
                  <p className="mt-1 text-xs leading-5 text-[#747579]">Discuss campaign goals and traffic.</p>
                </motion.div>
              </div>
            </motion.div>
            <motion.form
              onSubmit={submitContactForm}
              initial={{ opacity: 0, x: 32 }}
              animate={reduceMotion ? { opacity: 1, x: 0 } : undefined}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: reduceMotion ? 0 : 0.65, ease: revealEase }}
              className="rounded-xl border border-[#eff1f2] bg-white p-5 shadow-[0_12px_30px_rgba(36,41,45,0.08)] sm:p-7"
            >
              <h3 className="text-xl font-bold text-[#24292d]">Send us a message</h3>
              <p className="mt-1 text-sm text-[#747579]">Fill out the form and our team will follow up.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[#404448]">
                  First name
                  <input name="firstName" required maxLength={100} autoComplete="given-name" className="mt-1.5 min-h-11 w-full rounded-md border border-[#dde0e3] bg-white px-3 text-sm text-[#24292d] outline-none transition placeholder:text-[#9a9ea4] focus:border-[#066ac9] focus:ring-2 focus:ring-[#066ac9]/15" />
                </label>
                <label className="block text-sm font-medium text-[#404448]">
                  Last name
                  <input name="lastName" required maxLength={100} autoComplete="family-name" className="mt-1.5 min-h-11 w-full rounded-md border border-[#dde0e3] bg-white px-3 text-sm text-[#24292d] outline-none transition placeholder:text-[#9a9ea4] focus:border-[#066ac9] focus:ring-2 focus:ring-[#066ac9]/15" />
                </label>
                <label className="block text-sm font-medium text-[#404448] sm:col-span-2">
                  Email address
                  <input type="email" name="email" required maxLength={254} autoComplete="email" className="mt-1.5 min-h-11 w-full rounded-md border border-[#dde0e3] bg-white px-3 text-sm text-[#24292d] outline-none transition placeholder:text-[#9a9ea4] focus:border-[#066ac9] focus:ring-2 focus:ring-[#066ac9]/15" />
                </label>
                <label className="block text-sm font-medium text-[#404448] sm:col-span-2">
                  Message
                  <textarea name="message" required maxLength={5000} rows={4} className="mt-1.5 w-full resize-y rounded-md border border-[#dde0e3] bg-white px-3 py-2.5 text-sm text-[#24292d] outline-none transition placeholder:text-[#9a9ea4] focus:border-[#066ac9] focus:ring-2 focus:ring-[#066ac9]/15" />
                </label>
              </div>
              {contactError && <p role="alert" className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{contactError}</p>}
              {contactSuccess && <p role="status" className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{contactSuccess}</p>}
              <button type="submit" disabled={contactSubmitting} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#f7c32e] px-5 py-2.5 text-sm font-bold text-[#24292d] transition hover:bg-[#eab51f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066ac9] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
                {contactSubmitting ? 'Sending...' : 'Send message'}
                {!contactSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </motion.form>
          </div>
        </motion.section>

        <motion.section id="faqs" className="bg-[#f5f7f9] py-12 md:py-16" {...scrollReveal(Boolean(reduceMotion))}>
          <div className="mx-auto max-w-[880px] px-4 sm:px-6 lg:px-8">
            <div className="mb-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#066ac9]">Helpful answers</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[#24292d] sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map(({ question, answer }, index) => (
                <motion.article
                  key={question}
                  {...scrollReveal(Boolean(reduceMotion), 'scale', Math.min(index * 0.045, 0.225), 0.35)}
                  className="rounded-lg border border-[#eff1f2] bg-white px-4 shadow-[0_5px_18px_rgba(36,41,45,0.04)] sm:px-5"
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={openFaq === index}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold text-[#24292d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#066ac9] sm:text-base"
                    >
                      {question}
                      <ChevronDown className={`h-4 w-4 shrink-0 text-[#747579] transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {openFaq === index && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          height: { duration: reduceMotion ? 0 : 0.32, ease: revealEase },
                          opacity: { duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' },
                        }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-[#eff1f2] pb-4 pt-3 text-sm leading-6 text-[#747579]">
                          {answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>

        <section aria-label="Affiliate industry partners" className="bg-white py-8">
          <div className="mx-auto max-w-[1180px] overflow-hidden px-4 sm:px-6 lg:px-8">
            <div className={`partner-logo-track ${reduceMotion ? 'partner-logo-track-static' : ''}`}>
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center gap-5 pr-5 sm:gap-20 sm:pr-20" aria-hidden={copy === 1}>
                  {partners.map((partner) => (
                    <div key={partner.name} className="flex h-14 min-w-28 items-center justify-center rounded-md border border-[#eff1f2] bg-white px-3 py-2 shadow-sm">
                      <img
                        src={`/images/element/${partner.image}`}
                        alt={copy === 1 ? '' : partner.name}
                        loading="lazy"
                        decoding="async"
                        className="h-10 w-auto max-w-[170px] object-contain"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 pb-12 sm:px-6 md:pb-16">
          <div className="mx-auto max-w-[1180px] rounded-xl bg-[#24292d] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <motion.div
                initial={{ opacity: 0, x: -56 }}
                animate={reduceMotion ? { opacity: 1, x: 0 } : undefined}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reduceMotion ? 0 : 0.7, ease: revealEase }}
                className="max-w-2xl"
              >
                <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">Join AffClicker and grow with confidence</h2>
                <p className="mt-2 text-sm leading-6 text-white/75 sm:text-base">Access quality offers, clear performance insights, and support built around your goals.</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/90 sm:text-sm">
                  {['Reliable support', 'Exclusive offers', 'Real-time insights'].map((item) => (
                    <li key={item} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[#0cbc87]" />{item}</li>
                  ))}
                </ul>
              </motion.div>
              <motion.a
                href="/signup"
                initial={{ opacity: 0, x: 56 }}
                animate={reduceMotion ? { opacity: 1, x: 0 } : undefined}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.08, ease: revealEase }}
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#ff4c00] px-6 py-3 text-sm font-bold uppercase text-white shadow-[0_6px_16px_rgba(255,76,0,0.25)] transition hover:bg-[#ed4c00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#24292d]"
              >
                <UserRoundPlus className="h-4 w-4" />
                Start earning
              </motion.a>
            </div>
          </div>
        </section>

      </main>
    </PublicLayout>
  );
}

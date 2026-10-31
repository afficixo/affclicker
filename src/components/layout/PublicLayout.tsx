"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#services", label: "Publishers" },
  { href: "#services", label: "Advertisers" },
  { href: "#verticals", label: "Verticals" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function PublicLayout({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHomePage = pathname === "/";
  const [active, setActive] = useState<string | null>(isHomePage ? "#home" : null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const updateScrolledState = () => setIsScrolled(window.scrollY > 20);
    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolledState);
  }, [isHomePage]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!isHomePage) {
      setActive(null);
      return;
    }

    setActive("#home");
    const sections = navLinks
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (top) setActive(`#${top.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHomePage]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 72;
    const y = (el as HTMLElement).getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", href);
    setOpen(false);
  };

  return (
    <div
      data-mobile-menu-open={open ? "true" : undefined}
      className={`public-site relative min-h-screen w-full overflow-x-hidden ${className}`}
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        <header
          className={`fixed inset-x-0 top-0 z-40 border-b ${open ? "" : "transition-colors"} ${
            open || !isHomePage || isScrolled
              ? "border-slate-200 bg-[#ffffff] shadow-[0_2px_12px_rgba(15,23,42,0.08)] backdrop-blur-sm"
              : "border-transparent bg-transparent shadow-none"
          }`}
        >
          <nav className="relative z-10 mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <a
              href={isHomePage ? "#home" : "/#home"}
              onClick={isHomePage ? (e) => go(e, "#home") : undefined}
              className="flex shrink-0 items-center"
            >
              <Image
                src="/affclickerlogo.png"
                alt="AffClicker"
                width={1275}
                height={482}
                sizes="180px"
                className="h-8 w-[126px] object-contain sm:h-10 sm:w-[150px] lg:h-11 lg:w-[170px]"
                priority
              />
            </a>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a2540] sm:h-11 sm:w-11"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="public-mobile-menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-[#f3c746] px-3 py-2 text-xs font-bold text-[#0f172a] shadow-[0_8px_18px_rgba(243,199,70,0.3)] transition-colors hover:bg-[#f7d868] sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Sign In
              </Link>
            </div>
          </nav>

          <AnimatePresence>
            {open && (
              <motion.div
                id="public-mobile-menu"
                initial={{ y: -6 }}
                animate={{ y: 0 }}
                exit={{ y: -6 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute right-4 top-full z-10 mt-4 max-h-[calc(100dvh-5rem)] w-[min(15rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-[#ffffff] p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm"
              >
                <nav aria-label="Mobile navigation" className="pb-1">
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <a
                        key={link.href + link.label}
                        href={isHomePage ? link.href : `/${link.href}`}
                        onClick={(event) => {
                          if (isHomePage) go(event, link.href);
                          else setOpen(false);
                        }}
                        aria-current={isHomePage && active === link.href ? "location" : undefined}
                        className={`flex min-h-10 items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0a2540] ${
                          isHomePage && active === link.href ? "bg-[#0a2540] text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <span>{link.label}</span>
                        <span aria-hidden="true">→</span>
                      </a>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-slate-200 pt-2">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="flex min-h-10 items-center justify-center rounded-lg bg-[#f3c746] px-3 text-sm font-bold text-[#0f172a] shadow-[0_8px_18px_rgba(243,199,70,0.3)] transition-colors hover:bg-[#f7d868]"
                    >
                      Sign In
                    </Link>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {open && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-[#0b1120]/45 backdrop-blur-none lg:hidden"
          />
        )}

        {children}

        <footer className="mt-auto border-t border-slate-200 bg-[#f7f4f1]">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-8 border-b border-slate-200 pb-10 md:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_1.2fr]">
              <div>
                <div className="text-4xl font-black tracking-[-0.07em] text-[#1d2228]">Aff<span className="text-[#f3c746]">Clicker</span></div>
                <p className="mt-4 max-w-xs text-base leading-7 text-slate-600">
                  Experience the power of premium advertiser offers, driving unmatched traffic monetization and high earnings on one unified CPA network platform.
                </p>
                <div className="mt-6 flex gap-3 text-lg text-slate-700">
                  {['f', '◌', 'in'].map((item) => (
                    <span
                      key={item}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {[
                { title: 'Company', items: ['About us', 'Contact us', 'Support', 'FAQ', 'Sitemap'] },
                { title: 'Partners', items: ['Affpaying', 'AffPlus', 'Post Affiliate Pro', 'Affverify', 'Affwebsite'] },
                { title: 'Resources', items: ['Privacy policy', 'Terms & Conditions'] },
              ].map((column) => (
                <div key={column.title}>
                  <h4 className="text-lg font-black uppercase tracking-[0.14em] text-[#1d2228]">{column.title}</h4>
                  <ul className="mt-4 space-y-3 text-base text-slate-600">
                    {column.items.map((item) => (
                      <li key={item} className="transition hover:text-[#0f172a]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <h4 className="text-lg font-black uppercase tracking-[0.14em] text-[#1d2228]">Contact</h4>
                <ul className="mt-4 space-y-3 text-base text-slate-600">
                  <li>Phone: +1 307 201 6705</li>
                  <li>Email: hello@affclicker.com</li>
                  <li className="pt-2">
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0a2540]"
                      placeholder="your.email@example.com"
                    />
                  </li>
                  <li>
                    <button
                      type="button"
                      className="w-full rounded-xl bg-[#eb5f2d] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_22px_rgba(235,95,45,0.22)] transition hover:bg-[#f66a35]"
                    >
                      Subscribe
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <p>Copyright ©2024 AffClicker LLC. Designed with by AffClicker. All rights reserved.</p>
              <div className="flex flex-wrap items-center gap-4 md:gap-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
                  🌐 Language
                </span>
                <span>Terms of use</span>
                <span>Privacy policy</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
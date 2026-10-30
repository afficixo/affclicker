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
              ? "border-slate-200 bg-white/95 shadow-[0_2px_12px_rgba(15,23,42,0.08)] backdrop-blur-sm"
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
                className="h-11 w-[170px] object-contain"
                priority
              />
            </a>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="grid h-9 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a2540]"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="public-mobile-menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <button
                type="button"
                aria-label="Toggle theme"
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="text-base leading-none">◐</span>
              </button>

              <a
                href="https://partner.affroyal.com/user/login"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-xl bg-[#f3c746] px-4 py-2 text-sm font-bold text-[#0f172a] shadow-[0_8px_18px_rgba(243,199,70,0.3)] transition-colors hover:bg-[#f7d868]"
              >
                Sign In
              </a>
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
                className="absolute right-4 top-full z-10 mt-4 max-h-[calc(100dvh-5rem)] w-[min(15rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm"
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
                    <a
                      href="https://partner.affroyal.com/user/login"
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex min-h-10 items-center justify-center rounded-lg bg-[#f3c746] px-3 text-sm font-bold text-[#0f172a] shadow-[0_8px_18px_rgba(243,199,70,0.3)] transition-colors hover:bg-[#f7d868]"
                    >
                      Sign In
                    </a>
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

        <footer className="mt-auto border-t border-slate-200 bg-[#f3f1ee]">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-8 border-b border-slate-200 pb-8 md:grid-cols-[1.2fr_1fr_1fr_1fr_1.3fr]">
              <div>
                <div className="text-4xl font-black tracking-[-0.06em] text-[#1d2228]">Aff<span className="text-[#f3c746]">Clicker</span></div>
                <p className="mt-4 max-w-xs text-base leading-7 text-slate-600">
                  Experience the Power of Premium Advertiser Offers, Driving Unmatched Traffic Monetization and High Earnings on a Unified CPA Network Platform.
                </p>
                <div className="mt-6 flex gap-3 text-lg text-slate-700">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f0f3f6]">f</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f0f3f6]">◌</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f0f3f6]">in</span>
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-black tracking-[-0.06em] text-[#1d2228]">Company</h4>
                <ul className="mt-4 space-y-3 text-base text-slate-600">
                  <li>About us</li>
                  <li>Contact us</li>
                  <li>Support</li>
                  <li>Faq</li>
                  <li>Sitemap</li>
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-black tracking-[-0.06em] text-[#1d2228]">Partners</h4>
                <ul className="mt-4 space-y-3 text-base text-slate-600">
                  <li>Affpaying</li>
                  <li>AffPlus</li>
                  <li>Post Affiliate Pro</li>
                  <li>Affverify</li>
                  <li>Affwebsite</li>
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-black tracking-[-0.06em] text-[#1d2228]">Teaching</h4>
                <ul className="mt-4 space-y-3 text-base text-slate-600">
                  <li>Privacy policy</li>
                  <li>Terms &amp; Conditions</li>
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-black tracking-[-0.06em] text-[#1d2228]">Contact</h4>
                <ul className="mt-4 space-y-3 text-base text-slate-600">
                  <li>Phone: +1 307 201 6705</li>
                  <li>Email: hello@affclicker.com</li>
                  <li className="mt-3">
                    <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none" placeholder="your.email@example.com" />
                  </li>
                  <li>
                    <button type="button" className="w-full rounded-xl bg-[#eb5f2d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#f66a35]">
                      Subscribe
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <p>Copyright ©2024 AffClicker LLC. Designed with by AffClicker. All rights reserved.</p>
              <div className="flex items-center gap-5">
                <span>🌐 Language</span>
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
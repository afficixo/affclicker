"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, Power, X } from "lucide-react";

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
          className="fixed inset-x-0 top-0 z-40 border-b border-[#eff1f2] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)]"
        >
          <nav className="relative z-10 mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-4 sm:px-6 lg:h-[76px] lg:px-8">
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
                sizes="140px"
                className="h-8 w-[126px] object-contain sm:h-9 sm:w-[140px]"
                priority
              />
            </a>

            <div className="hidden items-center gap-7 lg:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href + link.label}
                  href={isHomePage ? link.href : `/${link.href}`}
                  onClick={isHomePage ? (event) => go(event, link.href) : undefined}
                  aria-current={isHomePage && active === link.href ? "location" : undefined}
                  className={`text-sm font-medium transition-colors hover:text-[#066ac9] ${
                    isHomePage && active === link.href ? "text-[#1d3b53]" : "text-[#747579]"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#eff1f2] bg-white text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066ac9] lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="public-mobile-menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <Link
                href="/login"
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#e7b820] border-b-[3px] bg-[#ffcc2b] px-4 py-2 text-xs font-bold uppercase italic tracking-wide text-[#24292d] shadow-[0_4px_10px_rgba(247,195,46,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f1bd16] hover:shadow-[0_6px_14px_rgba(247,195,46,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066ac9] focus-visible:ring-offset-2 sm:min-h-10 sm:px-5 sm:text-sm"
              >
                <Power aria-hidden="true" className="h-3.5 w-3.5" />
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
                className="absolute right-4 top-full z-10 mt-2 max-h-[calc(100dvh-5rem)] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-[#eff1f2] bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)] lg:hidden"
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
                      className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#e4ac12] border-b-[3px] bg-[#ffcc2b] px-3 text-sm font-black uppercase tracking-wide text-[#111827] shadow-[0_5px_12px_rgba(247,195,46,0.2)] transition hover:bg-[#f5bd17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066ac9]"
                    >
                      <Power aria-hidden="true" className="h-3.5 w-3.5" />
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
            <div className="grid gap-8 border-b border-slate-200 pb-10 md:grid-cols-[0.9fr_0.9fr_0.9fr_1.2fr]">
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

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <p className="text-slate-500">© 2024 AffClicker LLC. Crafted for high-converting growth.</p>
              <div className="flex flex-wrap items-center gap-3 md:gap-5">
                <a href="#" className="transition hover:text-[#0f172a]">Terms of use</a>
                <a href="#" className="transition hover:text-[#0f172a]">Privacy policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
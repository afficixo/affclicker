"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronRight, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#publishers", label: "Publishers" },
  { href: "#advertisers", label: "Advertisers" },
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

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
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
    const y = (el as HTMLElement).getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", href);
    setOpen(false);
  };

  return (
    <div className={`public-site relative min-h-screen w-full overflow-x-hidden ${className}`}>
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className={`fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-colors ${open ? "border-white/10 bg-[#0f172a]/95 shadow-lg shadow-black/20" : "border-white/[0.08] bg-[#0f172a]/80 shadow-[0_2px_8px_rgba(0,0,0,0.18)]"}`}>
          <nav className="relative z-10 mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8 md:h-20">
            <a
              href={isHomePage ? "#home" : "/#home"}
              onClick={isHomePage ? (e) => go(e, "#home") : undefined}
              className="flex shrink-0 items-center"
            >
              <Image
                src="/afficixlogo.png"
                alt="Afficix"
                width={2171}
                height={724}
                sizes="120px"
                className="h-10 w-[120px] object-contain"
                priority
              />
            </a>

            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={isHomePage ? link.href : `/${link.href}`}
                  onClick={isHomePage ? (e) => go(e, link.href) : undefined}
                  aria-current={active === link.href ? "location" : undefined}
                  className={`text-sm font-medium transition-colors ${
                    isHomePage && active === link.href ? "text-[#5ff442]" : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/signup"
                prefetch={false}
                className="hidden sm:inline-flex items-center rounded-md bg-[#5ff442] px-4 py-2 text-sm font-bold text-[#263238] transition-colors hover:bg-[#4dd935]"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                prefetch={false}
                aria-current={pathname === "/login" ? "page" : undefined}
                className="hidden sm:inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#263238] transition-colors hover:bg-[#f0f4f7]"
              >
                Login
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/[0.04] text-white transition-colors hover:border-[#5ff442]/50 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ff442] md:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="public-mobile-menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          <AnimatePresence>
            {open && (
              <motion.div
                key="mobile-menu-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setOpen(false)}
                  className="fixed inset-x-0 bottom-0 top-16 z-0 cursor-default bg-slate-950/55 backdrop-blur-[2px] md:hidden"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {open && (
              <motion.div
                id="public-mobile-menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute inset-x-0 top-full z-10 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-[#202b2f] shadow-2xl shadow-black/30 md:hidden"
              >
                <div className="mx-auto max-w-7xl px-4 pb-5 pt-4 sm:px-6">
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    Explore
                  </p>
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={isHomePage ? link.href : `/${link.href}`}
                        onClick={(event) => {
                          if (isHomePage) go(event, link.href);
                          else setOpen(false);
                        }}
                        aria-current={isHomePage && active === link.href ? "location" : undefined}
                        className={`flex min-h-12 items-center justify-between rounded-lg px-3 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ff442] ${
                          isHomePage && active === link.href
                            ? "bg-[#5ff442]/10 text-[#8aff70]"
                            : "text-white/80 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        {link.label}
                        <ChevronRight className="h-4 w-4 text-white/35" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-3 border-t border-white/10 pt-4">
                    <Link
                      href="/signup"
                      prefetch={false}
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[#5ff442] px-4 text-sm font-bold text-[#263238] transition-colors hover:bg-[#4dd935] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8aff70] focus-visible:ring-offset-2 focus-visible:ring-offset-[#202b2f]"
                    >
                      Sign up
                    </Link>
                    <Link
                      href="/login"
                      prefetch={false}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === "/login" ? "page" : undefined}
                      className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {children}

        <footer className="mt-auto border-t border-white/10 bg-[#202b2f]">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 sm:px-6 md:flex-row lg:px-8">
            <p className="text-center text-xs text-white/55 md:text-left">
              <span className="font-semibold text-white/85">Afficix</span>
              <span className="mx-2 text-[#5ff442]/70" aria-hidden="true">•</span>
              © 2019–2026. All rights reserved.
            </p>
            <nav aria-label="Legal" className="flex items-center gap-1 text-xs">
              <Link
                href="/privacy-policy"
                prefetch={false}
                className="rounded-md px-2 py-1 text-white/65 transition-colors hover:text-[#8aff70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ff442]"
              >
                Privacy Policy
              </Link>
              <span className="h-4 w-px bg-white/15" aria-hidden="true" />
              <Link
                href="/terms-of-service"
                prefetch={false}
                className="rounded-md px-2 py-1 text-white/65 transition-colors hover:text-[#8aff70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ff442]"
              >
                Terms &amp; Conditions
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X } from "lucide-react";

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
        <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06] bg-[#272b2d] shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 md:h-20">
            <a
              href={isHomePage ? "#home" : "/#home"}
              onClick={isHomePage ? (e) => go(e, "#home") : undefined}
              className="flex shrink-0 items-center"
            >
              <Image
                src="/afficixo-logo.png"
                alt="Afficixo"
                width={2172}
                height={724}
                sizes="108px"
                className="h-9 w-[108px] object-contain"
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
                className="grid h-9 w-9 place-items-center rounded-md text-white md:hidden"
                aria-label="Toggle menu"
                aria-expanded={open}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden border-t border-white/[0.08] bg-[#263238] md:hidden"
              >
                <div className="space-y-1 px-4 py-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={isHomePage ? link.href : `/${link.href}`}
                      onClick={isHomePage ? (e) => go(e, link.href) : undefined}
                      aria-current={isHomePage && active === link.href ? "location" : undefined}
                      className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/5 hover:text-white ${
                        isHomePage && active === link.href ? "text-[#5ff442]" : "text-white/80"
                      }`}
                    >
                      {link.label}
                    </a>
                  ))}
                  <Link href="/signup" prefetch={false} onClick={() => setOpen(false)} className="mt-2 flex items-center justify-center rounded-md bg-[#5ff442] px-4 py-2.5 text-sm font-bold text-[#263238]">
                    Sign up
                  </Link>
                  <Link href="/login" prefetch={false} onClick={() => setOpen(false)} aria-current={pathname === "/login" ? "page" : undefined} className="flex items-center justify-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#263238]">
                    Login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {children}

        <footer className="mt-auto bg-[#e6ebed] py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:px-6 lg:flex-row lg:px-8">
            <p className="text-sm text-[#455964]">© 2019 - 2026 Afficixo LLC - All rights reserved</p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy-policy" prefetch={false} className="text-[#455964] hover:text-[#263238]">Privacy Policy</Link>
              <Link href="/terms-of-service" prefetch={false} className="text-[#455964] hover:text-[#263238]">Terms &amp; Conditions</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
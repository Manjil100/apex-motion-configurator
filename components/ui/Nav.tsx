"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Logo } from "@/components/brand/Logo";
import { buttonClass } from "./Button";
import { displayName, useSession } from "@/stores/session";

const links = [
  { href: "/cars", label: "Cars" },
  { href: "/compare", label: "Compare" },
  { href: "/gallery", label: "Gallery" },
  { href: "/garage", label: "My garage" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { ready, user, signOut } = useSession();
  const accountLabel = user ? displayName(user) : "";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-carbon/85 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="APEX MOTION home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={clsx(
                "relative py-2 text-[0.9375rem] transition-colors hover:text-chalk",
                isActive(l.href) ? "text-chalk" : "text-steel",
              )}
            >
              {l.label}
              {isActive(l.href) && <span className="absolute inset-x-0 -bottom-[13px] h-px bg-volt" />}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {ready && user ? (
            <span className="flex items-center gap-4 text-[0.9375rem]">
              <span className="max-w-[10rem] truncate text-silver" title={user.email ?? undefined}>
                {accountLabel}
              </span>
              <button type="button" onClick={() => void signOut()} className="text-steel transition-colors hover:text-chalk">
                Sign out
              </button>
            </span>
          ) : (
            <Link
              href="/auth/login"
              className={clsx("text-[0.9375rem] text-steel transition-colors hover:text-chalk", !ready && "invisible")}
            >
              Sign in
            </Link>
          )}
          <Link href="/configure" className={buttonClass("primary", "md")}>
            Start customising
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-chalk lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
            {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 8h18M3 16h18" />}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-carbon lg:hidden">
          <nav aria-label="Mobile" className="shell flex flex-col py-6">
            {[...links, { href: "/contact", label: "Contact" }, ...(user ? [] : [{ href: "/auth/login", label: "Sign in" }])].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={clsx(
                  "type-heading border-b border-line py-5",
                  isActive(l.href) ? "text-chalk" : "text-silver",
                )}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="type-heading border-b border-line py-5 text-left text-silver"
              >
                Sign out <span className="block text-[0.875rem] font-normal text-steel">{user.email}</span>
              </button>
            )}
            <Link href="/configure" onClick={() => setOpen(false)} className={buttonClass("primary", "lg", "mt-8")}>
              Start customising
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

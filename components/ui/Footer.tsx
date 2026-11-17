import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/cars", label: "Discover cars" },
      { href: "/configure", label: "Configurator" },
      { href: "/compare", label: "Compare" },
      { href: "/gallery", label: "Gallery" },
    ],
  },
  {
    title: "Your account",
    links: [
      { href: "/garage", label: "My garage" },
      { href: "/auth/login", label: "Sign in" },
      { href: "/auth/register", label: "Create account" },
    ],
  },
  {
    title: "APEX MOTION",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-graphite">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-[0.9375rem] text-steel">Configure your dream. Experience the difference.</p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="type-label">{col.title}</h2>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[0.9375rem] text-silver transition-colors hover:text-chalk">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="shell space-y-3 py-8 text-[0.8125rem] leading-relaxed text-steel">
          <p className="max-w-4xl">
            APEX MOTION is an independent concept platform. It is not affiliated with, endorsed by or sponsored by
            Porsche, BMW, Nissan, Ferrari, Audi, Toyota, Mercedes-AMG, McLaren, Lamborghini or any other vehicle
            manufacturer. Vehicle names are used only to identify the cars shown. Specifications marked unverified have
            not been checked against manufacturer sources, and all prices are illustrative, not offers of sale.
          </p>
          <p>© APEX MOTION. A portfolio project.</p>
        </div>
      </div>
    </footer>
  );
}

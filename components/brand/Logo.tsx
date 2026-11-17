/**
 * APEX MOTION mark: a corner seen from above. The line turns in, clips the
 * apex (the dot) and runs out wide. Original artwork for this project.
 */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 27 C 9 27, 13 23, 15.5 16 C 18 9, 22 5, 29 5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="square"
      />
      <path d="M3 27 H 12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" opacity="0.35" />
      <circle cx="15.5" cy="16" r="2.9" className="fill-volt" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-chalk ${className}`}>
      <LogoMark />
      <span
        className="font-display text-[1.0625rem] font-semibold leading-none tracking-[0.02em]"
        style={{ fontStretch: "125%" }}
      >
        APEX<span className="font-normal text-silver"> MOTION</span>
      </span>
    </span>
  );
}

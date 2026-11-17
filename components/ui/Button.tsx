import Link from "next/link";
import { clsx } from "clsx";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "quiet";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-medium tracking-[0.02em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45 [font-stretch:112%]";

const variants: Record<Variant, string> = {
  primary: "chamfer bg-chalk text-carbon hover:bg-volt hover:text-carbon",
  secondary: "border border-line text-chalk hover:border-silver hover:bg-slate",
  quiet: "text-silver underline decoration-line underline-offset-[6px] hover:text-chalk hover:decoration-volt",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(base, variants[variant], variant === "quiet" ? "text-[0.9375rem]" : sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

import { classNames } from "@/lib/formatters";
import type { ReactNode } from "react";

type PillVariant = "navy" | "gold" | "success" | "warning" | "info" | "neutral";

interface PillProps {
  children: ReactNode;
  variant?: PillVariant;
  size?: "sm" | "md";
  className?: string;
}

const VARIANT_MAP: Record<PillVariant, string> = {
  navy: "bg-navy/10 text-navy",
  gold: "bg-gold/15 text-gold-600 border border-gold/30",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  neutral: "bg-ink-light/15 text-ink-mid",
};

const SIZE_MAP = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export function Pill({
  children,
  variant = "neutral",
  size = "md",
  className,
}: PillProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full font-medium uppercase tracking-wide",
        VARIANT_MAP[variant],
        SIZE_MAP[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

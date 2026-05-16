import { classNames } from "@/lib/formatters";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  accentColor?: string;
  onClick?: () => void;
}

const PADDING_MAP = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  children,
  className,
  padding = "md",
  accentColor,
  onClick,
}: CardProps) {
  const isClickable = typeof onClick === "function";
  const Tag = isClickable ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={classNames(
        "block w-full rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden text-left",
        isClickable && "transition-transform active:scale-[0.99] hover:shadow-elevated",
        PADDING_MAP[padding],
        className,
      )}
      style={accentColor ? { borderLeft: `4px solid ${accentColor}` } : undefined}
    >
      {children}
    </Tag>
  );
}

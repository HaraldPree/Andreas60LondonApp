import { classNames } from "@/lib/formatters";

interface GoldDividerProps {
  className?: string;
  width?: "sm" | "md" | "full";
}

const WIDTH_MAP = {
  sm: "w-12",
  md: "w-24",
  full: "w-full",
};

export function GoldDivider({ className, width = "md" }: GoldDividerProps) {
  return (
    <div
      className={classNames(
        "h-[2px] bg-gradient-to-r from-gold/40 via-gold to-gold/40 rounded-full",
        WIDTH_MAP[width],
        className,
      )}
    />
  );
}

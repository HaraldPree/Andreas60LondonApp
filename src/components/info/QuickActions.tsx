import type { QuickAction } from "@/types/trip";
import { classNames } from "@/lib/formatters";

interface QuickActionsProps {
  actions: QuickAction[];
}

const COLOR_MAP = {
  navy: "bg-navy/5 text-navy border-navy/15 hover:bg-navy/10",
  gold: "bg-gold/10 text-gold-600 border-gold/25 hover:bg-gold/20",
  warning: "bg-warning/10 text-warning border-warning/25 hover:bg-warning/15",
  success: "bg-success/10 text-success border-success/25 hover:bg-success/15",
  info: "bg-info/10 text-info border-info/25 hover:bg-info/15",
} as const;

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4">
      <h3 className="font-display text-base font-semibold text-navy mb-3">
        Schnellzugriff
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, i) => {
          const colorClass = COLOR_MAP[action.color ?? "navy"];
          const isExternal = !action.href.startsWith("tel:");
          return (
            <a
              key={i}
              href={action.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className={classNames(
                "rounded-xl border p-3 flex flex-col items-start gap-1 transition-all min-h-[80px]",
                colorClass,
              )}
            >
              <span className="text-2xl leading-none">{action.icon}</span>
              <span className="text-xs font-semibold leading-tight">
                {action.label}
              </span>
              {action.description && (
                <span className="text-[10px] opacity-70 leading-tight">
                  {action.description}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

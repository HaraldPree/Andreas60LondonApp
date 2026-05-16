"use client";

import { useMemo } from "react";
import type { Alert } from "@/types/trip";
import { isDateActive, classNames } from "@/lib/formatters";

interface AlertBannerProps {
  alerts: Alert[];
}

const TYPE_STYLES = {
  warning: "bg-warning/10 border-warning/30 text-warning",
  info: "bg-info/10 border-info/30 text-info",
  success: "bg-success/10 border-success/30 text-success",
};

export function AlertBanner({ alerts }: AlertBannerProps) {
  const visible = useMemo(
    () => alerts.filter((a) => isDateActive(a.validFrom, a.validUntil)),
    [alerts],
  );

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((alert, i) => (
        <div
          key={i}
          className={classNames(
            "rounded-xl border p-3 flex items-start gap-3",
            TYPE_STYLES[alert.type],
          )}
        >
          <span className="text-xl leading-none flex-shrink-0">{alert.icon}</span>
          <div className="flex-1 min-w-0">
            {alert.title && (
              <p className="font-semibold text-sm leading-tight">{alert.title}</p>
            )}
            <p
              className={classNames(
                "text-xs leading-relaxed",
                alert.title ? "mt-0.5 opacity-90" : "",
              )}
            >
              {alert.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

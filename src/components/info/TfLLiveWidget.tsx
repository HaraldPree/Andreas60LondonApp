"use client";

import { RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTflStatus, type TflLineStatus } from "@/hooks/useTflStatus";
import { classNames } from "@/lib/formatters";

export function TfLLiveWidget() {
  const { data, loading, error, lastUpdated, refresh } = useTflStatus();

  const hasDisruption = data?.some((l) => l.severity < 10);
  const goodCount = data?.filter((l) => l.severity === 10).length ?? 0;

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="bg-info text-cream px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
            🚇
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-tight">
              TfL Live-Status
            </p>
            <p className="text-[10px] text-cream/80 uppercase tracking-wider">
              Tube Linien
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="opacity-70 hover:opacity-100 transition"
          aria-label="Aktualisieren"
        >
          <RefreshCw size={14} className={classNames(loading && "animate-spin")} />
        </button>
      </div>

      <div className="p-4">
        {loading && !data && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 bg-cream-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs text-warning text-center py-4">
            Konnte TfL Status nicht laden: {error}
          </p>
        )}

        {data && (
          <>
            {/* Summary */}
            <div
              className={classNames(
                "rounded-xl px-3 py-2 mb-3 flex items-center gap-2",
                hasDisruption
                  ? "bg-warning/10 text-warning"
                  : "bg-success/10 text-success",
              )}
            >
              {hasDisruption ? (
                <AlertTriangle size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
              <p className="text-xs font-semibold">
                {hasDisruption
                  ? `Einschränkungen auf ${data.length - goodCount} Linien`
                  : `Alle ${data.length} Linien fahren normal`}
              </p>
            </div>

            {/* Line list */}
            <ul className="space-y-1.5">
              {data.map((line) => (
                <LineRow key={line.name} line={line} />
              ))}
            </ul>
          </>
        )}

        {lastUpdated && (
          <p className="text-[10px] text-ink-light text-center mt-3 italic">
            Aktualisiert: {lastUpdated.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
            · Alle 5 Min automatisch
          </p>
        )}

        <a
          href="https://tfl.gov.uk/tube-dlr-overground/status/"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-[11px] text-navy hover:text-gold font-semibold mt-2 underline"
        >
          → Vollansicht auf tfl.gov.uk
        </a>
      </div>
    </div>
  );
}

function LineRow({ line }: { line: TflLineStatus }) {
  const isGood = line.severity === 10;
  const isWarning = line.severity >= 4 && line.severity <= 9;
  const isSevere = line.severity < 4;

  return (
    <li
      className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-cream-50 transition"
      title={line.reason}
    >
      <div
        className="w-2 h-8 rounded-full flex-shrink-0"
        style={{ backgroundColor: line.color }}
      />
      <span className="flex-1 text-sm font-medium text-ink-dark">
        {line.name}
      </span>
      <span
        className={classNames(
          "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
          isGood && "bg-success/10 text-success",
          isWarning && "bg-warning/10 text-warning",
          isSevere && "bg-warning text-white",
        )}
      >
        {line.status}
      </span>
    </li>
  );
}

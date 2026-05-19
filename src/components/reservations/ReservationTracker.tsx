"use client";

import { useMemo, useState } from "react";
import type { Reservation } from "@/types/trip";
import { useReservations } from "@/hooks/useReservations";
import { ReservationCard } from "./ReservationCard";
import { ReservationStatusSheet } from "./ReservationStatusSheet";

interface ReservationTrackerProps {
  tripSlug: string;
  reservations: Reservation[];
}

const STATUS_ORDER = { offen: 0, reserviert: 1, erledigt: 2 } as const;

export function ReservationTracker({ tripSlug, reservations }: ReservationTrackerProps) {
  const { reservations: live, setStatus, hydrated } = useReservations(
    tripSlug,
    reservations,
  );

  // Welche Reservation hat gerade ihr Status-Sheet offen?
  const [pickerForId, setPickerForId] = useState<string | null>(null);
  const pickerReservation = live.find((r) => r.id === pickerForId);

  const sorted = useMemo(
    () =>
      [...live].sort((a, b) => {
        const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (statusDiff !== 0) return statusDiff;
        return a.day - b.day;
      }),
    [live],
  );

  const stats = useMemo(() => {
    const offen = live.filter((r) => r.status === "offen").length;
    const reserviert = live.filter((r) => r.status === "reserviert").length;
    const erledigt = live.filter((r) => r.status === "erledigt").length;
    return { offen, reserviert, erledigt, total: live.length };
  }, [live]);

  return (
    <div className="space-y-4">
      {/* Stats overview */}
      <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="font-display text-2xl font-semibold text-warning">
              {stats.offen}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mt-0.5">
              Offen
            </p>
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-gold-600">
              {stats.reserviert}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mt-0.5">
              Reserviert
            </p>
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-success">
              {stats.erledigt}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mt-0.5">
              Erledigt
            </p>
          </div>
        </div>
        {hydrated && stats.total > 0 && (
          <div className="mt-3 h-1.5 bg-cream-200 rounded-full overflow-hidden flex">
            <div
              className="bg-success transition-all"
              style={{ width: `${(stats.erledigt / stats.total) * 100}%` }}
            />
            <div
              className="bg-gold transition-all"
              style={{ width: `${(stats.reserviert / stats.total) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {sorted.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            onOpenStatusPicker={() => setPickerForId(reservation.id)}
          />
        ))}
      </div>

      <p className="text-[11px] text-center text-ink-light italic px-4">
        Status wird auf eurem Gerät gespeichert und bleibt nach Neuladen erhalten.
      </p>

      {/* Status-Picker (Apple-Way Action-Sheet) */}
      {pickerReservation && (
        <ReservationStatusSheet
          open={pickerForId !== null}
          reservationName={pickerReservation.name}
          currentStatus={pickerReservation.status}
          onPick={(next) => setStatus(pickerReservation.id, next)}
          onClose={() => setPickerForId(null)}
        />
      )}
    </div>
  );
}

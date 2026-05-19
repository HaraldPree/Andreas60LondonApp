"use client";

import { Lock, Heart, Users } from "lucide-react";
import type { SharedPhotoVisibility } from "@/types/sharedPhoto";
import { classNames } from "@/lib/formatters";

interface Props {
  value: SharedPhotoVisibility;
  onChange: (next: SharedPhotoVisibility) => void;
  /** Name des Geburtstagskindes für die 🎂-Option-Label */
  celebrantName?: string | null;
  /** Falls true: die 🎂-Option wird ausgeblendet (keine celebrant in dieser Reise) */
  hideCelebrant?: boolean;
  /** Kompakte Mini-Variante für In-Galerie-Toggle */
  compact?: boolean;
}

/**
 * 3-Stufen-Sichtbarkeits-Selector als Radio-Gruppe.
 *
 * Verwendung:
 *   - Beim ersten Upload eines Fotos (vor dem Speichern in IndexedDB)
 *   - Im Detail-View eines Fotos um die Sichtbarkeit nachträglich zu ändern
 *
 * Default-Wahl liegt im Aufrufer — meistens `"private"` (Privacy by
 * Default, DSGVO Art. 25 Abs. 2).
 */
export function VisibilitySelector({
  value,
  onChange,
  celebrantName,
  hideCelebrant,
  compact = false,
}: Props) {
  const options: Array<{
    val: SharedPhotoVisibility;
    icon: React.ReactNode;
    title: string;
    sub: string;
    hide?: boolean;
  }> = [
    {
      val: "private",
      icon: <Lock size={compact ? 12 : 14} />,
      title: "🔒 Privat",
      sub: compact ? "nur ich" : "Nur ich sehe es. Bleibt lokal auf meinem Handy.",
    },
    {
      val: "celebrant",
      icon: <Heart size={compact ? 12 : 14} />,
      title: celebrantName
        ? `🎂 Für ${celebrantName}`
        : "🎂 Für das Geburtstagskind",
      sub: compact
        ? `nur ${celebrantName ?? "Geburtstagskind"} + ich`
        : `Ich + ${celebrantName ?? "das Geburtstagskind"} sehen es. Andere Reisende nicht.`,
      hide: hideCelebrant,
    },
    {
      val: "group",
      icon: <Users size={compact ? 12 : 14} />,
      title: "🌐 Ganze Gruppe",
      sub: compact ? "alle 5" : "Alle Mitglieder dieser Reise sehen es.",
    },
  ];

  return (
    <fieldset className="space-y-1.5">
      {!compact && (
        <legend className="text-[10px] uppercase tracking-wider text-ink-mid font-semibold mb-1.5">
          Wer darf dieses Foto sehen?
        </legend>
      )}
      {options
        .filter((o) => !o.hide)
        .map((o) => {
          const checked = value === o.val;
          return (
            <label
              key={o.val}
              className={classNames(
                "flex items-start gap-2.5 rounded-lg border cursor-pointer transition",
                compact ? "p-2" : "p-3",
                checked
                  ? "bg-gold/10 border-gold/50"
                  : "bg-white border-cream-300 hover:border-cream-400",
              )}
            >
              <input
                type="radio"
                name="visibility"
                value={o.val}
                checked={checked}
                onChange={() => onChange(o.val)}
                className="mt-0.5 w-4 h-4 accent-gold flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={classNames(
                    "font-semibold leading-tight",
                    compact ? "text-xs" : "text-sm",
                    checked ? "text-navy" : "text-ink-dark",
                  )}
                >
                  {o.title}
                </p>
                <p
                  className={classNames(
                    "text-ink-mid leading-relaxed",
                    compact ? "text-[10px]" : "text-[11px]",
                    "mt-0.5",
                  )}
                >
                  {o.sub}
                </p>
              </div>
            </label>
          );
        })}
    </fieldset>
  );
}

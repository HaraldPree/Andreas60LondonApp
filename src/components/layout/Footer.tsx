import { GoldDivider } from "@/components/ui/GoldDivider";

export function Footer() {
  return (
    <footer className="mt-12 pb-32 px-4">
      <div className="mx-auto max-w-app text-center">
        <GoldDivider width="sm" className="mx-auto mb-4" />
        <p className="font-display text-base text-navy font-semibold tracking-wide">
          ReiseCenter Mader·Kuoni
        </p>
        <a
          href="https://www.meinreisecenter.at"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-ink-mid hover:text-gold transition-colors mt-1"
        >
          www.meinreisecenter.at
        </a>
        <p className="text-xs text-ink-light mt-3">
          Ihr Reisebegleiter unterwegs – mit ♥ erstellt
        </p>
      </div>
    </footer>
  );
}

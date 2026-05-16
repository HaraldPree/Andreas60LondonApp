export function TransportTips() {
  const tips = [
    {
      icon: "🚌",
      title: "Bus",
      text: "Während Tube-Streik beste Alternative. Linien 11, 24, 88 decken die Innenstadt ab.",
    },
    {
      icon: "⛴️",
      title: "Uber Boat (Thames Clipper)",
      text: "Schöne und schnelle Verbindung entlang der Themse, von Putney bis Greenwich.",
    },
    {
      icon: "🚶",
      title: "Zu Fuß",
      text: "Vieles in Zone 1 ist 20–30 Min fußläufig. Bequeme Schuhe einpacken!",
    },
    {
      icon: "🚖",
      title: "Uber / Bolt",
      text: "Beide Apps funktionieren. Bei Streik etwas teurer durch erhöhte Nachfrage.",
    },
    {
      icon: "💳",
      title: "Contactless zahlen",
      text: "Bankkarte einfach beim Einsteigen tippen – günstiger als Tageskarte.",
    },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4">
      <h3 className="font-display text-base font-semibold text-navy mb-1">
        Transport-Tipps bei Tube-Streik
      </h3>
      <p className="text-xs text-ink-mid mb-3">
        Praktische Alternativen für entspanntes Reisen in London.
      </p>
      <ul className="space-y-3">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-xl flex-shrink-0">{tip.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-navy">{tip.title}</p>
              <p className="text-xs text-ink-mid leading-relaxed mt-0.5">
                {tip.text}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type PhraseCategory =
  | "greeting"
  | "restaurant"
  | "transport"
  | "shopping"
  | "smalltalk"
  | "emergency"
  | "health";

export interface Phrase {
  de: string;
  en: string;
  /** Approximate German phonetic pronunciation */
  pronunciation?: string;
  category: PhraseCategory;
}

export const PHRASE_CATEGORIES: Array<{
  key: PhraseCategory;
  label: string;
  icon: string;
}> = [
  { key: "greeting", label: "Begrüßung", icon: "👋" },
  { key: "restaurant", label: "Restaurant", icon: "🍽️" },
  { key: "transport", label: "Transport", icon: "🚇" },
  { key: "shopping", label: "Shopping", icon: "🛍️" },
  { key: "smalltalk", label: "Smalltalk", icon: "💬" },
  { key: "emergency", label: "Notfall", icon: "🚨" },
  { key: "health", label: "Gesundheit", icon: "💊" },
];

export const PHRASES: Phrase[] = [
  // Begrüßung
  {
    de: "Hallo / Guten Tag",
    en: "Hello / Good afternoon",
    pronunciation: "hellou / gud äfter-nuun",
    category: "greeting",
  },
  {
    de: "Bitte / Danke / Bitte sehr",
    en: "Please / Thank you / You're welcome",
    pronunciation: "pliis / sänk juu / jor wel-kam",
    category: "greeting",
  },
  {
    de: "Entschuldigung",
    en: "Excuse me / Sorry",
    pronunciation: "ex-kjuus mi / sori",
    category: "greeting",
  },
  {
    de: "Auf Wiedersehen",
    en: "Goodbye / See you later",
    pronunciation: "gud-bai / sii ju leita",
    category: "greeting",
  },
  {
    de: "Sprechen Sie Deutsch?",
    en: "Do you speak German?",
    pronunciation: "duu juu spiik dscherman",
    category: "greeting",
  },
  {
    de: "Ich verstehe nicht.",
    en: "I don't understand.",
    pronunciation: "ai dount anda-ständ",
    category: "greeting",
  },

  // Restaurant
  {
    de: "Einen Tisch für fünf Personen, bitte.",
    en: "A table for five, please.",
    pronunciation: "ä tejbl for faif, pliis",
    category: "restaurant",
  },
  {
    de: "Die Speisekarte, bitte.",
    en: "Could we see the menu, please?",
    pronunciation: "kud wi sii se menjuu, pliis",
    category: "restaurant",
  },
  {
    de: "Was empfehlen Sie?",
    en: "What do you recommend?",
    pronunciation: "wott duu juu re-ko-ménd",
    category: "restaurant",
  },
  {
    de: "Ich nehme das.",
    en: "I'll have this, please.",
    pronunciation: "ail häv siss, pliis",
    category: "restaurant",
  },
  {
    de: "Ein Glas Wasser, bitte.",
    en: "A glass of (still / sparkling) water, please.",
    pronunciation: "ä glas of still oder spar-kling wota",
    category: "restaurant",
  },
  {
    de: "Ich habe eine Allergie gegen …",
    en: "I'm allergic to …",
    pronunciation: "aim ä-lör-dschick tu",
    category: "restaurant",
  },
  {
    de: "Vegetarisch? Vegan?",
    en: "Vegetarian? Vegan?",
    pronunciation: "we-dschi-té-rian / wii-gän",
    category: "restaurant",
  },
  {
    de: "Die Rechnung, bitte.",
    en: "Could we get the bill, please?",
    pronunciation: "kud wii get se bill, pliis",
    category: "restaurant",
  },
  {
    de: "Getrennt zahlen, bitte.",
    en: "We'd like to split the bill, please.",
    pronunciation: "wiid laik tu split se bill",
    category: "restaurant",
  },

  // Transport
  {
    de: "Wo ist die nächste U-Bahn-Station?",
    en: "Where is the nearest tube station?",
    pronunciation: "wer iss se nirest tjuub stä-schen",
    category: "transport",
  },
  {
    de: "Eine Fahrkarte nach Liverpool Street, bitte.",
    en: "One single to Liverpool Street, please.",
    pronunciation: "wann sing-l tu liwa-puul striit",
    category: "transport",
  },
  {
    de: "Kann ich mit Karte zahlen?",
    en: "Can I pay by (contactless) card?",
    pronunciation: "kän ai pej bai con-täkt-läss kard",
    category: "transport",
  },
  {
    de: "Hält dieser Bus am Buckingham Palace?",
    en: "Does this bus stop at Buckingham Palace?",
    pronunciation: "dass siss bass stop ät baking-äm pä-läss",
    category: "transport",
  },
  {
    de: "Ich möchte hier aussteigen.",
    en: "I'd like to get off here.",
    pronunciation: "aid laik tu get off hir",
    category: "transport",
  },
  {
    de: "Können Sie mir ein Taxi rufen?",
    en: "Could you call me a taxi/cab, please?",
    pronunciation: "kud juu kohl mi ä täxi",
    category: "transport",
  },
  {
    de: "Bitte zur Adresse …",
    en: "Please take me to this address …",
    pronunciation: "pliis tejk mi tu siss äd-ress",
    category: "transport",
  },

  // Shopping
  {
    de: "Was kostet das?",
    en: "How much is this?",
    pronunciation: "hau matsch iss siss",
    category: "shopping",
  },
  {
    de: "Haben Sie das in einer anderen Größe?",
    en: "Do you have this in a different size?",
    pronunciation: "duu juu häv siss in ä dif-rent saiss",
    category: "shopping",
  },
  {
    de: "Kann ich das anprobieren?",
    en: "Can I try this on?",
    pronunciation: "kän ai trai siss onn",
    category: "shopping",
  },
  {
    de: "Ich schaue nur, danke.",
    en: "I'm just browsing, thank you.",
    pronunciation: "aim dschast brau-sing, sänk juu",
    category: "shopping",
  },
  {
    de: "Tax-Free-Formular, bitte.",
    en: "Could I get the VAT refund form, please?",
    pronunciation: "kud ai get se wett re-fand form",
    category: "shopping",
  },

  // Smalltalk
  {
    de: "Wir sind aus Österreich.",
    en: "We're from Austria.",
    pronunciation: "wir from ohss-tria",
    category: "smalltalk",
  },
  {
    de: "Es ist eine Geburtstagsreise.",
    en: "It's a birthday trip.",
    pronunciation: "its ä börs-dej trip",
    category: "smalltalk",
  },
  {
    de: "London ist wunderschön.",
    en: "London is beautiful.",
    pronunciation: "landn iss bjuu-ti-fl",
    category: "smalltalk",
  },
  {
    de: "Können Sie ein Foto machen?",
    en: "Could you take a picture of us, please?",
    pronunciation: "kud juu tejk ä pik-tscha of as",
    category: "smalltalk",
  },

  // Notfall
  {
    de: "Hilfe!",
    en: "Help!",
    pronunciation: "help",
    category: "emergency",
  },
  {
    de: "Bitte rufen Sie die Polizei!",
    en: "Please call the police!",
    pronunciation: "pliis kohl se pä-liis",
    category: "emergency",
  },
  {
    de: "Bitte rufen Sie einen Krankenwagen!",
    en: "Please call an ambulance!",
    pronunciation: "pliis kohl än äm-bju-läns",
    category: "emergency",
  },
  {
    de: "Ich habe meinen Pass verloren.",
    en: "I've lost my passport.",
    pronunciation: "aif lost mai pass-port",
    category: "emergency",
  },
  {
    de: "Ich habe meine Brieftasche verloren.",
    en: "I've lost my wallet.",
    pronunciation: "aif lost mai wol-let",
    category: "emergency",
  },
  {
    de: "Wo ist die österreichische Botschaft?",
    en: "Where is the Austrian Embassy?",
    pronunciation: "wer iss se ohs-trian em-bä-ssi",
    category: "emergency",
  },

  // Gesundheit
  {
    de: "Ich brauche einen Arzt.",
    en: "I need to see a doctor.",
    pronunciation: "ai niid tu sii ä dok-ta",
    category: "health",
  },
  {
    de: "Wo ist die nächste Apotheke?",
    en: "Where is the nearest pharmacy?",
    pronunciation: "wer iss se nirest far-mä-ssi",
    category: "health",
  },
  {
    de: "Ich habe Kopfschmerzen / Bauchweh / Fieber.",
    en: "I have a headache / stomach ache / fever.",
    pronunciation: "ai häv ä häd-ejk / sto-mäk ejk / fii-wa",
    category: "health",
  },
  {
    de: "Ich nehme dieses Medikament regelmäßig.",
    en: "I take this medication regularly.",
    pronunciation: "ai tejk siss medi-kej-schn re-gju-larli",
    category: "health",
  },
  {
    de: "Ich habe eine Allergie gegen Penicillin.",
    en: "I'm allergic to penicillin.",
    pronunciation: "aim ä-lör-dschick tu pe-ni-si-lin",
    category: "health",
  },
];

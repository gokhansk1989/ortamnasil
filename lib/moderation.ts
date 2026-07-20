const PROFANITY = [
  "amk", "aq", "amına", "amina", "ananı", "anani", "orospu", "piç", "pic",
  "sikeyim", "sikerim", "siktir", "yarrak", "yarrak", "göt", "got",
  "pezevenk", "ibne", "gavat", "kahpe", "şerefsiz", "serefsiz",
  "oç", "oc", "mk", "mq", "s2m", "s2k", "skim", "skm",
];

const PROFANITY_RE = new RegExp(
  PROFANITY.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i",
);

const TC_KIMLIK_RE = /\b\d{11}\b/;
const PHONE_RE = /\b0?\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

const NAME_PREFIXES = [
  "müdür", "mudur", "müdire", "hoca", "öğretmen", "ogretmen",
  "memur", "görevli", "gorevli", "abla", "abi",
];

const NAME_PATTERN_RE = new RegExp(
  `(${NAME_PREFIXES.join("|")})\\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,}`,
  "i",
);

const FULL_NAME_RE = /\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,}\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,}(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,})?\b/;

export interface ModerationResult {
  ok: boolean;
  reason?: string;
}

export function moderateText(text: string): ModerationResult {
  if (PROFANITY_RE.test(text)) {
    return { ok: false, reason: "Küfür veya hakaret içeriyor." };
  }

  if (TC_KIMLIK_RE.test(text)) {
    return { ok: false, reason: "TC kimlik numarası paylaşılamaz." };
  }

  if (PHONE_RE.test(text)) {
    return { ok: false, reason: "Telefon numarası paylaşılamaz." };
  }

  if (EMAIL_RE.test(text)) {
    return { ok: false, reason: "E-posta adresi paylaşılamaz." };
  }

  if (NAME_PATTERN_RE.test(text)) {
    return { ok: false, reason: "Personel ismi paylaşılamaz — unvan + ad kalıbı algılandı." };
  }

  const nameMatches = text.match(FULL_NAME_RE);
  if (nameMatches) {
    const common = [
      "Atatürk", "Türkiye", "İstanbul", "Ankara", "Google", "Netflix",
      "TikTok", "YouTube", "Instagram", "Twitter",
    ];
    const match = nameMatches[0];
    if (!common.some((c) => match.includes(c))) {
      return { ok: false, reason: "Kişi ismine benzeyen ifade var — lütfen isim kullanma." };
    }
  }

  return { ok: true };
}

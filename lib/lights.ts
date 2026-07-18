// OrtamNasıl? — Trafik ışığı skalası ve skorlama.
// TEK KAYNAK: Prototiplerde her .dc.html dosyası bu tabloyu kendi içinde
// kopyalıyordu ve renkler kayıyordu (bkz. TOKEN-INCONSISTENCIES.md).
// Üretimde ışıkla ilgili her şey buradan türetilir.

export type LightKey = "green" | "yellow" | "orange" | "red" | "gray";

export interface Light {
  key: LightKey;
  /** Rozet / kart etiketi ("Kapağı at" vb.) */
  label: string;
  /** Skalada geçen kısa espri alt yazısı */
  sub: string;
  /** Açık zemin (kart/liste) üzerindeki nokta rengi */
  dot: string;
  /** Koyu panel (#12312c) üzerindeki parlak/glow varyantı */
  dotBright: string;
  /** Açık zeminde rozet arka planı */
  badgeBg: string;
  /** Açık zeminde rozet yazı rengi */
  badgeFg: string;
}

// Sıralama: en iyiden en kötüye, gray en sonda.
export const LIGHTS: Record<LightKey, Light> = {
  green: {
    key: "green",
    label: "Kapağı at",
    sub: "Hemen, koşarak",
    dot: "#2eb586",
    dotBright: "#3ee6a8",
    badgeBg: "#e7f6ef",
    badgeFg: "#177a52",
  },
  yellow: {
    key: "yellow",
    label: "Para için değer",
    sub: "Duygular hariç",
    dot: "#e8b93c",
    dotBright: "#f0c554",
    badgeBg: "#fbf1db",
    badgeFg: "#96690f",
  },
  orange: {
    key: "orange",
    label: "Girmeden düşün",
    sub: "İki kere hem de",
    dot: "#eb8a4a",
    dotBright: "#eb8a4a",
    badgeBg: "#fdeadd",
    badgeFg: "#a55a1a",
  },
  red: {
    key: "red",
    label: "Kaçarak uzaklaş",
    sub: "Arkana bakma",
    dot: "#e05d4b",
    dotBright: "#f4674f",
    badgeBg: "#fbe7e3",
    badgeFg: "#b23a28",
  },
  gray: {
    key: "gray",
    label: "Yeterli veri yok",
    sub: "İçeride casusumuz yok",
    dot: "#7a8a86",
    dotBright: "#7a8a86",
    badgeBg: "#eef1f0",
    badgeFg: "#5a6a66",
  },
};

/** Skalada gösterim sırası (Ana Sayfa koyu kart). */
export const LIGHT_ORDER: LightKey[] = ["red", "orange", "yellow", "green", "gray"];

// --- Skorlama ---------------------------------------------------------------

/**
 * Anket cevabı: A = 1, B = 0, pas = null.
 * Tek kaynak: hem Anket ekranı hem yurt toplam skoru bu eşikleri kullanır.
 */
export type Answer = 1 | 0 | null;

/** Sayılan (pas olmayan) cevapların oranı; hiç cevap yoksa null. */
export function ratioOf(answers: Answer[]): number | null {
  const counted = answers.filter((v): v is 0 | 1 => v !== null);
  if (counted.length === 0) return null;
  return counted.reduce<number>((t, v) => t + v, 0) / counted.length;
}

/**
 * Oran → ışık. Eşikler README ile birebir:
 *   ≥0.8 yeşil · 0.6–0.8 sarı · 0.4–0.6 turuncu · <0.4 kırmızı · null gri
 */
export function lightFromRatio(ratio: number | null): LightKey {
  if (ratio === null) return "gray";
  if (ratio >= 0.8) return "green";
  if (ratio >= 0.6) return "yellow";
  if (ratio >= 0.4) return "orange";
  return "red";
}

/** Bir anketin sonucunu doğrudan cevaplardan hesaplar. */
export function scoreSurvey(answers: Answer[]): LightKey {
  return lightFromRatio(ratioOf(answers));
}

/**
 * Yurt toplam ışığı: anket oranlarının ortalamasına aynı eşikler uygulanır
 * ("eşikler anketteki oranlarla aynı" — README). Hiç anket yoksa gri.
 */
export function companyLight(surveyRatios: (number | null)[]): LightKey {
  const valid = surveyRatios.filter((r): r is number => r !== null);
  if (valid.length === 0) return "gray";
  return lightFromRatio(valid.reduce((t, r) => t + r, 0) / valid.length);
}

/** Kart alt satırındaki 5 çubuklu mini skor için doluluk (0–5). */
export function scoreBars(light: LightKey): number {
  return { green: 5, yellow: 3, orange: 2, red: 1, gray: 0 }[light];
}

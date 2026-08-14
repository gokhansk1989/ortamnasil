import { ALL_DORMS, STATS, type Dorm } from "./dorms";
import { LIGHTS, type LightKey } from "./lights";

export interface DormCardData {
  id: string;
  name: string;
  initial: string;
  logoBg: string;
  logoFg: string;
  sector: string;
  reviewCount: number;
  light: LightKey;
  quote: string;
  author: string;
  when: string;
}

export interface TickerItem {
  dot: string;
  who: string;
  what: string;
}

const NICKS = [
  "GeceKuşuKirpi", "UykusuzBaykuş", "SessizFlamingoX", "KaçakÇaycı",
  "SabırlıAhtapot", "GizliVizyoner", "YorgunUnicorn", "MesaideKayıp",
];

const QUOTES = [
  "Yemek gerçekten doyuruyor, beklemiyordum.",
  "Temiz ve merkezi ama oda biraz kalabalık.",
  "Giriş saati 24 saat serbest, süper.",
  "Kışın botla uyuyorsun, internet de story çekmiyor.",
  "Oda arkadaşım denk geldi, yönetim ilgili.",
  "Kampüse 5 dakika dediler; yürüyerek destan.",
  "Yemekhaneye dua ederek gir.",
  "Fiyatına göre gayet makul.",
  "İnternet ödev çeker, kütüphaneye inmeye gerek yok.",
  "Isınma sorunu var, battaniyeyi kat kat ser.",
];

const WHENS = ["2 gün önce", "5 saat önce", "dün", "3 gün önce", "1 hafta önce", "az önce"];

const PALETTE: Record<string, { bg: string; fg: string }> = {
  KYK: { bg: "#e8f3f0", fg: "#0d7a6f" },
  Özel: { bg: "#fdf3e4", fg: "#b07d1e" },
};

function dormToCard(d: Dorm, i: number): DormCardData {
  const pal = PALETTE[d.type] || PALETTE.Özel;
  return {
    id: d.id,
    name: d.name,
    initial: d.name.charAt(0).toLocaleUpperCase("tr"),
    logoBg: pal.bg,
    logoFg: pal.fg,
    sector: `${d.type} · ${d.city}`,
    reviewCount: d.reviewCount,
    light: d.light,
    quote: `"${QUOTES[i % QUOTES.length]}"`,
    author: NICKS[i % NICKS.length],
    when: WHENS[i % WHENS.length],
  };
}

const featured = ALL_DORMS
  .filter((d) => d.reviewCount > 20)
  .sort((a, b) => b.reviewCount - a.reviewCount)
  .slice(0, 6);

export const dorms: DormCardData[] = featured.map(dormToCard);

export const ticker: TickerItem[] = [
  { dot: "#2eb586", who: "SabırlıAhtapot", what: "bir KYK yurduna yeşil ışık yaktı" },
  { dot: "#e05d4b", who: "KaçakÇaycı", what: "bir özel yurda kırmızı ışık yaktı" },
  { dot: "#7a8a86", who: "GizliVizyoner", what: "yeni yurt ekledi ✂️" },
  { dot: "#e8b93c", who: "YorgunUnicorn", what: "'yemekhaneye dua ederek gir' dedi" },
];

export const sectors = ["Tümü", "KYK", "Özel"];

export const stats = [
  { value: STATS.totalDorms.toLocaleString("tr"), label: "yurt dosyalandı" },
  { value: "8.917", label: "anonim itiraf" },
  { value: "312", label: "\"uzak dur\" verildi" },
  { value: "0", label: "gerçek isim sızdırıldı", highlight: true },
];

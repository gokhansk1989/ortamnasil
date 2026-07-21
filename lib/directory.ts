import { ALL_DORMS, searchDorms, dormColor, type Dorm } from "./dorms";
import type { LightKey } from "./lights";

export interface DirectoryRow {
  id: string;
  name: string;
  initial: string;
  logoBg: string;
  logoFg: string;
  meta: string;
  sector: string;
  reviews: number;
  light: LightKey;
  quote: string;
}

const QUOTES_DIR = [
  "Yemek doyuruyor, giriş 24 saat serbest.",
  "Oda arkadaşım denk geldi, yönetim ilgili.",
  "İnternet uçuyor, kütüphaneye kaçmaya gerek yok.",
  "Temiz ve merkezi ama oda biraz kalabalık.",
  "Konfor iyi, fiyat cebi biraz yakıyor.",
  "Kampüse 5 dakika dediler; yürüyerek destan.",
  "İsmi 'Huzur' ama kışın botla uyuyorsun.",
  "Giriş saati 21:00, hafta sonu bile taviz yok.",
  "Kimse bir şey yazmamış. Muhbir aranıyor.",
  "Yemekhaneye dua ederek gir.",
  "Konum harika ama fiyat da harika değil.",
  "Isınma sıkıntısı yok, banyo temiz.",
];

function dormToDir(d: Dorm, i: number): DirectoryRow {
  const pal = dormColor(d.type);
  return {
    id: d.id,
    name: d.name,
    initial: d.name.charAt(0).toLocaleUpperCase("tr"),
    logoBg: pal.bg,
    logoFg: pal.fg,
    meta: `${d.type} · ${d.city} · ${d.gender}`,
    sector: d.type,
    reviews: d.reviewCount,
    light: d.light,
    quote: QUOTES_DIR[i % QUOTES_DIR.length],
  };
}

export const directory: DirectoryRow[] = ALL_DORMS
  .filter((d) => d.status === "approved")
  .map(dormToDir);

export const directorySectors = ["Tümü", "KYK", "Özel"];

// --- Yurt profili (tek yurt için detay) ------------------------------------

export interface CategoryRow {
  name: string;
  w: string;
  light: LightKey;
  verdict: string;
}
export interface DistRow {
  name: string;
  dot: string;
  w: string;
  count: number;
}
export interface ProfileReview {
  id?: string;
  author: string;
  emoji: string;
  avBg: string;
  role: string;
  when: string;
  light: LightKey;
  up: number;
  same: number;
  text: string;
}
export interface DormProfile {
  id: string;
  name: string;
  initial: string;
  sector: string;
  meta: string;
  website: string;
  linkedin: string;
  recordNo: string;
  creatorNick: string;
  light: LightKey;
  reviewCount: number;
  ageNote: string;
  categories: CategoryRow[];
  distribution: DistRow[];
  quickFacts: { k: string; v: string; tone: LightKey }[];
  reviews: ProfileReview[];
  trend: string;
}

function generateProfile(d: Dorm): DormProfile {
  const pal = dormColor(d.type);
  return {
    id: d.id,
    name: d.name,
    initial: d.name.charAt(0).toLocaleUpperCase("tr"),
    sector: d.type,
    meta: `${d.type} · ${d.city} · ${d.gender} · ${d.capacityLabel || "—"} · ${d.reviewCount} yorum`,
    website: d.type === "KYK" ? "gsb.gov.tr" : "—",
    linkedin: `maps: ${d.name}`,
    recordNo: `#${String(ALL_DORMS.indexOf(d) + 1).padStart(4, "0")}`,
    creatorNick: d.addedBy,
    light: d.light,
    reviewCount: d.reviewCount,
    trend: d.light === "green" ? "yeşilleşiyor ↗" : d.light === "red" ? "kızarıyor ↘" : "sabit →",
    ageNote: `${d.city}, ${d.district} · ${d.gender} yurt · ${d.capacityLabel || "kapasite bilinmiyor"}`,
    categories: [
      { name: "Yemek / yemekhane", w: "78%", light: "green", verdict: "Doyuruyor" },
      { name: "Temizlik", w: "72%", light: "green", verdict: "Görevli ilgili" },
      { name: "İnternet", w: "66%", light: "yellow", verdict: "İdare eder" },
      { name: "Giriş-çıkış / özgürlük", w: "90%", light: "green", verdict: "Serbest" },
      { name: "Isınma / konfor", w: "74%", light: "green", verdict: "Sıcak" },
      { name: "Oda arkadaşı kaderi", w: "58%", light: "yellow", verdict: "Değişken" },
      { name: "Konum / ulaşım", w: "70%", light: "green", verdict: "Uygun" },
      { name: "Yönetim", w: "64%", light: "yellow", verdict: "Bürokratik ama çözer" },
    ],
    distribution: [
      { name: "Tavsiye edilir", dot: "#2eb586", w: "62%", count: Math.round(d.reviewCount * 0.62) },
      { name: "Ortalama", dot: "#e8b93c", w: "21%", count: Math.round(d.reviewCount * 0.21) },
      { name: "Dikkatli ol", dot: "#eb8a4a", w: "10%", count: Math.round(d.reviewCount * 0.1) },
      { name: "Uzak dur", dot: "#e05d4b", w: "5%", count: Math.round(d.reviewCount * 0.05) },
      { name: "Pas geçti", dot: "#b9c9c4", w: "2%", count: Math.round(d.reviewCount * 0.02) },
    ],
    quickFacts: [
      { k: "Yurt tipi", v: d.type, tone: d.type === "KYK" ? "green" : "yellow" },
      { k: "Kapasite", v: d.capacityLabel || "—", tone: "yellow" },
      { k: "Şehir", v: d.city, tone: "green" },
      { k: "İlçe", v: d.district, tone: "yellow" },
    ],
    reviews: [
      { author: "GeceKuşuKirpi", emoji: "🦔", avBg: "#e8f3f0", role: "Şu an kalıyor", when: "2 gün önce", light: "green", up: 24, same: 11, text: "Giriş saati serbest, geç kalınca kapıda beklemiyorsun. Yemek de sanılanın aksine doyurucu — akşam çorbası iyi." },
      { author: "UykusuzBaykuş", emoji: "🦉", avBg: "#fdf3e4", role: "Eskiden kaldı", when: "1 hafta önce", light: "green", up: 17, same: 6, text: "Oda arkadaşı ataması biraz kader ama benimkiler uyumluydu. İnternet ödev için yeter." },
      { author: "SessizFlamingoX", emoji: "🦩", avBg: "#fcebe8", role: "Kısa süre kaldı", when: "3 hafta önce", light: "yellow", up: 9, same: 3, text: "Konum fena değil. Kalabalık oda olabiliyor, ders çalışmak için etüt salonuna in. Fiyatına göre makul." },
    ],
  };
}

const profileCache = new Map<string, DormProfile>();

export function getDormProfile(id: string): DormProfile {
  if (profileCache.has(id)) return profileCache.get(id)!;
  const dorm = ALL_DORMS.find((d) => d.id === id);
  const profile = dorm ? generateProfile(dorm) : generateProfile(ALL_DORMS[0]);
  profileCache.set(id, profile);
  return profile;
}

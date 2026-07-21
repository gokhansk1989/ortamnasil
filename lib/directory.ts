import { ALL_DORMS, dormColor, type Dorm } from "./dorms";
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
}

function dormToDir(d: Dorm): DirectoryRow {
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
  };
}

export const directory: DirectoryRow[] = ALL_DORMS
  .filter((d) => d.status === "approved")
  .map(dormToDir);

export const directorySectors = ["Tümü", "KYK", "Özel"];

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
    trend: "Henüz veri yok",
    ageNote: `${d.city}, ${d.district} · ${d.gender} yurt · ${d.capacityLabel || "kapasite bilinmiyor"}`,
    categories: [],
    distribution: [
      { name: "Tavsiye edilir", dot: "#2eb586", w: "0%", count: 0 },
      { name: "Ortalama", dot: "#e8b93c", w: "0%", count: 0 },
      { name: "Dikkatli ol", dot: "#eb8a4a", w: "0%", count: 0 },
      { name: "Uzak dur", dot: "#e05d4b", w: "0%", count: 0 },
      { name: "Pas geçti", dot: "#b9c9c4", w: "0%", count: 0 },
    ],
    quickFacts: [
      { k: "Yurt tipi", v: d.type, tone: d.type === "KYK" ? "green" : "yellow" },
      { k: "Kapasite", v: d.capacityLabel || "—", tone: "yellow" },
      { k: "Şehir", v: d.city, tone: "green" },
      { k: "İlçe", v: d.district, tone: "yellow" },
    ],
    reviews: [],
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

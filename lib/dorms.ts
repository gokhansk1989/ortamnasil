import type { LightKey } from "./lights";
import rawDorms from "@/data/dorms.json";

export interface Dorm {
  id: string;
  name: string;
  city: string;
  district: string;
  gender: "Kız" | "Erkek" | "Karma";
  type: "KYK" | "Özel";
  capacity: number;
  capacityLabel: string;
  light: LightKey;
  reviewCount: number;
  status: "approved" | "pending" | "rejected";
  addedAt: string;
  addedBy: string;
}

const NICKS = [
  "GeceKuşuKirpi", "UykusuzBaykuş", "SessizFlamingoX", "KaçakÇaycı",
  "SabırlıAhtapot", "GizliVizyoner", "YorgunUnicorn", "MesaideKayıp",
  "PasifAgresifPanda", "KızgınKanguru7", "ÜşüyenBalık", "SinirliPenguen42",
];

const LIGHTS: LightKey[] = ["green", "green", "green", "yellow", "yellow", "orange", "red", "gray"];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const PALETTE: Record<string, { bg: string; fg: string }> = {
  KYK: { bg: "#e8f3f0", fg: "#0d7a6f" },
  Özel: { bg: "#fdf3e4", fg: "#b07d1e" },
};

function buildDorm(raw: (typeof rawDorms)[number], index: number): Dorm {
  const rand = seededRandom(hashStr(raw.id));
  const light = LIGHTS[Math.floor(rand() * LIGHTS.length)];
  const reviewCount = light === "gray" ? Math.floor(rand() * 3) : Math.floor(rand() * 180) + 3;
  const daysAgo = Math.floor(rand() * 365);
  const date = new Date(2026, 6, 18);
  date.setDate(date.getDate() - daysAgo);

  return {
    ...raw,
    gender: raw.gender as Dorm["gender"],
    type: raw.type as Dorm["type"],
    light,
    reviewCount,
    status: "approved",
    addedAt: date.toISOString().slice(0, 10),
    addedBy: NICKS[index % NICKS.length],
  };
}

export const ALL_DORMS: Dorm[] = rawDorms.map(buildDorm);

export const CITIES = [...new Set(ALL_DORMS.map((d) => d.city))].sort(
  (a, b) => a.localeCompare(b, "tr"),
);

export const DORM_TYPES = ["Tümü", "KYK", "Özel"] as const;
export const GENDERS = ["Tümü", "Kız", "Erkek", "Karma"] as const;

export function getDorm(id: string): Dorm | undefined {
  return ALL_DORMS.find((d) => d.id === id);
}

export function searchDorms(query: string, type?: string, city?: string, gender?: string): Dorm[] {
  const q = query.trim().toLocaleLowerCase("tr");
  return ALL_DORMS.filter(
    (d) =>
      d.status === "approved" &&
      (!q || d.name.toLocaleLowerCase("tr").includes(q) || d.city.toLocaleLowerCase("tr").includes(q)) &&
      (!type || type === "Tümü" || d.type === type) &&
      (!city || city === "Tümü" || d.city === city) &&
      (!gender || gender === "Tümü" || d.gender === gender),
  );
}

export function dormColor(type: string) {
  return PALETTE[type] || PALETTE.Özel;
}

export const STATS = {
  totalDorms: ALL_DORMS.length,
  totalKYK: ALL_DORMS.filter((d) => d.type === "KYK").length,
  totalOzel: ALL_DORMS.filter((d) => d.type === "Özel").length,
  totalCities: CITIES.length,
};

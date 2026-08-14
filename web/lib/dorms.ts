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

const PALETTE: Record<string, { bg: string; fg: string }> = {
  KYK: { bg: "#e8f3f0", fg: "#0d7a6f" },
  Özel: { bg: "#fdf3e4", fg: "#b07d1e" },
};

function buildDorm(raw: (typeof rawDorms)[number]): Dorm {
  return {
    ...raw,
    gender: raw.gender as Dorm["gender"],
    type: raw.type as Dorm["type"],
    light: "gray" as LightKey,
    reviewCount: 0,
    status: "approved",
    addedAt: "2026-07-18",
    addedBy: "sistem",
  };
}

export const ALL_DORMS: Dorm[] = rawDorms.map((raw) => buildDorm(raw));

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

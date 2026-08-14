"use client";

import { useMemo, useState, useEffect } from "react";

export interface DormOption {
  id: string;
  name: string;
  city: string;
  district: string | null;
  gender: string;
  type: string;
}

interface Props {
  onSelect: (dorm: DormOption) => void;
  selected?: string;
}

const GENDER_LABELS: Record<string, string> = { MALE: "Erkek", FEMALE: "Kız", MIXED: "Karma" };
const TYPE_LABELS: Record<string, string> = { KYK: "KYK", PRIVATE: "Özel", APART: "Apart" };

export function DormSelector({ onSelect, selected }: Props) {
  const [allDorms, setAllDorms] = useState<DormOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [dormId, setDormId] = useState(selected || "");

  useEffect(() => {
    fetch("/api/yurtlar?slim=1")
      .then((r) => r.json())
      .then((data) => {
        setAllDorms(
          (data.dorms || []).map((d: Record<string, string | null>) => ({
            id: d.id,
            name: d.name,
            city: d.city,
            district: d.district,
            gender: d.gender,
            type: d.type,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cities = useMemo(
    () => [...new Set(allDorms.map((d) => d.city))].sort((a, b) => a.localeCompare(b, "tr")),
    [allDorms],
  );

  const districts = useMemo(() => {
    if (!city) return [];
    return [...new Set(allDorms.filter((d) => d.city === city).map((d) => d.district || ""))].filter(Boolean).sort(
      (a, b) => a.localeCompare(b, "tr"),
    );
  }, [allDorms, city]);

  const dorms = useMemo(() => {
    if (!city) return [];
    return allDorms
      .filter((d) => d.city === city && (!district || d.district === district))
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [allDorms, city, district]);

  useEffect(() => {
    setDistrict("");
    setDormId("");
  }, [city]);

  useEffect(() => {
    setDormId("");
  }, [district]);

  function handleDormChange(id: string) {
    setDormId(id);
    const dorm = allDorms.find((d) => d.id === id);
    if (dorm) onSelect(dorm);
  }

  const selectClass =
    "w-full rounded-xl border-2 border-line bg-card px-3.5 py-3.5 text-[15px] text-ink outline-none transition-colors focus:border-primary/40";

  if (loading) {
    return <div className="py-4 text-center text-sm text-faint animate-pulse">Yurtlar yükleniyor...</div>;
  }

  return (
    <div className="grid gap-3">
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">İl</label>
        <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
          <option value="">İl seç...</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {city && districts.length > 1 && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">İlçe</label>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className={selectClass}>
            <option value="">Tüm ilçeler</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      {city && dorms.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">
            Yurt <span className="font-normal text-faint">({dorms.length} yurt)</span>
          </label>
          <select value={dormId} onChange={(e) => handleDormChange(e.target.value)} className={selectClass}>
            <option value="">Yurt seç...</option>
            {dorms.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({GENDER_LABELS[d.gender] || d.gender} · {TYPE_LABELS[d.type] || d.type})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

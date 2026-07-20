"use client";

import { useMemo, useState, useEffect } from "react";
import { ALL_DORMS, type Dorm } from "@/lib/dorms";

interface Props {
  onSelect: (dorm: Dorm) => void;
  selected?: string;
}

export function DormSelector({ onSelect, selected }: Props) {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [dormId, setDormId] = useState(selected || "");

  const cities = useMemo(
    () => [...new Set(ALL_DORMS.map((d) => d.city))].sort((a, b) => a.localeCompare(b, "tr")),
    [],
  );

  const districts = useMemo(() => {
    if (!city) return [];
    return [...new Set(ALL_DORMS.filter((d) => d.city === city).map((d) => d.district))].sort(
      (a, b) => a.localeCompare(b, "tr"),
    );
  }, [city]);

  const dorms = useMemo(() => {
    if (!city) return [];
    return ALL_DORMS.filter(
      (d) => d.city === city && (!district || d.district === district),
    ).sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [city, district]);

  useEffect(() => {
    setDistrict("");
    setDormId("");
  }, [city]);

  useEffect(() => {
    setDormId("");
  }, [district]);

  function handleDormChange(id: string) {
    setDormId(id);
    const dorm = ALL_DORMS.find((d) => d.id === id);
    if (dorm) onSelect(dorm);
  }

  const selectClass =
    "w-full rounded-xl border-2 border-line bg-card px-3.5 py-3.5 text-[15px] text-ink outline-none transition-colors focus:border-primary/40";

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
                {d.name} ({d.gender} · {d.type})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

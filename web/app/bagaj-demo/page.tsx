"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { RearCrossSection, SideCrossSection } from "./components/CrossSectionView";

const TrunkScene = dynamic(() => import("./components/TrunkScene"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] flex items-center justify-center text-muted text-sm">
      3D model yükleniyor...
    </div>
  ),
});

/* ─── Veri modeli ─── */
interface TrunkData {
  name: string;
  year: number;
  type: "sedan" | "suv" | "hatchback";
  vol: number;
  botW: number;
  topW: number;
  botD: number;
  topD: number;
  hL: number;
  hR: number;
  hC: number;
  archW: number;
  archH: number;
  archD: number;
  lipH: number;
}

interface ItemData {
  name: string;
  w: number;
  h: number;
  d: number;
  icon: string;
}

const CARS: TrunkData[] = [
  { name: "Toyota Corolla", year: 2024, type: "sedan", vol: 470, botW: 101, topW: 82, botD: 73, topD: 52, hL: 48, hR: 48, hC: 50, archW: 14, archH: 16, archD: 30, lipH: 5 },
  { name: "VW Golf 8", year: 2024, type: "hatchback", vol: 381, botW: 100, topW: 78, botD: 68, topD: 48, hL: 55, hR: 55, hC: 60, archW: 12, archH: 14, archD: 28, lipH: 18 },
  { name: "Hyundai Tucson", year: 2024, type: "suv", vol: 620, botW: 107, topW: 95, botD: 82, topD: 65, hL: 68, hR: 68, hC: 72, archW: 13, archH: 15, archD: 32, lipH: 20 },
  { name: "BMW 3 Serisi", year: 2024, type: "sedan", vol: 480, botW: 112, topW: 86, botD: 76, topD: 50, hL: 46, hR: 46, hC: 48, archW: 15, archH: 18, archD: 32, lipH: 4 },
  { name: "Skoda Octavia", year: 2024, type: "sedan", vol: 600, botW: 110, topW: 92, botD: 80, topD: 62, hL: 56, hR: 56, hC: 58, archW: 12, archH: 14, archD: 30, lipH: 16 },
  { name: "Peugeot 3008", year: 2024, type: "suv", vol: 520, botW: 108, topW: 90, botD: 78, topD: 58, hL: 65, hR: 65, hC: 68, archW: 14, archH: 16, archD: 34, lipH: 19 },
  { name: "Renault Megane", year: 2024, type: "hatchback", vol: 384, botW: 103, topW: 80, botD: 70, topD: 50, hL: 52, hR: 52, hC: 53, archW: 13, archH: 15, archD: 28, lipH: 17 },
  { name: "Mercedes C-Serisi", year: 2024, type: "sedan", vol: 455, botW: 110, topW: 84, botD: 78, topD: 52, hL: 47, hR: 47, hC: 50, archW: 15, archH: 17, archD: 33, lipH: 5 },
  { name: "Kia Sportage", year: 2024, type: "suv", vol: 591, botW: 106, topW: 93, botD: 82, topD: 63, hL: 67, hR: 67, hC: 70, archW: 13, archH: 15, archD: 31, lipH: 19 },
  { name: "Ford Focus", year: 2024, type: "hatchback", vol: 375, botW: 100, topW: 79, botD: 72, topD: 50, hL: 53, hR: 53, hC: 55, archW: 12, archH: 14, archD: 27, lipH: 16 },
];

const ITEMS: ItemData[] = [
  { name: "Kabin bavul", w: 55, h: 40, d: 20, icon: "S" },
  { name: "Büyük bavul", w: 75, h: 52, d: 30, icon: "L" },
  { name: "Bebek arabası", w: 90, h: 60, d: 40, icon: "B" },
  { name: "Golf çantası", w: 130, h: 30, d: 25, icon: "G" },
  { name: "Katlanır bisiklet", w: 80, h: 65, d: 35, icon: "K" },
  { name: "Kamp çadırı", w: 60, h: 20, d: 20, icon: "C" },
  { name: "Elektrik süpürgesi", w: 40, h: 30, d: 30, icon: "E" },
  { name: "Kedi taşıma çantası", w: 48, h: 32, d: 30, icon: "P" },
];

const TYPE_LABELS = { sedan: "Sedan", suv: "SUV", hatchback: "Hatchback" };

function checkFit(car: TrunkData, item: ItemData): "yes" | "tight" | "no" {
  const dims = [car.botW, car.hC, car.botD].sort((a, b) => b - a);
  const idims = [item.w, item.h, item.d].sort((a, b) => b - a);
  if (idims[0] > dims[0] || idims[1] > dims[1] || idims[2] > dims[2]) return "no";
  const usableW = car.botW - 2 * car.archW;
  if (idims[0] > usableW && idims[0] > car.topW) return "no";
  const margin = Math.min(dims[0] - idims[0], dims[1] - idims[1], dims[2] - idims[2]);
  return margin < 8 ? "tight" : "yes";
}

export default function BagajDemo() {
  const [car1Idx, setCar1Idx] = useState(0);
  const [car2Idx, setCar2Idx] = useState(2);
  const [tab, setTab] = useState<"compare" | "fit">("compare");

  const car1 = CARS[car1Idx];
  const car2 = CARS[car2Idx];

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="bg-ink text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">B</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">BagajKaç?</h1>
              <p className="text-[11px] text-onDarkMuted leading-tight">Araç bagaj hacmi karşılaştırma</p>
            </div>
          </div>
          <span className="text-[10px] bg-primary/20 text-primary-light px-2.5 py-0.5 rounded-pill font-semibold tracking-wider">DEMO</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Araç seçimi */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CarSelector label="1. Araç" value={car1Idx} onChange={setCar1Idx} accent="primary" />
          <CarSelector label="2. Araç" value={car2Idx} onChange={setCar2Idx} accent="teal" />
        </section>

        {/* Tab */}
        <div className="flex gap-1 bg-surface rounded-2xl p-1 w-fit">
          {(["compare", "fit"] as const).map((t) => (
            <button
              key={t}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? "bg-white text-ink shadow-sm" : "text-muted hover:text-body"}`}
              onClick={() => setTab(t)}
            >
              {t === "compare" ? "Karşılaştır" : "Sığar mı?"}
            </button>
          ))}
        </div>

        {tab === "compare" ? (
          <>
            {/* 3D modeller */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-card border border-line overflow-hidden">
                <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold">{car1.name}</span>
                    <span className="text-xs text-muted ml-2">{car1.vol}L</span>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-pill font-medium">{TYPE_LABELS[car1.type]}</span>
                </div>
                <Suspense fallback={<div className="h-[320px] flex items-center justify-center text-muted text-sm">Yükleniyor...</div>}>
                  <TrunkScene car={car1} color="#F97316" />
                </Suspense>
                <div className="px-4 pb-3">
                  <p className="text-[10px] text-faint text-center mb-2">Döndürmek için sürükle, yakınlaştır için scroll</p>
                  <div className="grid grid-cols-4 gap-2">
                    <Stat label="Alt gen." value={`${car1.botW}`} unit="cm" />
                    <Stat label="Üst gen." value={`${car1.topW}`} unit="cm" />
                    <Stat label="Yükseklik" value={`${car1.hC}`} unit="cm" />
                    <Stat label="Derinlik" value={`${car1.botD}`} unit="cm" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-card border border-line overflow-hidden">
                <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold">{car2.name}</span>
                    <span className="text-xs text-muted ml-2">{car2.vol}L</span>
                  </div>
                  <span className="text-[10px] bg-teal/10 text-teal px-2 py-0.5 rounded-pill font-medium">{TYPE_LABELS[car2.type]}</span>
                </div>
                <Suspense fallback={<div className="h-[320px] flex items-center justify-center text-muted text-sm">Yükleniyor...</div>}>
                  <TrunkScene car={car2} color="#0D9488" />
                </Suspense>
                <div className="px-4 pb-3">
                  <p className="text-[10px] text-faint text-center mb-2">Döndürmek için sürükle, yakınlaştır için scroll</p>
                  <div className="grid grid-cols-4 gap-2">
                    <Stat label="Alt gen." value={`${car2.botW}`} unit="cm" />
                    <Stat label="Üst gen." value={`${car2.topW}`} unit="cm" />
                    <Stat label="Yükseklik" value={`${car2.hC}`} unit="cm" />
                    <Stat label="Derinlik" value={`${car2.botD}`} unit="cm" />
                  </div>
                </div>
              </div>
            </section>

            {/* Kesit görünümleri */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-card border border-line p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Arkadan kesit — {car1.name}</h3>
                </div>
                <RearCrossSection car={car1} color="#F97316" />
              </div>
              <div className="bg-white rounded-card border border-line p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-teal" />
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Yandan profil — {car2.name}</h3>
                </div>
                <SideCrossSection car={car2} color="#0D9488" />
              </div>
            </section>

            {/* Boyut karşılaştırma */}
            <section className="bg-white rounded-card border border-line p-5">
              <h2 className="text-sm font-semibold mb-4">Boyut karşılaştırması</h2>
              <div className="space-y-2.5">
                {[
                  { label: "Alt genişlik", k: "botW" as const, unit: "cm" },
                  { label: "Üst genişlik", k: "topW" as const, unit: "cm" },
                  { label: "Zemin derinlik", k: "botD" as const, unit: "cm" },
                  { label: "Üst derinlik", k: "topD" as const, unit: "cm" },
                  { label: "Yükseklik", k: "hC" as const, unit: "cm" },
                  { label: "Hacim", k: "vol" as const, unit: "L" },
                ].map((m) => {
                  const v1 = car1[m.k], v2 = car2[m.k];
                  const max = Math.max(v1, v2);
                  const diff = v1 - v2;
                  return (
                    <div key={m.k} className="flex items-center gap-3">
                      <span className="text-[11px] text-muted w-24 shrink-0 text-right">{m.label}</span>
                      <div className="flex-1 flex gap-1.5 items-center">
                        <div className="flex-1 bg-line/60 rounded-lg h-7 overflow-hidden">
                          <div
                            className="h-full rounded-lg flex items-center justify-end pr-2.5 text-[10px] font-semibold text-white transition-all duration-700 ease-out"
                            style={{ width: `${(v1 / max) * 100}%`, background: "linear-gradient(90deg, #FB923C, #F97316)" }}
                          >
                            {v1}{m.unit}
                          </div>
                        </div>
                        <div className="flex-1 bg-line/60 rounded-lg h-7 overflow-hidden">
                          <div
                            className="h-full rounded-lg flex items-center justify-end pr-2.5 text-[10px] font-semibold text-white transition-all duration-700 ease-out"
                            style={{ width: `${(v2 / max) * 100}%`, background: "linear-gradient(90deg, #2DD4BF, #0D9488)" }}
                          >
                            {v2}{m.unit}
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold w-10 text-right ${diff > 0 ? "text-primary" : diff < 0 ? "text-teal" : "text-faint"}`}>
                          {diff > 0 ? `+${diff}` : diff === 0 ? "=" : diff}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-6 justify-center mt-4 pt-3 border-t border-line/50">
                <Legend color="bg-primary" label={car1.name} />
                <Legend color="bg-teal" label={car2.name} />
              </div>
            </section>

            {/* Detaylı ölçüm tablosu */}
            <section className="bg-white rounded-card border border-line p-5">
              <h2 className="text-sm font-semibold mb-4">Detaylı ölçümler (12 nokta)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left py-2 text-[11px] text-muted font-semibold uppercase tracking-wider">Ölçüm</th>
                      <th className="text-center py-2 text-[11px] text-primary font-semibold">{car1.name}</th>
                      <th className="text-center py-2 text-[11px] text-teal font-semibold">{car2.name}</th>
                      <th className="text-center py-2 text-[11px] text-muted font-semibold">Fark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Alt genişlik", v1: car1.botW, v2: car2.botW, u: "cm" },
                      { label: "Üst genişlik", v1: car1.topW, v2: car2.topW, u: "cm" },
                      { label: "Zemin derinlik", v1: car1.botD, v2: car2.botD, u: "cm" },
                      { label: "Üst derinlik", v1: car1.topD, v2: car2.topD, u: "cm" },
                      { label: "Sol yükseklik", v1: car1.hL, v2: car2.hL, u: "cm" },
                      { label: "Sağ yükseklik", v1: car1.hR, v2: car2.hR, u: "cm" },
                      { label: "Orta yükseklik", v1: car1.hC, v2: car2.hC, u: "cm" },
                      { label: "Eşik yüksekliği", v1: car1.lipH, v2: car2.lipH, u: "cm" },
                      { label: "Tekerlek kutusu gen.", v1: car1.archW, v2: car2.archW, u: "cm" },
                      { label: "Tekerlek kutusu yük.", v1: car1.archH, v2: car2.archH, u: "cm" },
                      { label: "Tekerlek kutusu der.", v1: car1.archD, v2: car2.archD, u: "cm" },
                      { label: "Hacim", v1: car1.vol, v2: car2.vol, u: "L" },
                    ].map((r, i) => {
                      const diff = r.v1 - r.v2;
                      const winner = diff > 0 ? "primary" : diff < 0 ? "teal" : null;
                      return (
                        <tr key={i} className="border-b border-line/40 hover:bg-surface/50 transition-colors">
                          <td className="py-2 text-body text-[13px]">{r.label}</td>
                          <td className={`py-2 text-center font-medium text-[13px] ${winner === "primary" ? "text-primary" : ""}`}>{r.v1} {r.u}</td>
                          <td className={`py-2 text-center font-medium text-[13px] ${winner === "teal" ? "text-teal" : ""}`}>{r.v2} {r.u}</td>
                          <td className={`py-2 text-center text-xs font-semibold ${winner === "primary" ? "text-primary" : winner === "teal" ? "text-teal" : "text-faint"}`}>
                            {diff > 0 ? `+${diff}` : diff} {r.u}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section className="space-y-5">
            {/* Sığar mı grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ITEMS.map((item) => {
                const f1 = checkFit(car1, item);
                const f2 = checkFit(car2, item);
                return (
                  <div key={item.name} className="bg-white rounded-card border border-line p-4 hover:shadow-hover transition-shadow">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-xs font-bold text-muted">{item.icon}</div>
                      <div>
                        <div className="text-sm font-semibold leading-tight">{item.name}</div>
                        <div className="text-[10px] text-faint">{item.w} x {item.h} x {item.d} cm</div>
                      </div>
                    </div>
                    <div className="space-y-1 mt-3">
                      <FitBadge car={car1.name} result={f1} side="primary" />
                      <FitBadge car={car2.name} result={f2} side="teal" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kendi eşyanı dene */}
            <CustomItemChecker car1={car1} car2={car2} />
          </section>
        )}

        {/* Footer */}
        <footer className="bg-surface rounded-card p-5 text-center">
          <p className="text-xs text-muted leading-relaxed">
            Bu bir demo prototipidir. Ölçümler yaklaşık değerlerdir ve üretici teknik sayfaları referans alınarak hazırlanmıştır.
            <br />
            Gerçek projede veriler API entegrasyonu ve bağımsız ölçümlerle desteklenecektir.
          </p>
          <div className="flex gap-4 justify-center mt-2 text-[10px] text-faint font-medium">
            <span>10 araç</span>
            <span>·</span>
            <span>12 ölçüm noktası</span>
            <span>·</span>
            <span>8 eşya tipi</span>
            <span>·</span>
            <span>Three.js 3D</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ─── Alt bileşenler ─── */

function CarSelector({ label, value, onChange, accent }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent: "primary" | "teal";
}) {
  const car = CARS[value];
  const border = accent === "primary" ? "border-primary/20" : "border-teal/20";
  const bg = accent === "primary" ? "bg-primary/[0.03]" : "bg-teal/[0.03]";
  const dot = accent === "primary" ? "bg-primary" : "bg-teal";

  return (
    <div className={`rounded-card border ${border} ${bg} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${dot}`} />
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">{label}</label>
      </div>
      <select
        className="w-full bg-white border border-inputline rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {CARS.map((c, i) => (
          <option key={i} value={i}>{c.name} ({c.year}) — {c.vol}L — {TYPE_LABELS[c.type]}</option>
        ))}
      </select>
      <div className="flex gap-2 mt-2 text-[10px] text-muted">
        <span className="bg-surface px-2 py-0.5 rounded-pill">{TYPE_LABELS[car.type]}</span>
        <span className="bg-surface px-2 py-0.5 rounded-pill">{car.vol} litre</span>
        <span className="bg-surface px-2 py-0.5 rounded-pill">{car.botW}x{car.hC}x{car.botD} cm</span>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-surface/80 rounded-xl p-2 text-center">
      <span className="text-[9px] text-faint block leading-tight">{label}</span>
      <span className="text-sm font-bold leading-tight">{value}</span>
      <span className="text-[9px] text-muted">{unit}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function FitBadge({ car, result, side }: {
  car: string;
  result: "yes" | "tight" | "no";
  side: "primary" | "teal";
}) {
  const config = {
    yes: { bg: "bg-green-50", text: "text-green-700", border: "border-green-100", icon: "✓", label: "Sığar" },
    tight: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: "~", label: "Dar sığar" },
    no: { bg: "bg-red-50", text: "text-red-700", border: "border-red-100", icon: "✗", label: "Sığmaz" },
  }[result];

  return (
    <div className={`flex items-center justify-between text-[11px] border rounded-lg px-2.5 py-1.5 ${config.bg} ${config.border}`}>
      <span className="truncate text-body">{car}</span>
      <span className={`font-semibold ${config.text}`}>{config.icon} {config.label}</span>
    </div>
  );
}

function CustomItemChecker({ car1, car2 }: { car1: TrunkData; car2: TrunkData }) {
  const [w, setW] = useState(60);
  const [h, setH] = useState(40);
  const [d, setD] = useState(30);

  const custom: ItemData = { name: "Özel", w, h, d, icon: "?" };
  const f1 = checkFit(car1, custom);
  const f2 = checkFit(car2, custom);

  return (
    <div className="bg-white rounded-card border border-line p-5">
      <h3 className="text-sm font-semibold mb-4">Kendi eşyanı dene</h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Genişlik (cm)", val: w, set: setW },
          { label: "Yükseklik (cm)", val: h, set: setH },
          { label: "Derinlik (cm)", val: d, set: setD },
        ].map((f) => (
          <div key={f.label}>
            <label className="text-[10px] text-muted block mb-1 font-medium">{f.label}</label>
            <input
              type="number"
              className="w-full border border-inputline rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              value={f.val}
              onChange={(e) => f.set(Number(e.target.value))}
              min={1}
              max={200}
            />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <FitBadge car={car1.name} result={f1} side="primary" />
        <FitBadge car={car2.name} result={f2} side="teal" />
      </div>
    </div>
  );
}

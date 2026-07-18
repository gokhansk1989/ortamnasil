import { LIGHTS, type LightKey } from "@/lib/lights";

// Işık rozeti: nokta + etiket. Renk körlüğü için etiket HER ZAMAN metinle
// birlikte (sadece renk değil). Prototipte bu bileşen 6 dosyada kopyalanmıştı.
export function LightBadge({ light }: { light: LightKey }) {
  const l = LIGHTS[light];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-sm font-semibold"
      style={{ background: l.badgeBg, color: l.badgeFg }}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: l.dot }}
        aria-hidden
      />
      {l.label}
    </span>
  );
}

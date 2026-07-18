import { LIGHTS, scoreBars, type LightKey } from "@/lib/lights";

// Kart köşesindeki 5 çubuklu mini skor.
export function MiniScore({ light }: { light: LightKey }) {
  const filled = scoreBars(light);
  const color = LIGHTS[light].dot;
  return (
    <div
      className="flex gap-[3px]"
      title={`ortam skoru: ${LIGHTS[light].label}`}
      aria-label={`ortam skoru: ${LIGHTS[light].label}`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="h-[18px] w-1.5 rounded-[3px]"
          style={{ background: i < filled ? color : "#F0E8EE" }}
        />
      ))}
    </div>
  );
}

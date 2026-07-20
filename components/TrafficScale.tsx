import { LIGHTS, LIGHT_ORDER } from "@/lib/lights";

const CARD_STYLES: Record<string, { bg: string; border: string; glow: string }> = {
  green: { bg: "#ECFDF5", border: "#A7F3D0", glow: "0 4px 20px rgba(46,181,134,.15)" },
  yellow: { bg: "#FFFBEB", border: "#FDE68A", glow: "0 4px 20px rgba(232,185,60,.15)" },
  orange: { bg: "#FFF7ED", border: "#FED7AA", glow: "0 4px 20px rgba(235,138,74,.15)" },
  red: { bg: "#FEF2F2", border: "#FECACA", glow: "0 4px 20px rgba(224,93,75,.15)" },
  gray: { bg: "#F9FAFB", border: "#E5E7EB", glow: "none" },
};

export function TrafficScale() {
  return (
    <section className="px-16 pb-14 max-md:px-5">
      <div className="mx-auto max-w-[1100px] overflow-hidden rounded-[22px] border border-line bg-card px-10 py-8 shadow-lg max-md:px-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="text-lg">🚦</span>
          <span className="font-mono text-xs font-medium tracking-wider text-muted">
            ORTAM SKALASI — BİLİMSEL DEĞİLDİR AMA DOĞRUDUR
          </span>
        </div>
        <div className="grid grid-cols-5 gap-3.5 max-md:grid-cols-2">
          {LIGHT_ORDER.map((key) => {
            const l = LIGHTS[key];
            const style = CARD_STYLES[key] || CARD_STYLES.gray;
            return (
              <div
                key={key}
                className="rounded-2xl border-2 p-5 text-center transition-all hover:scale-105"
                style={{
                  background: style.bg,
                  borderColor: style.border,
                  boxShadow: style.glow,
                }}
              >
                <div
                  className="mx-auto mb-3 h-5 w-5 rounded-full"
                  style={{
                    background: l.dotBright,
                    boxShadow: key !== "gray" ? `0 0 14px ${l.dotBright}80` : "none",
                  }}
                  aria-hidden
                />
                <div className="text-[15px] font-bold text-ink">{l.label}</div>
                <div className="mt-1 text-[12px] text-muted">{l.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

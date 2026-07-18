import { LIGHTS, LIGHT_ORDER } from "@/lib/lights";

export function TrafficScale() {
  return (
    <section className="px-16 pb-14 max-md:px-5">
      <div className="mx-auto max-w-[1100px] overflow-hidden rounded-[22px] bg-ink px-10 py-8 text-white max-md:px-6">
        <div className="mb-[18px] flex items-center gap-2">
          <span className="text-lg">🚦</span>
          <span className="font-mono text-xs tracking-wider text-primary-light">
            ORTAM SKALASI — BİLİMSEL DEĞİLDİR AMA DOĞRUDUR
          </span>
        </div>
        <div className="grid grid-cols-5 gap-3.5 max-md:grid-cols-2">
          {LIGHT_ORDER.map((key) => {
            const l = LIGHTS[key];
            const glow = key !== "gray";
            return (
              <div
                key={key}
                className="rounded-2xl border border-white/10 bg-white/[.06] p-4 text-center transition-transform hover:scale-105"
              >
                <div
                  className="mx-auto mb-2.5 h-4 w-4 rounded-full"
                  style={{
                    background: l.dotBright,
                    boxShadow: glow ? `0 0 18px ${l.dotBright}99` : "none",
                  }}
                  aria-hidden
                />
                <div className="text-sm font-semibold">{l.label}</div>
                <div className="mt-1 text-xs text-onDarkMuted">{l.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

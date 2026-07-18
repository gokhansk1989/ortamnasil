import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LIGHTS, type LightKey } from "@/lib/lights";

const stats = [
  { value: "12", label: "itiraf", highlight: false },
  { value: "2", label: "eklenen yurt", highlight: false },
  { value: "148", label: '"faydalı" oyu', highlight: false },
  { value: "3", label: "kırmızı ışık yakıldı", highlight: true },
];

const mine: { company: string; id: string; light: LightKey; when: string; up: number }[] = [
  { company: "KYK Atatürk Yurdu", id: "kyk-ataturk-yurdu", light: "green", when: "2 gün önce", up: 24 },
  { company: "Huzur Erkek Yurdu", id: "huzur-erkek-yurdu", light: "yellow", when: "3 hafta önce", up: 41 },
  { company: "Kampüs Life Apart", id: "kampus-life-apart", light: "red", when: "2 ay önce", up: 83 },
];

export default function ProfilPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/90 px-16 py-4 backdrop-blur-md max-md:px-5">
        <Logo />
        <nav className="flex items-center gap-6 text-[15px]">
          <Link href="/sirketler" className="text-body hover:text-primary max-md:hidden">Yurtlar</Link>
          <Link href="/anket" className="gradient-pink rounded-pill px-6 py-2.5 font-semibold text-white shadow-glow transition-transform hover:scale-105">
            Yorum yaz
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-[900px] px-8 pb-20 pt-12 max-md:px-5">
        {/* KİMLİK KARTI */}
        <div className="mb-5 flex items-center gap-7 rounded-[22px] bg-ink px-10 py-9 text-white max-md:flex-col max-md:px-6 max-md:text-center">
          <div className="grid h-[88px] w-[88px] flex-shrink-0 place-items-center rounded-full bg-white/[.08] text-[42px]">
            🥸
          </div>
          <div className="flex-1">
            <div className="mb-2 font-mono text-[11.5px] tracking-widest text-primary-light">
              ANONİM KİMLİK KARTI — GERÇEK İSİM: BİZDE BİLE YOK
            </div>
            <h1 className="mb-2 text-[30px] font-bold tracking-[-.5px]">SinirliPenguen42</h1>
            <div className="flex flex-wrap gap-2 max-md:justify-center">
              <span className="rounded-pill bg-primary/20 px-3 py-[5px] text-[12.5px] font-semibold text-primary-light">
                🎀 KurdeleKesen ×2
              </span>
              <span className="rounded-pill bg-white/[.08] px-3 py-[5px] text-[12.5px] font-semibold text-onDarkMuted">
                🕵️ Güvenilir Muhbir
              </span>
              <span className="rounded-pill bg-white/[.08] px-3 py-[5px] text-[12.5px] font-semibold text-onDarkMuted">
                ✍️ 12 itiraf
              </span>
            </div>
          </div>
          <button className="flex-shrink-0 rounded-xl bg-white/10 px-[18px] py-2.5 text-[13.5px] font-semibold text-white transition-all hover:bg-white/20">
            Takma adı değiştir
          </button>
        </div>

        {/* İSTATİSTİKLER */}
        <div className="mb-8 grid grid-cols-4 gap-3.5 max-md:grid-cols-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-card border border-line bg-card p-5 text-center transition-all hover:shadow-sm">
              <div
                className="text-[28px] font-bold"
                style={{ color: s.highlight ? "#FF2D78" : "#1A1A2E" }}
              >
                {s.value}
              </div>
              <div className="text-[13px] text-faint">{s.label}</div>
            </div>
          ))}
        </div>

        {/* İTİRAFLARIM */}
        <h2 className="mb-4 text-xl font-bold text-ink">İtirafların 📝</h2>
        <div className="grid gap-3.5">
          {mine.map((m) => {
            const l = LIGHTS[m.light];
            return (
              <div key={m.id} className="flex items-center gap-[18px] rounded-card border border-line bg-card px-6 py-[22px] transition-all hover:border-primary/20 hover:shadow-sm max-md:flex-wrap">
                <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ background: l.dot }} />
                <div className="flex-1">
                  <div className="text-[15.5px] font-semibold text-ink">
                    {m.company} — <span style={{ color: l.badgeFg }}>{l.label}</span>
                  </div>
                  <div className="mt-[3px] text-[13.5px] text-faint">
                    {m.when} · {m.up} faydalı oyu
                  </div>
                </div>
                <button className="flex-shrink-0 text-[13.5px] font-semibold text-primary">Düzenle</button>
                <button className="flex-shrink-0 text-[13.5px] text-light-red">Sil</button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-card bg-surface2 px-6 py-5 text-[13.5px] leading-relaxed text-muted">
          🔒 <strong className="text-ink">Anonimlik sözümüz:</strong> E-postan tek yönlü
          şifrelenir, IP kaydı tutulmaz, yorumların takma adınla bile eşleştirilemez
          şekilde saklanır. Yurt yönetimi arasa da verecek bir şeyimiz yok.
        </div>
      </div>
    </div>
  );
}

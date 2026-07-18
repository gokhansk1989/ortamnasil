"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const POOL = [
  "KızgınKanguru7", "MelankolikMartı", "SabırlıAhtapot", "KaçakÇaycı",
  "GizliVizyoner", "YorgunUnicorn", "PasifAgresifPanda", "MesaideKayıp",
];
const TAKEN = ["sinirlipenguen42", "kaçanbalık", "uykusuzkirpi"];

export default function GirisPage() {
  const [nick, setNick] = useState("");
  const clean = nick.trim().toLocaleLowerCase("tr");

  let statusMsg = "";
  let statusColor = "#9090AC";
  let borderColor = "#E0D4DE";
  if (clean.length > 0 && clean.length < 3) {
    statusMsg = "Biraz daha uzun olsun — en az 3 karakter.";
    statusColor = "#eb8a4a";
    borderColor = "#eb8a4a";
  } else if (TAKEN.includes(clean)) {
    statusMsg = `❌ Bu isim kapılmış. ${nick.trim()}43 dene?`;
    statusColor = "#e05d4b";
    borderColor = "#e05d4b";
  } else if (clean.length >= 3) {
    statusMsg = "✓ Müsait! Bu isimle efsane olabilirsin.";
    statusColor = "#2eb586";
    borderColor = "#2eb586";
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex items-center justify-center py-6">
        <Logo />
      </header>

      <div className="flex flex-1 items-center justify-center px-8 pb-16 pt-6 max-md:px-5">
        <div className="w-[520px] max-w-full">
          <div className="mb-7 text-center">
            <div className="mb-3 text-[44px]">🥸</div>
            <h1 className="mb-2.5 text-[32px] font-bold tracking-[-.5px] text-ink">Kim olmak istersin?</h1>
            <p className="text-[15.5px] leading-relaxed text-muted">
              Gerçek ismini isteMİyoruz. Buradaki kimliğin, seçeceğin takma ad. İyi
              seç — itirafların bu isimle anılacak.
            </p>
          </div>

          <div className="grid gap-5 rounded-[22px] border border-line bg-card px-9 py-8 shadow-lg max-md:px-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Takma adın</label>
              <div className="flex gap-2.5">
                <input
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  placeholder="örn. SinirliPenguen42"
                  aria-label="Takma ad"
                  className="flex-1 rounded-xl border-2 bg-card px-4 py-3.5 font-mono text-[15px] text-ink outline-none transition-colors"
                  style={{ borderColor }}
                />
                <button
                  onClick={() => setNick(POOL[Math.floor(Math.random() * POOL.length)])}
                  title="Rastgele öner"
                  aria-label="Rastgele takma ad öner"
                  className="rounded-xl border-2 border-line bg-surface px-4 text-lg transition-all hover:scale-105 hover:border-primary/30"
                >
                  🎲
                </button>
              </div>
              <div className="mt-2 min-h-[18px] text-[13px]" style={{ color: statusColor }}>
                {statusMsg}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                E-posta{" "}
                <span className="font-normal text-faint">(sadece giriş için, tek yönlü şifrelenir)</span>
              </label>
              <input
                type="email"
                placeholder="sen@ornek.com"
                aria-label="E-posta"
                className="w-full rounded-xl border-2 border-line bg-card px-4 py-3.5 text-[15px] text-ink outline-none transition-colors focus:border-primary/40"
              />
            </div>

            <button className="gradient-pink rounded-xl py-[15px] text-base font-bold text-white shadow-glow transition-transform hover:scale-[1.02]">
              Bu kimlikle devam et
            </button>
            <p className="text-center text-[12.5px] leading-normal text-faint2">
              🔒 Takma adın e-postanla eşleştirilemez şekilde saklanır.
              <br />
              Zaten hesabın var mı?{" "}
              <Link href="/giris" className="font-semibold text-primary">
                Giriş yap
              </Link>
            </p>
          </div>

          <div className="mt-5 text-center">
            <div className="mb-2.5 text-[12.5px] text-faint2">İlham lazımsa, boşta olanlardan:</div>
            <div className="flex flex-wrap justify-center gap-2">
              {POOL.slice(0, 4).map((name) => (
                <button
                  key={name}
                  onClick={() => setNick(name)}
                  className="rounded-pill border border-line bg-card px-3.5 py-1.5 font-mono text-[12.5px] text-primary transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getDorm } from "@/lib/dorms";

const RELATIONS = ["Şu an kalıyorum", "Eskiden kaldım", "Kısa süre kaldım", "Gezip gördüm"];

export default function ItirafYazPage() {
  return (
    <Suspense>
      <ItirafYazContent />
    </Suspense>
  );
}

function ItirafYazContent() {
  const searchParams = useSearchParams();
  const dormId = searchParams.get("dorm") || "kyk-ataturk-yurdu";
  const dorm = getDorm(dormId);
  const dormName = dorm?.name || "Yurt";
  const dormInitial = dormName.charAt(0).toLocaleUpperCase("tr");

  const [relation, setRelation] = useState(RELATIONS[0]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const n = text.length;
  const valid = n >= 40 && title.trim().length > 0;
  const hint =
    n === 0
      ? "En az 40 karakter — tek kelime 'kötü' sayılmaz."
      : n < 40
        ? `Biraz daha detay: ${40 - n} karakter kaldı.`
        : "Güzel gidiyor. ✓";

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-line bg-paper/90 px-16 py-4 backdrop-blur-md max-md:px-5">
        <Logo />
        <div className="font-mono text-[13px] text-faint max-md:hidden">
          🥸 SinirliPenguen42 · kimliğin kasada 🔒
        </div>
      </header>

      <div className="mx-auto max-w-[680px] px-8 pb-20 pt-11 max-md:px-5">
        {!submitted ? (
          <>
            <div className="mb-7">
              <div className="mb-4 text-[13.5px] text-faint">
                <Link href={`/sirket/${dormId}`}>← {dormName}</Link> profiline dön
              </div>
              <h1 className="mb-2.5 text-[32px] font-bold tracking-[-.5px] text-ink">
                İtirafını yaz ✍️
              </h1>
              <p className="text-[15.5px] leading-relaxed text-muted">
                Anketi doldurdun, ışığın skora karıştı. Şimdi hikayeni anlat —
                dışarıdan bakan biri okuyunca &ldquo;ha, anladım&rdquo; desin.
              </p>
            </div>

            <div className="grid gap-[22px] rounded-[22px] border border-line bg-card px-9 py-8 shadow-lg max-md:px-6">
              {/* Yurt özeti */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-surface px-[18px] py-3.5">
                <div className="gradient-pink grid h-11 w-11 place-items-center rounded-xl text-lg font-bold text-white">
                  {dormInitial}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-ink">{dormName}</div>
                  <div className="text-[12.5px] text-faint">
                    Senin ışığın: <strong className="text-light-green">Kapağı at</strong>{" "}
                    (anketten geldi)
                  </div>
                </div>
                <Link href={`/anket?dorm=${dormId}`} className="text-[13px] font-semibold text-primary">
                  Değiştir
                </Link>
              </div>

              {/* İlişki */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">İlişkin ne?</label>
                <div className="flex flex-wrap gap-2">
                  {RELATIONS.map((r) => {
                    const on = r === relation;
                    return (
                      <button
                        key={r}
                        onClick={() => setRelation(r)}
                        aria-pressed={on}
                        className="rounded-pill border-2 px-4 py-[9px] text-[13.5px] transition-all"
                        style={{
                          fontWeight: on ? 600 : 400,
                          background: on ? "linear-gradient(135deg, #FF2D78, #7C3AED)" : "#fff",
                          borderColor: on ? "transparent" : "#E0D4DE",
                          color: on ? "#fff" : "#3D3D56",
                        }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Başlık */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  Başlık <span className="font-normal text-faint">(tek cümlelik özet)</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="örn. Mesai bitince gerçekten bitiyor"
                  className="w-full rounded-xl border-2 border-line bg-card px-4 py-3.5 text-[15.5px] text-ink outline-none transition-colors focus:border-primary/40"
                />
              </div>

              {/* İtiraf */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">İtirafın</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 600))}
                  placeholder="İyi yanı, kötü yanı, 'keşke bilseydim' dediğin şey... Kurumsal ağız yasak, insan gibi anlat."
                  className="min-h-[140px] w-full resize-y rounded-xl border-2 border-line bg-card px-4 py-3.5 text-[15px] leading-relaxed text-ink outline-none transition-colors focus:border-primary/40"
                />
                <div
                  className="mt-2 flex justify-between text-[12.5px]"
                  style={{ color: n > 0 && n < 40 ? "#eb8a4a" : "#9090AC" }}
                >
                  <span>{hint}</span>
                  <span className="font-mono">{n}/600</span>
                </div>
              </div>

              <div className="rounded-xl bg-surface2 px-[18px] py-3.5 text-[13px] leading-relaxed text-purple">
                ⚖️ <strong>Kısa hukuk köşesi:</strong> İsim verme, küfür etme, sır ifşa
                etme. &ldquo;Müdür kötü&rdquo; değil &ldquo;toplantıda söz kesiliyor&rdquo; yaz — hem daha
                faydalı hem dava riski yok.
              </div>

              <button
                onClick={() => valid && setSubmitted(true)}
                disabled={!valid}
                className="rounded-xl py-4 text-base font-bold text-white transition-all"
                style={{
                  background: valid ? "linear-gradient(135deg, #FF2D78, #7C3AED)" : "#E0D4DE",
                  cursor: valid ? "pointer" : "not-allowed",
                  boxShadow: valid ? "0 0 30px rgba(255,45,120,.25)" : "none",
                }}
              >
                Anonim yayınla 📮
              </button>
            </div>
          </>
        ) : (
          <div className="animate-pop rounded-[22px] bg-ink px-12 py-[52px] text-center text-white max-md:px-6">
            <div className="mb-3 text-[44px]">📮</div>
            <div className="mb-3.5 font-mono text-xs tracking-widest text-primary-light">
              İTİRAF #8918 YAYINDA
            </div>
            <h1 className="mb-3 text-[30px] font-bold tracking-[-.5px]">
              Yayınlandı. Kimse bilmiyor, herkes okuyor. 👀
            </h1>
            <p className="mx-auto mb-[30px] max-w-[420px] text-[15px] leading-relaxed text-onDarkMuted">
              &ldquo;{title.trim() || "Yeni itiraf"}&rdquo; itirafın {dormName} dosyasına
              eklendi. Faydalı oyları geldikçe profilindeki Güvenilir Muhbir rozetin
              güçlenir. 💪
            </p>
            <div className="flex justify-center gap-3 max-md:flex-col">
              <Link
                href={`/sirket/${dormId}`}
                className="gradient-pink rounded-2xl px-[26px] py-3.5 text-[15px] font-bold text-white"
              >
                İtirafını dosyada gör
              </Link>
              <Link
                href="/profil"
                className="rounded-2xl bg-white/10 px-[26px] py-3.5 text-[15px] font-semibold text-white"
              >
                Profilime git
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

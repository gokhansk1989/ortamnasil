"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

const SECTORS = [
  { label: "Seç…", value: "" },
  { label: "KYK (devlet)", value: "KYK" },
  { label: "Özel yurt", value: "PRIVATE" },
  { label: "Öğrenci apartı", value: "APART" },
];

const GENDERS = [
  { label: "Karma", value: "MIXED" },
  { label: "Kız", value: "FEMALE" },
  { label: "Erkek", value: "MALE" },
];

const CONFETTI = [
  { emoji: "🎊", left: "15%", dur: "1.8s", delay: "0s" },
  { emoji: "🎉", left: "45%", dur: "2.2s", delay: ".4s" },
  { emoji: "🎊", left: "75%", dur: "1.9s", delay: ".8s" },
];

export default function YurtEklePage() {
  const router = useRouter();
  const [nick, setNick] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [gender, setGender] = useState("MIXED");
  const [website, setWebsite] = useState("");
  const [blurb, setBlurb] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [dormId, setDormId] = useState("");

  useEffect(() => {
    fetch("/api/auth/ben")
      .then((r) => {
        if (!r.ok) {
          router.replace("/giris?donuş=/yurt-ekle");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.nick) {
          setNick(data.nick);
          setAuthed(true);
        }
      })
      .catch(() => router.replace("/giris?donuş=/yurt-ekle"))
      .finally(() => setAuthChecked(true));
  }, [router]);

  const dupWarn = name.toLocaleLowerCase("tr").includes("atatürk");
  const valid = name.trim().length >= 3 && type !== "" && city.trim().length >= 2;

  async function handleSubmit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/yurt-ekle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          city: city.trim(),
          district: district.trim() || undefined,
          gender,
          website: website.trim() || undefined,
          blurb: blurb.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Bir hata oluştu");
        return;
      }
      setDormId(data.id);
      setSubmitted(true);
    } catch {
      setSubmitError("Sunucuya ulaşılamadı");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authChecked || !authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div className="mb-3 text-2xl animate-pulse">🔐</div>
          <p className="text-faint text-sm">Giriş kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-line bg-paper/90 px-16 py-4 backdrop-blur-md max-md:px-5">
        <Logo />
        <div className="font-mono text-[13px] text-faint">🥸 {nick} · kimliğin kasada 🔒</div>
      </header>

      <div className="mx-auto max-w-[680px] px-8 pb-20 pt-12 max-md:px-5">
        {!submitted ? (
          <>
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-pill bg-primary/10 px-4 py-[6px] text-[12.5px] font-bold text-primary">
                ✂️ İLK EKLEYEN KURDELEYİ KESER
              </div>
              <h1 className="mb-2.5 text-[36px] font-bold tracking-[-.5px] text-ink max-md:text-[28px]">
                Listeye yeni yurt ekle
              </h1>
              <p className="text-base text-muted">
                Yurt adını ve şehrini gir, gerisini biz halledelim.
                &ldquo;Hangi Atatürk Yurdu?&rdquo; dramı yaşamayalım.
              </p>
            </div>

            <div className="grid gap-[22px] rounded-[22px] border border-line bg-card px-10 py-9 shadow-lg max-md:px-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  Yurt adı <span className="text-primary">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="örn. KYK Atatürk Öğrenci Yurdu"
                  className="w-full rounded-xl border-2 border-line bg-card px-4 py-3.5 text-[15.5px] text-ink outline-none transition-colors focus:border-primary/40"
                />
                {dupWarn && (
                  <div className="mt-2.5 rounded-xl border border-light-orange/30 bg-[#FFF8F0] px-3.5 py-3 text-[13.5px] leading-snug text-[#96690f]">
                    ⚠️ Benzer isimli kayıt olabilir. İlçe bilgisi ekleyerek ayrıştırabilirsin.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">
                    Sektör <span className="text-primary">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border-2 border-line bg-card px-3 py-3.5 text-[15px] text-ink outline-none"
                  >
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">
                    Şehir <span className="text-primary">*</span>
                  </label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="örn. İstanbul"
                    className="w-full rounded-xl border-2 border-line bg-card px-4 py-3.5 text-[15.5px] text-ink outline-none transition-colors focus:border-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">İlçe</label>
                  <input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="örn. Kadıköy"
                    className="w-full rounded-xl border-2 border-line bg-card px-4 py-3.5 text-[15.5px] text-ink outline-none transition-colors focus:border-primary/40"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">Cinsiyet</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl border-2 border-line bg-card px-3 py-3.5 text-[15px] text-ink outline-none"
                  >
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3.5 rounded-2xl bg-surface px-5 py-[18px]">
                <div className="text-[13px] text-muted">
                  <strong className="text-ink">Kimlik doğrulama (isteğe bağlı ama hayat kurtarır):</strong>{" "}
                  web sitesini eklersen isim benzerliği derdi biter.
                </div>
                <div>
                  <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">🌐 Web sitesi</label>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yurtadi.com"
                    className="w-full rounded-xl border-2 border-line bg-card px-3.5 py-3 font-mono text-sm text-ink outline-none transition-colors focus:border-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  Tek cümlelik tanıtım{" "}
                  <span className="font-normal text-faint">(dışardan bakan biri için)</span>
                </label>
                <textarea
                  value={blurb}
                  onChange={(e) => setBlurb(e.target.value.slice(0, 300))}
                  placeholder="örn. İTÜ Ayazağa'ya servisle 10 dk, ~1.200 kapasiteli KYK erkek yurdu."
                  className="min-h-[80px] w-full resize-y rounded-xl border-2 border-line bg-card px-4 py-3.5 text-[15px] text-ink outline-none transition-colors focus:border-primary/40"
                />
                <div className="mt-1 text-right text-[12px] text-faint font-mono">{blurb.length}/300</div>
              </div>

              {submitError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
                  {submitError}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!valid || submitting}
                className="rounded-xl py-4 text-base font-bold text-white transition-all"
                style={{
                  background: valid && !submitting ? "linear-gradient(135deg, #F97316, #EA580C)" : "#E7E0DA",
                  cursor: valid && !submitting ? "pointer" : "not-allowed",
                  boxShadow: valid && !submitting ? "0 0 30px rgba(249,115,22,.20)" : "none",
                }}
              >
                {submitting ? "Ekleniyor..." : "Yurdu ekle ve kurdeleyi kes ✂️"}
              </button>
              <p className="text-center text-[12.5px] text-faint2">
                Ekledikten sonra ilk değerlendirme anketi otomatik açılır — dışarıdan
                bakan biri fikir edinebilsin diye.
              </p>
            </div>
          </>
        ) : (
          <div className="relative animate-pop overflow-hidden rounded-[22px] bg-ink px-12 py-14 text-center text-white max-md:px-6">
            {CONFETTI.map((c, i) => (
              <span
                key={i}
                className="absolute top-0 text-xl"
                style={{
                  left: c.left,
                  animation: `confetti ${c.dur} ${c.delay} ease-in infinite`,
                }}
              >
                {c.emoji}
              </span>
            ))}
            <div className="mb-3 text-[48px]">✂️</div>
            <h1 className="mb-3 text-[34px] font-bold tracking-[-.5px]">Tebrikler, kurdeleyi kestin!</h1>
            <p className="mx-auto mb-2 max-w-[440px] text-base leading-relaxed text-onDarkMuted">
              <strong className="text-white">{name.trim() || "Yeni Yurt"}</strong> artık
              listede — ve ilk ekleyen olarak profilinde{" "}
              <strong className="text-primary-light">KurdeleKesen</strong> rozeti seni bekliyor. ✨
            </p>
            <p className="mx-auto mb-8 text-sm text-onDarkMuted">
              Şimdi ilk değerlendirmeyi yap ki ışığı yansın. Şu an: gri, &ldquo;yeterli veri yok&rdquo;.
            </p>
            <div className="flex justify-center gap-3 max-md:flex-col">
              <Link
                href={`/anket?dorm=${dormId}`}
                className="gradient-pink rounded-2xl px-[26px] py-3.5 text-[15px] font-bold text-white shadow-glow"
              >
                İlk anketi doldur →
              </Link>
              <Link
                href="/"
                className="rounded-2xl bg-white/10 px-[26px] py-3.5 text-[15px] font-semibold text-white"
              >
                Ana sayfaya dön
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

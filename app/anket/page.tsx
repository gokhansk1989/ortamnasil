"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { DormSelector } from "@/components/DormSelector";
import { QUESTIONS, RESULT_BLURB } from "@/lib/survey";
import { LIGHTS, scoreSurvey, type Answer } from "@/lib/lights";
import { getDorm, type Dorm } from "@/lib/dorms";

export default function AnketPage() {
  return (
    <Suspense>
      <AnketContent />
    </Suspense>
  );
}

function buildPeriods(): string[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const currentAcadYear = m >= 8 ? y : y - 1;
  const periods: string[] = [];
  for (let i = 0; i < 5; i++) {
    const start = currentAcadYear - i;
    periods.push(`${start}-${start + 1} Güz`);
    periods.push(`${start}-${start + 1} Bahar`);
  }
  return periods;
}

const PERIODS = buildPeriods();

function AnketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("dorm") || "";
  const preselectedDorm = preselectedId ? getDorm(preselectedId) : undefined;

  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/ben")
      .then((r) => {
        if (!r.ok) {
          router.replace("/giris?donuş=/anket");
        } else {
          setAuthed(true);
        }
      })
      .catch(() => router.replace("/giris?donuş=/anket"))
      .finally(() => setAuthChecked(true));
  }, [router]);

  const [selectedDorm, setSelectedDorm] = useState<Dorm | undefined>(preselectedDorm);
  const dormId = selectedDorm?.id || "";
  const dormName = selectedDorm?.name || "Yurt";

  const [relation, setRelation] = useState<"" | "CURRENT" | "FORMER">("");
  const [period, setPeriod] = useState("");
  const [periodSelected, setPeriodSelected] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [comment, setComment] = useState("");
  const [commentDone, setCommentDone] = useState(false);

  const needsPeriod = relation === "FORMER";
  const relationDone = relation === "CURRENT" || (relation === "FORMER" && periodSelected);
  const questionsComplete = step >= QUESTIONS.length;
  const done = questionsComplete && commentDone;

  function answer(val: Answer) {
    setAnswers((prev) => {
      const a = prev.slice(0, step);
      a[step] = val;
      return a;
    });
    setStep((s) => s + 1);
  }

  const q = QUESTIONS[done ? 0 : step];
  const light = LIGHTS[scoreSurvey(answers)];

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
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-line bg-paper/90 px-16 py-4 backdrop-blur-md max-md:px-5">
        <Logo />
        <div className="font-mono text-[13px] text-faint max-md:hidden">
          🥸 kimliğin kasada 🔒
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-8 py-12 max-md:px-5">
        <div className="w-[720px] max-w-full">
          {!dormId ? (
            /* ── Yurt seçimi ── */
            <div className="animate-pop rounded-[22px] border border-line bg-card px-12 py-11 shadow-lg max-md:px-6">
              <div className="mb-2.5 font-mono text-[12.5px] font-bold tracking-wider text-primary">
                YURT DEĞERLENDİRMESİ
              </div>
              <h1 className="mb-2 text-[28px] font-bold leading-tight tracking-[-.3px] text-ink">
                Hangi yurdu değerlendireceksin?
              </h1>
              <p className="mb-6 text-[15px] text-faint">
                Önce il ve ilçeni seç, sonra yurdunu bul.
              </p>
              <DormSelector onSelect={setSelectedDorm} />
            </div>
          ) : !relation ? (
            /* ── Yurtla ilişki ── */
            <div className="animate-pop rounded-[22px] border border-line bg-card px-12 py-11 shadow-lg max-md:px-6">
              <div className="mb-2.5 font-mono text-[12.5px] font-bold tracking-wider text-primary">
                {dormName.toLocaleUpperCase("tr")} DEĞERLENDİRMESİ
              </div>
              <h1 className="mb-2 text-[28px] font-bold leading-tight tracking-[-.3px] text-ink">
                Yurtla ilişkin ne?
              </h1>
              <p className="mb-6 text-[15px] text-faint">
                Değerlendirmeni daha iyi anlamak için bunu bilmemiz gerekiyor.
              </p>
              <div className="grid gap-3.5">
                <button
                  onClick={() => setRelation("CURRENT")}
                  className="rounded-2xl border-2 border-line bg-card px-6 py-[22px] text-left transition-all hover:border-primary hover:bg-surface hover:shadow-glow"
                >
                  <div className="mb-1.5 text-2xl">🏠</div>
                  <div className="text-[16.5px] font-semibold text-ink">Şu an kalıyorum</div>
                  <div className="mt-1 text-[13px] text-faint">Hâlâ bu yurtta ikamet ediyorum</div>
                </button>
                <button
                  onClick={() => setRelation("FORMER")}
                  className="rounded-2xl border-2 border-line bg-card px-6 py-[22px] text-left transition-all hover:border-primary hover:bg-surface hover:shadow-glow"
                >
                  <div className="mb-1.5 text-2xl">📦</div>
                  <div className="text-[16.5px] font-semibold text-ink">Eskiden kaldım</div>
                  <div className="mt-1 text-[13px] text-faint">Artık burada kalmıyorum</div>
                </button>
              </div>
            </div>
          ) : needsPeriod && !periodSelected ? (
            /* ── Dönem seçimi (sadece eskiden kalanlar için) ── */
            <div className="animate-pop rounded-[22px] border border-line bg-card px-12 py-11 shadow-lg max-md:px-6">
              <div className="mb-2.5 font-mono text-[12.5px] font-bold tracking-wider text-primary">
                {dormName.toLocaleUpperCase("tr")} DEĞERLENDİRMESİ
              </div>
              <h1 className="mb-2 text-[28px] font-bold leading-tight tracking-[-.3px] text-ink">
                Hangi dönem kaldın?
              </h1>
              <p className="mb-6 text-[15px] text-faint">
                Yorumun güncelliğini anlamak için kaldığın dönemi seç.
              </p>
              <div className="grid grid-cols-2 gap-2.5 max-md:grid-cols-1">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="rounded-xl border-2 px-4 py-3 text-left text-[15px] font-medium transition-all"
                    style={{
                      borderColor: period === p ? "#F97316" : "#F5F0EB",
                      background: period === p ? "#FFF7ED" : "white",
                      color: period === p ? "#EA580C" : "#1C1917",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPeriodSelected(true)}
                disabled={!period}
                className="mt-6 w-full rounded-xl py-3.5 text-[15px] font-bold text-white transition-all disabled:opacity-40"
                style={{ background: period ? "#F97316" : "#D6D3D1" }}
              >
                Devam et →
              </button>
            </div>
          ) : !questionsComplete ? (
            /* ── Sorular ── */
            <>
              <div className="mb-7 text-center">
                <div className="mb-2.5 font-mono text-[12.5px] font-bold tracking-wider text-primary">
                  {dormName.toLocaleUpperCase("tr")} DEĞERLENDİRMESİ
                </div>
                <div className="flex justify-center gap-1.5">
                  {QUESTIONS.map((_, i) => (
                    <span
                      key={i}
                      className="h-2 w-[26px] rounded-pill transition-colors"
                      style={{
                        background:
                          i < step ? "#F97316" : i === step ? "#0D9488" : "#F5F0EB",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="animate-pop rounded-[22px] border border-line bg-card px-12 py-11 shadow-lg max-md:px-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-pill bg-primary/10 px-3.5 py-[5px] text-[12.5px] font-bold text-primary">
                    {q.topic}
                  </span>
                  <span className="font-mono text-[13px] text-faint">{step + 1}/{QUESTIONS.length}</span>
                </div>
                <h1 className="mb-2 text-[28px] font-bold leading-tight tracking-[-.3px] text-ink">
                  {q.title}
                </h1>
                <p className="mb-[30px] text-[15px] text-faint">{q.sub}</p>
                <div className="grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
                  <button
                    onClick={() => answer(1)}
                    className="rounded-2xl border-2 border-line bg-card px-6 py-[22px] text-left transition-all hover:border-primary hover:bg-surface hover:shadow-glow"
                  >
                    <div className="mb-2.5 text-2xl">{q.aEmoji}</div>
                    <div className="text-[16.5px] font-semibold text-ink">{q.a}</div>
                    <div className="mt-1 text-[13px] text-faint">{q.aSub}</div>
                  </button>
                  <button
                    onClick={() => answer(0)}
                    className="rounded-2xl border-2 border-line bg-card px-6 py-[22px] text-left transition-all hover:border-light-red hover:bg-[#FFF5F5]"
                  >
                    <div className="mb-2.5 text-2xl">{q.bEmoji}</div>
                    <div className="text-[16.5px] font-semibold text-ink">{q.b}</div>
                    <div className="mt-1 text-[13px] text-faint">{q.bSub}</div>
                  </button>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="text-sm font-semibold disabled:cursor-default"
                    style={{ color: step > 0 ? "#F97316" : "#E7E0DA" }}
                  >
                    ← Geri
                  </button>
                  <button
                    onClick={() => answer(null)}
                    className="text-sm text-faint hover:text-primary"
                  >
                    Bu konuda fikrim yok, pas →
                  </button>
                </div>
              </div>
              <p className="mt-5 text-center text-[13px] text-faint2">
                Cevapların yurdun ortam skoruna anonim olarak karışır. Kimse kim
                olduğunu bilmez, biz dahil. 🤫
              </p>
            </>
          ) : !commentDone ? (
            /* ── Yorum (opsiyonel) ── */
            <div className="animate-pop rounded-[22px] border border-line bg-card px-12 py-11 shadow-lg max-md:px-6">
              <div className="mb-4 font-mono text-[12.5px] font-bold tracking-wider text-primary">
                ANKET TAMAMLANDI — YORUM EKLE
              </div>
              <h1 className="mb-2 text-[28px] font-bold leading-tight tracking-[-.3px] text-ink">
                Eklemek istediğin bir şey var mı?
              </h1>
              <p className="mb-6 text-[15px] text-faint">
                Zorunlu değil ama yazarsan yurdu merak edenlere çok yardımcı olur. Küfür, isim ifşası ve kişisel bilgi yasak.
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="Örn: Yemekhanede çeşit var ama lezzet kısmı şansa bağlı. İnternete 22:00'dan sonra güvenme..."
                className="min-h-[120px] w-full resize-y rounded-xl border-2 border-line bg-card px-4 py-3.5 text-[15px] leading-relaxed text-ink outline-none transition-colors focus:border-primary/40"
              />
              <div className="mt-2 flex justify-between text-[12.5px]">
                <span style={{ color: comment.length > 0 && comment.length < 15 ? "#eb8a4a" : "#A8A29E" }}>
                  {comment.length === 0
                    ? "Boş bırakabilirsin — zorunlu değil."
                    : comment.length < 15
                      ? `Biraz daha detay ver: ${15 - comment.length} karakter kaldı.`
                      : "Güzel gidiyor."}
                </span>
                <span className="font-mono">{comment.length}/500</span>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setComment(""); setCommentDone(true); }}
                  className="flex-1 rounded-xl border-2 border-line py-3.5 text-[15px] font-semibold text-faint transition-all hover:border-primary/30"
                >
                  Atla
                </button>
                <button
                  onClick={() => {
                    if (comment.length > 0 && comment.length < 15) return;
                    setCommentDone(true);
                  }}
                  disabled={comment.length > 0 && comment.length < 15}
                  className="flex-1 rounded-xl py-3.5 text-[15px] font-bold text-white transition-all disabled:opacity-40"
                  style={{ background: comment.length > 0 && comment.length < 15 ? "#D6D3D1" : "#F97316" }}
                >
                  Gönder →
                </button>
              </div>
            </div>
          ) : (
            /* ── Sonuç ── */
            <>
              <div className="animate-pop rounded-[22px] bg-ink px-12 py-[52px] text-center text-white max-md:px-6">
                <div className="mb-2.5 text-[44px]">🎉</div>
                <div className="mb-3.5 font-mono text-xs tracking-widest text-primary-light">
                  ANKET KAYDEDİLDİ
                </div>
                <h1 className="mb-2.5 text-[32px] font-bold tracking-[-.5px]">Senin verdiğin ışık:</h1>
                <div className="my-3.5 inline-flex items-center gap-3 rounded-pill bg-white/[.08] px-[30px] py-3.5">
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ background: light.dotBright, boxShadow: `0 0 16px ${light.dotBright}` }}
                  />
                  <span className="text-2xl font-bold" style={{ color: light.dotBright }}>
                    {light.label}
                  </span>
                </div>
                <p className="mx-auto mb-[30px] max-w-[420px] text-[15px] leading-relaxed text-onDarkMuted">
                  {RESULT_BLURB[light.key]}
                </p>
                <div className="flex justify-center gap-3 max-md:flex-col">
                  <Link
                    href={`/yurt/${dormId}`}
                    className="gradient-pink rounded-2xl px-[26px] py-3.5 text-[15px] font-bold text-white"
                  >
                    Yurt profilini gör
                  </Link>
                  <button
                    onClick={() => {
                      setStep(0);
                      setAnswers([]);
                      setComment("");
                      setCommentDone(false);
                      setRelation("");
                      setPeriod("");
                      setPeriodSelected(false);
                      if (!preselectedId) setSelectedDorm(undefined);
                    }}
                    className="rounded-2xl bg-white/10 px-[26px] py-3.5 text-[15px] font-semibold text-white"
                  >
                    Bir daha doldur
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

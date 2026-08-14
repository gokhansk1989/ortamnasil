"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { DormSelector, type DormOption } from "@/components/DormSelector";
import { QUESTIONS, RESULT_BLURB } from "@/lib/survey";
import { LIGHTS, scoreSurvey, type Answer } from "@/lib/lights";
import { trackEvent, trackMetaConversion } from "@/lib/analytics";

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

const DRAFT_KEY = "ortam_anket_taslak";

export function AnketContent({ dormParam, resume }: { dormParam: string; resume?: boolean }) {
  const router = useRouter();

  const [selectedDorm, setSelectedDorm] = useState<DormOption | undefined>(undefined);

  useEffect(() => {
    if (dormParam) {
      fetch(`/api/yurtlar/${encodeURIComponent(dormParam)}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data) setSelectedDorm({ id: data.id, name: data.name, city: data.city, district: data.district, gender: data.gender, type: data.type });
        })
        .catch(() => {});
    }
  }, [dormParam]);

  const dormId = selectedDorm?.id || "";
  const dormName = selectedDorm?.name || "Yurt";

  const [relation, setRelation] = useState<"" | "CURRENT" | "FORMER">("");
  const [period, setPeriod] = useState("");
  const [periodSelected, setPeriodSelected] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [comment, setComment] = useState("");
  const [commentDone, setCommentDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const needsPeriod = relation === "FORMER";
  const questionsComplete = step >= QUESTIONS.length;
  const done = questionsComplete && commentDone;

  // Girişten dönüşte yarım kalan anketi geri yükleyip kendiliğinden kaydeder —
  // kullanıcı 8 soruyu ikinci kez cevaplamak zorunda kalmasın.
  const restored = useRef(false);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    if (!resume || restored.current) return;
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      if (draft.relation) setRelation(draft.relation);
      if (draft.period) {
        setPeriod(draft.period);
        setPeriodSelected(true);
      }
      if (Array.isArray(draft.answers) && draft.answers.length) {
        setAnswers(draft.answers);
        setStep(QUESTIONS.length);
      }
      if (draft.comment) setComment(draft.comment);
      restored.current = true;
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }, [resume]);

  useEffect(() => {
    if (!restored.current || autoSubmitted.current) return;
    if (!dormId || answers.length === 0) return;
    autoSubmitted.current = true;
    submitSurvey(comment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dormId, answers, comment]);

  function answer(val: Answer) {
    setAnswers((prev) => {
      const a = prev.slice(0, step);
      a[step] = val;
      return a;
    });
    setStep((s) => s + 1);
  }

  async function submitSurvey(finalComment: string) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/anket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dormId,
          answers,
          period: period || undefined,
          comment: finalComment || undefined,
        }),
      });

      // Kimlik en sonda isteniyor: cevaplar kaybolmasın diye taslağı saklayıp
      // girişe gönderiyoruz, dönüşte otomatik kaydediliyor.
      if (res.status === 401) {
        sessionStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ dormId, relation, period, answers, comment: finalComment }),
        );
        trackEvent("anket_kayit_gerekti", { yurt: dormId });
        const back = `/anket?dorm=${dormId}&devam=1`;
        router.push(`/giris?donuş=${encodeURIComponent(back)}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Bir hata oluştu");
        return;
      }
      sessionStorage.removeItem(DRAFT_KEY);
      trackEvent("anket_tamamlandi", { yurt: dormId, yorumlu: finalComment.length > 0 });
      trackMetaConversion();
      setCommentDone(true);
    } catch {
      setSubmitError("Sunucuya ulaşılamadı");
    } finally {
      setSubmitting(false);
    }
  }

  const q = QUESTIONS[done ? 0 : step];
  const light = LIGHTS[scoreSurvey(answers)];

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
                  onClick={() => {
                    trackEvent("anket_basladi", { yurt: dormId, iliski: "CURRENT" });
                    setRelation("CURRENT");
                  }}
                  className="rounded-2xl border-2 border-line bg-card px-6 py-[22px] text-left transition-all hover:border-primary hover:bg-surface hover:shadow-glow"
                >
                  <div className="mb-1.5 text-2xl">🏠</div>
                  <div className="text-[16.5px] font-semibold text-ink">Şu an kalıyorum</div>
                  <div className="mt-1 text-[13px] text-faint">Hâlâ bu yurtta ikamet ediyorum</div>
                </button>
                <button
                  onClick={() => {
                    trackEvent("anket_basladi", { yurt: dormId, iliski: "FORMER" });
                    setRelation("FORMER");
                  }}
                  className="rounded-2xl border-2 border-line bg-card px-6 py-[22px] text-left transition-all hover:border-primary hover:bg-surface hover:shadow-glow"
                >
                  <div className="mb-1.5 text-2xl">📦</div>
                  <div className="text-[16.5px] font-semibold text-ink">Eskiden kaldım</div>
                  <div className="mt-1 text-[13px] text-faint">Artık burada kalmıyorum</div>
                </button>
              </div>
            </div>
          ) : needsPeriod && !periodSelected ? (
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
              {submitError && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
                  {submitError}
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => submitSurvey("")}
                  disabled={submitting}
                  className="flex-1 rounded-xl border-2 border-line py-3.5 text-[15px] font-semibold text-faint transition-all hover:border-primary/30 disabled:opacity-50"
                >
                  {submitting ? "Gönderiliyor..." : "Atla"}
                </button>
                <button
                  onClick={() => submitSurvey(comment)}
                  disabled={(comment.length > 0 && comment.length < 15) || submitting}
                  className="flex-1 rounded-xl py-3.5 text-[15px] font-bold text-white transition-all disabled:opacity-40"
                  style={{ background: comment.length > 0 && comment.length < 15 ? "#D6D3D1" : "#F97316" }}
                >
                  {submitting ? "Gönderiliyor..." : "Gönder →"}
                </button>
              </div>
            </div>
          ) : (
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
                  <Link
                    href="/yurtlar"
                    className="rounded-2xl bg-white/10 px-[26px] py-3.5 text-[15px] font-semibold text-white"
                  >
                    Başka yurt değerlendir
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

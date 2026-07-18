"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { QUESTIONS, RESULT_BLURB } from "@/lib/survey";
import { LIGHTS, scoreSurvey, type Answer } from "@/lib/lights";
import { getDorm } from "@/lib/dorms";

export default function AnketPage() {
  return (
    <Suspense>
      <AnketContent />
    </Suspense>
  );
}

function AnketContent() {
  const searchParams = useSearchParams();
  const dormId = searchParams.get("dorm") || "kyk-ataturk-yurdu";
  const dorm = getDorm(dormId);
  const dormName = dorm?.name || "Yurt";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const done = step >= QUESTIONS.length;

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

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-line bg-paper/90 px-16 py-4 backdrop-blur-md max-md:px-5">
        <Logo />
        <div className="font-mono text-[13px] text-faint max-md:hidden">
          🥸 SinirliPenguen42 · kimliğin kasada 🔒
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-8 py-12 max-md:px-5">
        <div className="w-[720px] max-w-full">
          {!done ? (
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
                          i < step ? "#FF2D78" : i === step ? "#7C3AED" : "#F0E8EE",
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
                  <span className="font-mono text-[13px] text-faint">{step + 1}/9</span>
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
                    style={{ color: step > 0 ? "#FF2D78" : "#E0D4DE" }}
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
          ) : (
            <>
              <div className="animate-pop rounded-[22px] bg-ink px-12 py-[52px] text-center text-white max-md:px-6">
                <div className="mb-2.5 text-[44px]">🎉</div>
                <div className="mb-3.5 font-mono text-xs tracking-widest text-primary-light">
                  İTİRAF KAYDEDİLDİ — SAĞ OL SinirliPenguen42
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
                    href={`/sirket/${dormId}`}
                    className="gradient-pink rounded-2xl px-[26px] py-3.5 text-[15px] font-bold text-white"
                  >
                    Yurt profilini gör
                  </Link>
                  <button
                    onClick={() => {
                      setStep(0);
                      setAnswers([]);
                    }}
                    className="rounded-2xl bg-white/10 px-[26px] py-3.5 text-[15px] font-semibold text-white"
                  >
                    Bir daha doldur
                  </button>
                </div>
              </div>
              <p className="mt-5 text-center text-[13px] text-faint2">
                Hikâyeni de anlatmak istersen:{" "}
                <Link href={`/itiraf-yaz?dorm=${dormId}`} className="font-semibold text-primary">
                  itirafını yaz →
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

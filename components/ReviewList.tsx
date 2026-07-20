"use client";

import { useState } from "react";
import { LIGHTS } from "@/lib/lights";
import type { ProfileReview } from "@/lib/directory";

const REPORT_REASONS = [
  { value: "NAME_DISCLOSURE", label: "İsim ifşası", emoji: "🪪" },
  { value: "PROFANITY", label: "Küfür / hakaret", emoji: "🤬" },
  { value: "SPAM", label: "Spam / anlamsız", emoji: "🗑️" },
];

interface ReviewState {
  voted: boolean;
  agreed: boolean;
  reported: boolean;
  upDelta: number;
  sameDelta: number;
  voteLoading: boolean;
  agreeLoading: boolean;
}

export function ReviewList({ reviews }: { reviews: ProfileReview[] }) {
  const [states, setStates] = useState<Record<number, ReviewState>>({});
  const [reportIdx, setReportIdx] = useState<number | null>(null);
  const [reportSending, setReportSending] = useState(false);
  const [reportDone, setReportDone] = useState<Record<number, boolean>>({});

  function getState(i: number): ReviewState {
    return states[i] || {
      voted: false, agreed: false, reported: false,
      upDelta: 0, sameDelta: 0, voteLoading: false, agreeLoading: false,
    };
  }

  function updateState(i: number, patch: Partial<ReviewState>) {
    setStates((prev) => ({ ...prev, [i]: { ...getState(i), ...patch } }));
  }

  async function toggleVote(i: number, reviewId?: string) {
    const s = getState(i);
    if (s.voteLoading) return;
    updateState(i, { voteLoading: true });

    if (reviewId) {
      try {
        const res = await fetch("/api/oy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewId }),
        });
        if (res.ok) {
          const data = await res.json();
          updateState(i, {
            voted: data.voted,
            upDelta: data.voted ? 1 : 0,
            voteLoading: false,
          });
          return;
        }
      } catch { /* fall through to local toggle */ }
    }
    updateState(i, {
      voted: !s.voted,
      upDelta: s.voted ? 0 : 1,
      voteLoading: false,
    });
  }

  async function toggleAgree(i: number, reviewId?: string) {
    const s = getState(i);
    if (s.agreeLoading) return;
    updateState(i, { agreeLoading: true });

    if (reviewId) {
      try {
        const res = await fetch("/api/aynen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewId }),
        });
        if (res.ok) {
          const data = await res.json();
          updateState(i, {
            agreed: data.agreed,
            sameDelta: data.agreed ? 1 : 0,
            agreeLoading: false,
          });
          return;
        }
      } catch { /* fall through */ }
    }
    updateState(i, {
      agreed: !s.agreed,
      sameDelta: s.agreed ? 0 : 1,
      agreeLoading: false,
    });
  }

  async function submitReport(i: number, reason: string, reviewId?: string) {
    setReportSending(true);
    if (reviewId) {
      try {
        await fetch("/api/bildir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewId, reason }),
        });
      } catch { /* ok */ }
    }
    setReportDone((prev) => ({ ...prev, [i]: true }));
    updateState(i, { reported: true });
    setReportSending(false);
    setTimeout(() => setReportIdx(null), 1200);
  }

  return (
    <>
      <div className="grid gap-3.5">
        {reviews.map((r, i) => {
          const l = LIGHTS[r.light];
          const s = getState(i);
          const up = r.up + s.upDelta;
          const same = r.same + s.sameDelta;

          return (
            <div key={i} className="rounded-card border border-line bg-card p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <div
                  className="grid h-[34px] w-[34px] place-items-center rounded-full text-base"
                  style={{ background: r.avBg }}
                >
                  {r.emoji}
                </div>
                <div className="flex-1">
                  <span className="font-mono text-[13.5px] font-medium text-ink">
                    {r.author}
                  </span>
                  <span className="text-[12.5px] text-faint">
                    {" "}· {r.role} · {r.when}
                  </span>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-pill px-3 py-[5px] text-[12.5px] font-semibold"
                  style={{ background: l.badgeBg, color: l.badgeFg }}
                >
                  <span className="h-[7px] w-[7px] rounded-full" style={{ background: l.dot }} />
                  {l.label}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed text-body">{r.text}</p>
              <div className="mt-3.5 flex gap-2 text-[13px]">
                <button
                  onClick={() => toggleVote(i, r.id)}
                  disabled={s.voteLoading}
                  className="inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-[7px] font-medium transition-all"
                  style={{
                    background: s.voted ? "#ECFDF5" : "transparent",
                    borderColor: s.voted ? "#A7F3D0" : "#F0EBE5",
                    color: s.voted ? "#0d7a6f" : "#78716C",
                  }}
                >
                  <span className="text-[15px]" style={{ transform: s.voted ? "scale(1.2)" : "scale(1)", transition: "transform 0.2s" }}>
                    👍
                  </span>
                  Faydalı
                  <span className="font-mono text-[12px]">({up})</span>
                </button>
                <button
                  onClick={() => toggleAgree(i, r.id)}
                  disabled={s.agreeLoading}
                  className="inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-[7px] font-medium transition-all"
                  style={{
                    background: s.agreed ? "#FFF7ED" : "transparent",
                    borderColor: s.agreed ? "#FED7AA" : "#F0EBE5",
                    color: s.agreed ? "#EA580C" : "#78716C",
                  }}
                >
                  <span className="text-[15px]" style={{ transform: s.agreed ? "scale(1.2)" : "scale(1)", transition: "transform 0.2s" }}>
                    🤝
                  </span>
                  Aynen yaşadım
                  <span className="font-mono text-[12px]">({same})</span>
                </button>
                <button
                  onClick={() => !s.reported && setReportIdx(i)}
                  disabled={s.reported}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-line px-3.5 py-[7px] font-medium transition-all"
                  style={{
                    color: s.reported ? "#A8A29E" : "#78716C",
                    cursor: s.reported ? "default" : "pointer",
                  }}
                >
                  {s.reported ? "✅ Bildirildi" : "🚩 Bildir"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bildir Modal */}
      {reportIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => !reportSending && setReportIdx(null)}
        >
          <div
            className="animate-pop mx-4 w-full max-w-[400px] rounded-[22px] border border-line bg-card p-8 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {reportDone[reportIdx] ? (
              <div className="text-center">
                <div className="mb-3 text-4xl">✅</div>
                <h3 className="text-lg font-bold text-ink">Bildirim alındı</h3>
                <p className="mt-2 text-sm text-faint">İncelenecek, teşekkürler.</p>
              </div>
            ) : (
              <>
                <h3 className="mb-1 text-lg font-bold text-ink">Neden bildiriyorsun?</h3>
                <p className="mb-5 text-[13px] text-faint">
                  Sadece kural ihlali için bildir. Farklı görüş = bildir değil.
                </p>
                <div className="grid gap-2.5">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      onClick={() => submitReport(reportIdx, reason.value, reviews[reportIdx]?.id)}
                      disabled={reportSending}
                      className="flex items-center gap-3 rounded-xl border-2 border-line px-4 py-3.5 text-left text-[15px] font-medium text-ink transition-all hover:border-primary/40 hover:bg-surface disabled:opacity-50"
                    >
                      <span className="text-xl">{reason.emoji}</span>
                      {reason.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setReportIdx(null)}
                  className="mt-4 w-full text-center text-[13px] text-faint transition-colors hover:text-ink"
                >
                  Vazgeç
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

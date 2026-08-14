"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/ben").then((r) => setLoggedIn(r.ok)).catch(() => {});
  }, []);

  const [states, setStates] = useState<Record<string, ReviewState>>({});
  const [reportIdx, setReportIdx] = useState<number | null>(null);
  const [reportSending, setReportSending] = useState(false);
  const [reportDone, setReportDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const init: Record<string, ReviewState> = {};
    for (const r of reviews) {
      const key = r.id || r.author + r.text.slice(0, 20);
      if (r.voted || r.agreed) {
        init[key] = {
          voted: !!r.voted, agreed: !!r.agreed, reported: false,
          upDelta: 0, sameDelta: 0, voteLoading: false, agreeLoading: false,
        };
      }
    }
    setStates(init);
  }, [reviews]);

  function reviewKey(r: ProfileReview): string {
    return r.id || r.author + r.text.slice(0, 20);
  }

  function getState(key: string): ReviewState {
    return states[key] || {
      voted: false, agreed: false, reported: false,
      upDelta: 0, sameDelta: 0, voteLoading: false, agreeLoading: false,
    };
  }

  function updateState(key: string, patch: Partial<ReviewState>) {
    setStates((prev) => ({ ...prev, [key]: { ...getState(key), ...patch } }));
  }

  async function toggleVote(key: string, id?: string, type?: string) {
    const s = getState(key);
    if (s.voteLoading) return;
    updateState(key, { voteLoading: true });

    if (id) {
      try {
        const body = type === "survey" ? { surveyId: id } : { reviewId: id };
        const res = await fetch("/api/oy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          const wasPreviouslyVoted = s.voted;
          updateState(key, {
            voted: data.voted,
            upDelta: data.voted && !wasPreviouslyVoted ? 1 : !data.voted && wasPreviouslyVoted ? -1 : 0,
            voteLoading: false,
          });
          return;
        }
      } catch { /* fall through to local toggle */ }
    }
    updateState(key, {
      voted: !s.voted,
      upDelta: s.voted ? s.upDelta - 1 : s.upDelta + 1,
      voteLoading: false,
    });
  }

  async function toggleAgree(key: string, id?: string, type?: string) {
    const s = getState(key);
    if (s.agreeLoading) return;
    updateState(key, { agreeLoading: true });

    if (id) {
      try {
        const body = type === "survey" ? { surveyId: id } : { reviewId: id };
        const res = await fetch("/api/aynen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          const wasPreviouslyAgreed = s.agreed;
          updateState(key, {
            agreed: data.agreed,
            sameDelta: data.agreed && !wasPreviouslyAgreed ? 1 : !data.agreed && wasPreviouslyAgreed ? -1 : 0,
            agreeLoading: false,
          });
          return;
        }
      } catch { /* fall through */ }
    }
    updateState(key, {
      agreed: !s.agreed,
      sameDelta: s.agreed ? s.sameDelta - 1 : s.sameDelta + 1,
      agreeLoading: false,
    });
  }

  async function submitReport(key: string, reason: string, reviewId?: string) {
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
    setReportDone((prev) => ({ ...prev, [key]: true }));
    updateState(key, { reported: true });
    setReportSending(false);
    setTimeout(() => setReportIdx(null), 1200);
  }

  return (
    <>
      <div className="grid gap-3.5">
        {reviews.map((r, i) => {
          const l = LIGHTS[r.light];
          const key = reviewKey(r);
          const s = getState(key);
          const up = r.up + s.upDelta;
          const same = r.same + s.sameDelta;

          return (
            <div key={key} className="rounded-card border border-line bg-card p-6">
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
                  onClick={() => loggedIn ? toggleVote(key, r.id, r.type) : router.push("/giris")}
                  disabled={s.voteLoading}
                  className="inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-[7px] font-medium transition-all"
                  style={{
                    background: s.voted ? "#ECFDF5" : "transparent",
                    borderColor: s.voted ? "#A7F3D0" : "#F0EBE5",
                    color: s.voted ? "#0d7a6f" : "#78716C",
                    opacity: loggedIn ? 1 : 0.55,
                    cursor: loggedIn ? "pointer" : "default",
                  }}
                >
                  <span className="text-[15px]" style={{ transform: s.voted ? "scale(1.2)" : "scale(1)", transition: "transform 0.2s" }}>
                    👍
                  </span>
                  Faydalı
                  <span className="font-mono text-[12px]">({up})</span>
                </button>
                <button
                  onClick={() => loggedIn ? toggleAgree(key, r.id, r.type) : router.push("/giris")}
                  disabled={s.agreeLoading}
                  className="inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-[7px] font-medium transition-all"
                  style={{
                    background: s.agreed ? "#FFF7ED" : "transparent",
                    borderColor: s.agreed ? "#FED7AA" : "#F0EBE5",
                    color: s.agreed ? "#EA580C" : "#78716C",
                    opacity: loggedIn ? 1 : 0.55,
                    cursor: loggedIn ? "pointer" : "default",
                  }}
                >
                  <span className="text-[15px]" style={{ transform: s.agreed ? "scale(1.2)" : "scale(1)", transition: "transform 0.2s" }}>
                    🤝
                  </span>
                  Aynen
                  <span className="font-mono text-[12px]">({same})</span>
                </button>
                <button
                  onClick={() => loggedIn ? (!s.reported && setReportIdx(i)) : router.push("/giris")}
                  disabled={s.reported}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-line px-3.5 py-[7px] font-medium transition-all"
                  style={{
                    color: s.reported ? "#A8A29E" : "#78716C",
                    cursor: s.reported || !loggedIn ? "default" : "pointer",
                    opacity: loggedIn ? 1 : 0.55,
                  }}
                >
                  {s.reported ? "Bildirildi" : "Bildir"}
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
            {reportDone[reviewKey(reviews[reportIdx])] ? (
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
                      onClick={() => submitReport(reviewKey(reviews[reportIdx]), reason.value, reviews[reportIdx]?.id)}
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

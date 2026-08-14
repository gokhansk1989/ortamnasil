"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function DormSurveyNudge({ dormId }: { dormId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/auth/ben")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        fetch(`/api/anket/kontrol?dormId=${encodeURIComponent(dormId)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((res) => {
            if (res && !res.hasSurvey) setShow(true);
          });
      })
      .catch(() => {});
  }, [dormId]);

  if (!show) return null;

  return (
    <div className="mb-5 overflow-hidden rounded-[22px] border-2 border-dashed border-primary/40 bg-gradient-to-r from-orange-50 to-amber-50 p-5">
      <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:text-center">
        <div>
          <div className="mb-1 text-[15px] font-bold text-ink">
            Bu yurdu tanıyor musun?
          </div>
          <p className="text-[13.5px] text-muted">
            2 dakikalık anonim anketle deneyimini paylaş, bir sonraki öğrenciye yol göster.
          </p>
        </div>
        <Link
          href={`/anket?dorm=${dormId}`}
          className="gradient-pink flex-shrink-0 rounded-xl px-5 py-2.5 text-[14px] font-bold text-white shadow-glow transition-transform hover:scale-105"
        >
          Anonim puanla →
        </Link>
      </div>
    </div>
  );
}

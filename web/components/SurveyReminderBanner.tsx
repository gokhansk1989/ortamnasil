"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DISMISS_KEY = "ortamnasil_survey_banner_dismissed";
const DISMISS_DAYS = 3;

export function SurveyReminderBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < DISMISS_DAYS * 86400000) return;
    }

    fetch("/api/auth/ben")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.stats?.surveys === 0) setShow(true);
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="border-b border-emerald-200 bg-emerald-50 px-16 py-3 max-md:px-4">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 max-md:gap-2">
          <span className="text-[14px] font-medium text-emerald-800">
            📝 Yurdunu henüz değerlendirmedin. 9 soru, 2 dakika, tamamen anonim.
          </span>
          <Link
            href="/anket"
            className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Anketi doldur →
          </Link>
        </div>
        <button
          onClick={dismiss}
          className="flex-shrink-0 text-emerald-400 transition-colors hover:text-emerald-600"
          aria-label="Kapat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

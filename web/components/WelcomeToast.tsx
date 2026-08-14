"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DISMISS_KEY = "ortamnasil_welcome_dismissed";
const DISMISS_DAYS = 7;

export function WelcomeToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const expiry = parseInt(dismissed, 10);
      if (Date.now() < expiry) return;
    }
    const timer = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86400000));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 w-[340px] animate-slideUp rounded-2xl border border-line bg-card p-5 shadow-xl max-md:left-3 max-md:right-3 max-md:w-auto">
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 text-faint transition-colors hover:text-ink"
        aria-label="Kapat"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="mb-2.5 text-[22px]">🚀</div>
      <div className="mb-1.5 text-[16px] font-bold text-ink">
        Yeni açıldık!
      </div>
      <p className="mb-4 text-[13.5px] leading-relaxed text-muted">
        OrtamNasıl? henüz yeni doğdu. Sizin değerlendirmelerinizle büyüyeceğiz.
        İlk yorumu yazan sen ol, binlerce öğrenciye yol göster.
      </p>
      <div className="flex gap-2">
        <Link
          href="/anket"
          onClick={handleDismiss}
          className="gradient-pink flex-1 rounded-xl py-2.5 text-center text-[13.5px] font-bold text-white transition-transform hover:scale-105"
        >
          Değerlendir
        </Link>
        <button
          onClick={handleDismiss}
          className="flex-1 rounded-xl border border-line py-2.5 text-[13.5px] font-medium text-faint transition-colors hover:bg-surface"
        >
          Sonra
        </button>
      </div>
    </div>
  );
}

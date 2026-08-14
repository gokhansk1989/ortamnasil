"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "ortamnasil_push_dismissed";
const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function PushNotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!VAPID_KEY) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const timer = setTimeout(() => {
      fetch("/api/auth/ben")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.stats?.surveys === 0) setShow(true);
        })
        .catch(() => {});
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  async function handleAllow() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShow(false);
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY!) as BufferSource,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setShow(false);
    } catch {
      setShow(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[320px] rounded-2xl border border-line bg-card p-5 shadow-xl max-md:left-4 max-md:right-4 max-md:w-auto">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-[15px] font-bold text-ink">🔔 Hatırlatma almak ister misin?</span>
        <button
          onClick={handleDismiss}
          className="text-faint transition-colors hover:text-ink"
          aria-label="Kapat"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="mb-4 text-[13px] leading-relaxed text-muted">
        Yurdunu değerlendirmeni hatırlatalım. Bildirimler anonim, istediğin zaman kapatabilirsin.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleAllow}
          className="gradient-pink flex-1 rounded-xl py-2.5 text-[13.5px] font-bold text-white transition-transform hover:scale-105"
        >
          İzin ver
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 rounded-xl border border-line py-2.5 text-[13.5px] font-medium text-faint transition-colors hover:bg-surface"
        >
          Hayır
        </button>
      </div>
    </div>
  );
}

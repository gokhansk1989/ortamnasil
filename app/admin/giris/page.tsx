"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";

export default function AdminGirisPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/admin/giris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = "/admin";
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <div className="mt-4 font-mono text-[11px] tracking-widest text-primary-light">
            🔐 KUMANDA ODASI GİRİŞİ
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[22px] border border-white/10 bg-white/[.06] px-8 py-8 backdrop-blur-sm"
        >
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-white">
              Yönetici şifresi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="••••••••"
              autoFocus
              className="w-full rounded-xl border-2 bg-white/10 px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-onDarkMuted"
              style={{ borderColor: error ? "#e05d4b" : "rgba(255,255,255,0.15)" }}
            />
            {error && (
              <div className="mt-2 text-[13px] text-light-red">
                Şifre yanlış. Tekrar dene.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 1}
            className="gradient-pink w-full rounded-xl py-3.5 text-[15px] font-bold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Kontrol ediliyor..." : "Giriş yap"}
          </button>

          <p className="mt-4 text-center text-[12px] text-onDarkMuted">
            Bu alan sadece yöneticiler içindir. 🛡️
          </p>
        </form>
      </div>
    </div>
  );
}

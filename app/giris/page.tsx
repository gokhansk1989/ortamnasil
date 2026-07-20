"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

const POOL = [
  "KızgınKanguru7", "MelankolikMartı", "SabırlıAhtapot", "KaçakÇaycı",
  "GizliVizyoner", "YorgunUnicorn", "PasifAgresifPanda", "MesaideKayıp",
];

type Tab = "kayit" | "giris";

export default function GirisPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("kayit");
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clean = nick.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canRegister = clean.length >= 3 && emailValid;
  const canLogin = emailValid;

  async function handleRegister() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick: clean, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
        return;
      }
      setSuccess(`Hoş geldin ${data.nick}!`);
      setTimeout(() => router.push("/"), 1200);
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
        return;
      }
      setSuccess(`Tekrar hoş geldin ${data.nick}!`);
      setTimeout(() => router.push("/"), 1200);
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex items-center justify-center py-6">
        <Logo />
      </header>

      <div className="flex flex-1 items-center justify-center px-8 pb-16 pt-6 max-md:px-5">
        <div className="w-[520px] max-w-full">
          <div className="mb-7 text-center">
            <div className="mb-3 text-[44px]">🥸</div>
            <h1 className="mb-2.5 text-[32px] font-bold tracking-[-.5px] text-ink">
              {tab === "kayit" ? "Kim olmak istersin?" : "Tekrar hoş geldin"}
            </h1>
            <p className="text-[15.5px] leading-relaxed text-muted">
              {tab === "kayit"
                ? "Gerçek ismini isteMİyoruz. Buradaki kimliğin, seçeceğin takma ad."
                : "E-postanla giriş yap — kimliğin her zamanki gibi gizli."}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="mb-5 flex rounded-xl bg-surface p-1">
            <button
              onClick={() => { setTab("kayit"); setError(""); setSuccess(""); }}
              className="flex-1 rounded-lg py-2.5 text-[14px] font-semibold transition-all"
              style={{
                background: tab === "kayit" ? "white" : "transparent",
                color: tab === "kayit" ? "#1C1917" : "#A8A29E",
                boxShadow: tab === "kayit" ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              }}
            >
              Kayıt ol
            </button>
            <button
              onClick={() => { setTab("giris"); setError(""); setSuccess(""); }}
              className="flex-1 rounded-lg py-2.5 text-[14px] font-semibold transition-all"
              style={{
                background: tab === "giris" ? "white" : "transparent",
                color: tab === "giris" ? "#1C1917" : "#A8A29E",
                boxShadow: tab === "giris" ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              }}
            >
              Giriş yap
            </button>
          </div>

          <div className="grid gap-5 rounded-[22px] border border-line bg-card px-9 py-8 shadow-lg max-md:px-6">
            {tab === "kayit" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Takma adın</label>
                <div className="flex gap-2.5">
                  <input
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                    placeholder="örn. SinirliPenguen42"
                    className="flex-1 rounded-xl border-2 border-line bg-card px-4 py-3.5 font-mono text-[15px] text-ink outline-none transition-colors focus:border-primary/40"
                  />
                  <button
                    onClick={() => setNick(POOL[Math.floor(Math.random() * POOL.length)])}
                    title="Rastgele öner"
                    className="rounded-xl border-2 border-line bg-surface px-4 text-lg transition-all hover:scale-105 hover:border-primary/30"
                  >
                    🎲
                  </button>
                </div>
                {clean.length > 0 && clean.length < 3 && (
                  <div className="mt-2 text-[13px]" style={{ color: "#eb8a4a" }}>
                    En az 3 karakter olmalı.
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                E-posta{" "}
                <span className="font-normal text-faint">(tek yönlü şifrelenir, kimse göremez)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sen@ornek.com"
                className="w-full rounded-xl border-2 border-line bg-card px-4 py-3.5 text-[15px] text-ink outline-none transition-colors focus:border-primary/40"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-[14px] font-medium text-green-700">
                {success}
              </div>
            )}

            <button
              onClick={tab === "kayit" ? handleRegister : handleLogin}
              disabled={loading || (tab === "kayit" ? !canRegister : !canLogin)}
              className="gradient-pink rounded-xl py-[15px] text-base font-bold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading
                ? "Bekle..."
                : tab === "kayit"
                  ? "Bu kimlikle devam et"
                  : "Giriş yap"}
            </button>

            <p className="text-center text-[12.5px] leading-normal text-faint2">
              🔒 E-postan tek yönlü şifrelenerek saklanır. Takma adınla eşleştirilemez.
            </p>
          </div>

          {tab === "kayit" && (
            <div className="mt-5 text-center">
              <div className="mb-2.5 text-[12.5px] text-faint2">İlham lazımsa, boşta olanlardan:</div>
              <div className="flex flex-wrap justify-center gap-2">
                {POOL.slice(0, 4).map((name) => (
                  <button
                    key={name}
                    onClick={() => setNick(name)}
                    className="rounded-pill border border-line bg-card px-3.5 py-1.5 font-mono text-[12.5px] text-primary transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

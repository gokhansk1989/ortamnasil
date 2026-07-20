"use client";

import { useState, useRef } from "react";
import { Logo } from "@/components/Logo";

type Step = "password" | "otp";

export default function AdminGirisPage() {
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [otpId, setOtpId] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullCode = code.join("");

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setCode(pasted.split(""));
      digitRefs.current[5]?.focus();
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
        return;
      }

      if (data.needsOtp) {
        setOtpId(data.otpId);
        setStep("otp");
      }
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp() {
    if (fullCode.length !== 6) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpId, code: fullCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
        setCode(["", "", "", "", "", ""]);
        digitRefs.current[0]?.focus();
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setStep("password");
    setPassword("");
    setCode(["", "", "", "", "", ""]);
    setError("");
    setOtpId("");
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

        {step === "password" ? (
          <form
            onSubmit={handlePassword}
            className="rounded-[22px] border border-white/10 bg-white/[.06] px-8 py-8 backdrop-blur-sm"
          >
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-white">
                Yönetici şifresi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                autoFocus
                className="w-full rounded-xl border-2 bg-white/10 px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-onDarkMuted"
                style={{ borderColor: error ? "#e05d4b" : "rgba(255,255,255,0.15)" }}
              />
              {error && (
                <div className="mt-2 text-[13px] text-light-red">
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 1}
              className="gradient-pink w-full rounded-xl py-3.5 text-[15px] font-bold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "Kontrol ediliyor..." : "Devam et"}
            </button>

            <p className="mt-4 text-center text-[12px] text-onDarkMuted">
              Bu alan sadece yöneticiler içindir. 🛡️
            </p>
          </form>
        ) : (
          <div className="rounded-[22px] border border-white/10 bg-white/[.06] px-8 py-8 backdrop-blur-sm">
            <div className="mb-6 text-center">
              <div className="mb-2 text-[28px]">📬</div>
              <p className="text-[14px] text-onDarkMuted">
                Admin e-postana 6 haneli doğrulama kodu gönderildi.
              </p>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-center text-sm font-semibold text-white">
                Doğrulama kodu
              </label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { digitRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="h-14 w-11 rounded-xl border-2 border-white/15 bg-white/10 text-center font-mono text-2xl font-bold text-white outline-none transition-colors focus:border-primary/60"
                  />
                ))}
              </div>
              {error && (
                <div className="mt-3 text-center text-[13px] text-light-red">
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handleOtp}
              disabled={loading || fullCode.length !== 6}
              className="gradient-pink w-full rounded-xl py-3.5 text-[15px] font-bold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "Doğrulanıyor..." : "Giriş yap"}
            </button>

            <button
              onClick={goBack}
              className="mt-4 w-full text-center text-[13px] text-onDarkMuted transition-colors hover:text-white"
            >
              ← Geri dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

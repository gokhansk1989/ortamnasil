"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

type Step = "email" | "code" | "done";

export default function SifreSifirlaPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  async function handleRequestCode() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/sifre-sifirla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, step: "request" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
        return;
      }
      setSuccess("Kayıtlıysa e-postana sıfırlama kodu gönderildi.");
      setStep("code");
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/sifre-sifirla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode, newPassword, step: "reset" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
        if (data.error === "Kod hatalı") {
          setCode(["", "", "", "", "", ""]);
          digitRefs.current[0]?.focus();
        }
        return;
      }
      setStep("done");
      setSuccess("Şifren güncellendi! Giriş sayfasına yönlendiriliyorsun...");
      setTimeout(() => router.push("/giris"), 2000);
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
            <div className="mb-3 text-[44px]">🔑</div>
            <h1 className="mb-2.5 text-[32px] font-bold tracking-[-.5px] text-ink">
              {step === "done" ? "Şifren güncellendi" : "Şifreni sıfırla"}
            </h1>
            <p className="text-[15.5px] leading-relaxed text-muted">
              {step === "email" && "E-postanı gir, sıfırlama kodu gönderelim."}
              {step === "code" && "E-postana gelen kodu ve yeni şifreni gir."}
              {step === "done" && "Artık yeni şifrenle giriş yapabilirsin."}
            </p>
          </div>

          <div className="grid gap-5 rounded-[22px] border border-line bg-card px-9 py-8 shadow-lg max-md:px-6">
            {step === "email" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">E-posta</label>
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

                <button
                  onClick={handleRequestCode}
                  disabled={loading || !emailValid}
                  className="gradient-pink rounded-xl py-[15px] text-base font-bold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? "Gönderiliyor..." : "Sıfırlama kodu gönder"}
                </button>
              </>
            )}

            {step === "code" && (
              <>
                <div>
                  <label className="mb-3 block text-center text-sm font-semibold text-ink">
                    Doğrulama kodu
                  </label>
                  <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
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
                        className="h-14 w-12 rounded-xl border-2 border-line bg-surface text-center font-mono text-2xl font-bold text-ink outline-none transition-colors focus:border-primary/60 max-md:h-12 max-md:w-10"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">
                    Yeni şifre <span className="font-normal text-faint">(en az 6 karakter)</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Yeni şifreni belirle"
                    className="w-full rounded-xl border-2 border-line bg-card px-4 py-3.5 text-[15px] text-ink outline-none transition-colors focus:border-primary/40"
                  />
                  {newPassword.length > 0 && newPassword.length < 6 && (
                    <div className="mt-2 text-[13px]" style={{ color: "#eb8a4a" }}>
                      En az 6 karakter olmalı.
                    </div>
                  )}
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
                  onClick={handleReset}
                  disabled={loading || fullCode.length !== 6 || newPassword.length < 6}
                  className="gradient-pink rounded-xl py-[15px] text-base font-bold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? "Güncelleniyor..." : "Şifremi güncelle"}
                </button>

                <button
                  onClick={() => { setStep("email"); setError(""); setSuccess(""); setCode(["", "", "", "", "", ""]); setNewPassword(""); }}
                  className="text-[13px] text-muted transition-colors hover:text-ink"
                >
                  ← Geri dön
                </button>
              </>
            )}

            {step === "done" && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-center text-[14px] font-medium text-green-700">
                {success}
              </div>
            )}

            <p className="text-center text-[12.5px] leading-normal text-faint2">
              Spam klasörünü kontrol etmeyi unutma.
            </p>
          </div>

          <div className="mt-5 text-center">
            <Link href="/giris" className="text-[14px] font-medium text-primary transition-colors hover:text-primary/80">
              ← Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/Logo";

type Step = "email" | "done";

export default function SifreSifirlaPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleRequest() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/sifre-sifirla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
        return;
      }
      setStep("done");
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
              {step === "done" ? "E-postanı kontrol et" : "Şifreni sıfırla"}
            </h1>
            <p className="text-[15.5px] leading-relaxed text-muted">
              {step === "email" && "E-postanı gir, geçici şifre gönderelim."}
              {step === "done" && "Kayıtlıysa e-postana geçici şifre gönderildi. Bu şifreyle giriş yaptıktan sonra yeni şifreni belirleyeceksin."}
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
                  onClick={handleRequest}
                  disabled={loading || !emailValid}
                  className="gradient-pink rounded-xl py-[15px] text-base font-bold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? "Gönderiliyor..." : "Geçici şifre gönder"}
                </button>
              </>
            )}

            {step === "done" && (
              <div className="grid gap-4 text-center">
                <div className="rounded-xl bg-green-50 px-4 py-3 text-[14px] font-medium text-green-700">
                  Geçici şifre e-postana gönderildi. Spam klasörünü kontrol etmeyi unutma.
                </div>
                <Link
                  href="/giris"
                  className="gradient-pink rounded-xl py-[15px] text-base font-bold text-white shadow-glow transition-transform hover:scale-[1.02]"
                >
                  Giriş sayfasına git
                </Link>
              </div>
            )}

            <p className="text-center text-[12.5px] leading-normal text-faint2">
              Geçici şifreyle giriş yaptıktan sonra yeni şifreni belirlemen istenecek.
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

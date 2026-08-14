"use client";

import { useEffect, useState, useRef } from "react";

type Phase = "idle" | "sending" | "code" | "verifying" | "done";

export function VerificationBanner() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/auth/ben")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.emailVerified === false) {
          setUserId(data.id);
          const storedEmail = sessionStorage.getItem("ortamnasil_verify_email");
          if (storedEmail) setEmail(storedEmail);
          setShow(true);
        }
      })
      .catch(() => {});
  }, []);

  function startCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendCode() {
    if (!email) return;
    setPhase("sending");
    setError("");
    try {
      const res = await fetch("/api/auth/tekrar-gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
        setPhase("idle");
        return;
      }
      if (data.userId) setUserId(data.userId);
      setPhase("code");
      setSuccess("Doğrulama kodu gönderildi!");
      startCooldown();
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Sunucuya ulaşılamadı");
      setPhase("idle");
    }
  }

  async function handleVerify() {
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;
    setPhase("verifying");
    setError("");
    try {
      const res = await fetch("/api/auth/dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
        setCode(["", "", "", "", "", ""]);
        digitRefs.current[0]?.focus();
        setPhase("code");
        return;
      }
      sessionStorage.removeItem("ortamnasil_verify_email");
      sessionStorage.removeItem("ortamnasil_verify_uid");
      setPhase("done");
      setSuccess("E-postan doğrulandı!");
      setTimeout(() => setShow(false), 2000);
    } catch {
      setError("Sunucuya ulaşılamadı");
      setPhase("code");
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || !email) return;
    setError("");
    try {
      const res = await fetch("/api/auth/tekrar-gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
        return;
      }
      if (data.userId) setUserId(data.userId);
      setSuccess("Yeni kod gönderildi!");
      setCode(["", "", "", "", "", ""]);
      startCooldown();
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Sunucuya ulaşılamadı");
    }
  }

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) digitRefs.current[index + 1]?.focus();
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

  if (!show) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-16 py-3 max-md:px-4">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-3">
        {phase === "done" ? (
          <div className="flex items-center gap-2 text-[14px] font-medium text-green-700">
            <span>&#10003;</span> {success}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 max-md:gap-2">
              <span className="text-[14px] font-medium text-amber-800">
                E-postan henüz doğrulanmadı.
              </span>

              {email ? (
                phase === "idle" || phase === "sending" ? (
                  <button
                    onClick={handleSendCode}
                    disabled={phase === "sending"}
                    className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                  >
                    {phase === "sending" ? "Gönderiliyor..." : "Doğrulama kodu gönder"}
                  </button>
                ) : null
              ) : (
                <a
                  href="/giris"
                  className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-amber-700"
                >
                  Giriş yaparak doğrula
                </a>
              )}
            </div>

            {(phase === "code" || phase === "verifying") && (
              <div className="flex flex-wrap items-center gap-3 max-md:gap-2">
                <div className="flex gap-1.5" onPaste={handlePaste}>
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
                      className="h-9 w-8 rounded-lg border border-amber-300 bg-white text-center font-mono text-lg font-bold text-ink outline-none focus:border-amber-500"
                    />
                  ))}
                </div>
                <button
                  onClick={handleVerify}
                  disabled={phase === "verifying" || code.join("").length !== 6}
                  className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                >
                  {phase === "verifying" ? "Doğrulanıyor..." : "Doğrula"}
                </button>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-[12px] font-medium text-amber-700 hover:text-amber-900 disabled:text-amber-400"
                >
                  {resendCooldown > 0 ? `Tekrar gönder (${resendCooldown}s)` : "Tekrar gönder"}
                </button>
              </div>
            )}

            {error && (
              <div className="text-[13px] font-medium text-red-600">{error}</div>
            )}
            {success && (
              <div className="text-[13px] font-medium text-green-700">{success}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

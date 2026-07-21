"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

const ADJECTIVES = [
  "Kızgın", "Melankolik", "Sabırlı", "Gizli", "Yorgun", "Pasif", "Neşeli",
  "Huzursuz", "Kaçak", "Hayalet", "Sessiz", "Uykusuz", "Dalgın", "Aceleci",
  "Sinsi", "Gizemli", "Sakin", "Gürültücü", "Tembel", "Hırslı", "Utangaç",
  "Cesur", "Kurnaz", "Alıngan", "Şanslı", "Şüpheci", "Panikçi", "Romantik",
  "Karamsar", "İyimser", "Kayıp", "Gezgin", "Meraklı",
  "Dramatik", "Nostaljik", "Çılgın", "Fırtınalı", "Soğukkanlı", "Dertli",
  "Muzip", "Kaotik", "Epik", "Efsanevi", "Asi", "Takılgan", "Hayalperest",
  "Maceracı", "Filozofik", "Garip", "Şaşkın",
];

const NOUNS = [
  "Kanguru", "Martı", "Ahtapot", "Penguen", "Unicorn", "Panda", "Tilki",
  "Baykuş", "Kedi", "Sincap", "Koala", "Flamingo", "Papağan", "Tavşan",
  "Kurt", "Kartal", "Yunus", "Kirpi", "Bukalemun", "Arı", "Karga",
  "Çaycı", "Vizyoner", "Gezgin", "Kaşif", "Kaptan", "Müfettiş", "Ninja",
  "Korsan", "Astronot", "Şef", "Derviş", "Samuray", "Kahin", "Simyacı",
  "Hacker", "Pilot", "Viking", "Şövalye", "Denizci", "Palyaço", "Casus",
  "Postacı", "Tamirci", "Garson", "Aşçıbaşı", "Muhtar", "Bekçi", "Kapıcı",
  "Stajyer",
];

function generateNick(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}${noun}${num}`;
}

const STATIC_SHOWCASE = [
  "KızgınKanguru7", "MelankolikMartı42", "SabırlıAhtapot19", "KaçakÇaycı88",
];

type Tab = "kayit" | "giris";
type Step = "form" | "verify";

export default function GirisPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("kayit");
  const [step, setStep] = useState<Step>("form");
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showcase, setShowcase] = useState(STATIC_SHOWCASE);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setShowcase([generateNick(), generateNick(), generateNick(), generateNick()]);
  }, []);

  const clean = nick.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canRegister = clean.length >= 3 && emailValid && password.length >= 6;
  const canLogin = emailValid && password.length >= 1;
  const fullCode = code.join("");
  const canVerify = fullCode.length === 6;

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

  async function handleRegister() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick: clean, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
        return;
      }
      if (data.needsVerification) {
        setUserId(data.id);
        setStep("verify");
        setSuccess("Doğrulama kodu e-postana gönderildi!");
        startResendCooldown();
      }
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
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsVerification) {
          setUserId(data.userId);
          setStep("verify");
          setError("E-postan henüz doğrulanmamış. Kodunu gir veya yeni kod iste.");
          return;
        }
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

  async function handleVerify() {
    setLoading(true);
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

  function startResendCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setLoading(true);
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
      startResendCooldown();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setStep("form");
    setCode(["", "", "", "", "", ""]);
    setError("");
    setSuccess("");
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex items-center justify-center py-6">
        <Logo />
      </header>

      <div className="flex flex-1 items-center justify-center px-8 pb-16 pt-6 max-md:px-5">
        <div className="w-[520px] max-w-full">
          {step === "form" ? (
            <>
              <div className="mb-7 text-center">
                <div className="mb-3 text-[44px]">🥸</div>
                <h1 className="mb-2.5 text-[32px] font-bold tracking-[-.5px] text-ink">
                  {tab === "kayit" ? "Kim olmak istersin?" : "Tekrar hoş geldin"}
                </h1>
                <p className="text-[15.5px] leading-relaxed text-muted">
                  {tab === "kayit"
                    ? "Gerçek ismini istemiyoruz. Buradaki kimliğin, seçeceğin takma ad."
                    : "E-postanla giriş yap — kimliğin her zamanki gibi gizli."}
                </p>
              </div>

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
                        onClick={() => setNick(generateNick())}
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

                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">
                    Şifre{" "}
                    {tab === "kayit" && (
                      <span className="font-normal text-faint">(en az 6 karakter)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === "kayit" ? "En az 6 karakter" : "Şifreni gir"}
                    className="w-full rounded-xl border-2 border-line bg-card px-4 py-3.5 text-[15px] text-ink outline-none transition-colors focus:border-primary/40"
                  />
                  {tab === "kayit" && password.length > 0 && password.length < 6 && (
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

                {tab === "giris" && (
                  <div className="text-center">
                    <Link href="/sifre-sifirla" className="text-[13px] font-medium text-primary transition-colors hover:text-primary/80">
                      Şifremi unuttum
                    </Link>
                  </div>
                )}

                <p className="text-center text-[12.5px] leading-normal text-faint2">
                  🔒 E-postan tek yönlü şifrelenerek saklanır. Takma adınla eşleştirilemez.
                </p>
              </div>

              {tab === "kayit" && (
                <div className="mt-5 text-center">
                  <div className="mb-2.5 text-[12.5px] text-faint2">İlham lazımsa, boşta olanlardan:</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {showcase.map((name) => (
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
            </>
          ) : (
            <>
              <div className="mb-7 text-center">
                <div className="mb-3 text-[44px]">📬</div>
                <h1 className="mb-2.5 text-[32px] font-bold tracking-[-.5px] text-ink">
                  E-postanı kontrol et
                </h1>
                <p className="text-[15.5px] leading-relaxed text-muted">
                  <span className="font-semibold text-ink">{email}</span> adresine
                  6 haneli doğrulama kodu gönderdik.
                </p>
              </div>

              <div className="grid gap-5 rounded-[22px] border border-line bg-card px-9 py-8 shadow-lg max-md:px-6">
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
                  onClick={handleVerify}
                  disabled={loading || !canVerify}
                  className="gradient-pink rounded-xl py-[15px] text-base font-bold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? "Doğrulanıyor..." : "Doğrula"}
                </button>

                <div className="flex items-center justify-between text-[13px]">
                  <button
                    onClick={goBack}
                    className="text-muted transition-colors hover:text-ink"
                  >
                    ← Geri dön
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="font-medium text-primary transition-colors hover:text-primary/80 disabled:text-faint2"
                  >
                    {resendCooldown > 0
                      ? `Tekrar gönder (${resendCooldown}s)`
                      : "Tekrar gönder"}
                  </button>
                </div>

                <p className="text-center text-[12.5px] leading-normal text-faint2">
                  Spam klasörünü kontrol etmeyi unutma.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

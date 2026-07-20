"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

interface UserInfo {
  id: string;
  nick: string;
}

export function Header() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/ben")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.nick) setUser({ id: data.id, nick: data.nick });
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/cikis", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/90 px-16 py-4 backdrop-blur-md max-md:px-5">
      <Logo />
      <nav className="flex items-center gap-6 text-[15px] text-body max-md:gap-3">
        <Link href="/yurtlar" className="text-body hover:text-primary max-md:hidden">
          Yurtlar
        </Link>
        <Link href="/#nasil" className="text-body hover:text-primary max-md:hidden">
          Nasıl?
        </Link>
        {user ? (
          <>
            <Link
              href="/profil"
              className="rounded-pill border border-line bg-surface px-3.5 py-1.5 font-mono text-[13px] text-muted hover:border-primary/30 hover:bg-surface"
            >
              🥸 {user.nick}
            </Link>
            <button
              onClick={handleLogout}
              className="text-[13px] text-faint hover:text-primary max-md:hidden"
            >
              Çıkış
            </button>
          </>
        ) : (
          <Link
            href="/giris"
            className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-muted hover:border-primary/30"
          >
            Giriş yap
          </Link>
        )}
        <Link
          href="/yurtlar"
          className="gradient-pink rounded-pill px-6 py-2.5 font-semibold text-white shadow-glow transition-transform hover:scale-105"
        >
          Yorum yaz
        </Link>
      </nav>
    </header>
  );
}

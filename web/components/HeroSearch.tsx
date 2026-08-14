"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/yurtlar?q=${encodeURIComponent(q)}` : "/yurtlar");
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex max-w-[640px] gap-2.5 max-md:flex-col"
    >
      <div className="flex flex-1 items-center gap-3 rounded-2xl border-2 border-line bg-white px-5 shadow-lg transition-all focus-within:border-primary/40 focus-within:shadow-glow">
        <span className="text-xl" aria-hidden>
          🔍
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Yurt ara... (KYK Atatürk, Albatros, Campus Suite...)"
          aria-label="Yurt ara"
          className="flex-1 border-none bg-transparent py-[17px] text-base text-ink outline-none placeholder:text-faint2"
        />
      </div>
      <button
        type="submit"
        className="gradient-pink rounded-2xl px-[30px] py-4 text-base font-bold text-white shadow-glow transition-transform hover:scale-105"
      >
        Ara
      </button>
    </form>
  );
}

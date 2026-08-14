"use client";

import { useEffect, useRef } from "react";

const EMOJIS = ["💬", "⚡", "🔥", "💖", "👀", "✨", "🚦", "🥸", "📝"];

export function EmojiRain() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const interval = setInterval(() => {
      const el = document.createElement("span");
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      el.style.cssText = `
        position:absolute;
        left:${Math.random() * 100}%;
        font-size:${14 + Math.random() * 12}px;
        opacity:0;
        animation:emoji-fall ${4 + Math.random() * 4}s linear forwards;
        pointer-events:none;
      `;
      container.appendChild(el);
      setTimeout(() => el.remove(), 9000);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    />
  );
}

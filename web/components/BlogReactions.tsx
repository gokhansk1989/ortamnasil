"use client";

import { useEffect, useState } from "react";
import { ShareButtons } from "./ShareButtons";

interface Props {
  slug: string;
  title: string;
  initialLikes: number;
}

export function BlogReactions({ slug, title, initialLikes }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);

  const storageKey = `ortam_blog_begeni_${slug}`;

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(storageKey) === "1");
    } catch {
      // gizli sekmede localStorage kapalı olabilir; beğeni yine çalışsın
    }
    fetch(`/api/blog/${encodeURIComponent(slug)}/goruntuleme`, { method: "POST" }).catch(() => {});
  }, [storageKey, slug]);

  async function toggleLike() {
    if (pending) return;
    setPending(true);

    const next = !liked;
    // İyimser güncelleme: buton anında tepki versin, istek arkada tamamlansın.
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));

    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/begeni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: next ? "like" : "unlike" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.likeCount === "number") setLikes(data.likeCount);
        try {
          if (next) localStorage.setItem(storageKey, "1");
          else localStorage.removeItem(storageKey);
        } catch {
          // yoksay
        }
      } else {
        // Başarısızsa iyimser değişikliği geri al.
        setLiked(!next);
        setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
      }
    } catch {
      setLiked(!next);
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
      <button
        onClick={toggleLike}
        disabled={pending}
        aria-pressed={liked}
        className="inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-[13.5px] font-semibold transition-all disabled:opacity-60"
        style={{
          borderColor: liked ? "#F97316" : "#E7E0D8",
          background: liked ? "#FFF3EA" : "transparent",
          color: liked ? "#C2410C" : "#5a6a66",
        }}
      >
        <span className="text-base">{liked ? "❤️" : "🤍"}</span>
        {liked ? "Beğendin" : "Beğen"}
        {likes > 0 && (
          <span className="font-mono text-[12.5px] opacity-70">{likes}</span>
        )}
      </button>

      <span className="text-[13px] text-faint max-md:w-full">Başkasına yolla:</span>
      <ShareButtons
        url={`https://www.ortamnasil.com/blog/${slug}`}
        title={title}
      />
    </div>
  );
}

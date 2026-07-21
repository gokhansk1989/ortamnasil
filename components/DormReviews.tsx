"use client";

import { useState, useEffect, useCallback } from "react";
import { ReviewList } from "./ReviewList";
import type { ProfileReview } from "@/lib/directory";

interface Props {
  dormId: string;
  fallbackReviews: ProfileReview[];
  totalCount: number;
}

export function DormReviews({ dormId, fallbackReviews, totalCount }: Props) {
  const [reviews, setReviews] = useState<ProfileReview[]>(fallbackReviews);
  const [sort, setSort] = useState<"new" | "helpful">("new");
  const [hasMore, setHasMore] = useState(totalCount > fallbackReviews.length);
  const [loading, setLoading] = useState(false);
  const [useApi, setUseApi] = useState(false);

  const fetchReviews = useCallback(
    async (sortBy: "new" | "helpful", skip: number, append: boolean) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/yorumlar?dormId=${dormId}&sort=${sortBy}&skip=${skip}&take=10`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setReviews((prev) => (append ? [...prev, ...data.items] : data.items));
        setHasMore(data.hasMore);
        setUseApi(true);
      } catch {
        if (!append) setReviews(fallbackReviews);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [dormId, fallbackReviews],
  );

  useEffect(() => {
    fetchReviews("new", 0, false);
  }, [fetchReviews]);

  function handleSort(s: "new" | "helpful") {
    if (s === sort) return;
    setSort(s);
    setReviews([]);
    fetchReviews(s, 0, false);
  }

  function handleLoadMore() {
    if (loading) return;
    fetchReviews(sort, reviews.length, true);
  }

  const remaining = Math.max(0, totalCount - reviews.length);

  return (
    <>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[19px] font-bold text-ink">Anonim itiraflar 💬</h2>
        <div className="flex gap-2 text-[13px]">
          <button
            onClick={() => handleSort("new")}
            className={`rounded-pill px-3.5 py-1.5 font-semibold transition-all ${
              sort === "new"
                ? "gradient-pink text-white"
                : "border border-line bg-card text-body hover:border-primary/30"
            }`}
          >
            En yeni
          </button>
          <button
            onClick={() => handleSort("helpful")}
            className={`rounded-pill px-3.5 py-1.5 font-semibold transition-all ${
              sort === "helpful"
                ? "gradient-pink text-white"
                : "border border-line bg-card text-body hover:border-primary/30"
            }`}
          >
            En faydalı
          </button>
        </div>
      </div>

      {reviews.length === 0 && !loading && (
        <div className="rounded-card border border-line bg-card p-8 text-center text-faint">
          Henüz yorum yok. İlk yorumu sen yaz!
        </div>
      )}

      <ReviewList reviews={reviews} />

      {loading && (
        <div className="mt-4 text-center text-sm text-faint animate-pulse">
          Yükleniyor...
        </div>
      )}

      {hasMore && !loading && remaining > 0 && (
        <div className="mt-5 text-center">
          <button
            onClick={handleLoadMore}
            className="rounded-2xl border border-line bg-card px-7 py-3 text-sm font-semibold text-primary hover:border-primary/30 hover:shadow-sm transition-all"
          >
            {remaining} itiraf daha yükle
          </button>
        </div>
      )}
    </>
  );
}

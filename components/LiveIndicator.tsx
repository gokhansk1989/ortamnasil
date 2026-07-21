"use client";

import { useEffect, useState } from "react";

export function LiveIndicator() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/istatistik")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setCount(data.recentActivity);
      })
      .catch(() => {});
  }, []);

  if (count === null || count === 0) return null;

  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-pill bg-surface px-5 py-2 text-[13px] font-semibold text-primary">
      <span className="h-2 w-2 rounded-full bg-light-green animate-blink" />
      Son 24 saatte {count} değerlendirme yapıldı
    </div>
  );
}

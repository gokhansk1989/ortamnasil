"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle" | "fluid";
  layout?: "in-article" | "in-feed";
  responsive?: boolean;
  className?: string;
}

const AD_CLIENT = "ca-pub-4400330012095219";

export function AdSlot({ slot, format = "auto", layout, responsive = true, className = "" }: AdSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, []);

  return (
    <div className={`ad-container overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: layout === "in-article" ? ("center" as const) : undefined }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout && { "data-ad-layout": layout })}
        {...(responsive && { "data-full-width-responsive": "true" })}
      />
    </div>
  );
}

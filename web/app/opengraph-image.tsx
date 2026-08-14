import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OrtamNasıl? — Anonim öğrenci yurt değerlendirme platformu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ec4899, #f97316)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 800,
              color: "white",
            }}
          >
            O
          </div>
          <div style={{ fontSize: "48px", fontWeight: 800, color: "white" }}>
            OrtamNasıl?
          </div>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Yurt nasıl, içerden öğren.
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {["🔴", "🟡", "🟢"].map((dot, i) => (
            <div
              key={i}
              style={{
                fontSize: "24px",
              }}
            >
              {dot}
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: "18px",
            color: "#71717a",
            marginTop: "24px",
          }}
        >
          2.400+ yurt · Anonim değerlendirmeler · Gerçek deneyimler
        </div>
      </div>
    ),
    { ...size }
  );
}

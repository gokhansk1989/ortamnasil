import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { lightFromRatio } from "@/lib/lights";

export const runtime = "nodejs";
export const alt = "OrtamNasıl? — Yurt Değerlendirme";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TYPE_LABELS: Record<string, string> = { KYK: "KYK", PRIVATE: "Özel", APART: "Apart" };

const LIGHT_COLORS: Record<string, { bg: string; label: string }> = {
  green: { bg: "#2eb586", label: "Tavsiye edilir" },
  yellow: { bg: "#e8b93c", label: "Ortalama" },
  orange: { bg: "#eb8a4a", label: "Dikkatli ol" },
  red: { bg: "#e05d4b", label: "Uzak dur" },
  gray: { bg: "#b9c9c4", label: "Veri yok" },
};

export default async function OGImage({ params }: { params: { id: string } }) {
  let name = params.id.replace(/-/g, " ");
  let city = "";
  let type = "";
  let surveyCount = 0;
  let light = "gray";

  try {
    const dorm = await prisma.dorm.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        city: true,
        type: true,
        _count: { select: { surveys: true } },
        surveys: { select: { ratio: true } },
      },
    });
    if (dorm) {
      name = dorm.name;
      city = dorm.city;
      type = TYPE_LABELS[dorm.type] || dorm.type;
      surveyCount = dorm._count.surveys;
      const validRatios = dorm.surveys.filter((s) => s.ratio !== null).map((s) => s.ratio!);
      const avgRatio = validRatios.length > 0
        ? validRatios.reduce((a, b) => a + b, 0) / validRatios.length
        : null;
      light = lightFromRatio(avgRatio);
    }
  } catch {
    // fallback to slug-based name
  }

  const l = LIGHT_COLORS[light] || LIGHT_COLORS.gray;

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
            gap: "12px",
            marginBottom: "40px",
            opacity: 0.7,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #F97316, #EA580C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 800,
              color: "white",
            }}
          >
            O
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#a1a1aa" }}>
            OrtamNasil.com
          </div>
        </div>

        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #F97316, #EA580C)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            fontWeight: 800,
            color: "white",
            marginBottom: "24px",
          }}
        >
          {name.charAt(0).toLocaleUpperCase("tr")}
        </div>

        <div
          style={{
            fontSize: "42px",
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            maxWidth: "900px",
            marginBottom: "12px",
          }}
        >
          {name}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "22px",
            color: "#a1a1aa",
            marginBottom: "32px",
          }}
        >
          {type && city ? `${type} · ${city} · ${surveyCount} değerlendirme` : `${surveyCount} değerlendirme`}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "999px",
            padding: "12px 28px",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: l.bg,
              boxShadow: `0 0 20px ${l.bg}`,
            }}
          />
          <div style={{ fontSize: "24px", fontWeight: 700, color: l.bg }}>
            {l.label}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

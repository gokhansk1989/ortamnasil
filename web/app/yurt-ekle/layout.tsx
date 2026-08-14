import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yurt Ekle",
  description:
    "Listede olmayan bir yurdu OrtamNasıl? platformuna ekle. KYK, özel yurt veya apart — tüm yurtlar kabul edilir.",
  alternates: {
    canonical: "https://www.ortamnasil.com/yurt-ekle",
  },
};

export default function YurtEkleLayout({ children }: { children: React.ReactNode }) {
  return children;
}

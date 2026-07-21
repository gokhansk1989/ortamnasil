import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yurt Değerlendirme Anketi",
  description:
    "Kaldığın yurdu 3 dakikada anonim olarak değerlendir. Yemek, temizlik, internet, sosyal ortam ve daha fazlası.",
  alternates: {
    canonical: "https://www.ortamnasil.com/anket",
  },
};

export default function AnketLayout({ children }: { children: React.ReactNode }) {
  return children;
}

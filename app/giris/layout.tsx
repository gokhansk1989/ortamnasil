import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap / Kayıt Ol",
  description:
    "OrtamNasıl? hesabına giriş yap veya anonim takma adınla kayıt ol. E-posta ve şifre ile güvenli giriş.",
  alternates: {
    canonical: "https://www.ortamnasil.com/giris",
  },
};

export default function GirisLayout({ children }: { children: React.ReactNode }) {
  return children;
}

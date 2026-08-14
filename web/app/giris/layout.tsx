import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap / Kayıt Ol",
  description:
    "OrtamNasıl? hesabına giriş yap veya anonim takma adınla kayıt ol. E-posta ve şifre ile güvenli giriş.",
  robots: { index: false, follow: true },
};

export default function GirisLayout({ children }: { children: React.ReactNode }) {
  return children;
}

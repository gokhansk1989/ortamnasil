import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Şifre Sıfırla",
  description: "OrtamNasıl? hesabının şifresini sıfırla. E-posta adresine gönderilen kod ile yeni şifre belirle.",
  robots: { index: false, follow: false },
};

export default function SifreSifirlaLayout({ children }: { children: React.ReactNode }) {
  return children;
}

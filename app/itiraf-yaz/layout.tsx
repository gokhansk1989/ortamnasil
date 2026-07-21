import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İtiraf Yaz",
  description:
    "Yurt deneyimini anonim olarak paylaş. Kimliğin gizli kalır, sözün kalır.",
  alternates: {
    canonical: "https://www.ortamnasil.com/itiraf-yaz",
  },
};

export default function ItirafYazLayout({ children }: { children: React.ReactNode }) {
  return children;
}

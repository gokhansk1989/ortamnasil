import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "OrtamNasıl? ile iletişime geç. Soru, öneri, hak talebi veya kural ihlali bildirimi için bize ulaş.",
  alternates: {
    canonical: "https://www.ortamnasil.com/iletisim",
  },
};

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-[760px] px-8 pb-20 pt-12 max-md:px-5">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-pill bg-primary/10 px-3.5 py-1 text-[12px] font-bold text-primary">
          💌 İLETİŞİM
        </div>
        <h1 className="mb-2 text-[32px] font-bold tracking-[-.5px] text-ink">İletişim</h1>
        <p className="mb-8 text-[15px] text-muted">
          Soru, öneri, hak talebi veya kural ihlali bildirimi için bize ulaşabilirsin.
        </p>

        <div className="grid gap-5">
          <div className="rounded-card border border-line bg-card px-7 py-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <h2 className="mb-2 text-[16px] font-semibold text-ink">💬 Genel sorular</h2>
            <p className="text-[14.5px] leading-relaxed text-muted">
              Platform hakkında sorularınız veya önerileriniz için:
            </p>
            <a
              href="mailto:iletisim@ortamnasil.com"
              className="mt-3 inline-block text-[15px] font-semibold text-primary"
            >
              iletisim@ortamnasil.com
            </a>
          </div>

          <div className="rounded-card border border-line bg-card px-7 py-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <h2 className="mb-2 text-[16px] font-semibold text-ink">🚨 İçerik bildirimi</h2>
            <p className="text-[14.5px] leading-relaxed text-muted">
              Kural ihlali gördüysen, isim ifşası veya hakaret içeren bir yorum varsa bize bildir.
              24 saat içinde incelenir.
            </p>
            <a
              href="mailto:bildirim@ortamnasil.com"
              className="mt-3 inline-block text-[15px] font-semibold text-primary"
            >
              bildirim@ortamnasil.com
            </a>
          </div>

          <div className="rounded-card border border-line bg-card px-7 py-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <h2 className="mb-2 text-[16px] font-semibold text-ink">⚖️ KVKK hak talepleri</h2>
            <p className="text-[14.5px] leading-relaxed text-muted">
              Kişisel verilerinize erişim, düzeltme veya silme talepleri için aşağıdaki adresi
              kullanın. Yasal süre olan 30 gün içinde yanıtlanır.
            </p>
            <a
              href="mailto:kvkk@ortamnasil.com"
              className="mt-3 inline-block text-[15px] font-semibold text-primary"
            >
              kvkk@ortamnasil.com
            </a>
          </div>

          <div className="rounded-card bg-surface2 px-7 py-5 text-[13.5px] leading-relaxed text-muted">
            <strong className="text-ink">Not:</strong> Anonim platformuz ama anonim bir
            kuruluş değiliz. Yasal bildirimlerde 5651 sayılı kanun kapsamında yer sağlayıcı
            olarak hareket ediyoruz. 🏛️
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

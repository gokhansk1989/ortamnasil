import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "OrtamNasıl? gizlilik politikası. Kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu öğrenin.",
  alternates: {
    canonical: "https://www.ortamnasil.com/gizlilik",
  },
};

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-[760px] px-8 pb-20 pt-12 max-md:px-5">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-pill bg-primary/10 px-3.5 py-1 text-[12px] font-bold text-primary">
          🔒 GİZLİLİK
        </div>
        <h1 className="mb-2 text-[32px] font-bold tracking-[-.5px] text-ink">Gizlilik politikası</h1>
        <p className="mb-8 text-sm text-faint">Son güncelleme: 18 Temmuz 2026</p>

        <div className="grid gap-8 text-[15px] leading-relaxed text-body">
          <section className="rounded-card border border-line bg-card px-7 py-6">
            <h2 className="mb-3 text-lg font-semibold text-ink">🤝 Temel vaadimiz</h2>
            <p>
              OrtamNasıl? anonim bir platformdur. Gerçek isminizi bilmiyoruz, saklamıyoruz,
              istemiyoruz. E-posta adresiniz tek yönlü şifrelenir (HMAC); düz metin olarak
              hiçbir yerde tutulmaz. Takma adınız ile e-posta hash&apos;iniz ayrı tablolarda
              saklanır ve birbirine bağlanamaz.
            </p>
          </section>

          <section className="rounded-card border border-line bg-card px-7 py-6">
            <h2 className="mb-3 text-lg font-semibold text-ink">📋 Hangi verileri topluyoruz?</h2>
            <ul className="ml-5 grid gap-2 list-disc">
              <li><strong>Takma ad:</strong> Kendiniz seçersiniz. Gerçek isminizle ilişkilendirilemez.</li>
              <li><strong>E-posta hash&apos;i:</strong> Giriş doğrulaması için. Asla düz metin saklanmaz.</li>
              <li><strong>Anket cevapları:</strong> Yurt değerlendirmesi (A/B seçimleri). Anonim.</li>
              <li><strong>İtiraflar:</strong> Metin tabanlı yorumlar. Takma adla yayınlanır.</li>
              <li><strong>Trafik logları:</strong> Yasal zorunluluk gereği (5651 sayılı kanun) sunucu logları saklanır.</li>
            </ul>
          </section>

          <section className="rounded-card border border-line bg-card px-7 py-6">
            <h2 className="mb-3 text-lg font-semibold text-ink">⚖️ KVKK uyumu</h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu
              sıfatıyla hareket ediyoruz. Platform 18 yaş üstü kullanıcılar içindir.
              Çocuklara ait veri toplamıyoruz. Verilerinizle ilgili haklarınız (erişim,
              düzeltme, silme) için iletişim sayfamızdan bize ulaşabilirsiniz.
            </p>
          </section>

          <section className="rounded-card border border-line bg-card px-7 py-6">
            <h2 className="mb-3 text-lg font-semibold text-ink">🍪 Çerezler</h2>
            <p>
              Sadece oturum yönetimi için zorunlu çerezler kullanıyoruz. Reklam veya
              izleme çerezi yoktur. Üçüncü taraf analitik aracı kullanmıyoruz.
            </p>
          </section>

          <section className="rounded-card border border-line bg-card px-7 py-6">
            <h2 className="mb-3 text-lg font-semibold text-ink">🚫 Veri paylaşımı</h2>
            <p>
              Verilerinizi üçüncü taraflarla paylaşmıyoruz. Yasal zorunluluk (mahkeme
              kararı) dışında hiçbir kurum veya kişiye veri aktarımı yapılmaz. Zaten
              aktaracak gerçek isim verimiz yok.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

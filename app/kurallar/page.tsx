import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Topluluk Kuralları",
  description:
    "OrtamNasıl? topluluk kuralları. Anonim değerlendirmelerde uyulması gereken kurallar ve moderasyon politikası.",
  alternates: {
    canonical: "https://www.ortamnasil.com/kurallar",
  },
};

const RULES = [
  {
    icon: "🚫",
    title: "İsim ifşası yasaktır",
    body: "Personel, öğrenci veya yönetici adı verme. \"Müdür kötü\" değil, \"toplantıda söz kesiliyor\" yaz. Baş harf + departman bile sınırda vaka sayılır.",
  },
  {
    icon: "🤬",
    title: "Küfür ve hakaret yasaktır",
    body: "Duyguların anlaşılıyor ama üslup kural dışı. Eleştiri yap, hakaret etme. Sansürlü küfür de küfürdür.",
  },
  {
    icon: "🤖",
    title: "Spam ve sahte yorum yasaktır",
    body: "Aynı yurda tekrar tekrar aynı yorum, toplu olumlu/olumsuz kampanya, botla oluşturulmuş içerik — hepsi kaldırılır.",
  },
  {
    icon: "🔒",
    title: "Ticari sır ifşası yasaktır",
    body: "Sözleşme detayları, fiyat listeleri gibi gizli bilgileri paylaşma. Genel deneyimini anlat yeter.",
  },
  {
    icon: "✅",
    title: "Yapıcı eleştiri teşvik edilir",
    body: "\"Bu yurt berbat\" yerine \"kışın ısınma sorunu var, banyo temizliği haftada bir\" yaz. Faydalı bilgi herkese kazandırır.",
  },
  {
    icon: "⚖️",
    title: "Moderasyon süreci",
    body: "Bildirilen içerikler incelenir. Kural ihlali varsa kaldırılır veya düzenleme istenir. Tekrarlayan ihlallerde hesap askıya alınır.",
  },
];

export default function KurallarPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-[760px] px-8 pb-20 pt-12 max-md:px-5">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-pill bg-teal/10 px-3.5 py-1 text-[12px] font-bold text-teal">
          📜 KURALLAR
        </div>
        <h1 className="mb-2 text-[32px] font-bold tracking-[-.5px] text-ink">Topluluk kuralları</h1>
        <p className="mb-8 text-[15px] text-muted">
          OrtamNasıl? anonim bir platform ama anonimlik sorumsuzluk değildir.
          Herkesin faydalı bilgi bulabilmesi için birkaç basit kural var.
        </p>

        <div className="grid gap-4">
          {RULES.map((r) => (
            <div key={r.title} className="rounded-card border border-line bg-card px-7 py-6 transition-all hover:border-primary/20 hover:shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl">{r.icon}</span>
                <h2 className="text-[16px] font-semibold text-ink">{r.title}</h2>
              </div>
              <p className="text-[14.5px] leading-relaxed text-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

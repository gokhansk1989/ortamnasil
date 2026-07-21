// Yurt anketi soruları — A = 1 (iyi), B = 0 (kötü). Skorlama lib/lights.ts'te.
export interface Question {
  topic: string;
  title: string;
  sub: string;
  aEmoji: string;
  a: string;
  aSub: string;
  bEmoji: string;
  b: string;
  bSub: string;
}

export const QUESTIONS: Question[] = [
  {
    topic: "YEMEK / YEMEKHANE",
    title: "Yemekhane nasıl?",
    sub: "Akşam 18:00, tepsi elde sıra bekliyorsun.",
    aEmoji: "😋", a: "Anne eli değmiş gibi", aSub: "Çeşit var, porsiyon doyuruyor",
    bEmoji: "🥲", b: "İdare eder ama beklentiyi düşük tut", bSub: "Menü sürpriz, mide kumarı",
  },
  {
    topic: "TEMİZLİK",
    title: "Banyoya girerken tereddüt ediyor musun?",
    sub: "Sabah 08:00, herkes aynı anda kalktı.",
    aEmoji: "🩴", a: "Rahat kullanıyorum", aSub: "Görevli işini yapıyor, zemin kuru",
    bEmoji: "🥾", b: "Terlikle bile zor, botla giriyorum", bSub: "Kendi malzemenle savaş",
  },
  {
    topic: "İNTERNET",
    title: "Gece 2'de Wi-Fi ile aranızda nasıl bir ilişki var?",
    sub: "Ödev teslimi yarın, Netflix açık, oda arkadaşı oyunda.",
    aEmoji: "📶", a: "Mutlu bir ilişkideyiz", aSub: "Video, ödev, oyun hepsi akıyor",
    bEmoji: "💔", b: "Terk edilmiş hissediyorum", bSub: "Kütüphaneye kaçmak serbest",
  },
  {
    topic: "GİRİŞ-ÇIKIŞ / ÖZGÜRLÜK",
    title: "Gece dışarıda kalsan yurda dönüşte ne olur?",
    sub: "Cuma gecesi, saat belirsiz.",
    aEmoji: "🔑", a: "Kart bas, gir, bitti", aSub: "İznin senin elinde",
    bEmoji: "📝", b: "Savunma tezi hazırla", bSub: "Kapı 22:00, sonrası sorgu",
  },
  {
    topic: "ISINMA / KONFOR",
    title: "Ocak ayında odanda kaç kat giyiyorsun?",
    sub: "Dışarısı -5, battaniye sayışmacası başladı.",
    aEmoji: "🔥", a: "T-shirt yeter", aSub: "Kalorifer gerçekten yanıyor",
    bEmoji: "🧊", b: "Mont + bere + dua", bSub: "Kombi efsanesi anlatılıyor",
  },
  {
    topic: "KONUM / ULAŞIM",
    title: "Kampüse ulaşım nasıl?",
    sub: "Ders 08:30, gözlerin yarım açık.",
    aEmoji: "🌸", a: "Çiçek gibi", aSub: "Yürüme mesafesi veya kısa yol",
    bEmoji: "🚌", b: "Aktarma gerekiyor", bSub: "Sabahın köründe yola çık",
  },
  {
    topic: "YÖNETİM",
    title: "Yönetimi \"abi/abla\" diye mi arıyorsun \"sayın müdür\" diye mi?",
    sub: "Bir sorunun var, idareye gidiyorsun.",
    aEmoji: "🙋", a: "Abi/abla, hallolur", aSub: "Derdini dinleyip çözüyorlar",
    bEmoji: "📋", b: "Sayın müdüre dilekçe yazmaca", bSub: "Cevap: 'kural kural kural'",
  },
  {
    topic: "ORTAM / SOSYAL",
    title: "Akşam sosyal alanlarda ortam var mı yoksa herkes odasına mı kapanıyor?",
    sub: "Saat 21:00, ders bitti, karnın aç.",
    aEmoji: "☕", a: "Muhabbet durmuyor", aSub: "Sosyal alanlar ikinci ev gibi",
    bEmoji: "👻", b: "Herkes hayalet gibi", bSub: "Ya mezar sessizliği ya gürültü dramı",
  },
];

// Işık → sonuç ekranı açıklaması (koyu panel).
export const RESULT_BLURB: Record<string, string> = {
  green:
    "Cevapların 'burası yaşanır' diye bağırıyor. Skora yeşil ışık olarak eklendi — arkadaşına da söyle.",
  yellow:
    "Ne rüya ne kâbus: fiyatına göre idare eder. Skora sarı ışık olarak işlendi.",
  orange:
    "Cevapların 'bir düşün, hem de iki kere' diyor. Turuncu ışık skora eklendi.",
  red: "Cevaplarını okurken biz bile üşüdük. Kırmızı ışık yandı — başka kapıya bak.",
  gray: "Hep pas geçtin — içeride muhbirimiz hâlâ yok. Fikrin oluşunca yine gel.",
};

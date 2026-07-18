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
    title: "Yurt yemeği: doy da gel mi, dua ederek gir mi?",
    sub: "Akşam 18:00, sıra uzun.",
    aEmoji: "😋", a: "Doy da gel", aSub: "Çeşit var, tadı yerinde",
    bEmoji: "🥲", b: "Dua ederek gir", bSub: "Menü sürpriz, mide kumarı",
  },
  {
    topic: "TEMİZLİK",
    title: "Sabah banyo-tuvalet ne durumda?",
    sub: "08:00, herkes aynı anda kalktı.",
    aEmoji: "🧼", a: "Pırıl pırıl", aSub: "Görevli işini yapıyor",
    bEmoji: "🧟", b: "Kader ağlarını örüyor", bSub: "Kendi malzemenle savaş",
  },
  {
    topic: "İNTERNET",
    title: "Yurt interneti ödev çeker mi?",
    sub: "Gece 23:00, teslim yarın.",
    aEmoji: "📶", a: "Uçuyor", aSub: "Video, ödev, oyun hepsi akıyor",
    bEmoji: "🐌", b: "Story bile zor", bSub: "Kütüphaneye kaçmak serbest",
  },
  {
    topic: "GİRİŞ-ÇIKIŞ / ÖZGÜRLÜK",
    title: "Giriş saati: özgür müsün, Külkedisi mi?",
    sub: "Cuma akşamı, dışarı çıktın.",
    aEmoji: "🕊️", a: "Özgürsün", aSub: "İznin senin elinde",
    bEmoji: "⏰", b: "Külkedisi", bSub: "Kapı 22:00, koş yetiş",
  },
  {
    topic: "ISINMA / KONFOR",
    title: "Kışın oda sıcaklığı nasıl?",
    sub: "Ocak ayı, dışarısı eksi.",
    aEmoji: "🔥", a: "Mis gibi", aSub: "Kalorifer gerçekten yanıyor",
    bEmoji: "🧊", b: "Botla uyuyorsun", bSub: "Kombi efsanesi anlatılıyor",
  },
  {
    topic: "ODA ARKADAŞI",
    title: "Oda arkadaşı ataması kader mi, uyum mu?",
    sub: "Kapıyı ilk kez açıyorsun.",
    aEmoji: "🤝", a: "Denk geldi", aSub: "Uyumlu, saygılı, sessiz saat var",
    bEmoji: "🎲", b: "Rus ruleti", bSub: "Her akşam yeni bir sürpriz",
  },
  {
    topic: "KONUM / ULAŞIM",
    title: "Kampüse/şehre ulaşım nasıl?",
    sub: "Sabah 08:30 dersi var.",
    aEmoji: "🚶", a: "Yürüme mesafesi", aSub: "Sabah 10 dk uyku bonusu",
    bEmoji: "🚌", b: "3 vasıta destanı", bSub: "Sabahın köründe yola çık",
  },
  {
    topic: "YÖNETİM",
    title: "Sorun çıkınca yönetim ne yapıyor?",
    sub: "Musluk aktı, forma yazdın.",
    aEmoji: "🙋", a: "Çözüm odaklı", aSub: "Derdini dinleyip hallediyorlar",
    bEmoji: "🚪", b: "Duvara konuş", bSub: "Cevap: 'kural kural kural'",
  },
  {
    topic: "ORTAM / SOSYAL",
    title: "Akşamları yurt ortamı nasıl?",
    sub: "Ders bitti, çay ocağı zamanı.",
    aEmoji: "🎉", a: "Canlı ve huzurlu", aSub: "Muhabbet var, kavga yok",
    bEmoji: "🔇", b: "Ya ölü ya kavga", bSub: "Ya mezar sessizliği ya gürültü dramı",
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

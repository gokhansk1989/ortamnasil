import { ALL_DORMS, STATS } from "./dorms";

export type AdminView = "dashboard" | "moderation" | "dorms" | "users" | "surveys" | "settings";

export interface MenuItem {
  key: AdminView;
  icon: string;
  name: string;
  badge: number | null;
}

export const MENU: MenuItem[] = [
  { key: "dashboard", icon: "📊", name: "Kumanda odası", badge: null },
  { key: "moderation", icon: "🚨", name: "Moderasyon", badge: 7 },
  { key: "dorms", icon: "🏠", name: "Yurtlar", badge: null },
  { key: "users", icon: "🥸", name: "Kullanıcılar", badge: null },
  { key: "surveys", icon: "📝", name: "Anket soruları", badge: null },
  { key: "settings", icon: "⚙️", name: "Ayarlar", badge: null },
];

export interface QueueCase {
  id: number;
  tag: string;
  tagBg: string;
  tagFg: string;
  who: string;
  dorm: string;
  when: string;
  reports: number;
  text: string;
}

export const QUEUE: QueueCase[] = [
  { id: 0, tag: "İSİM İFŞASI ŞÜPHESİ", tagBg: "#fbe7e3", tagFg: "#b23a28", who: "KızgınKanguru7", dorm: "KYK Atatürk Yurdu", when: "14 dk önce", reports: 3, text: "“Kat sorumlusu A**** K**** herkese bağırıyor, herkes biliyor zaten…” — otomatik filtre isim yakaladı, maskeleyip onaylanabilir." },
  { id: 1, tag: "KÜFÜR / HAKARET", tagBg: "#fbf1db", tagFg: "#96690f", who: "PasifAgresifPanda", dorm: "Yıldız Kız Yurdu", when: "1 sa önce", reports: 5, text: "“Bu yurda yerleşeceğinize gidin [sansürlendi]. Yönetim tam bir [sansürlendi]…” — duygular anlaşılıyor ama üslup kural dışı." },
  { id: 2, tag: "SPAM ŞÜPHESİ", tagBg: "#eef1f0", tagFg: "#5a6a66", who: "YeniÜye2026", dorm: "Kampüs Life Apart", when: "2 sa önce", reports: 2, text: "“Harika yurt harika yönetim harika ortam herkese tavsiye ederim 10/10” — hesap 1 saatlik, 6 yurda aynı yorum. 🤔" },
  { id: 3, tag: "İSİM İFŞASI ŞÜPHESİ", tagBg: "#fbe7e3", tagFg: "#b23a28", who: "MesaideKayıp", dorm: "Huzur Erkek Yurdu", when: "3 sa önce", reports: 1, text: "“Yönetimdeki B. Hanım şikâyet edince güldü…” — baş harf + departman, sınırda vaka." },
  { id: 4, tag: "KURAL DIŞI İÇERİK", tagBg: "#fbf1db", tagFg: "#96690f", who: "GizliVizyoner", dorm: "UniApart Residence", when: "5 sa önce", reports: 2, text: "“Yurt kontratındaki gizli maddeler şöyle: …” — ticari sır ifşası olabilir, hukuk köşesine takıldı." },
];

export const KPIS = [
  { label: "Bekleyen bildirimler", value: "7", color: "#b23a28", note: "2'si isim ifşası şüphesi ⚠️", noteColor: "#b23a28" },
  { label: "Toplam yurt", value: STATS.totalDorms.toLocaleString("tr"), color: "#12312c", note: `KYK: ${STATS.totalKYK} · Özel: ${STATS.totalOzel}`, noteColor: "#177a52" },
  { label: "Bugünkü itiraf", value: "86", color: "#12312c", note: "↗ dün 61'di, rekor yakın", noteColor: "#177a52" },
  { label: "Aktif kullanıcı (7g)", value: "3.412", color: "#12312c", note: "hepsi anonim, hepsi gergin", noteColor: "#7a8a86" },
];

export const PLATFORM_DIST = [
  { name: "🟢 Kapağı at", pct: "%34", w: "34%", color: "#2eb586" },
  { name: "🟡 Para için değer", pct: "%27", w: "27%", color: "#e8b93c" },
  { name: "🟠 Girmeden düşün", pct: "%14", w: "14%", color: "#eb8a4a" },
  { name: "🔴 Kaçarak uzaklaş", pct: "%17", w: "17%", color: "#e05d4b" },
  { name: "⚪ Veri yok", pct: "%8", w: "8%", color: "#5a6a66" },
];

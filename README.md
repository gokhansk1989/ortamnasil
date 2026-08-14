# Handoff: OrtamNasıl? — Anonim Şirket Değerlendirme Platformu

## Overview
Glassdoor tarzı, Türkçe, mizahi tonlu bir platform: kullanıcılar takma adla (anonim) şirketleri "eğlenceli ikili seçim" anketleriyle değerlendirir; her şirket trafik-ışığı skoru + esprili rozet etiketi alır ("Kapağı at", "Kaçarak uzaklaş" vb.). Listede olmayan şirketi ilk ekleyen kullanıcı "kurdele keser" (tebrik töreni + rozet). Web sitesi / LinkedIn URL'leri isim benzerliği karışıklığını önler. Bir de moderasyon odaklı admin paneli vardır.

## About the Design Files
Bu paketteki `.dc.html` dosyaları **HTML ile yapılmış tasarım referanslarıdır** — amaçlanan görünümü ve davranışı gösteren prototiplerdir, üretim kodu değildir. Görev: bu tasarımları hedef kod tabanının mevcut ortamında (React, Vue, Next.js vb.) o ortamın kalıplarıyla **yeniden inşa etmek**. Ortam yoksa öneri: Next.js + React + Tailwind (veya CSS-in-JS) + bir veritabanı (ör. Postgres + Prisma). Dosyalar tarayıcıda doğrudan açılabilir; `support.js` sadece prototip çalışma zamanıdır, taşınmayacak.

## Fidelity
**High-fidelity (hifi).** Renkler, tipografi, boşluklar, köşe yarıçapları ve mikro-etkileşimler finaldir; birebir uygulanmalıdır.

## Design Tokens
**Renkler**
- Zemin: `#fafcfb` (sayfa), `#fff` (kart), `#eef5f2` / `#f2f5f4` (ikincil zemin)
- Koyu panel / marka koyusu: `#12312c` (koyu panelde açık yeşil vurgu `#3ee6a8`, mono etiket `#8ff5d2`, soluk metin `#9ec4bb`)
- Ana vurgu (primary): `#0d7a6f`, hover `#0a5c54`
- Metin: başlık `#12312c`, gövde `#3d4a47` / `#5a6a66`, soluk `#7a8a86` / `#9aa8a4`
- Çizgiler: `#e3ebe8` (kart border), `#cfdcd8` (input border)
- Trafik ışığı skalası (5 kademe):
  - Yeşil "Kapağı at": nokta `#2eb586`, rozet bg `#e7f6ef`, yazı `#177a52`
  - Sarı "Para için değer": `#e8b93c` / `#fbf1db` / `#96690f`
  - Turuncu "Girmeden düşün": `#eb8a4a` / `#fdeadd` / `#a55a1a`
  - Kırmızı "Kaçarak uzaklaş": `#e05d4b` / `#fbe7e3` / `#b23a28`
  - Gri "Yeterli veri yok": `#7a8a86` / `#eef1f0` / `#5a6a66`

**Tipografi**
- Gövde/başlık: `Space Grotesk` (400–700), Google Fonts
- Mono (takma adlar, etiketler, sayaçlar): `IBM Plex Mono` (400–500)
- Ölçek: h1 30–52px (letter-spacing −0.5 ile −1px), h2 18–26px, gövde 14–16px, meta 12–13.5px

**Şekil & gölge**
- Köşe: kart 14–20px, input/buton 10–12px, rozet/çip 999px (pill)
- Kart border: `1px solid #e3ebe8`; vurgulu CTA kutuları `1.5px dashed #9ec4bb`
- Hover gölge: `0 10px 28px rgba(13,60,55,.10)` + `translateY(-2px)`
- Logo: marka adı yanında 3 nokta (kırmızı/sarı/yeşil, 10px daire); yeşil nokta `blink` animasyonu (opacity 1→0.35, 2s sonsuz)

**Animasyonlar**
- `blink`: canlı göstergeler için opacity yanıp sönme
- `pop`: sonuç/tebrik kartları girişi — scale .6→1.06→1, ~0.3s ease-out
- `confetti`: tebrik ekranında düşen emoji (translateY + rotate, sonsuz)

## Screens / Views (dosya → ekran)

### 1. `OrtamNasıl - Ana Sayfa.dc.html` — Ana sayfa
- Sticky header: logo, nav (Şirketler, Nasıl çalışır?), takma ad çipi (mono, pill), "Yorum yaz" primary buton
- Hero: ortalanmış, radial yeşil parıltı arka planı; canlı rozet ("Şu an 3 kişi… yazıyor"); 52px başlık; arama input + Ara butonu; "İlk ekleyen sen ol" linki
- **Ortam Skalası**: koyu (`#12312c`) yatay kart, 5 kademe grid'i — renkli nokta (glow'lu) + isim + espri alt yazısı
- Canlı akış şeridi: pill kartlarda "kim ne yaptı" ticker'ı
- İstatistik şeridi: 4 sayı, dikey ayraçlarla
- "Bu hafta konuşulanlar": sektör filtre çipleri + 3 sütun şirket kartı grid'i. Kart: logo karesi (baş harf), isim + meta, rozet (nokta+etiket), 5 çubuklu mini skor, alıntı, dashed üst çizgili yazar satırı. Tüm kart şirket profiline link.
- "Nasıl çalışır?": `#eef5f2` bant, 3 adım kartı (mono `ADIM_01` etiketleri)
- Şirket ekle CTA: dashed border kutu, "🎉 İLK EKLEYENE TEBRİK TÖRENİ" rozeti
- Footer: telif esprisi + linkler

### 2. `Şirketler.dc.html` — Şirket listesi / arama
- Arama input + sıralama select; sektör çipleri (aktif: koyu dolgu); ışığa göre filtre çipleri (aktif: o rengin bg/border'ı, toggle)
- Sonuç satırı: 4 sütunlu grid (logo 56px, isim+meta, italik alıntı, sağda rozet + yorum sayısı)
- Filtre mantığı: metin + sektör + ışık kesişimi, canlı
- **Boş durum**: 🔦, `"X" için dosya yok`, "ilk ekleyen sen ol" CTA → Şirket Ekle

### 3. `Şirket Profili.dc.html` — Şirket detayı
- Breadcrumb; başlık kartı: 72px logo, isim, meta, web + LinkedIn URL çipleri, mono "kayıt #0042 · KurdeleKesen: <kullanıcı> 🎀"
- Skor kartı (koyu): 4 soluk + 1 parlayan trafik ışığı noktası, "Kapağı at" (26px), onay alt yazısı
- **Kategori kırılımı**: 8 satır (Maaş, Yönetim, İş-yaşam, Ofis/uzaktan, Kariyer, Kültür, Mülakat, Çıkış) — isim + renkli progress bar + espri hükmü ("Efsane", "Sabır ister"). Altta yaş ortalaması notu.
- **Işık dağılımı**: 5 renk için yatay bar + adet; trend satırı ("yeşilleşiyor ↗")
- İtiraf kartları: emoji avatar, mono takma ad, rol/zaman, rozet; metin; "👍 Faydalı (n)" (tıklanınca +1 toggle, renk `#0d7a6f`), "Aynen yaşadım", "Bildir"; "39 itiraf daha yükle" butonu
- Sağ sütun: "Anonim değerlendir" CTA (dashed kutu), Hızlı Bilgiler (5 anahtar-değer), benzer şirketler kutusu

### 4. `Anket.dc.html` — Değerlendirme anketi
- 9 soru, tek kart, ilerleme noktaları (geçmiş yeşil, aktif koyu, gelecek gri)
- Soru kartı: konu rozeti + "n/9" sayaç; 28px soru; 2 sütun A/B seçenek butonu (emoji + başlık + espri alt yazı; hover: A yeşil border, B kırmızı border); "← Geri" ve "pas →"
- Sorular ikili seçim mizahıyla yazılı (ör. "Mesai bitince: eve mi, yine masaya mı?") — tam metinler dosyada
- **Skorlama**: A=1, B=0, pas sayılmaz; oran ≥.8 yeşil, .6–.8 sarı, .4–.6 turuncu, <.4 kırmızı, hiç cevap yoksa gri
- Sonuç ekranı (koyu, pop animasyonu): 🎉, "İTİRAF KAYDEDİLDİ", ışık pill'i (glow), açıklama, "Şirket profilini gör" + "Bir daha doldur"; altta "itirafını yaz →" linki

### 5. `İtiraf Yaz.dc.html` — Serbest metin yorum
- Şirket özet kutusu (anketten gelen ışık + "Değiştir" linki)
- İlişki çipleri: Mevcut / Eski çalışan / Stajyer / Mülakata girdim
- Başlık input; 600 karakter sınırlı textarea; canlı sayaç + ipucu (0: "En az 40 karakter…", <40: kalan, ≥40: "Güzel gidiyor ✓")
- Sarı "Kısa hukuk köşesi" uyarı kutusu (isim verme / küfür yok)
- Buton 40 karakter + başlık dolana dek pasif (`#b9c9c4`)
- Yayınlandı ekranı (koyu): 📮, "Kimse bilmiyor, herkes okuyor."

### 6. `Şirket Ekle.dc.html` — Yeni şirket formu
- Alanlar: ad*, sektör select, şehir, **web sitesi + LinkedIn URL** (mono input, "kimlik doğrulama" açıklamalı `#eef5f2` kutu), tek cümlelik tanıtım
- **Mükerrer uyarısı**: ada "yıldız" yazılınca sarı uyarı kutusu — benzer 2 kayıt + "URL ekleyerek ayrıştır"
- Başarı ekranı: konfeti emojileri, 🎀, "KAYIT #1205 AÇILDI", "Tebrikler, kurdeleyi kestin!", KurdeleKesen rozeti sözü, "İlk anketi doldur →" CTA

### 7. `Giriş.dc.html` — Takma ad / kayıt
- Takma ad input + 🎲 rastgele butonu; canlı müsaitlik: <3 karakter sarı uyarı, alınmışsa kırmızı "❌ … 43 dene?", müsaitse yeşil "✓ Müsait!" (border rengi eş değişir)
- E-posta ("tek yönlü şifrelenir" notu); "Bu kimlikle devam et"
- Altta tıklanabilir öneri çipleri (KızgınKanguru7 vb.)

### 8. `Profil.dc.html` — Anonim profil
- Koyu kimlik kartı: 🥸 avatar, "GERÇEK İSİM: BİZDE BİLE YOK", rozetler (🎀 KurdeleKesen ×2, 🕵️ Güvenilir Muhbir, ✍️ 12 itiraf), "Takma adı değiştir"
- 4 istatistik kartı; itiraf listesi (ışık noktası, şirket + etiket, faydalı oyu, Düzenle/Sil)
- Anonimlik sözü kutusu (🔒)

### 9. `Admin Panel.dc.html` — Kumanda odası
- Sol sabit koyu menü (240px): logo + "KUMANDA ODASI", 6 madde (Moderasyon 7, Şirketler 4 kırmızı badge), altta admin e-postası. Aktif madde: `rgba(62,230,168,.14)` bg + `#3ee6a8` yazı.
- Dashboard: 4 KPI kartı; moderasyon kuyruğu önizleme (3 vaka); onay bekleyen şirketler (mükerrer uyarısı / URL doğrulama durumu, ✅ 🗑️); platform ışık dağılımı (yığılmış bar + yüzdeler)
- Moderasyon görünümü: filtre çipleri; vaka kartları (etiket: İSİM İFŞASI / KÜFÜR / SPAM; kim→şirket; bildirim sayısı; Onayla / Kaldır / Düzenleme iste). Aksiyon vakayı kuyruktan düşürür; boş kuyruk: 🧹 "Kuyruk tertemiz… git bir kahve al."

## Interactions & Behavior
- Tüm sayfa geçişleri normal linkler; prototipte dosya adlarıyla bağlı
- Hover: kartlar gölge + hafif yukarı; butonlar koyulaşır
- Anket state: `step`, `answers[]` (1/0/null); geri gidilebilir; skorlama yukarıda
- Faydalı oyu: toggle, sayaç ±1
- Filtreler: anlık, client-side
- Form doğrulama: itiraf ≥40 karakter + başlık; takma ad ≥3 karakter + benzersiz

## State Management (üretim için öneri)
- Auth: e-posta + takma ad; takma ad ↔ e-posta eşleşmesi geri döndürülemez şekilde ayrılmalı (anonimlik vaadi)
- Entities: Company (name, sector, city, websiteUrl, linkedinUrl, blurb, creatorNick, createdAt), Survey (9 cevap, hesaplanan ışık), Review (title, text, relation, light, helpfulCount), User (nick, badges), Report/ModerationCase
- Şirket skoru: anket ışıklarının dağılımından türetilir; eşikler anketteki oranlarla aynı
- Mükerrer tespiti: isim benzerliği (fuzzy) + URL eşleşmesi

## Assets
Harici görsel yok; logolar baş-harf karesi, avatarlar emoji. Fontlar Google Fonts'tan (Space Grotesk, IBM Plex Mono).

## Files
- `OrtamNasıl - Ana Sayfa.dc.html`, `Şirketler.dc.html`, `Şirket Profili.dc.html`, `Anket.dc.html`, `İtiraf Yaz.dc.html`, `Şirket Ekle.dc.html`, `Giriş.dc.html`, `Profil.dc.html`, `Admin Panel.dc.html`
- `support.js` — prototip çalışma zamanı (taşınmaz, sadece dosyaları tarayıcıda açmak için)
- (`Ana Sayfa Yönleri.dc.html` erken keşif dosyasıdır, pakete dahil edilmedi)

# Token & Renk Tutarsızlıkları — Tam Envanter

9 `.dc.html` dosyasındaki tüm hex renkleri tarandı (`grep -rhoE '#[0-9a-f]{6}'`).
Aşağıdaki liste, aynı anlamı taşıması gereken ama farklı hex değeri kullanılan
yerleri gösterir. Üstteki `web/lib/lights.ts` ve `web/tailwind.config.ts` bunları
tek kaynağa indirger; bu doküman "neyi neye eşitlediğimizin" kaydı.

## 1. Yeşil ışık — 3 farklı değer (en ciddi)

| Değer | Nerede | Bağlam |
|-------|--------|--------|
| `#2eb586` | tüm dosyalar | açık zemin nokta/rozet (base) — **doğru referans** |
| `#3ee6a8` | Anket, Admin Panel, Şirket Ekle, İtiraf Yaz, Profil | koyu panel üzerinde parlak varyant |
| `#5ce6ae` | **yalnız Şirket Profili** (`:63`, "Kapağı at" metni) | koyu panelde ama diğerlerinden farklı ton |

→ Koyu zeminde iki ayrı "parlak yeşil" var (`#3ee6a8` vs `#5ce6ae`). Karar: koyu
zemin için tek varyant `#3ee6a8` (`LIGHTS.green.dotBright`). Şirket Profili
`#5ce6ae` buna eşitlenmeli.

## 2. Sarı ışık — koyu zemin varyantı standartsız

| Değer | Nerede |
|-------|--------|
| `#e8b93c` | tüm dosyalar (base) |
| `#f0c554` | **yalnız Anket** sonuç ekranı (`:129`) |

→ Sarının parlak varyantı sadece tek yerde tanımlı. `LIGHTS.yellow.dotBright = #f0c554`
olarak resmileştirildi; başka koyu-zemin kullanımı çıkarsa buradan gelir.

## 3. Kırmızı ışık — aynı durum

| Değer | Nerede |
|-------|--------|
| `#e05d4b` | tüm dosyalar (base) |
| `#f4674f` | **yalnız Anket** sonuç ekranı (`:131`) |

→ `LIGHTS.red.dotBright = #f4674f`.

## 4. Input/border grisi — muhtemel yazım hatası

| Değer | Nerede |
|-------|--------|
| `#cfdcd8` | Giriş, Anket, Şirket Ekle, İtiraf Yaz, Şirketler, Ana Sayfa, Şirket Profili (standart input border) |
| `#cfd8d5` | **yalnız Anket** (`:138`, pasif "← Geri" rengi) |

→ İki karakter farkı; neredeyse kesin typo. `#cfdcd8` (`inputline`) doğru; devre
dışı metin için ayrı bir `disabled` tonu gerekiyorsa bilinçli seçilmeli.

## 5. "Pasif / soluk" griler — 3 ayrı değer, tanımsız

| Değer | Nerede | Bağlam |
|-------|--------|--------|
| `#b9c9c4` | İtiraf Yaz (pasif buton), Şirket Profili ("Pas geçti" dot) | devre dışı |
| `#7fa89f` | Admin Panel, Şirket Ekle | soluk yeşilimsi |
| `#9aa8a4` / `#9ec4bb` | çeşitli | soluk metin (README'de var) |

→ `#b9c9c4` ve `#7fa89f` README token listesinde **yok**. Bunlar ya
`faint2 (#9aa8a4)`'e toplanmalı ya da "disabled" / "onDark-muted" olarak resmî
token'a dönüşmeli. Şu an ad-hoc.

## 6. Gri ışık vs. "pas" grisi karışıyor

- Gri ışık ("Yeterli veri yok") noktası: `#7a8a86` (README).
- Şirket Profili ışık dağılımında "Pas geçti" satırı: `#b9c9c4` (`:175`).

→ İkisi farklı kavram (veri yok ≠ pas) ama görsel olarak ayrışmıyor. "Pas"
için bilinçli, ayrı ve dokümante bir ton seçilmeli.

## 7. Doğru/tutarlı olanlar (referans)

- Turuncu `#eb8a4a` her yerde tek değer — sorun yok (base=bright kabul edildi).
- Marka koyusu `#12312c`, primary `#0d7a6f`/`#0a5c54`, çizgi `#e3ebe8`, zemin
  `#fafcfb` — hepsi tutarlı, doğrudan token'a alındı.

---

### Sonuç
README "tek palet" diyor ama kod pratikte **iki paletli** (açık zemin `dot` +
koyu zemin `dotBright`). Bu aslında iyi bir tasarım kararı — sadece
formalize edilmemişti. `lib/lights.ts` bunu `dot` / `dotBright` alanlarıyla
resmileştirir ve yukarıdaki tüm sapmaları tek kaynağa bağlar.

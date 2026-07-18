# OrtamNasıl? — Üretim Uygulaması (referans)

Prototip `.dc.html` dosyalarının Next.js (App Router) + Tailwind + Prisma'ya
taşınmış hâli. **9 ekranın tamamı** uygulandı; hepsi tek token ve ışık
kaynağını paylaşıyor. `npm run build` ✓ (11 route).

## Route haritası (prototip → route)
| Ekran | Route | Tür |
|-------|-------|-----|
| Ana Sayfa | `/` | server |
| Şirketler (arama/filtre/boş durum) | `/sirketler` | server + client explorer |
| Şirket Profili | `/sirket/[id]` | server + client oy widget'i |
| Anket (9 soru, `scoreSurvey`) | `/anket` | client |
| İtiraf Yaz | `/itiraf-yaz` | client |
| Şirket Ekle (mükerrer + konfeti) | `/sirket-ekle` | client |
| Giriş (takma ad kontrolü) | `/giris` | client |
| Profil | `/profil` | server |
| Admin Panel (dashboard + moderasyon) | `/admin` | client |

## Çalıştırma
```bash
cd web
npm install
cp .env.example .env      # DATABASE_URL ve AUTH_PEPPER doldur
npm run dev               # http://localhost:3000
npm run build             # prod derleme (doğrulandı: ✓)
```

## Mimari kararlar
- **Tek ışık kaynağı:** `lib/lights.ts` — renk/etiket/skorlama tablosu ve
  eşikler tek yerde. Prototipteki kopyalanan paletler ve sapmalar
  `../TOKEN-INCONSISTENCIES.md`'de dokümante edilip buraya toplandı.
  `dot` (açık zemin) / `dotBright` (koyu panel) ayrımı resmileştirildi.
- **Token'lar:** `tailwind.config.ts` içinde semantik isimler (`ink`, `primary`,
  `light-green` …). Inline hex yok.
- **Paylaşılan bileşenler:** `Header`, `Footer`, `Logo`, `LightBadge`,
  `MiniScore`, `TrafficScale`, `CompanyCard` — her ekranda tekrar eden parçalar.
- **Erişilebilirlik:** tıklanabilir öğeler gerçek `<button>`; ışık her yerde
  etiket metniyle birlikte; input'larda `aria-label`; responsive (`max-md`).
- **Gizlilik:** `prisma/schema.prisma` — e-posta düz metin saklanmaz, `nick` ve
  `emailHash` ayrı tablolarda (bkz. şemadaki not).

## Yapı
```
web/
├─ app/
│  ├─ layout.tsx        # fontlar + global
│  ├─ globals.css
│  └─ page.tsx          # Ana Sayfa
├─ components/          # paylaşılan UI
├─ lib/
│  ├─ lights.ts         # ışık + skorlama (tek kaynak)
│  └─ data.ts           # mock veri (üretimde Prisma sorgusu olur)
└─ prisma/schema.prisma
```

## Sıradaki adımlar (backend)
UI tamam; kalan iş veriyi gerçekleştirmek: `lib/data.ts`, `lib/companies.ts`,
`lib/admin.ts` içindeki mock'ların yerine Prisma sorguları; form gönderimleri
için Server Action / route handler; anket & itiraf yazımında oturum + benzersizlik
doğrulaması (backend). Işık/skorlama zaten `lib/lights.ts`'te üretime hazır.

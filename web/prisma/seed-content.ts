import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FAQ_ITEMS = [
  // Platform
  { question: "OrtamNasıl? nedir?", answer: "OrtamNasıl?, Türkiye'deki KYK, özel ve apart yurtlarını anonim olarak değerlendirme platformudur. Öğrenciler takma isimlerle yurt deneyimlerini paylaşır; gerçek isimleri bizde bile yoktur. Yemek, internet, temizlik, giriş saati gibi konularda dürüst değerlendirmeler sayesinde yurda kaydolmadan önce içerden öğrenebilirsin.", category: "platform", sortOrder: 1 },
  { question: "Değerlendirmeler gerçekten anonim mi?", answer: "Evet. Kayıt olurken sadece takma ad ve e-posta istiyoruz. E-posta asla düz metin olarak saklanmaz — tek yönlü şifreli hash'i tutulur. Değerlendirmelerde sadece takma adın görünür. Yurt yönetimi dahil kimse gerçek kimliğini öğrenemez.", category: "platform", sortOrder: 2 },
  { question: "Yurt nasıl eklenir?", answer: "Giriş yaptıktan sonra 'Yurt ekle' sayfasından yurdun adını, şehrini, ilçesini ve tipini (KYK/Özel) girerek ekleyebilirsin. İlk ekleyen kişi 'Kurdele Kesen' rozeti kazanır.", category: "platform", sortOrder: 3 },
  { question: "Ortam skoru (ışık sistemi) nasıl çalışıyor?", answer: "Ankette verdiğin cevaplar bir oran hesaplanarak ışık rengine dönüşür: Yeşil (Tavsiye edilir), Sarı (Ortalama), Turuncu (Dikkatli ol), Kırmızı (Uzak dur). Tüm anketteki cevaplar anonim olarak ortalaması alınır ve yurdun genel skoru oluşur.", category: "platform", sortOrder: 4 },
  // KYK
  { question: "KYK yurt başvurusu ne zaman ve nasıl yapılır?", answer: "KYK (Kredi ve Yurtlar Kurumu) yurt başvuruları genellikle her yıl Ağustos ayında e-Devlet üzerinden açılır. Başvuru için üniversite kaydının yapılmış olması gerekir. Başvuru sonuçları gelir durumu, aile bilgileri ve tercih sırasına göre değerlendirilir. Güncel tarihler için KYK'nın resmi web sitesini takip etmelisin.", category: "kyk", sortOrder: 5 },
  { question: "KYK yurt ücreti ne kadar?", answer: "KYK yurt ücretleri devlet tarafından belirlenir ve her yıl güncellenir. 2025-2026 döneminde aylık ücret yaklaşık 750-1.500 TL arasında değişmektedir (yurt tipine göre). Ücretlere yemek dahil değildir. Güncel ücretler için KYK'nın resmi sitesini kontrol edin.", category: "kyk", sortOrder: 6 },
  { question: "KYK yurdunda yemek nasıl?", answer: "KYK yurtlarında sabah kahvaltısı ve akşam yemeği sunulur. Yemek kalitesi yurttan yurda büyük farklılık gösterir — tam da bu yüzden OrtamNasıl? var. Anketlerde yemek kalitesi özel olarak sorulur ve her yurdun yemek puanını görebilirsin.", category: "kyk", sortOrder: 7 },
  { question: "KYK yurdunda internet hızı nasıl?", answer: "KYK yurtlarında genellikle Wi-Fi bulunur ancak hız ve stabilite yurttan yurta çok değişir. Bazı yurtlarda fiber altyapı varken bazılarında akşam saatlerinde bağlantı çok yavaşlar. OrtamNasıl?'daki anketlerde internet kalitesi ayrı olarak değerlendirilir.", category: "kyk", sortOrder: 8 },
  { question: "KYK yurduna giriş-çıkış saatleri nedir?", answer: "KYK yurtlarında giriş-çıkış saatleri yönetmeliğe bağlıdır. Genellikle hafta içi 23:00-24:00 arası kapanış olur, ancak bazı yurtlarda daha esnek uygulamalar da var. Hafta sonu kuralları farklı olabilir. Yurt bazında detaylı bilgi için OrtamNasıl?'daki değerlendirmelere bak.", category: "kyk", sortOrder: 9 },
  // Özel
  { question: "Özel yurt fiyatları ne kadar?", answer: "Özel yurt fiyatları şehre, konuma ve sunulan olanaklara göre büyük farklılık gösterir. Büyükşehirlerde aylık 4.000-12.000 TL arasında değişebilir. Fiyata yemek, internet ve temizlik dahil mi, ayrı mı — her yurtta farklı. OrtamNasıl?'daki değerlendirmelerde kullanıcılar fiyat-performans dengesini yorumlar.", category: "ozel", sortOrder: 10 },
  { question: "Özel yurt mu KYK yurdu mu daha iyi?", answer: "Bu tamamen ihtiyaçlarına ve bütçene bağlı. KYK yurtları çok daha uygun fiyatlı ama oda arkadaşı sayısı fazla olabilir. Özel yurtlar genellikle daha konforlu ama pahalı. Her iki tip için de OrtamNasıl?'da gerçek öğrenci deneyimlerini karşılaştırabilirsin.", category: "ozel", sortOrder: 11 },
];

const BLOG_POSTS = [
  {
    slug: "kyk-yurt-basvurusu-nasil-yapilir",
    title: "KYK Yurt Başvurusu Nasıl Yapılır? (2026 Rehber)",
    excerpt: "e-Devlet üzerinden adım adım KYK yurt başvurusu, gerekli belgeler, tercih sıralaması ve sonuç tarihleri.",
    category: "rehber",
    readTime: "8 dk",
    content: `<h2>KYK Yurt Başvurusu Ne Zaman Açılır?</h2>
<p>KYK yurt başvuruları genellikle her yıl <strong>Ağustos ayının ilk haftasında</strong> açılır. Başvuru süresi yaklaşık 2-3 hafta olup, üniversite kayıt dönemine paralel ilerler. Kesin tarihler yıldan yıla değişebilir — KYK resmi web sitesini ve e-Devlet duyurularını takip etmeni öneririz.</p>

<h2>Başvuru İçin Gerekenler</h2>
<ul>
<li>e-Devlet hesabı (e-Devlet şifresi veya mobil imza)</li>
<li>Üniversite kayıt belgesi (kayıt yaptıktan sonra otomatik güncellenir)</li>
<li>Nüfus kayıt bilgileri (e-Devlet üzerinden otomatik çekilir)</li>
<li>Gelir bilgileri (ailenin vergi ve SGK bilgileri otomatik sorgulanır)</li>
<li>Varsa burs/kredi bilgileri</li>
</ul>

<div class="tip"><strong>Tavsiye:</strong> e-Devlet şifreni önceden al. Başvuru döneminde PTT şubeleri yoğun oluyor. İnternet bankacılığı veya mobil imza ile de e-Devlet'e giriş yapabilirsin.</div>

<h2>Adım Adım Başvuru Süreci</h2>
<ol>
<li><strong>e-Devlet'e giriş yap:</strong> turkiye.gov.tr adresinden TC kimlik no ve şifrenle gir.</li>
<li><strong>KYK Yurt Başvurusu sayfasını bul:</strong> Arama çubuğuna "KYK yurt başvurusu" yaz veya Kredi ve Yurtlar Kurumu hizmetlerinden başvuru sayfasına git.</li>
<li><strong>Kişisel bilgilerini kontrol et:</strong> Nüfus, iletişim ve öğrenim bilgilerini doğrula. Hatalı bilgi varsa düzeltmeden devam etme.</li>
<li><strong>Yurt tercihlerini sırala:</strong> Okuduğun şehirdeki KYK yurtlarından en fazla 10 tercih yapabilirsin. Sıralama önemli — en çok istediğin yurdu ilk sıraya koy.</li>
<li><strong>Başvuruyu tamamla:</strong> Bilgilerini onaylayıp başvurunu gönder. Başvuru numaranı not al.</li>
</ol>

<h2>Yurt Tercih Sıralaması Nasıl Yapılmalı?</h2>
<p>Tercih sıralaman yerleşme şansını doğrudan etkiler. İşte dikkat etmen gerekenler:</p>
<ul>
<li><strong>Konumu kontrol et:</strong> Yurdun üniversitene uzaklığını ve ulaşım olanaklarını araştır.</li>
<li><strong>Değerlendirmeleri oku:</strong> OrtamNasıl?'da yurdun ortam skoruna, yemek ve internet puanlarına bak.</li>
<li><strong>Oda tiplerini incele:</strong> 4, 6 veya 8 kişilik oda seçenekleri var. Az kişilik odalar daha çabuk dolar.</li>
<li><strong>Yeni yurtları da düşün:</strong> Yeni açılan yurtlar genellikle daha az tercih edilir ama daha temiz ve modern olabilir.</li>
</ul>

<div class="tip"><strong>Tavsiye:</strong> Popüler yurtlar hızla dolar. İlk 3 tercihini en çok istediğin yurtlara, son tercihleri ise yerleşme garantisi için daha az talep gören yurtlara ayır.</div>

<h2>Sonuçlar Ne Zaman Açıklanır?</h2>
<p>KYK yurt yerleştirme sonuçları genellikle <strong>Eylül ayının ortasında</strong> açıklanır. Sonuçları e-Devlet üzerinden veya KYK web sitesinden öğrenebilirsin. Yerleşemezsen yedek listesinde olabilirsin — ek yerleştirme duyurularını takip et.</p>

<h2>Yerleştikten Sonra Yapılacaklar</h2>
<ol>
<li>Yurt kayıt tarihlerini kontrol et ve zamanında git.</li>
<li>Gerekli belgeleri hazırla: öğrenci belgesi, vesikalık fotoğraf, nüfus cüzdanı fotokopisi.</li>
<li>Yurt ücretini öde (banka veya PTT üzerinden).</li>
<li>Odanı ve eşyalarını teslim al.</li>
</ol>

<h2>Sıkça Yapılan Hatalar</h2>
<ul>
<li><strong>Başvuruyu son güne bırakmak:</strong> e-Devlet sunucuları son günlerde yavaşlayabilir.</li>
<li><strong>Tercih sıralamasını rastgele yapmak:</strong> Sıralama çok önemli, dikkatle düşün.</li>
<li><strong>İletişim bilgilerini güncellememek:</strong> Yanlış telefon numarası yüzünden duyuruları kaçırabilirsin.</li>
<li><strong>Yurdu araştırmadan tercih etmek:</strong> OrtamNasıl?'daki değerlendirmelere mutlaka göz at.</li>
</ul>`,
  },
  {
    slug: "yurt-hayatina-hazirlik-rehberi",
    title: "Yurt Hayatına Hazırlık: Yanına Alman Gerekenler",
    excerpt: "İlk kez yurda yerleşecekler için bavul listesi, oda düzeni ipuçları ve yurt hayatını kolaylaştıran tavsiyeler.",
    category: "rehber",
    readTime: "6 dk",
    content: `<p>Yurt hayatına ilk kez adım atmak heyecan verici ama biraz da stresli olabilir. Bu rehber, bavulunu hazırlarken ve yurda yerleşirken işine yarayacak pratik bilgileri derliyor.</p>

<h2>Temel Eşya Listesi</h2>
<h3>Yatak ve Banyo</h3>
<ul>
<li>Çarşaf takımı (tek kişilik) — en az 2 set</li>
<li>Yastık ve yastık kılıfı</li>
<li>Battaniye veya yorgan (yurdun ısınma durumuna göre)</li>
<li>Havlu (banyo + yüz)</li>
<li>Terlik (oda + banyo için ayrı)</li>
</ul>

<h3>Kişisel Bakım</h3>
<ul>
<li>Şampuan, sabun, diş fırçası, diş macunu</li>
<li>Çamaşır deterjanı (sıvı tercih et, daha pratik)</li>
<li>Kurutma askıları</li>
<li>Küçük çamaşır sepeti</li>
</ul>

<h3>Teknoloji ve Çalışma</h3>
<ul>
<li>Dizüstü bilgisayar + şarj kablosu</li>
<li>Uzatma kablosu (çoklu priz — yurtlarda priz az olur)</li>
<li>Kulaklık (oda arkadaşına saygı)</li>
<li>USB bellek veya harici disk</li>
</ul>

<div class="tip"><strong>Tavsiye:</strong> Uzatma kablosu ve kulaklık, yurt hayatının en önemli iki eşyası. İlk gün yanında olsun.</div>

<h3>Mutfak ve Yiyecek</h3>
<ul>
<li>Su bardağı, çay bardağı, çatal-kaşık</li>
<li>Kettle (izin verilen yurtlarda)</li>
<li>Atıştırmalık kutusu</li>
<li>Küçük buzdolabı kilidi (ortak dolap varsa)</li>
</ul>

<h2>Yurda Yerleşme İpuçları</h2>
<ul>
<li><strong>İlk gün oda arkadaşınla tanış:</strong> İlk izlenim önemli, açık ve samimi ol.</li>
<li><strong>Ortak alanları kararlaştırın:</strong> Dolap paylaşımı, ışık saatleri, sessizlik kuralları konuşulmalı.</li>
<li><strong>Değerli eşyalarını kilitle:</strong> Laptop ve telefonunu kilitli dolabında tut.</li>
<li><strong>İlk hafta yurdu keşfet:</strong> Çamaşırhane, çalışma salonu, kantin — nerede ne var öğren.</li>
</ul>

<h2>Yurt Hayatını Kolaylaştıran Tavsiyeler</h2>
<ol>
<li>Gürültü önleyici kulaklık al — ders çalışırken hayat kurtarır.</li>
<li>Çamaşırlarını haftada bir gün belirleyerek yıka, birikmesin.</li>
<li>Yurt yemekhanesi dışında da alternatif yemek seçenekleri araştır.</li>
<li>Yurt arkadaşlarınla iyi ilişkiler kur — 4 yıl birlikte olacaksınız.</li>
<li>Ders programına göre uyku düzeni oluştur.</li>
</ol>

<div class="tip"><strong>Tavsiye:</strong> Yurdun ortam skorunu merak ediyorsan, OrtamNasıl?'da anonim değerlendirmelere bak. Daha yurda gitmeden içerden öğren.</div>`,
  },
  {
    slug: "yurt-secerken-dikkat-edilecekler",
    title: "Yurt Seçerken Nelere Dikkat Etmelisin?",
    excerpt: "KYK mı özel mi, konum mu fiyat mı? Yurt seçiminde göz önünde bulundurman gereken 10 kriter.",
    category: "rehber",
    readTime: "7 dk",
    content: `<p>Doğru yurdu seçmek, üniversite hayatının kalitesini doğrudan etkiler. Bu rehberde yurt seçerken göz önünde bulundurman gereken 10 kritik faktörü ele alıyoruz.</p>

<h2>1. KYK mi Özel Yurt mu?</h2>
<p><strong>KYK yurtları</strong> çok uygun fiyatlı (aylık 750-1.500 TL) ama genellikle 4-8 kişilik odalar. <strong>Özel yurtlar</strong> daha konforlu ama aylık 4.000-12.000 TL arası olabilir. Bütçeni hesapla ve ailenle konuş.</p>

<h2>2. Konum ve Ulaşım</h2>
<p>Yurdun üniversitene uzaklığı günlük hayatını çok etkiler. Toplu taşıma güzergahını, süresini ve ücretini araştır. Kampüse yürüme mesafesindeki yurtlar en ideal olanlar.</p>

<h2>3. Oda Tipi ve Kapasite</h2>
<p>Daha az kişilik odalar daha sessiz ve daha rahat ama daha pahalı olabilir. Kendi çalışma düzenini düşün: sessizliğe mi ihtiyacın var, yoksa sosyal bir ortam mı tercih ediyorsun?</p>

<h2>4. Yemek Kalitesi</h2>
<p>KYK yurtlarında sabah-akşam yemek sunulur ama kalite yurttan yurta değişir. Özel yurtlarda yemek dahil olabilir veya olmayabilir. OrtamNasıl?'daki değerlendirmelerde yemek puanına bak.</p>

<h2>5. İnternet Hızı</h2>
<p>Özellikle mühendislik, tasarım veya online dersler için internet hızı kritik. Bazı yurtlarda fiber varken bazılarında akşam saatlerinde bağlantı çok yavaşlar. Gerçek kullanıcı yorumlarını oku.</p>

<h2>6. Temizlik ve Hijyen</h2>
<p>Ortak banyolar, koridorlar ve mutfakların temizliği yurttan yurta büyük fark gösterir. Temizlik programı düzenli mi, personel yeterli mi — bunları öğrenmek için OrtamNasıl?'daki değerlendirmeler çok işe yarar.</p>

<h2>7. Giriş-Çıkış Kuralları</h2>
<p>KYK yurtlarında genellikle gece kapanış saati var. Bazı özel yurtlarda 7/24 giriş-çıkış serbest. Sosyal hayatını ve ders programını düşünerek karar ver.</p>

<h2>8. Güvenlik</h2>
<p>Kamera sistemi, kartlı giriş, güvenlik görevlisi — bunlar özellikle özel yurtlarda farklılık gösterebilir. Güvenlik altyapısını sormaktan çekinme.</p>

<h2>9. Sosyal Ortam</h2>
<p>Yurdun sosyal ortamı, arkadaşlık kurma ve adaptasyon sürecini etkiler. Etüt odası, ortak salon, spor alanı gibi olanaklar sosyal hayatı zenginleştirir.</p>

<h2>10. Gerçek Öğrenci Yorumları</h2>
<p>Broşürler ve web siteleri her zaman gerçeği yansıtmaz. Yurtta kalan öğrencilerin anonim değerlendirmelerini okumak en güvenilir yöntem. OrtamNasıl?'da her yurdun gerçek deneyimlerini bulabilirsin.</p>

<div class="tip"><strong>Tavsiye:</strong> Yurt seçimini yapmadan önce OrtamNasıl?'da ilgilendiğin yurtları ara, ortam skorlarını karşılaştır ve yorumları oku. Anonim değerlendirmeler sayesinde gerçek resmi görebilirsin.</div>`,
  },
];

async function main() {
  // Seed FAQ items
  for (const faq of FAQ_ITEMS) {
    await prisma.faqItem.upsert({
      where: { id: `seed-faq-${faq.sortOrder}` },
      update: faq,
      create: { id: `seed-faq-${faq.sortOrder}`, ...faq },
    });
  }
  console.log(`Seeded ${FAQ_ITEMS.length} FAQ items`);

  // Seed blog posts
  for (const post of BLOG_POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { title: post.title, excerpt: post.excerpt, content: post.content, category: post.category, readTime: post.readTime },
      create: { ...post, published: true, publishedAt: new Date() },
    });
  }
  console.log(`Seeded ${BLOG_POSTS.length} blog posts`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });

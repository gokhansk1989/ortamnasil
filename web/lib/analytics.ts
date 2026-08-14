// GA4 olay gönderimi.
//
// Anket tek sayfa içinde ilerlediği ve URL değişmediği için GA yalnızca
// "/anket görüntülendi" bilgisini görüyor; kaç kişinin gerçekten değerlendirme
// bıraktığı ölçülemiyordu. Kampanyanın başarısı tıklamayla değil tamamlanan
// değerlendirmeyle ölçüldüğü için huninin adımlarını olay olarak gönderiyoruz.

type GtagFn = (command: string, eventName: string, params?: Record<string, unknown>) => void;
type FbqFn = (command: string, eventName: string, params?: Record<string, unknown>) => void;

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", name, params);
  } catch {
    // Ölçüm hiçbir zaman kullanıcı akışını bozmamalı.
  }
}

// Meta'ya reklam optimizasyonu için gönderilen dönüşüm sinyali.
//
// Bilinçli olarak parametresiz: hangi yurdun değerlendirildiği Meta'ya
// gönderilmez. Optimizasyon için olayın kendisi yeterli ve sitenin anonimlik
// sözü, bir kullanıcının belirli bir yurt değerlendirmesiyle ilişkilendirilmesine
// izin vermiyor. Standart "Lead" olayı kullanılıyor çünkü Meta'nın
// optimizasyonu standart olaylarda özel olaylara göre daha iyi çalışıyor.
export function trackMetaConversion(): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: FbqFn }).fbq;
  if (typeof fbq !== "function") return;
  try {
    fbq("track", "Lead");
  } catch {
    // Ölçüm hiçbir zaman kullanıcı akışını bozmamalı.
  }
}

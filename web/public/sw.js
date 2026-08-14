self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "OrtamNasıl?";
  const options = {
    body: data.body || "Yurdunu değerlendirmeni bekliyoruz!",
    icon: "/apple-touch-icon.png",
    badge: "/apple-touch-icon.png",
    data: { url: data.url || "https://www.ortamnasil.com/anket" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "https://www.ortamnasil.com/anket";
  event.waitUntil(clients.openWindow(url));
});

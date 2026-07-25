/* Görsel ön yükleme önbelleği.
   Aynı adres iki kez istenmesin diye söz (promise) düzeyinde tutuluyor: scroll
   sekansı hem yükleme sırasında hem yeniden mount edildiğinde aynı kareleri
   ister, ikinci istek doğrudan hazır görseli alır.

   `decode()` de bekleniyor — indirmek yetmiyor, çözülmemiş bir görseli ilk
   çizimde tarayıcı ana iş parçacığında açıyor ve tam da kaydırma sırasında
   kare atlatıyor. */

const cache = new Map<string, Promise<HTMLImageElement>>();

export function preloadImage(src: string): Promise<HTMLImageElement> {
  const hit = cache.get(src);
  if (hit) return hit;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const failed = () => reject(new Error(`Görsel yüklenemedi: ${src}`));
    const img = new Image();
    img.decoding = "async";
    img.src = src;

    if (img.decode) {
      // decode() bozuk dosyada da reddeder; iki yolu da resolve/reject'e bağla.
      img.decode().then(
        () => resolve(img),
        () => (img.complete && img.naturalWidth > 0 ? resolve(img) : failed()),
      );
      return;
    }
    img.onload = () => resolve(img);
    img.onerror = failed;
  });

  cache.set(src, promise);
  return promise;
}

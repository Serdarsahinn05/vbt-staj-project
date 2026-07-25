/* Ana sayfadaki Lunaris scroll sekansı.
   Kareler `public/sequence/lunaris/0001.webp … 0150.webp` — 900×900, altı ayrı
   çekimden çıkarıldı. Sekans kaydırma ile ilerler, altı noktada durup ürünün
   o anda görünen parçasını anlatır.

   Anotasyon koordinatları karenin kendi içinde 0–1 normalize edilmiştir, yani
   tuval ekranda hangi boyuta ölçeklenirse ölçeklensin çizgi doğru yeri gösterir. */

export const SEQUENCE_DIR = "/sequence/lunaris";
export const SEQUENCE_FRAMES = 150;

export function frameSrc(frame: number): string {
  return `${SEQUENCE_DIR}/${String(frame).padStart(4, "0")}.webp`;
}

export interface SequenceStop {
  /** Sekansın durakladığı kare (1 tabanlı). */
  frame: number;
  /** Çizginin ucu — karenin içinde normalize konum. */
  anchor: { x: number; y: number };
  /** Etiket kutusunun tuvalin hangi yanına yerleşeceği. */
  side: "left" | "right";
  title: string;
  body: string;
}

/* Kareler tek tek incelenerek seçildi: her durak, o karede gerçekten görünen
   bir parçayı gösteriyor. Metinler iki kaynağın dışına çıkmıyor — karede
   görünen ve backend açıklamasında geçen ("40 mm kasa, ay evresi (moon phase)
   komplikasyonu ve takımyıldızı detaylı gökyüzü temalı kadran, timsah derisi
   kayış"). Doğrulanamayan ayrıntı yazılmıyor. Tek çıkarım kurma kolunun ne
   ayarladığı: saatte ay evresi komplikasyonu var ve kasada başka kontrol
   yok, ikisi de o koldan ayarlanıyor. */
export const SEQUENCE_STOPS: SequenceStop[] = [
  {
    frame: 8,
    anchor: { x: 0.25, y: 0.5 },
    side: "left",
    title: "İlk Bakış",
    body: "40 mm kasa, krem kadran, saat 6 yönünde ay evresi.",
  },
  {
    frame: 28,
    anchor: { x: 0.76, y: 0.52 },
    side: "right",
    title: "Kurma Kolu",
    body: "Tırtıklı kenarında Zemrek amblemi gravürlü. Saat ayarı da ay evresi de buradan yapılıyor.",
  },
  {
    frame: 52,
    anchor: { x: 0.45, y: 0.42 },
    side: "right",
    title: "Yandan Bakınca",
    body: "Ayna cilalı kenar, mat gövde. İnce kasa ve kavisli kulaklar bileğe yatıyor.",
  },
  {
    frame: 78,
    anchor: { x: 0.46, y: 0.52 },
    side: "left",
    title: "Kapalı Arka Kapak",
    body: "Zemrek amblemi kasaya gravürlenmiş. Mekanizma dışarıya kapalı, tek parça gövde.",
  },
  {
    frame: 120,
    anchor: { x: 0.46, y: 0.84 },
    side: "left",
    title: "Timsah Derisi",
    body: "Koyu kahve, mat bir yüzey. Kasanın parlaklığını dengeliyor.",
  },
  {
    frame: 148,
    anchor: { x: 0.53, y: 0.77 },
    side: "right",
    title: "Ay Evresi Komplikasyonu",
    body: "Krem kadranın altında lacivert bir disk: ay ve takımyıldız haritası. Lunaris adını buradan alıyor.",
  },
];

/* Kaydırma ilerlemesi (0–1) → kare numarası.
   Zaman çizgisi ardışık parçalara bölünüyor: her durak öncesinde kameranın
   döndüğü bir "geçiş", ardından karenin sabit kaldığı bir "bekleme". Geçişin
   ağırlığı kat edilen kare sayısı kadar, böylece dönüş hızı sabit kalıyor. */

/* Bekleme payı geçişlere göre bilerek ağır: durakta metni okuyacak vakit
   kalsın, kaydırma oradan hızla geçip gitmesin. */
const HOLD_WEIGHT = 38;
/* Son durakla sekansın sonu arasındaki pay. Kısa tutulursa kapanış yazısı son
   etiketin üstüne biniyor; uzun tutulursa kare 148–150 arası görüntü donarken
   kullanıcı boşluğa kaydırıyor. */
const TAIL_WEIGHT = 26;

interface Segment {
  /** Segmentin ilerleme çizgisindeki başı ve sonu (0–1). */
  start: number;
  end: number;
  fromFrame: number;
  toFrame: number;
  /** Bekleme segmentiyse hangi durağa ait. */
  stopIndex: number | null;
}

function buildTimeline(): Segment[] {
  const raw: Omit<Segment, "start" | "end">[] = [];
  let frame = 1;

  for (const [index, stop] of SEQUENCE_STOPS.entries()) {
    raw.push({ fromFrame: frame, toFrame: stop.frame, stopIndex: null });
    raw.push({ fromFrame: stop.frame, toFrame: stop.frame, stopIndex: index });
    frame = stop.frame;
  }
  raw.push({ fromFrame: frame, toFrame: SEQUENCE_FRAMES, stopIndex: null });

  const weights = raw.map((s, i) => {
    if (s.stopIndex !== null) return HOLD_WEIGHT;
    if (i === raw.length - 1) return TAIL_WEIGHT;
    return Math.abs(s.toFrame - s.fromFrame);
  });
  const total = weights.reduce((a, b) => a + b, 0);

  let cursor = 0;
  return raw.map((segment, i) => {
    const start = cursor / total;
    cursor += weights[i];
    return { ...segment, start, end: cursor / total };
  });
}

export const TIMELINE: Segment[] = buildTimeline();

/** İlerlemeye karşılık gelen kare (kesirli; çizerken yuvarlanır). */
export function frameAt(progress: number): number {
  const p = Math.min(Math.max(progress, 0), 1);
  for (const segment of TIMELINE) {
    if (p > segment.end) continue;
    if (segment.fromFrame === segment.toFrame) return segment.fromFrame;
    const local = (p - segment.start) / (segment.end - segment.start);
    return segment.fromFrame + local * (segment.toFrame - segment.fromFrame);
  }
  return SEQUENCE_FRAMES;
}

/** Bir durağın bekleme segmentindeki ilerleme; segment dışındaysa null. */
export function stopProgress(
  progress: number,
  stopIndex: number,
): number | null {
  const segment = TIMELINE.find((s) => s.stopIndex === stopIndex);
  if (!segment) return null;
  if (progress < segment.start || progress > segment.end) return null;
  return (progress - segment.start) / (segment.end - segment.start);
}

/* Etiketin görünürlüğü: bekleme segmentinin başında açılır, sonunda kapanır.
   Ortadaki düzlük okumaya ayrılan süre. */
export function revealAmount(t: number | null): number {
  if (t === null) return 0;
  const IN = 0.22;
  const OUT = 0.82;
  if (t < IN) return t / IN;
  if (t > OUT) return Math.max(0, 1 - (t - OUT) / (1 - OUT));
  return 1;
}

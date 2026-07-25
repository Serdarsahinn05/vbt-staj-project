import { create } from "zustand";

/* Kısa bildirimler. Sepete ekleme gibi işlemler sayfayı değiştirmiyor, bu
   yüzden geri bildirim ve "sepete git" kestirmesi buradan veriliyor.
   Kalıcı değil: yenilemede kaybolması doğru, o yüzden persist yok. */

export interface Toast {
  id: number;
  title: string;
  description?: string;
  /** Bildirimin içindeki kestirme bağlantı. */
  action?: { label: string; href: string };
}

interface ToastState {
  toasts: Toast[];
  show: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  show: (toast) =>
    set((s) => ({
      /* Ekranda tek bildirim: arka arkaya sepete eklendiğinde kartlar alt alta
         birikmesin, yenisi eskisinin yerini alsın. Kimlik her seferinde
         değiştiği için giriş animasyonu yeniden oynuyor ve ekleme fark
         ediliyor. */
      toasts: [...s.toasts, { ...toast, id: nextId++ }].slice(-1),
    })),

  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Bileşen dışından da çağrılabilsin diye kısayol. */
export function toast(t: Omit<Toast, "id">): void {
  useToastStore.getState().show(t);
}

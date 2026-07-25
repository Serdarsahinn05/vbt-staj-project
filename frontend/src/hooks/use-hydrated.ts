import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/* Hydration tamamlanınca true döner; SSR'de ve ilk client render'da false.
   setState-in-effect olmadan hydration-güvenli koşullu render sağlar
   (örn. localStorage'dan gelen sepet sayacını göstermek). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/* Basit className birleştirici. Falsy değerleri atar.
   Tailwind class'larını biz kontrol ettiğimiz için tailwind-merge'e gerek yok. */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}

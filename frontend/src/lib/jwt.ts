/* Access token'ın payload'ını okur. İmzayı DOĞRULAMAZ — doğrulamayı backend
   yapıyor. Burada sadece "kim giriş yapmış, rolü ne, süresi doldu mu" için
   kullanıyoruz; yetki kararı her zaman sunucuda veriliyor. */

export interface JwtPayload {
  sub: number;
  email: string;
  role?: string | null;
  iat: number;
  exp: number;
}

function base64UrlDecode(segment: string): string {
  const padded = segment
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(segment.length / 4) * 4, "=");

  // atob byte döndürür; Türkçe karakterler için UTF-8'e çeviriyoruz.
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwt(token: string): JwtPayload | null {
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    return JSON.parse(base64UrlDecode(segment)) as JwtPayload;
  } catch {
    return null;
  }
}


import { useAuthStore } from "@/stores/auth-store";
import type { AuthTokens } from "@/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** NestJS ValidationPipe hataları `message` alanını dizi olarak döndürüyor. */
function errorMessage(body: unknown, fallback: string): string {
  const message = (body as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join(" · ");
  if (typeof message === "string") return message;
  return fallback;
}

export type ApiOptions = Omit<RequestInit, "body"> & {
  /** Authorization: Bearer başlığı ekler, 401'de token'ı bir kez yeniler. */
  auth?: boolean;
  body?: unknown;
};

async function request<T>(
  path: string,
  { auth = false, body, headers, ...init }: ApiOptions = {},
  allowRetry = true,
): Promise<T> {
  const finalHeaders = new Headers(headers);
  if (body !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = useAuthStore.getState().accessToken;
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    // Fiyat ve stok yönetim panelinden değişiyor; hiçbir yanıt build'e
    // gömülmesin, sunucuda render edilen sayfalar her istekte tazelensin.
    cache: "no-store",
    ...init,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // Access token 15 dakikalık; süresi dolduysa refresh ile bir kez daha dene.
  if (res.status === 401 && auth && allowRetry && (await refreshSession())) {
    return request<T>(path, { auth, body, headers, ...init }, false);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new ApiError(res.status, errorMessage(errorBody, res.statusText));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function api<T>(path: string, options?: ApiOptions): Promise<T> {
  return request<T>(path, options);
}

/** Refresh token ile yeni oturum alır. Başarısızsa oturumu düşürür. */
async function refreshSession(): Promise<boolean> {
  const { refreshToken, setSession, clear } = useAuthStore.getState();
  if (!refreshToken) return false;

  try {
    const tokens = await request<AuthTokens>(
      "/auth/refresh",
      { method: "POST", body: { refreshToken } },
      false,
    );
    setSession(tokens);
    return true;
  } catch {
    clear();
    return false;
  }
}

export async function login(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const tokens = await request<AuthTokens>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  useAuthStore.getState().setSession(tokens);
  return tokens;
}

export function logout(): void {
  useAuthStore.getState().clear();
}

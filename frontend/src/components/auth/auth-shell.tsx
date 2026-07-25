import type { ReactNode } from "react";

/* Giriş ve kayıt sayfalarının ortak dar kart düzeni. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[480px] flex-col px-6 pb-24 pt-32 max-md:px-4 max-md:pb-14 max-md:pt-26">
      <h1 className="mb-2 font-heading text-h2 font-semibold text-heading">
        {title}
      </h1>
      {subtitle && <p className="mb-8 text-body">{subtitle}</p>}

      <div className="rounded-lg border border-border-subtle bg-surface p-7 shadow-soft max-sm:p-5">
        {children}
      </div>

      {footer && (
        <div className="mt-6 text-center text-body">{footer}</div>
      )}
    </div>
  );
}

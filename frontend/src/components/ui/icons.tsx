/* Arayüzde tekrar eden küçük simgeler. Hepsi currentColor ile çiziliyor ve
   1.8 kalınlıkta — başlıktaki simge setiyle aynı çizgi diliyle dursunlar. */

function Icon({
  size = 16,
  children,
}: {
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

export function TrashIcon({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M3 6h18" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
      <path d="M18.5 6 18 19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5.5 6" />
      <path d="M10 11v6M14 11v6" />
    </Icon>
  );
}

export function BagIcon({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </Icon>
  );
}

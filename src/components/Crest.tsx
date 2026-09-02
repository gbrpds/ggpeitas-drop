export function Crest({ className }: { className?: string }) {
  return (
    <svg className={className ?? "crest"} viewBox="0 0 100 112" aria-hidden="true">
      <path
        d="M50 4 L92 20 V56 C92 84 72 100 50 108 C28 100 8 84 8 56 V20 Z"
        fill="#0b0e07"
        stroke="#ffc400"
        strokeWidth="3"
      />
      <path d="M50 12 L84 25 V55 C84 78 68 92 50 99 Z" fill="#0f8a3d" />
      <path d="M50 12 L16 25 V55 C16 78 32 92 50 99 Z" fill="#ffc400" />
      <text x="50" y="66" textAnchor="middle" fontFamily="Anton,sans-serif" fontSize="42" fill="#0b0e07">
        G
      </text>
    </svg>
  );
}

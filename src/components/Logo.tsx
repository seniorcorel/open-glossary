interface Props {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 36 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3D3229" />
          <stop offset="100%" stopColor="#6B5E4F" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#logoBg)" />
      <rect x="14" y="13" width="3.5" height="38" rx="1.75" fill="#C49A3C" opacity={0.8} />
      <rect x="17.5" y="13" width="30" height="38" rx="2.5" fill="#FAF7F2" />
      <rect x="22" y="21" width="16" height="2.5" rx="1.25" fill="#B8705A" opacity={0.8} />
      <rect x="22" y="27" width="21" height="1.5" rx="0.75" fill="#C4BAA8" opacity={0.6} />
      <rect x="22" y="31.5" width="15" height="1.5" rx="0.75" fill="#C4BAA8" opacity={0.6} />
      <rect x="22" y="36" width="19" height="1.5" rx="0.75" fill="#C4BAA8" opacity={0.6} />
      <path d="M28 43 Q32 40 36 43" fill="none" stroke="#C49A3C" strokeWidth="1.2" opacity={0.7} />
    </svg>
  );
}

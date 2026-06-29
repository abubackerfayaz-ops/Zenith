interface FameRingProps {
  score: number;
  size?: number;
  sw?: number;
  className?: string;
}

export default function FameRing({ score, size = 120, sw = 8, className = '' }: FameRingProps) {
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 10);

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 block">
        <defs>
          <linearGradient id={`fg${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={sw}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={`url(#fg${size})`} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ filter: 'drop-shadow(0 0 8px #8B5CF6)', transition: 'stroke-dashoffset 1.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-white leading-none font-display" style={{ fontSize: size * 0.24 }}>
          {score}
        </span>
        <span className="text-white/40 uppercase tracking-widest font-display" style={{ fontSize: size * 0.09 }}>
          FAME
        </span>
      </div>
    </div>
  );
}

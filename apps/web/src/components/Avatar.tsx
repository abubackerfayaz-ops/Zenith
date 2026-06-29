interface AvatarProps {
  ini: string;
  color: string;
  size?: number;
  ring?: boolean;
  className?: string;
}

export default function Avatar({ ini, color, size = 40, ring = false, className = '' }: AvatarProps) {
  const fs = Math.round(size * 0.32);

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      {ring && (
        <div
          className="spin-slow absolute inset-0 rounded-full"
          style={{
            padding: 2,
            background: `conic-gradient(from 0deg, ${color}, #EC4899, ${color})`,
            borderRadius: '50%',
          }}
        >
          <div className="w-full h-full rounded-full bg-background" />
        </div>
      )}
      <div
        className="absolute rounded-full flex items-center justify-center font-bold text-white"
        style={{
          inset: ring ? 3 : 0,
          background: `linear-gradient(135deg, ${color}, ${color}88)`,
          fontSize: fs,
          boxShadow: ring ? `0 0 14px ${color}60` : undefined,
        }}
      >
        {ini}
      </div>
    </div>
  );
}

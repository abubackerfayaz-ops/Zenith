import type { View } from '../lib/types';

export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      <div
        className="aurora1 absolute -top-48 -left-48 w-[760px] h-[760px] rounded-full opacity-[.28]"
        style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 68%)' }}
      />
      <div
        className="aurora2 absolute -top-24 right-0 w-[640px] h-[640px] rounded-full opacity-[.22]"
        style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 68%)' }}
      />
      <div
        className="aurora3 absolute bottom-0 left-1/3 w-[860px] h-[620px] rounded-full opacity-[.18]"
        style={{ background: 'radial-gradient(circle, #0891B2 0%, transparent 68%)' }}
      />
      <div
        className="aurora1 absolute -bottom-48 right-0 w-[620px] h-[620px] rounded-full opacity-[.22]"
        style={{
          background: 'radial-gradient(circle, #DB2777 0%, transparent 68%)',
          animationDirection: 'reverse',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,.08) 0%, transparent 60%)' }}
      />
    </div>
  );
}

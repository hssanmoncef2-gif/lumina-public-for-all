'use client';

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  size: (((i * 7 + 3) % 17) / 17) * 2 + 1,
  top:  (((i * 13 + 5) % 97)) + '%',
  left: (((i * 11 + 2) % 89)) + '%',
  op:   (((i * 9  + 1) % 5)  / 10) + 0.1,
}));

export default function AtmosphericBg() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_10%,rgba(88,28,220,0.14),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_90%,rgba(20,180,160,0.09),transparent)]" />
      {STARS.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white"
          style={{ width: s.size, height: s.size, top: s.top, left: s.left, opacity: s.op }} />
      ))}
    </div>
  );
}

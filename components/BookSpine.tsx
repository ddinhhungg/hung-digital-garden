'use client';

export default function BookSpine({ title, tool, bg, w, h, delay }: {
  title: string; tool: string; bg: string; w: number; h: number; delay: number;
}) {
  return (
    <div className={`reveal reveal-delay-${delay}`} style={{
      cursor: 'pointer', borderRadius: '3px 3px 0 0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
      width: w, height: h, background: bg,
      boxShadow: '2px 0 8px rgba(0,0,0,0.22), inset -4px 0 0 rgba(0,0,0,0.18)',
      transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1)',
    }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-8px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <span style={{
        writingMode: 'vertical-rl', transform: 'rotate(180deg)',
        fontFamily: 'var(--mono)', fontSize: 8, color: 'rgba(255,255,255,0.75)',
        letterSpacing: '0.08em', whiteSpace: 'nowrap', padding: '8px 0', userSelect: 'none',
      }}>{title}</span>
      <span style={{
        position: 'absolute', bottom: 5, left: 0, right: 0,
        fontFamily: 'var(--mono)', fontSize: 6, color: 'rgba(255,255,255,0.35)',
        textAlign: 'center', letterSpacing: '0.04em',
      }}>{tool}</span>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function BookSpine({ title, tool, bg, w, h, delay, href }: {
  title: string; tool: string; bg: string; w: number; h: number; delay: number; href?: string;
}) {
  const [hovered, setHovered] = useState(false);

  const inner = (
    <div
      className={`reveal reveal-delay-${delay}`}
      style={{
        cursor: href ? 'pointer' : 'default',
        borderRadius: '3px 3px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', flexShrink: 0,
        width: w, height: h, background: bg,
        boxShadow: hovered
          ? '4px 0 16px rgba(0,0,0,0.35), inset -4px 0 0 rgba(0,0,0,0.18)'
          : '2px 0 8px rgba(0,0,0,0.22), inset -4px 0 0 rgba(0,0,0,0.18)',
        transform: hovered ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: '110%', left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--ink)', color: 'var(--cream)',
          fontFamily: 'var(--mono)', fontSize: 9,
          padding: '6px 10px', borderRadius: 4,
          whiteSpace: 'nowrap', zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          pointerEvents: 'none',
          maxWidth: 220, textAlign: 'center', lineHeight: 1.5,
        }}>
          {title}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: '5px solid var(--ink)',
          }} />
        </div>
      )}

      {/* Spine title — truncated vertical text */}
      <span style={{
        writingMode: 'vertical-rl', transform: 'rotate(180deg)',
        fontFamily: 'var(--mono)', fontSize: 8, color: 'rgba(255,255,255,0.8)',
        letterSpacing: '0.08em',
        padding: '8px 0',
        userSelect: 'none',
        maxHeight: h - 24,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>{title}</span>

      {/* Tag label at bottom */}
      <span style={{
        position: 'absolute', bottom: 5, left: 0, right: 0,
        fontFamily: 'var(--mono)', fontSize: 6, color: 'rgba(255,255,255,0.4)',
        textAlign: 'center', letterSpacing: '0.04em',
      }}>{tool}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </Link>
    );
  }
  return inner;
}

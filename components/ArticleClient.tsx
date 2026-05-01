'use client';

import { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const pct = doc.scrollTop / (doc.scrollHeight - doc.clientHeight) * 100;
      setWidth(Math.min(100, pct));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${width}%` }} />
    </div>
  );
}

export function Ruler() {
  return (
    <div className="ruler">
      <div className="ruler-label">reading</div>
      <div className="ruler-line" />
      <div className="ruler-tick" />
      <div className="ruler-tick" />
      <div className="ruler-tick" />
    </div>
  );
}

export function MarginToggle({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const pref = localStorage.getItem('garden-margin-notes');
    if (pref === '0') setHidden(true);
  }, []);

  useEffect(() => {
    const wrap = document.getElementById('article-outer');
    if (wrap) wrap.classList.toggle('margin-hidden', hidden);
  }, [hidden]);

  return <>{children}</>;
}

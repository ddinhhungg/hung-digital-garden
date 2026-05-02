'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function PageLoader() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const navHref = useRef<string | null>(null);

  const hide = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 600);
  };

  // Initial page load
  useEffect(() => {
    const min = 1100;
    const t0 = Date.now();
    const done = () => {
      const wait = Math.max(0, min - (Date.now() - t0));
      setTimeout(hide, wait);
    };
    if (document.readyState === 'complete') done();
    else {
      window.addEventListener('load', done, { once: true });
      const safety = setTimeout(done, 2800);
      return () => { window.removeEventListener('load', done); clearTimeout(safety); };
    }
  }, []);

  // Page-to-page transition via custom event
  useEffect(() => {
    const handler = (e: CustomEvent<{ href: string }>) => {
      navHref.current = e.detail.href;
      setVisible(true);
      setFading(false);
      // Navigate after 750ms (mid-flip)
      setTimeout(() => {
        if (navHref.current) router.push(navHref.current);
      }, 750);
      // Hide 600ms after navigation
      setTimeout(() => hide(), 1350);
    };
    window.addEventListener('book-navigate' as any, handler);
    return () => window.removeEventListener('book-navigate' as any, handler);
  }, [router]);

  if (!visible) return null;

  return (
    <div className={`page-loader${fading ? ' page-loader--hidden' : ''}`} aria-hidden="true">
      {/* Book */}
      <div className="bk-scene">
        <div className="bk">
          {/* Left half — already-read pages */}
          <div className="bk-left">
            <div className="bk-left__lines" />
          </div>

          {/* Spine */}
          <div className="bk-spine" />

          {/* Right half — background (bottommost unturned page) */}
          <div className="bk-right">
            <div className="bk-right__lines" />
          </div>

          {/* Flipping pages (staggered) */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`bk-page bk-page--${i + 1}`}>
              <div className="bk-page__lines" />
              <div className="bk-page__back">
                <div className="bk-page__lines" />
              </div>
            </div>
          ))}

          {/* Table shadow beneath book */}
          <div className="bk-shadow" />
        </div>
      </div>

      <div className="loader-text">đợi mình lật trang khác nhé!</div>
    </div>
  );
}

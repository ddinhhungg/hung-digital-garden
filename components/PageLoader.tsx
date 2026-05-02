'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = (delay = 0) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setFading(true);
      setTimeout(() => setVisible(false), 580);
    }, delay);
  };

  // Initial page load — show until window.load + at least 1s
  useEffect(() => {
    const min = 1100;
    const t0 = Date.now();
    const done = () => hide(Math.max(0, min - (Date.now() - t0)));
    if (document.readyState === 'complete') {
      done();
    } else {
      window.addEventListener('load', done, { once: true });
      const safety = setTimeout(done, 2800);
      return () => { window.removeEventListener('load', done); clearTimeout(safety); };
    }
  }, []);

  // Show loader when any TransitionLink is clicked
  useEffect(() => {
    const handler = () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setVisible(true);
      setFading(false);
    };
    window.addEventListener('book-show', handler);
    return () => window.removeEventListener('book-show', handler);
  }, []);

  // Hide loader when navigation is complete (pathname changed)
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      hide(350); // slight delay so page content can render first
    }
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className={`page-loader${fading ? ' page-loader--hidden' : ''}`} aria-hidden="true">
      <div className="bk-scene">
        <div className="bk">
          <div className="bk-left"><div className="bk-left__lines" /></div>
          <div className="bk-spine" />
          <div className="bk-right"><div className="bk-right__lines" /></div>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`bk-page bk-page--${i + 1}`}>
              <div className="bk-page__lines" />
              <div className="bk-page__back"><div className="bk-page__lines" /></div>
            </div>
          ))}
          <div className="bk-shadow" />
        </div>
      </div>
      <div className="loader-text">đợi mình lật trang khác nhé!</div>
    </div>
  );
}

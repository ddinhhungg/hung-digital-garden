'use client';

import { useEffect, useState } from 'react';

export default function PageLoader() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const minDuration = 900;
    const start = performance.now();

    const finish = () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        setHidden(true);
        setTimeout(() => setRemoved(true), 600);
      }, wait);
    };

    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish, { once: true });
      // Safety net: never block more than 2.5s
      const safety = setTimeout(finish, 2500);
      return () => {
        window.removeEventListener('load', finish);
        clearTimeout(safety);
      };
    }
  }, []);

  if (removed) return null;

  return (
    <div className={`page-loader${hidden ? ' page-loader--hidden' : ''}`} aria-hidden={hidden}>
      <div className="loader-book">
        <div className="loader-book__page loader-book__page--1" />
        <div className="loader-book__page loader-book__page--2" />
        <div className="loader-book__page loader-book__page--3" />
        <div className="loader-book__page loader-book__page--4" />
        <div className="loader-book__cover" />
      </div>
      <div className="loader-text">đợi mình lật trang khác nhé!</div>
    </div>
  );
}

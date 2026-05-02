'use client';

import TransitionLink from '@/components/TransitionLink';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavProps {
  showBack?: boolean;
}

export default function Nav({ showBack = false }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`site-nav${scrolled ? ' scrolled' : ''}`}>
      <TransitionLink href="/" className="nav-logo">{"Hưng's Garden"}</TransitionLink>

      <div className="nav-links">
        <TransitionLink href="/" className={pathname === '/' ? 'active' : ''}>home</TransitionLink>
        <TransitionLink href="/notes" className={pathname.startsWith('/notes') ? 'active' : ''}>notes</TransitionLink>
        <TransitionLink href="/projects" className={pathname === '/projects' ? 'active' : ''}>projects</TransitionLink>
        <TransitionLink href="/journey" className={pathname === '/journey' ? 'active' : ''}>journey</TransitionLink>
        <TransitionLink href="/thoughts" className={pathname === '/thoughts' ? 'active' : ''}>thoughts</TransitionLink>
        <TransitionLink href="/#about" className={pathname === '/about' ? 'active' : ''}>about</TransitionLink>
      </div>

      {showBack ? (
        <TransitionLink href="/" className="nav-back" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em',
          color: 'var(--ink-muted)', textDecoration: 'none',
          transition: 'color 0.15s', padding: '6px 0',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 3L5 8l5 5"/>
          </svg>
          back to garden
        </TransitionLink>
      ) : (
        <div className="nav-meta">☀ growing since 2024</div>
      )}
    </nav>
  );
}

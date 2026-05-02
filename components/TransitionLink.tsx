'use client';

import React from 'react';

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export default function TransitionLink({ href, children, onClick, ...props }: TransitionLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // External links, hash anchors, and mailto/tel links navigate normally
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('book-navigate', { detail: { href } }));
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

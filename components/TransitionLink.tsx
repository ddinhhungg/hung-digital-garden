'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof Link>;

export default function TransitionLink({ href, children, onClick, ...props }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e as any);
    if (e.defaultPrevented) return;
    const h = typeof href === 'string' ? href : (href as any).pathname || '';
    // Skip external, hash, and special links — let them navigate normally
    if (!h || h.startsWith('http') || h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:')) return;
    // Show book animation; actual navigation handled by <Link>
    window.dispatchEvent(new CustomEvent('book-show'));
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

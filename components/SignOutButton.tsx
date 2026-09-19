'use client';

import React from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface SignOutProps {
  children?: React.ReactNode;
  redirectUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function EchoSignOutButton({ children, redirectUrl = '/', className, style }: SignOutProps) {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/users/offline');
      } else {
        await fetch('/api/users/offline', { method: 'POST', keepalive: true }).catch(() => {});
      }
    } catch {}

    await signOut({ redirectUrl });
    router.push(redirectUrl);
  };

  if (!children) {
    return (
      <button onClick={handleSignOut} className={className || 'btn-secondary'} style={style}>
        Sign Out
      </button>
    );
  }

  // If children is a button or element, attach onClick
  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleSignOut,
    });
  }

  return (
    <span onClick={handleSignOut} style={{ cursor: 'pointer', ...style }} className={className}>
      {children}
    </span>
  );
}

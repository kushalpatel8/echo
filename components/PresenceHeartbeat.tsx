'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export function PresenceHeartbeat() {
  const { isSignedIn, isLoaded } = useUser();
  const lastPingRef = useRef<number>(0);

  const prevSignedInRef = useRef(isSignedIn);

  useEffect(() => {
    if (prevSignedInRef.current && !isSignedIn) {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/users/offline');
      } else {
        fetch('/api/users/offline', { method: 'POST', keepalive: true }).catch(() => {});
      }
    }
    prevSignedInRef.current = isSignedIn;
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const pingHeartbeat = async () => {
      const now = Date.now();
      // Rate limit to once every 15 seconds minimum
      if (now - lastPingRef.current < 15000) return;
      lastPingRef.current = now;

      try {
        await fetch('/api/users/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        });
      } catch {
        // Silently fail in case of offline/network glitch
      }
    };

    const markOffline = () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/users/offline');
      } else {
        fetch('/api/users/offline', { method: 'POST', keepalive: true }).catch(() => {});
      }
    };

    // Initial ping
    pingHeartbeat();

    // Periodic heartbeat every 30 seconds
    const interval = setInterval(pingHeartbeat, 30000);

    // Event listeners for user activity & visibility
    const handleActivity = () => {
      pingHeartbeat();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pingHeartbeat();
      }
    };

    window.addEventListener('focus', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', markOffline);
    window.addEventListener('beforeunload', markOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', markOffline);
      window.removeEventListener('beforeunload', markOffline);
    };
  }, [isSignedIn, isLoaded]);

  return null;
}

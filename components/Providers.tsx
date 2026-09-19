'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';
import { PresenceHeartbeat } from '@/components/PresenceHeartbeat';
import { GlobalMessageNotifier } from '@/components/GlobalMessageNotifier';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={true}>
      <PresenceHeartbeat />
      <GlobalMessageNotifier />
      <Toaster position="top-right" richColors closeButton />
      {children}
    </ThemeProvider>
  );
}

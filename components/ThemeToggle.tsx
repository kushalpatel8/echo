'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHomePage = pathname === '/';

  if (!mounted) {
    return (
      <div className="theme-toggle-btn" style={{ width: '40px', height: '40px' }} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        border: '1px solid var(--echo-border)',
        background: 'var(--echo-surface)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '1.2rem',
        boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
      }}
      className="theme-toggle-btn"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="animate-fade-in" key={theme}>
        {isDark ? '☀️' : '🌙'}
      </span>
      <style>{`
        .theme-toggle-btn:hover {
          transform: translateY(-2px) rotate(8deg);
          border-color: var(--echo-primary);
          box-shadow: 0 0 15px var(--echo-primary-low);
        }
        .theme-toggle-btn:active {
          transform: scale(0.95);
        }
        ${!isHomePage ? `
        @media (max-width: 640px) {
          .theme-toggle-btn {
            display: none !important;
          }
        }
        ` : ''}
      `}</style>
    </button>
  );
}

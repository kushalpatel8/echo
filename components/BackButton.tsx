'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Pages where a back button makes no sense
const NO_BACK_PAGES = ['/', '/sign-in', '/sign-up', '/role-selection'];

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on root-level pages
  if (NO_BACK_PAGES.includes(pathname)) return null;

  return (
    <button
      onClick={() => router.back()}
      aria-label="Go back"
      className="back-btn"
    >
      <ArrowLeft size={16} strokeWidth={2.5} />
      <span className="back-btn-label">Back</span>

      <style>{`
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: var(--echo-glass-bg);
          border: 1px solid var(--echo-border);
          border-radius: 0.625rem;
          color: var(--echo-text-muted);
          padding: 0.35rem 0.75rem 0.35rem 0.55rem;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-inter);
          backdrop-filter: blur(12px);
          transition: color 0.2s ease,
                      border-color 0.2s ease,
                      background 0.2s ease,
                      transform 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .back-btn:hover {
          color: var(--echo-text);
          border-color: var(--echo-primary);
          background: var(--echo-primary-low);
          transform: translateX(-2px);
        }

        .back-btn:active {
          transform: translateX(-4px) scale(0.97);
        }

        /* Hide label on very small screens to save space */
        @media (max-width: 380px) {
          .back-btn-label { display: none; }
        }
      `}</style>
    </button>
  );
}

'use client';
import { SignIn } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function SignInPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--echo-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '400px', height: '400px', borderRadius: '50%',
          background: `radial-gradient(circle, rgba(124,58,237,${isDark ? '0.12' : '0.06'}) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c3aed, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: '800', color: 'white',
            margin: '0 auto 1rem',
          }}>E</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--echo-text)' }}>Welcome back to ECHO</h1>
          <p style={{ color: 'var(--echo-text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Your mental health journey continues here
          </p>
        </div>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#7c3aed',
              colorText: isDark ? '#e2e8f0' : '#0f172a',
              colorTextSecondary: isDark ? '#8892a4' : '#64748b',
              colorBackground: isDark ? '#0a0f0a' : '#ffffff',
              colorInputBackground: isDark ? '#121812' : '#f8fafc',
              colorInputText: isDark ? '#e2e8f0' : '#0f172a',
              colorBorder: isDark ? '#1a221a' : '#e2e8f0',
            },
            elements: {
              rootBox: 'w-full',
              card: {
                background: 'var(--echo-surface)',
                border: '1px solid var(--echo-border)',
                borderRadius: '1rem',
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.05)',
              },
              headerTitle: isDark ? 'text-white' : 'text-slate-900',
              headerSubtitle: isDark ? 'text-slate-400' : 'text-slate-500',
              socialButtonsBlockButton: isDark ? 'bg-[#121812] border-[#1a221a] text-white hover:bg-[#1a221a]' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50',
              socialButtonsBlockButtonText: isDark ? 'text-white' : 'text-slate-900',
              formFieldLabel: isDark ? 'text-slate-400' : 'text-slate-700',
              formButtonPrimary: 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:opacity-90 transition-all text-white',
              footerActionLink: 'text-[#7c3aed] hover:text-[#6d28d9]',
              identityPreviewText: isDark ? 'text-white' : 'text-slate-900',
              formFieldInput: isDark ? 'bg-[#121812] border-[#1a221a] text-white focus:border-[#7c3aed]' : 'bg-white border-slate-200 text-slate-900 focus:border-[#7c3aed]',
              footer: {
                background: isDark ? '#060806' : '#f8fafc',
                borderTop: '1px solid var(--echo-border)',
              }
            }
          }}
          fallbackRedirectUrl="/"
          signUpUrl="/sign-up"
        />
      </div>
    </main>
  );
}

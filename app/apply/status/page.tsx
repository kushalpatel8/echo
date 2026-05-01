'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';

export default function ApplicationStatusPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          if (data.user.applicationStatus === 'approved') {
            router.push('/dashboard');
          } else {
            setUser(data.user);
          }
        } else {
          router.push('/role-selection');
        }
      })
      .catch(() => router.push('/role-selection'))
      .finally(() => setLoading(false));
  }, [router]);

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to withdraw your application and delete your account?')) return;
    await fetch('/api/users/profile', { method: 'DELETE' });
    router.push('/');
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--echo-bg)' }} />;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--echo-bg)', padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="echo-card animate-fade-in-up" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
          {user?.applicationStatus === 'rejected' ? '❌' : '⏳'}
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--echo-text)' }}>
          {user?.applicationStatus === 'rejected' ? 'Application Not Approved' : 'Application Under Review'}
        </h1>
        <p style={{ color: 'var(--echo-text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
          {user?.applicationStatus === 'rejected' 
            ? 'Unfortunately, your application to join as a professional or volunteer was not approved at this time. You can withdraw your application and try again later or contact our support team for more details.'
            : 'Thank you for applying! Your application is currently being reviewed by our administration team. You will be granted full access to the dashboard once your request is approved.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SignOutButton>
            <button className="btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
              Sign Out & Wait
            </button>
          </SignOutButton>
          <button 
            onClick={deleteAccount}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#ef4444', 
              padding: '0.875rem', 
              cursor: 'pointer',
              fontWeight: '600',
              textDecoration: 'underline'
            }}
          >
            Withdraw Application & Delete Account
          </button>
        </div>
      </div>
    </main>
  );
}

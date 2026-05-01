'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          // Redirect to role-specific dashboard
          const role = data.user.role;
          const status = data.user.applicationStatus;
          
          if (role === 'admin') router.replace('/dashboard/admin');
          else if (role === 'user') router.replace('/dashboard/user');
          else if ((role === 'volunteer' || role === 'doctor') && status !== 'approved') {
            router.replace('/apply/status');
          }
          else if (role === 'volunteer') router.replace('/dashboard/volunteer');
          else if (role === 'doctor') router.replace('/dashboard/doctor');
          else router.replace('/role-selection');
        } else {
          router.replace('/role-selection');
        }
      })
      .catch(() => router.replace('/role-selection'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          border: '3px solid var(--echo-primary)',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--echo-text-muted)' }}>Loading your dashboard...</p>
      </div>
    </main>
  );
}

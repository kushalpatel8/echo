'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BubbleLoader from '@/components/BubbleLoader';

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

  return <BubbleLoader message="Loading your dashboard..." />;
}

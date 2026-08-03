'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BubbleLoader from '@/components/BubbleLoader';
import { Heart, User, Stethoscope, ArrowRight } from 'lucide-react';
import { formatName } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [chooseRole, setChooseRole] = useState(false);

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          const role = data.user.role;
          const status = data.user.applicationStatus;
          
          if (role === 'admin') router.replace('/dashboard/admin');
          else if (role === 'user') router.replace('/dashboard/user');
          else if ((role === 'volunteer' || role === 'doctor') && status !== 'approved') {
            router.replace('/apply/status');
          }
          else if (role === 'volunteer' || role === 'doctor') {
            setChooseRole(true);
            setLoading(false);
          }
          else router.replace('/role-selection');
        } else {
          router.replace('/role-selection');
        }
      })
      .catch(() => router.replace('/role-selection'));
  }, [router]);

  if (loading || (!chooseRole && user)) return <BubbleLoader message="Loading your dashboard..." />;

  if (chooseRole && user) {
    const isDoctor = user.role === 'doctor';
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--echo-bg)', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--echo-text)', textAlign: 'center' }}>
          Welcome, {formatName(user.name as string, user.role as string)}
        </h1>
        <p style={{ color: 'var(--echo-text-muted)', marginBottom: '3rem', fontSize: '1.125rem', textAlign: 'center' }}>
          How would you like to continue today?
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '800px' }}>
          
          {/* User Option */}
          <div 
            onClick={() => router.push('/dashboard/user')}
            className="glass echo-card"
            style={{ padding: '2.5rem 2rem', borderRadius: '24px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--echo-border)', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#3b82f6'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--echo-border)'; }}
          >
            <div style={{ width: '80px', height: '80px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#3b82f6' }}>
              <User size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--echo-text)' }}>As a User</h2>
            <p style={{ color: 'var(--echo-text-muted)', marginBottom: '1.5rem' }}>Track your mood, relax, play games, and explore the AI companion.</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: '700' }}>
              Enter User Dashboard <ArrowRight size={16} />
            </div>
          </div>

          {/* Professional Option */}
          <div 
            onClick={() => router.push(isDoctor ? '/dashboard/doctor' : '/dashboard/volunteer')}
            className="glass echo-card"
            style={{ padding: '2.5rem 2rem', borderRadius: '24px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--echo-border)', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = isDoctor ? '#06b6d4' : '#10b981'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--echo-border)'; }}
          >
            <div style={{ width: '80px', height: '80px', background: isDoctor ? 'rgba(6, 182, 212, 0.15)' : 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: isDoctor ? '#06b6d4' : '#10b981' }}>
              {isDoctor ? <Stethoscope size={40} /> : <Heart size={40} />}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--echo-text)' }}>As a {isDoctor ? 'Doctor' : 'Volunteer'}</h2>
            <p style={{ color: 'var(--echo-text-muted)', marginBottom: '1.5rem' }}>Manage your patients, respond to chats, and provide guidance.</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: isDoctor ? '#06b6d4' : '#10b981', fontWeight: '700' }}>
              Enter Professional Dashboard <ArrowRight size={16} />
            </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
}

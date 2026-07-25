'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const roles = [
  {
    id: 'user',
    emoji: '🌱',
    title: 'I need support',
    desc: 'Access volunteers, AI companion, mood tracking, and relaxation tools.',
    color: '#22c55e',
    badge: 'User',
  },
  {
    id: 'volunteer',
    emoji: '🤝',
    title: 'I want to volunteer',
    desc: 'Help others by offering your time, compassion, and listening skills.',
    color: '#a78bfa',
    badge: 'Volunteer',
  },
  {
    id: 'doctor',
    emoji: '👨‍⚕️',
    title: 'I\'m a mental health professional',
    desc: 'Provide expert guidance as a certified doctor or therapist.',
    color: '#67e8f9',
    badge: 'Doctor',
  },
  {
    id: 'admin',
    emoji: '🛡️',
    title: 'I\'m an administrator',
    desc: 'Manage the platform, volunteers, and users.',
    color: '#fbbf24',
    badge: 'Admin',
    secure: true,
  },
];

export default function RoleSelectionPage() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, adminToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (selectedRole === 'volunteer' || selectedRole === 'doctor') {
        router.push(`/apply/${selectedRole}`);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--echo-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: '800', color: 'white',
            margin: '0 auto 1.25rem',
            boxShadow: '0 0 30px rgba(124,58,237,0.4)',
          }}>E</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            Who are you, {user?.username || 'friend'}?
          </h1>
          <p style={{ color: 'var(--echo-text-muted)' }}>
            Choose your role to personalize your ECHO experience
          </p>
        </div>

        {/* Role Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              style={{
                cursor: 'pointer',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: `2px solid ${selectedRole === role.id ? role.color : 'var(--echo-border)'}`,
                background: selectedRole === role.id ? `rgba(${role.id === 'user' ? '34,197,94' : role.id === 'volunteer' ? '167,139,250' : role.id === 'doctor' ? '103,232,249' : '251,191,36'},0.08)` : 'var(--echo-surface)',
                transition: 'all 0.2s ease',
                transform: selectedRole === role.id ? 'translateY(-2px)' : 'none',
                boxShadow: selectedRole === role.id ? `0 8px 25px rgba(0,0,0,0.3)` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{role.emoji}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>{role.title}</span>
                    {role.secure && <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>🔒 Secure</span>}
                  </div>
                  <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.8125rem', lineHeight: '1.5' }}>{role.desc}</p>
                </div>
              </div>
              {selectedRole === role.id && (
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ color: role.color, fontSize: '0.8125rem', fontWeight: '600' }}>✓ Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Admin Token Input */}
        {selectedRole === 'admin' && (
          <div style={{ marginBottom: '1.5rem' }} className="animate-fade-in-up">
            <label className="echo-label">Admin Verification Token</label>
            <input
              type="password"
              className="echo-input"
              placeholder="Enter your admin token"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>
              Contact your system administrator for the admin token.
            </p>
          </div>
        )}

        {error && (
          <div className="badge badge-red" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', display: 'block', borderRadius: '0.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem', opacity: !selectedRole || loading ? 0.5 : 1, cursor: !selectedRole || loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Setting up your account...' : 'Continue →'}
        </button>
      </div>
    </main>
  );
}

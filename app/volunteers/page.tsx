'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface Helper {
  clerkId: string;
  name: string;
  imageUrl: string;
  role: 'volunteer' | 'doctor';
  volunteerProfile: {
    rating: number;
    totalRatings: number;
    experience: string;
  };
  doctorProfile?: {
    degree: string;
  };
}

export default function VolunteersListPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/volunteers?type=volunteer`)
      .then(r => r.json())
      .then(data => {
        setHelpers(data.helpers || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const startChat = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', targetUserId }),
      });
      const data = await res.json();
      if (res.ok && data.chat) {
        router.push(`/chat/${data.chat._id}`);
      } else {
        alert(data.error || 'Unable to start chat. Please try again.');
      }
    } catch (err) {
      console.error('Chat creation failed:', err);
      alert('Network error. Please check your connection or sign in again.');
    }
  };

  if (!userLoaded) return <div style={{ minHeight: '100vh', background: 'var(--echo-bg)' }} />;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--echo-bg)' }}>
      <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--echo-border)', background: 'var(--echo-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>← Back</Link>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🤝</span> Peer Support
          </h1>
        </div>

      </header>

      <div className="page-container">
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.75rem' }}>Compassionate Peer Support</h2>
          <p style={{ color: 'var(--echo-text-muted)', maxWidth: '600px' }}>
            Talk to trained volunteers who are here to listen, support, and help you navigate your wellness journey with empathy and care.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}><p style={{ color: 'var(--echo-text-muted)' }}>Connecting you with volunteers...</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {helpers.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }} className="echo-card">
                <p style={{ color: 'var(--echo-text-muted)' }}>No volunteers currently available. Please check back shortly.</p>
              </div>
            ) : (
              helpers.map(helper => (
                <div key={helper.clerkId} className="echo-card animate-fade-in-up">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--echo-border)', overflow: 'hidden' }}>
                      {helper.imageUrl && <img src={helper.imageUrl} alt={helper.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '1.125rem' }}>{helper.name}</div>
                      <div style={{ color: 'var(--echo-text-muted)', fontSize: '0.8125rem' }}>
                        Certified Support Volunteer
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#fbbf24' }}>⭐ {helper.volunteerProfile.rating || 'New'}</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--echo-text-muted)' }}>({helper.volunteerProfile.totalRatings || 0} chats)</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--echo-text-muted)', marginBottom: '1.25rem', height: '2.75rem', lineHeight: '1.375rem' }}>
                    {helper.volunteerProfile.experience || 'Ready to listen and support you on your wellness journey.'}
                  </p>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.875rem' }}
                    onClick={() => startChat(helper.clerkId)}
                  >
                    Chat Now
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

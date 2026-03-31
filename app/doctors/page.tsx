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
    whatsappNumber?: string;
  };
}

interface ConnectionRequest {
  _id: string;
  doctorId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function DoctorsListPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [docsRes, reqsRes] = await Promise.all([
          fetch('/api/volunteers?type=doctor'),
          fetch('/api/connections?type=sent')
        ]);
        const docsData = await docsRes.json();
        const reqsData = await reqsRes.json();
        setHelpers(docsData.helpers || []);
        setRequests(reqsData.requests || []);
      } catch (err) {
        console.error('Failed to load doctors or requests', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const sendRequest = async (doctorId: string) => {
    setActionLoading(doctorId);
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId }),
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(prev => [...prev, data.request]);
      } else {
        alert(data.error || 'Failed to send request');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const cancelRequest = async (requestId: string, doctorId: string) => {
    setActionLoading(doctorId);
    try {
      const res = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== requestId));
      } else {
        alert('Failed to cancel request');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

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
            <span>👨‍⚕️</span> Professional Doctors
          </h1>
        </div>
      </header>

      <div className="page-container">
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.75rem' }}>Expert Clinical Support</h2>
          <p style={{ color: 'var(--echo-text-muted)', maxWidth: '600px' }}>
            Connect with verified mental health professionals for expert guidance and specialized care tailored to your journey.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}><p style={{ color: 'var(--echo-text-muted)' }}>Connecting you with professionals...</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {helpers.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }} className="echo-card">
                <p style={{ color: 'var(--echo-text-muted)' }}>No doctors currently available. Please check back shortly.</p>
              </div>
            ) : (
              helpers.map(helper => (
                <div key={helper.clerkId} className="echo-card animate-fade-in-up" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--echo-border)', overflow: 'hidden', border: '2px solid var(--echo-primary-low)' }}>
                      {helper.imageUrl && <img src={helper.imageUrl} alt={helper.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--echo-text)' }}>{helper.name}</div>
                      <div style={{ color: 'var(--echo-primary-light)', fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {helper.doctorProfile?.degree || 'Medical Professional'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#fbbf24' }}>⭐ {helper.volunteerProfile.rating || 'New'}</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--echo-text-muted)' }}>({helper.volunteerProfile.totalRatings || 0} sessions)</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9375rem', color: 'var(--echo-text-muted)', lineHeight: '1.6', marginBottom: '1.5rem', height: '4.8rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {helper.volunteerProfile.experience || 'Dedicated to providing professional mental health support and guidance.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* WhatsApp Connection Section */}
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--echo-surface-60)', border: '1px solid var(--echo-border)', position: 'relative' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--echo-text-muted)', marginBottom: '0.5rem', letterSpacing: '0.025em' }}>WhatsApp Connection</div>
                      {(() => {
                        const req = requests.find(r => r.doctorId === helper.clerkId);
                        if (req?.status === 'accepted') {
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#22c55e' }}>Approved ✓</span>
                              <a href={`https://wa.me/${helper.doctorProfile?.whatsappNumber}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: '#22c55e', borderColor: '#22c55e' }}>
                                  Connect 📲
                                </button>
                              </a>
                            </div>
                          );
                        }
                        if (req?.status === 'pending') {
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>⌛ Pending Approval</span>
                              <button
                                className="btn-danger"
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.625rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
                                onClick={() => cancelRequest(req._id, helper.clerkId)}
                                disabled={actionLoading === helper.clerkId}
                              >
                                {actionLoading === helper.clerkId ? '...' : 'Cancel'}
                              </button>
                            </div>
                          );
                        }
                        if (req?.status === 'rejected') {
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.8125rem', color: '#ef4444' }}>❌ Not Accepted</span>
                              <button
                                className="btn-primary"
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.625rem' }}
                                onClick={() => cancelRequest(req._id, helper.clerkId)}
                                disabled={actionLoading === helper.clerkId}
                              >
                                {actionLoading === helper.clerkId ? '...' : 'Try Again'}
                              </button>
                            </div>
                          );
                        }
                        return (
                          <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '0.6rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid var(--echo-primary)', color: 'var(--echo-primary)' }}
                            onClick={() => sendRequest(helper.clerkId)}
                            disabled={actionLoading === helper.clerkId}
                          >
                            <span>{actionLoading === helper.clerkId ? 'Sending...' : 'Request WhatsApp'}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          </button>
                        );
                      })()}
                    </div>

                    {/* ALWAYS AVAILABLE: Internal Chat */}
                    <button
                      className="btn-primary"
                      style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      onClick={() => startChat(helper.clerkId)}
                    >
                      <span>Start Internal Chat</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

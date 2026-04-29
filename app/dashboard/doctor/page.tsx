'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

type Tab = 'overview' | 'patients' | 'requests' | 'profile';

export default function DoctorDashboard() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [dbUser, setDbUser] = useState<Record<string, unknown> | null>(null);
  const [chats, setChats] = useState<Record<string, unknown>[]>([]);
  const [requests, setRequests] = useState<Record<string, unknown>[]>([]);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (d.user) {
        if (d.user.role !== 'doctor') { router.push('/dashboard'); return; }
        setDbUser(d.user);
        setEditName(d.user.name);
      } else router.push('/role-selection');
    });
    fetch('/api/chat').then(r => r.json()).then(d => setChats(d.chats || []));
    fetch('/api/connections?type=received').then(r => r.json()).then(d => setRequests(d.requests || []));
  }, [router]);

  const updateRequestStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    setRequestActionLoading(requestId);
    try {
      const res = await fetch('/api/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });
      if (res.ok) {
        setRequests(prev => prev.map((r: any) => r._id === requestId ? { ...r, status } : r));
      } else {
        alert('Failed to update request');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setRequestActionLoading(null);
    }
  };

  const removeConnection = async (requestId: string) => {
    if (!confirm('Are you sure you want to revoke this patient\'s access to your WhatsApp contact?')) return;
    setRequestActionLoading(requestId);
    try {
      const res = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        setRequests(prev => prev.filter((r: any) => r._id !== requestId));
      } else {
        alert('Failed to revoke connection');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setRequestActionLoading(null);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    await fetch('/api/users/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName }) });
    setDbUser(prev => prev ? { ...prev, name: editName } : prev);
    setSaving(false);
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure?')) return;
    await fetch('/api/users/profile', { method: 'DELETE' });
    router.push('/');
  };

  const appStatus = dbUser?.applicationStatus;
  const doctorProfile = dbUser?.doctorProfile as Record<string, unknown>;

  const deleteChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat permanently?')) return;
    try {
      const res = await fetch(`/api/chat?chatId=${chatId}`, { method: 'DELETE' });
      if (res.ok) {
        setChats(prev => prev.filter((c: any) => c._id !== chatId));
      }
    } catch {
      alert('Failed to delete chat');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`echo-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img 
              src="/favicon.ico" 
              alt="Logo" 
              style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0, cursor: 'pointer' }} 
            />
          </Link>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <ThemeToggle />
              <button 
                className="show-mobile"
                onClick={() => setIsSidebarOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--echo-text)', fontSize: '1.25rem', padding: '0.25rem' }}
              >✕</button>
            </div>
          </div>
          <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>{dbUser?.name as string || clerkUser?.firstName}</div>
          <span className={`badge badge-${appStatus === 'approved' ? 'cyan' : 'yellow'}`}>
            Doctor · {appStatus as string || 'Pending'}
          </span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%', marginBottom: '0.5rem' }}>
              <span>🏠</span>
              <span>Home</span>
            </button>
          </Link>
          <div style={{ height: '1px', background: 'var(--echo-border)', margin: '0.5rem 0' }} />
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'patients', icon: '👥', label: 'Patient Chats' },
            { id: 'requests', icon: '📨', label: 'Incoming Requests' },
            { id: 'profile', icon: '👤', label: 'Profile' },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => { setTab(item.id as Tab); setIsSidebarOpen(false); }} 
              className={`sidebar-link ${tab === item.id ? 'active' : ''}`} 
              style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}
            >
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--echo-border)' }}>
          <SignOutButton><button className="btn-danger" style={{ width: '100%', padding: '0.6rem', fontSize: '0.8125rem' }}>Sign Out</button></SignOutButton>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 'clamp(1rem, 5vw, 2rem)', overflowY: 'auto', minWidth: 0 }}>
        <div className="show-mobile" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 48px', alignItems: 'center', minHeight: '44px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'var(--echo-text)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <span style={{ fontSize: '1.25rem' }}>🏠</span>
            </Link>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '800', textAlign: 'center', margin: 0 }}>Doctor Hub</h2>
            <button 
              onClick={() => setTab('profile')}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                cursor: 'pointer'
              }}
            >
              {clerkUser?.imageUrl ? (
                <img 
                  src={clerkUser.imageUrl} 
                  alt="Profile" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--echo-primary)' }} 
                />
              ) : (
                <span style={{ fontSize: '1.25rem' }}>👤</span>
              )}
            </button>
          </div>
        </div>
        {appStatus === 'pending' && (
          <div style={{ padding: '1rem 1.5rem', borderRadius: '0.75rem', background: 'var(--echo-warning-low)', border: '1px solid var(--echo-border)', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--echo-text)', fontSize: '0.875rem' }}>⏳ Your doctor application is under review by admin.</span>
          </div>
        )}

        {/* Mobile Navigation Grid */}
        <div className="show-mobile animate-fade-in-up" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              { id: 'overview', icon: '📊', label: 'Overview' },
              { id: 'patients', icon: '👥', label: 'Patient Chats', badge: chats.filter((c: any) => c.isActive).length },
              { id: 'requests', icon: '📨', label: 'Incoming Requests', badge: requests.filter((r: any) => r.status === 'pending').length },
              { id: 'profile', icon: '👤', label: 'My Profile' },
            ].map(item => (
              <div 
                key={item.id} 
                onClick={() => setTab(item.id as Tab)}
                className="glass-panel"
                style={{ 
                  padding: '1.5rem 1rem', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  border: tab === item.id ? '2px solid var(--echo-primary)' : '1px solid var(--echo-border)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <div style={{ fontWeight: '700', fontSize: '0.8125rem', color: 'var(--echo-text)' }}>{item.label}</div>
                {item.badge !== undefined && item.badge > 0 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '0.5rem', 
                    right: '0.5rem', 
                    background: '#7c3aed', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '20px', 
                    height: '20px', 
                    fontSize: '0.625rem', 
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>{item.badge}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {tab === 'overview' && (
          <div className="animate-fade-in-up">
            <h1 className="section-heading hide-mobile">Doctor Dashboard 👨‍⚕️</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Active Patients', value: chats.filter((c: Record<string, unknown>) => c.isActive).length, icon: '👥', color: '#67e8f9' },
                { label: 'Pending Requests', value: requests.filter((r: any) => r.status === 'pending').length, icon: '📩', color: '#fbbf24' },
                { label: 'Status', value: appStatus as string || 'Pending', icon: '🔄', color: appStatus === 'approved' ? '#22c55e' : '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} className="echo-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: stat.color }}>{stat.value as React.ReactNode}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
            {Boolean(doctorProfile?.whatsappNumber) && (
              <div className="echo-card" style={{ border: '1px solid var(--echo-border)', background: 'var(--echo-primary-low)', maxWidth: '400px' }}>
                <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>📱 Your WhatsApp Contact</div>
                <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  Reach out to patients via your verified contact:
                </p>
                <a href={`https://wa.me/${doctorProfile.whatsappNumber}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%' }}>
                    📲 {doctorProfile.whatsappNumber as string}
                  </button>
                </a>
              </div>
            )}
          </div>
        )}

        {tab === 'patients' && (
          <div className="animate-fade-in-up">
            <h1 className="section-heading">👥 Patient Chats</h1>
            {chats.length === 0 ? (
              <div className="echo-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--echo-text-muted)' }}>No patient chats yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chats.map((chat: Record<string, unknown>) => {
                  const participants = chat.participantNames as string[];
                  const myIndex = (chat.participants as string[]).indexOf(dbUser?.clerkId as string);
                  const otherName = participants[1 - myIndex] || 'Patient';
                  const lastMsg = (chat.messages as Record<string, unknown>[])?.slice(-1)[0];
                  return (
                    <div key={chat._id as string} style={{ position: 'relative' }}>
                      <Link href={`/chat/${chat._id}`} style={{ textDecoration: 'none' }}>
                        <div className="echo-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingRight: '3.5rem' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>
                            {otherName[0]}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{otherName}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {lastMsg ? (lastMsg.content as string) : 'No messages yet'}
                            </div>
                          </div>
                        </div>
                      </Link>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteChat(chat._id as string); }}
                        style={{ 
                          position: 'absolute', 
                          right: '1.25rem', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          background: 'rgba(239, 68, 68, 0.1)', 
                          border: 'none', 
                          color: '#ef4444', 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          zIndex: 2
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                        title="Delete Chat"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="animate-fade-in-up">
            <h1 className="section-heading">📨 Incoming WhatsApp Requests</h1>
            <p style={{ color: 'var(--echo-text-muted)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
              Accept requests to reveal your WhatsApp number to patients for further consultation.
            </p>
            
            {requests.filter((r: any) => r.status === 'pending').length === 0 ? (
              <div className="echo-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--echo-text-muted)' }}>No new connection requests.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {requests.filter((r: any) => r.status === 'pending').map((request: any) => (
                  <div key={request._id} className="echo-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--echo-border)', overflow: 'hidden' }}>
                        {request.userImage && <img src={request.userImage} alt={request.userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>{request.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>Requested: {new Date(request.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        className="btn-primary" 
                        style={{ background: '#22c55e', borderColor: '#22c55e', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                        onClick={() => updateRequestStatus(request._id, 'accepted')}
                        disabled={requestActionLoading === request._id}
                      >
                        {requestActionLoading === request._id ? '...' : 'Accept'}
                      </button>
                      <button 
                        className="btn-danger" 
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                        onClick={() => updateRequestStatus(request._id, 'rejected')}
                        disabled={requestActionLoading === request._id}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* History */}
            {requests.filter((r: any) => r.status !== 'pending').length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--echo-text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Recent History</h3>
                <div style={{ opacity: 0.7 }}>
                  {requests.filter((r: any) => r.status !== 'pending').slice(0, 5).map((request: any) => (
                    <div key={request._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--echo-border)' }}>
                      <span style={{ fontSize: '0.875rem' }}>{request.userName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className={`badge badge-${request.status === 'accepted' ? 'cyan' : 'red'}`} style={{ fontSize: '0.75rem' }}>
                          {request.status}
                        </span>
                        {request.status === 'accepted' && (
                          <button 
                            onClick={() => removeConnection(request._id)}
                            disabled={requestActionLoading === request._id}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', padding: '0.25rem', textDecoration: 'underline' }}
                          >
                            {requestActionLoading === request._id ? '...' : 'Revoke'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div className="animate-fade-in-up">
            <h1 className="section-heading">👤 My Profile</h1>
            <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="echo-card">
                <label className="echo-label">Display Name</label>
                <input className="echo-input" value={editName} onChange={e => setEditName(e.target.value)} style={{ marginBottom: '1rem' }} />
                <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ width: '100%' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
              <div className="echo-card" style={{ border: '1px solid var(--echo-border)', background: 'var(--echo-danger-low)' }}>
                <div style={{ fontWeight: '700', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>⚠️ Danger Zone</div>
                <button className="btn-danger" onClick={deleteAccount} style={{ width: '100%' }}>Delete Account</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

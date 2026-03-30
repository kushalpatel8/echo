'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

type Tab = 'overview' | 'patients' | 'profile';

export default function DoctorDashboard() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [dbUser, setDbUser] = useState<Record<string, unknown> | null>(null);
  const [chats, setChats] = useState<Record<string, unknown>[]>([]);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (d.user) {
        if (d.user.role !== 'doctor') { router.push('/dashboard'); return; }
        setDbUser(d.user);
        setEditName(d.user.name);
      } else router.push('/role-selection');
    });
    fetch('/api/chat').then(r => r.json()).then(d => setChats(d.chats || []));
  }, [router]);

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--echo-bg)' }}>
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
        {/* Mobile Header */}
        <div className="show-mobile" style={{ display: 'grid', gridTemplateColumns: '48px 1fr 48px', alignItems: 'center', marginBottom: '1.5rem', minHeight: '40px' }}>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{ 
              background: 'var(--echo-surface)', 
              border: '1px solid var(--echo-border)', 
              borderRadius: '8px', 
              padding: '0.5rem', 
              color: 'var(--echo-text)', 
              display: 'flex', 
              alignItems: 'center',
              width: '40px'
            }}
          >☰</button>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', textAlign: 'center' }}>Doctor Dashboard</h2>
          <div style={{ width: '40px' }} />
        </div>
        {appStatus === 'pending' && (
          <div style={{ padding: '1rem 1.5rem', borderRadius: '0.75rem', background: 'var(--echo-warning-low)', border: '1px solid var(--echo-border)', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--echo-text)', fontSize: '0.875rem' }}>⏳ Your doctor application is under review by admin.</span>
          </div>
        )}

        {tab === 'overview' && (
          <div className="animate-fade-in-up">
            <h1 className="section-heading">Doctor Dashboard 👨‍⚕️</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Active Patients', value: chats.filter((c: Record<string, unknown>) => c.isActive).length, icon: '👥', color: '#67e8f9' },
                { label: 'Total Chats', value: chats.length, icon: '💬', color: '#a78bfa' },
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
                  Patients with Pro subscription can reach you at:
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

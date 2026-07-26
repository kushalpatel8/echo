'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import BackButton from '@/components/BackButton';
import BanAppealBanner from '@/components/BanAppealBanner';
import { Stethoscope, Users, Inbox, User, LogOut, Sparkles, Activity, Menu } from 'lucide-react';

type Tab = 'overview' | 'patients' | 'requests' | 'profile';
type DashTheme = 'celestial' | 'forest' | 'sunset' | 'ocean' | 'aurora';

const DASH_THEMES: Record<DashTheme, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
  celestial: { name: '🌌 Celestial', primary: '#7c3aed', secondary: '#06b6d4', glow: 'rgba(124,58,237,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.12) 0%, transparent 60%)' },
  forest:    { name: '🌲 Forest',    primary: '#059669', secondary: '#10b981', glow: 'rgba(5,150,105,0.25)',  bgGrad: 'radial-gradient(ellipse at top right, rgba(5,150,105,0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.12) 0%, transparent 60%)' },
  sunset:    { name: '🌅 Sunset',    primary: '#f59e0b', secondary: '#e11d48', glow: 'rgba(245,158,11,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225, 29, 72, 0.12) 0%, transparent 60%)' },
  ocean:     { name: '🌊 Ocean',     primary: '#3b82f6', secondary: '#0ea5e9', glow: 'rgba(59,130,246,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(14, 165, 233, 0.12) 0%, transparent 60%)' },
  aurora:    { name: '✨ Aurora',    primary: '#a855f7', secondary: '#10b981', glow: 'rgba(168,85,247,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(10, 200, 120, 0.12) 0%, transparent 60%)' },
};

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',  label: '📊 Overview',           icon: <Activity size={15} /> },
  { id: 'patients',  label: '👥 Patient Chats',      icon: <Users size={15} /> },
  { id: 'requests',  label: '📨 Requests',           icon: <Inbox size={15} /> },
  { id: 'profile',   label: '👤 Profile',             icon: <User size={15} /> },
];

export default function DoctorDashboard() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [dashTheme, setDashTheme] = useState<DashTheme>('celestial');
  const [dbUser, setDbUser] = useState<Record<string, unknown> | null>(null);
  const [chats, setChats] = useState<Record<string, unknown>[]>([]);
  const [requests, setRequests] = useState<Record<string, unknown>[]>([]);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentTheme = DASH_THEMES[dashTheme];
  const appStatus = dbUser?.applicationStatus;
  const doctorProfile = dbUser?.doctorProfile as Record<string, unknown>;

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (d.user) {
        if (d.user.role !== 'doctor') { router.push('/dashboard'); return; }
        if (d.user.applicationStatus !== 'approved') { router.push('/apply/status'); return; }
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
      const res = await fetch('/api/connections', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId, status }) });
      if (res.ok) setRequests(prev => prev.map((r: any) => r._id === requestId ? { ...r, status } : r));
    } finally { setRequestActionLoading(null); }
  };

  const removeConnection = async (requestId: string) => {
    if (!confirm("Revoke this patient's access?")) return;
    setRequestActionLoading(requestId);
    try {
      const res = await fetch('/api/connections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId }) });
      if (res.ok) setRequests(prev => prev.filter((r: any) => r._id !== requestId));
    } finally { setRequestActionLoading(null); }
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

  const deleteChat = async (chatId: string) => {
    if (!confirm('Delete this chat permanently?')) return;
    const res = await fetch(`/api/chat?chatId=${chatId}`, { method: 'DELETE' });
    if (res.ok) setChats(prev => prev.filter((c: any) => c._id !== chatId));
  };

  const pendingRequests = requests.filter((r: any) => r.status === 'pending').length;
  const activePatients = chats.filter((c: any) => c.isActive).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', color: 'var(--echo-text)', position: 'relative', overflowX: 'hidden' }}>
      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        style={{ zIndex: 190 }}
      />

      {/* Sidebar navigation */}
      <aside
        className={`echo-sidebar ${isSidebarOpen ? 'open' : ''}`}
        style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', width: '240px',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          visibility: isSidebarOpen ? 'visible' : 'hidden', zIndex: 200,
          transition: 'transform 0.3s ease, visibility 0.3s', padding: '1.25rem 1rem',
          display: 'flex', flexDirection: 'column', boxShadow: isSidebarOpen ? '10px 0 40px rgba(0,0,0,0.3)' : 'none',
          overflowY: 'auto', background: 'var(--echo-surface)', borderRight: '1px solid var(--echo-border)',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--echo-border)', borderRadius: '0.625rem', color: 'var(--echo-text)',
              padding: '0.45rem 0.875rem', fontSize: '0.8125rem', fontWeight: '600', cursor: 'pointer',
              marginBottom: '1.25rem', width: '100%', transition: 'background 0.2s',
            }}
          >
            <span>←</span><span>Close Menu</span>
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Link href="/" onClick={() => setIsSidebarOpen(false)}>
              <img src="/favicon.ico" alt="Logo" style={{ width: '38px', height: '38px', borderRadius: '10px' }} />
            </Link>
            <ThemeToggle />
          </div>
          <div style={{ padding: '0.625rem 0.75rem', borderRadius: '0.625rem', background: 'var(--echo-primary-low)', border: '1px solid var(--echo-border)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--echo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Signed in as</div>
            <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--echo-text)' }}>
              {(dbUser?.name as string) || clerkUser?.username || 'Doctor'}
            </div>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }} onClick={() => setIsSidebarOpen(false)}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}><span>🏠</span><span>Home</span></button>
          </Link>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setIsSidebarOpen(false); }} className={`sidebar-link ${tab === t.id ? 'active' : ''}`} style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>
              <span>{t.label.split(' ')[0]}</span><span>{t.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--echo-border)' }}>
          <SignOutButton><button className="btn-danger" style={{ width: '100%', padding: '0.6rem', fontSize: '0.8125rem' }}>Sign Out</button></SignOutButton>
        </div>
      </aside>

      {/* Dynamic Ambient Background Glow */}
      <div style={{ position: 'fixed', inset: 0, background: currentTheme.bgGrad, pointerEvents: 'none', transition: 'background 1s ease', zIndex: 0 }} />

      {/* ── Sticky Header ── */}
      <header style={{
        padding: '1rem 1.5rem', borderBottom: '1px solid var(--echo-border)',
        background: 'var(--echo-surface)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Hamburger button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              border: '1px solid var(--echo-border)', background: 'var(--echo-glass-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: 'var(--echo-text)',
            }}
          >
            <Menu size={20} />
          </button>
          
          <BackButton />
          
          <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--echo-text)', marginLeft: '0.25rem' }}>
            Doctor Hub
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          {clerkUser?.imageUrl
            ? <img src={clerkUser.imageUrl} alt="Avatar" onClick={() => setTab('profile')} style={{ width: '34px', height: '34px', borderRadius: '50%', border: `2px solid ${currentTheme.primary}`, cursor: 'pointer', objectFit: 'cover' }} />
            : <div onClick={() => setTab('profile')} style={{ width: '34px', height: '34px', borderRadius: '50%', background: currentTheme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#fff', fontWeight: '700' }}>{(dbUser?.name as string)?.[0] || '?'}</div>
          }
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="page-container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5rem' }}>
        <BanAppealBanner dbUser={dbUser} />

        {!dbUser?.isBanned && (
          <>
            {/* Pending Application Banner */}
            {appStatus === 'pending' && (
              <div style={{ padding: '1rem 1.5rem', borderRadius: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>⏳</span>
                <span style={{ color: '#fde047', fontSize: '0.875rem' }}>Your doctor application is under review by admin.</span>
              </div>
            )}

            {/* ── Tab Navigation ── */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', width: '100%' }}>
              <div className="glass" style={{
                display: 'inline-flex', padding: '0.375rem', borderRadius: '16px',
                border: '1px solid var(--echo-border)', background: 'var(--echo-surface)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)', gap: '0.25rem',
                overflowX: 'auto', maxWidth: '100%', scrollbarWidth: 'none',
              }}>
                {TABS.map(t => {
                  const isActive = tab === t.id;
                  const hasBadge = (t.id === 'requests' && pendingRequests > 0);
                  return (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 1.25rem', borderRadius: '12px', border: 'none',
                      background: isActive ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` : 'transparent',
                      color: isActive ? '#fff' : 'var(--echo-text-muted)',
                      fontWeight: isActive ? '700' : '600', fontSize: '0.875rem',
                      cursor: 'pointer', transition: 'all 0.25s ease',
                      boxShadow: isActive ? `0 4px 15px ${currentTheme.glow}` : 'none',
                      position: 'relative',
                      flexShrink: 0,
                    }}>
                      {t.icon}<span>{t.label}</span>
                      {hasBadge && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.625rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: '6px', right: '6px' }}>{pendingRequests}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ambient Mood Selector */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--echo-surface-2)', padding: '0.35rem 0.5rem', borderRadius: '999px', border: '1px solid var(--echo-border)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--echo-text-muted)', paddingLeft: '0.5rem' }}>Mood:</span>
                {(Object.keys(DASH_THEMES) as DashTheme[]).map(key => {
                  const t = DASH_THEMES[key];
                  const isSel = dashTheme === key;
                  const isExtra = key === 'ocean' || key === 'aurora';
                  return (
                    <button key={key} onClick={() => setDashTheme(key)} className={isExtra ? 'hide-mobile' : ''} style={{ padding: '0.35rem 0.75rem', borderRadius: '999px', border: 'none', background: isSel ? t.primary : 'transparent', color: isSel ? '#fff' : 'var(--echo-text-muted)', fontSize: '0.75rem', fontWeight: isSel ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                      {t.name.split(' ')[0]} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="animate-fade-in-up">
                {/* Hero */}
                <div className="glass" style={{ padding: '2.5rem', borderRadius: '28px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)', boxShadow: `0 20px 50px rgba(0,0,0,0.12), 0 0 30px ${currentTheme.glow}`, marginBottom: '2rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
                  <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.12, filter: 'blur(35px)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                      <Sparkles size={13} /><span>Doctor Command Center</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>
                      Welcome, Dr. <span style={{ color: currentTheme.primary }}>{(dbUser?.name as string)?.split(' ')[0] || 'Doctor'}</span> 👨‍⚕️
                    </h1>
                    <p style={{ color: 'var(--echo-text-muted)', fontSize: '1rem', marginBottom: '2rem', margin: '0 auto 2rem', maxWidth: '600px' }}>You are making a profound impact on mental health worldwide.</p>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '2rem', justifyContent: 'center' }}>
                      {[
                        { label: 'Active Patients', value: activePatients, color: '#67e8f9', bg: 'rgba(103,232,249,0.12)', border: 'rgba(103,232,249,0.25)' },
                        { label: 'Pending Requests', value: pendingRequests, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
                        { label: 'Status', value: appStatus as string || 'Pending', color: appStatus === 'approved' ? '#22c55e' : '#f59e0b', bg: appStatus === 'approved' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', border: appStatus === 'approved' ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)' },
                      ].map(stat => (
                        <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.375rem', borderRadius: '1.25rem', background: stat.bg, border: `1px solid ${stat.border}` }}>
                          <div>
                            <div style={{ fontSize: '1.375rem', fontWeight: '900', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--echo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '0.125rem' }}>{stat.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {Boolean(doctorProfile?.whatsappNumber) && (
                      <a href={`https://wa.me/${doctorProfile.whatsappNumber}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary" style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          📲 Contact via WhatsApp: {doctorProfile.whatsappNumber as string}
                        </button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── PATIENT CHATS ── */}
            {tab === 'patients' && (
              <div className="animate-fade-in-up">
                <h2 className="section-heading">👥 Patient Chats</h2>
                {chats.length === 0 ? (
                  <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
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
                            <div className="glass echo-card" style={{ padding: '1.25rem 1.5rem', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)', display: 'flex', gap: '1rem', alignItems: 'center', paddingRight: '4rem' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                                {otherName[0]}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', marginBottom: '0.25rem', color: 'var(--echo-text)' }}>{otherName}</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {lastMsg ? (lastMsg.content as string) : 'No messages yet'}
                                </div>
                              </div>
                              <span className={`status-dot ${chat.isActive ? 'online' : 'offline'}`} />
                            </div>
                          </Link>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteChat(chat._id as string); }} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>🗑️</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── REQUESTS ── */}
            {tab === 'requests' && (
              <div className="animate-fade-in-up">
                <h2 className="section-heading">📨 Incoming WhatsApp Requests</h2>
                <p style={{ color: 'var(--echo-text-muted)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
                  Accept requests to reveal your WhatsApp number to patients for further consultation.
                </p>
                {requests.filter((r: any) => r.status === 'pending').length === 0 ? (
                  <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <p style={{ color: 'var(--echo-text-muted)' }}>No new connection requests.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {requests.filter((r: any) => r.status === 'pending').map((request: any) => (
                      <div key={request._id} className="glass echo-card" style={{ padding: '1.25rem 1.5rem', borderRadius: '20px', border: `1px solid ${currentTheme.primary}44`, background: 'var(--echo-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--echo-surface-2)', overflow: 'hidden', border: '1px solid var(--echo-border)' }}>
                            {request.userImage && <img src={request.userImage} alt={request.userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--echo-text)' }}>{request.userName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>Requested: {new Date(request.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button className="btn-primary" style={{ background: '#22c55e', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }} onClick={() => updateRequestStatus(request._id, 'accepted')} disabled={requestActionLoading === request._id}>
                            {requestActionLoading === request._id ? '...' : '✓ Accept'}
                          </button>
                          <button className="btn-danger" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }} onClick={() => updateRequestStatus(request._id, 'rejected')} disabled={requestActionLoading === request._id}>Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* History */}
                {requests.filter((r: any) => r.status !== 'pending').length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--echo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Recent History</h3>
                    <div className="glass" style={{ borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)', overflow: 'hidden' }}>
                      {requests.filter((r: any) => r.status !== 'pending').slice(0, 5).map((request: any, i: number) => (
                        <div key={request._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: i < 4 ? '1px solid var(--echo-border)' : 'none' }}>
                          <span style={{ fontSize: '0.875rem', color: 'var(--echo-text)' }}>{request.userName}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className={`badge badge-${request.status === 'accepted' ? 'cyan' : 'red'}`}>{request.status}</span>
                            {request.status === 'accepted' && (
                              <button onClick={() => removeConnection(request._id)} disabled={requestActionLoading === request._id} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
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

            {/* ── PROFILE ── */}
            {tab === 'profile' && (
              <div className="animate-fade-in-up" style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 className="section-heading">👤 My Profile</h2>
                <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                  <label className="echo-label">Display Name</label>
                  <input className="echo-input" value={editName} onChange={e => setEditName(e.target.value)} style={{ marginBottom: '1.25rem' }} />
                  <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ width: '100%', background: currentTheme.primary }}>{saving ? 'Saving...' : 'Save Changes'}</button>
                </div>
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                  <SignOutButton>
                    <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </SignOutButton>
                </div>
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(239,68,68,0.25)', background: 'var(--echo-danger-low)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>⚠️ Danger Zone</div>
                  <button className="btn-danger" onClick={deleteAccount} style={{ width: '100%' }}>Delete Account</button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

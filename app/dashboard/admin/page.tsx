'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import BackButton from '@/components/BackButton';
import { ShieldCheck, ClipboardList, Users, Stethoscope, Lightbulb, Mailbox, Sparkles, LogOut, Menu, UserX } from 'lucide-react';
import { formatName } from '@/lib/utils';

type Tab = 'applications' | 'users' | 'volunteers' | 'doctors' | 'suggestions' | 'appeals' | 'banned';
type DashTheme = 'celestial' | 'forest' | 'sunset' | 'ocean' | 'aurora';

const DASH_THEMES: Record<DashTheme, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
  celestial: { name: '🌌 Celestial', primary: '#7c3aed', secondary: '#06b6d4', glow: 'rgba(124,58,237,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6,182,212,0.12) 0%, transparent 60%)' },
  forest:    { name: '🌲 Forest',    primary: '#059669', secondary: '#10b981', glow: 'rgba(5,150,105,0.25)',  bgGrad: 'radial-gradient(ellipse at top right, rgba(5,150,105,0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16,185,129,0.12) 0%, transparent 60%)' },
  sunset:    { name: '🌅 Sunset',    primary: '#f59e0b', secondary: '#e11d48', glow: 'rgba(245,158,11,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225,29,72,0.12) 0%, transparent 60%)' },
  ocean:     { name: '🌊 Ocean',     primary: '#3b82f6', secondary: '#0ea5e9', glow: 'rgba(59,130,246,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(14, 165, 233, 0.12) 0%, transparent 60%)' },
  aurora:    { name: '✨ Aurora',    primary: '#a855f7', secondary: '#10b981', glow: 'rgba(168,85,247,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(10, 200, 120, 0.12) 0%, transparent 60%)' },
};

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'applications', label: '📋 Applications', icon: <ClipboardList size={15} /> },
  { id: 'users',        label: '👥 Users',         icon: <Users size={15} /> },
  { id: 'volunteers',   label: '🤝 Volunteers',    icon: <Users size={15} /> },
  { id: 'doctors',      label: '🩺 Doctors',        icon: <Stethoscope size={15} /> },
  { id: 'suggestions',  label: '💡 Suggestions',   icon: <Lightbulb size={15} /> },
  { id: 'appeals',      label: '📬 Appeals',        icon: <Mailbox size={15} /> },
  { id: 'banned',       label: '🚫 Banned Accounts', icon: <UserX size={15} /> },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('applications');
  const [dashTheme, setDashTheme] = useState<DashTheme>('celestial');
  const [dbUser, setDbUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentTheme = DASH_THEMES[dashTheme];

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (d.user?.role !== 'admin') { router.push('/dashboard'); return; }
      setDbUser(d.user);
    });
    loadApplications();
    loadAppeals();
  }, [router]);

  const loadApplications = () => fetch('/api/admin').then(r => r.json()).then(d => setApplications(d.applications || []));
  const loadUsers = (role?: string) => { const url = role ? `/api/admin/users?role=${role}` : '/api/admin/users'; fetch(url).then(r => r.json()).then(d => setUsers(d.users || [])); };
  const loadBannedUsers = () => fetch('/api/admin/users?isBanned=true').then(r => r.json()).then(d => setUsers(d.users || []));
  const loadSuggestions = () => fetch('/api/suggestions').then(r => r.json()).then(d => setSuggestions(d.suggestions || []));
  const loadAppeals = () => fetch('/api/appeals').then(r => r.json()).then(d => setAppeals(d.appeals || []));

  useEffect(() => {
    if (tab === 'users') loadUsers('user');
    else if (tab === 'volunteers') loadUsers('volunteer');
    else if (tab === 'doctors') loadUsers('doctor');
    else if (tab === 'banned') loadBannedUsers();
    else if (tab === 'suggestions') loadSuggestions();
    else if (tab === 'appeals') loadAppeals();
    else loadApplications();
  }, [tab]);

  const adminAction = async (targetUserId: string, action: string) => {
    setLoading(true);
    await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId, action }) });
    if (tab === 'applications') loadApplications();
    else if (tab === 'users') loadUsers('user');
    else if (tab === 'volunteers') loadUsers('volunteer');
    else if (tab === 'doctors') loadUsers('doctor');
    else if (tab === 'banned') loadBannedUsers();
    setLoading(false);
  };

  const deleteSuggestion = async (id: string) => {
    if (!confirm('Delete this suggestion?')) return;
    setLoading(true);
    await fetch(`/api/suggestions?id=${id}`, { method: 'DELETE' });
    loadSuggestions();
    setLoading(false);
  };

  const pendingAppeals = appeals.filter((a: any) => a.status === 'pending').length;

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
              {formatName(dbUser?.name, dbUser?.role) || 'Administrator'}
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
            Admin Panel
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          <SignOutButton>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LogOut size={14} /> Sign Out
            </button>
          </SignOutButton>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="page-container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5rem' }}>

        {/* Hero Banner */}
        <div className="glass" style={{ padding: '2rem 2.5rem', borderRadius: '28px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)', boxShadow: `0 20px 50px rgba(0,0,0,0.1), 0 0 30px ${currentTheme.glow}`, marginBottom: '2.5rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.12, filter: 'blur(35px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
              <Sparkles size={13} /><span>Admin Command Center</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--echo-text)', marginBottom: '0.375rem' }}>
              Welcome, <span style={{ color: currentTheme.primary }}>{formatName(dbUser?.name, dbUser?.role) || 'Admin'}</span> 🛡️
            </h1>
            <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.9375rem', margin: '0 auto', maxWidth: '600px' }}>
              {applications.length} pending application{applications.length !== 1 ? 's' : ''} · {pendingAppeals} pending appeal{pendingAppeals !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

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
              const hasBadge = (t.id === 'applications' && applications.length > 0) || (t.id === 'appeals' && pendingAppeals > 0);
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
                  {hasBadge && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.625rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: '6px', right: '6px' }}>
                    {t.id === 'applications' ? applications.length : pendingAppeals}
                  </span>}
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
                <button key={key} onClick={() => setDashTheme(key)} className={isExtra ? 'hide-mobile' : ''} style={{
                  padding: '0.35rem 0.75rem', borderRadius: '999px', border: 'none',
                  background: isSel ? t.primary : 'transparent', color: isSel ? '#fff' : 'var(--echo-text-muted)',
                  fontSize: '0.75rem', fontWeight: isSel ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s ease',
                }}>
                  {t.name.split(' ')[0]} {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── APPLICATIONS ── */}
        {tab === 'applications' && (
          <div className="animate-fade-in-up">
            <h2 className="section-heading">📋 Pending Applications</h2>
            {applications.length === 0 ? (
              <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <p style={{ color: 'var(--echo-text-muted)' }}>No pending applications. All caught up!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.map((app: any) => {
                  const profile = app.role === 'doctor' ? app.doctorProfile : app.volunteerProfile;
                  return (
                    <div key={app._id} className="glass echo-card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '1rem' }}>{formatName(app.name, app.role)}</span>
                            <span className={`badge badge-${app.role === 'doctor' ? 'cyan' : 'purple'}`}>{app.role}</span>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>{app.email}</div>
                        </div>
                      </div>
                      {profile && (
                        <div style={{ background: 'var(--echo-surface-2)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                          <div><strong>📞 Phone:</strong> <span style={{ color: 'var(--echo-text-muted)' }}>{profile.phoneNo}</span></div>
                          <div><strong>💬 Reason:</strong> <span style={{ color: 'var(--echo-text-muted)' }}>{profile.whyVolunteer || profile.whyDoctor}</span></div>
                          {profile.degree && <div><strong>🎓 Degree:</strong> <span style={{ color: 'var(--echo-text-muted)' }}>{profile.degree}</span></div>}
                          {profile.experience && <div><strong>💼 Experience:</strong> <span style={{ color: 'var(--echo-text-muted)' }}>{profile.experience}</span></div>}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', background: 'linear-gradient(135deg, #16a34a, #15803d)' }} onClick={() => adminAction(app._id, 'approve')} disabled={loading}>✓ Approve</button>
                        <button className="btn-danger" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }} onClick={() => adminAction(app._id, 'reject')} disabled={loading}>✗ Reject</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── USERS / VOLUNTEERS / DOCTORS ── */}
        {(tab === 'users' || tab === 'volunteers' || tab === 'doctors') && (
          <div className="animate-fade-in-up" key={tab}>
            <h2 className="section-heading">{tab === 'users' ? '👥 All Users' : tab === 'volunteers' ? '🤝 All Volunteers' : '🩺 All Doctors'}</h2>
            {users.length === 0 ? (
              <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                <p style={{ color: 'var(--echo-text-muted)' }}>No {tab} found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {users.map((u: any) => (
                  <div key={u._id} className="glass echo-card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: (tab === 'volunteers' || tab === 'doctors') ? '1rem' : '0', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                          {u.name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem', flexWrap: 'wrap' }}>
                            {formatName(u.name, u.role)}
                            {u.isBanned && <span className="badge badge-red">Banned</span>}
                            {u.applicationStatus && <span className={`badge badge-${u.applicationStatus === 'approved' ? 'green' : u.applicationStatus === 'pending' ? 'yellow' : 'red'}`}>{u.applicationStatus}</span>}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {u.isBanned
                          ? <button className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem' }} onClick={() => adminAction(u._id, 'unban')} disabled={loading}>Unban</button>
                          : <button className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem' }} onClick={() => adminAction(u._id, 'ban')} disabled={loading}>Ban</button>
                        }
                        <button className="btn-danger" style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem' }} onClick={() => adminAction(u._id, 'delete')} disabled={loading}>Delete</button>
                      </div>
                    </div>
                    {(tab === 'volunteers' || tab === 'doctors') && (
                      <div style={{ background: 'var(--echo-surface-2)', borderRadius: '12px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', border: '1px solid var(--echo-border)' }}>
                        {u[tab === 'volunteers' ? 'volunteerProfile' : 'doctorProfile'] ? (<>
                          <div><div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>📞 Phone</div><div style={{ fontWeight: '500' }}>{u[tab === 'volunteers' ? 'volunteerProfile' : 'doctorProfile'].phoneNo || 'N/A'}</div></div>
                          <div><div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>💬 WhatsApp</div><div style={{ fontWeight: '500' }}>{u[tab === 'volunteers' ? 'volunteerProfile' : 'doctorProfile'].whatsappNumber || 'N/A'}</div></div>
                          <div><div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>🎓 Degree</div><div style={{ fontWeight: '500' }}>{u[tab === 'volunteers' ? 'volunteerProfile' : 'doctorProfile'].degree || 'N/A'}</div></div>
                          <div><div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>💼 Experience</div><div style={{ fontWeight: '500' }}>{u[tab === 'volunteers' ? 'volunteerProfile' : 'doctorProfile'].experience || 'None'}</div></div>
                        </>) : <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>Profile details not available.</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BANNED ACCOUNTS ── */}
        {tab === 'banned' && (
          <div className="animate-fade-in-up" key={tab}>
            <h2 className="section-heading">🚫 Banned Accounts</h2>
            {users.length === 0 ? (
              <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                <p style={{ color: 'var(--echo-text-muted)' }}>No banned accounts found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {users.map((u: any) => (
                  <div key={u._id} className="glass echo-card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: (u.role === 'volunteer' || u.role === 'doctor') ? '1rem' : '0', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                          {u.name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem', flexWrap: 'wrap' }}>
                            {formatName(u.name, u.role)}
                            <span className="badge badge-purple">{u.role.toUpperCase()}</span>
                            <span className="badge badge-red" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Bans: {u.banCount || 0}</span>
                            {u.warningCount > 0 && <span className="badge badge-yellow">Warnings: {u.warningCount}</span>}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem' }} onClick={() => adminAction(u._id, 'unban')} disabled={loading}>Unban</button>
                        <button className="btn-danger" style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem' }} onClick={() => adminAction(u._id, 'delete')} disabled={loading}>Delete</button>
                      </div>
                    </div>
                    {(u.role === 'volunteer' || u.role === 'doctor') && (
                      <div style={{ background: 'var(--echo-surface-2)', borderRadius: '12px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', border: '1px solid var(--echo-border)' }}>
                        {u[u.role === 'volunteer' ? 'volunteerProfile' : 'doctorProfile'] ? (<>
                          <div><div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>📞 Phone</div><div style={{ fontWeight: '500' }}>{u[u.role === 'volunteer' ? 'volunteerProfile' : 'doctorProfile'].phoneNo || 'N/A'}</div></div>
                          <div><div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>💬 WhatsApp</div><div style={{ fontWeight: '500' }}>{u[u.role === 'volunteer' ? 'volunteerProfile' : 'doctorProfile'].whatsappNumber || 'N/A'}</div></div>
                          <div><div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>🎓 Degree</div><div style={{ fontWeight: '500' }}>{u[u.role === 'volunteer' ? 'volunteerProfile' : 'doctorProfile'].degree || 'N/A'}</div></div>
                          <div><div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>💼 Experience</div><div style={{ fontWeight: '500' }}>{u[u.role === 'volunteer' ? 'volunteerProfile' : 'doctorProfile'].experience || 'None'}</div></div>
                        </>) : <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>Profile details not available.</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SUGGESTIONS ── */}
        {tab === 'suggestions' && (
          <div className="animate-fade-in-up">
            <h2 className="section-heading">💡 Suggestions</h2>
            {suggestions.length === 0 ? (
              <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                <p style={{ color: 'var(--echo-text-muted)' }}>No suggestions received yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {suggestions.map((s: any) => (
                  <div key={s._id} className="glass echo-card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${s.role === 'anonymous' ? 'gray' : 'purple'}`}>{s.role.toUpperCase()}</span>
                        {s.name && <span style={{ fontWeight: '600' }}>{formatName(s.name, s.role)} <span style={{ fontWeight: 'normal', color: 'var(--echo-text-muted)', fontSize: '0.8125rem' }}>({s.email})</span></span>}
                        <span style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>{new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <button className="btn-danger" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px' }} onClick={() => deleteSuggestion(s._id)} disabled={loading}>🗑️ Delete</button>
                    </div>
                    <p style={{ color: 'var(--echo-text)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{s.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── APPEALS ── */}
        {tab === 'appeals' && (
          <div className="animate-fade-in-up">
            <h2 className="section-heading">📬 Ban Appeals & Support</h2>
            {appeals.length === 0 ? (
              <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <p style={{ color: 'var(--echo-text-muted)' }}>No ban appeals at this moment.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {appeals.map((a: any) => (
                  <div key={a._id} className="glass echo-card" style={{ padding: '1.5rem', borderRadius: '20px', border: a.status === 'pending' ? `2px solid ${currentTheme.primary}` : '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--echo-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '700', fontSize: '1.125rem' }}>{a.userName}</span>
                          <span className={`badge badge-${a.userRole === 'doctor' ? 'cyan' : 'purple'}`}>{a.userRole}</span>
                          <span className={`badge badge-${a.status === 'resolved' ? 'green' : a.status === 'rejected' ? 'red' : 'yellow'}`}>{a.status.toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>{a.userEmail}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {a.status === 'pending' && (
                          <>
                            <button onClick={async () => { if (!confirm(`Revoke ban for ${a.userName}?`)) return; setLoading(true); await fetch('/api/appeals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'resolve', appealId: a._id, content: replyInput[a._id] || '' }) }); setReplyInput(p => ({ ...p, [a._id]: '' })); loadAppeals(); setLoading(false); }} disabled={loading} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.8125rem', cursor: 'pointer' }}>✅ Revoke Ban</button>
                            <button onClick={async () => { if (!confirm(`Reject appeal for ${a.userName}?`)) return; setLoading(true); await fetch('/api/appeals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject', appealId: a._id, content: replyInput[a._id] || '' }) }); setReplyInput(p => ({ ...p, [a._id]: '' })); loadAppeals(); setLoading(false); }} disabled={loading} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.8125rem', cursor: 'pointer' }}>❌ Reject</button>
                          </>
                        )}
                        <button onClick={async () => { if (!confirm(`Delete appeal from ${a.userName}?`)) return; setLoading(true); await fetch(`/api/appeals?id=${a._id}`, { method: 'DELETE' }); loadAppeals(); setLoading(false); }} disabled={loading} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.8125rem', cursor: 'pointer' }}>🗑️ Delete</button>
                      </div>
                    </div>
                    <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'var(--echo-bg)', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--echo-border)' }}>
                      {a.messages.map((m: any, idx: number) => (
                        <div key={idx} style={{ alignSelf: m.isAdmin ? 'flex-end' : 'flex-start', maxWidth: '80%', background: m.isAdmin ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` : 'var(--echo-surface-2)', color: m.isAdmin ? 'white' : 'var(--echo-text)', padding: '0.75rem 1rem', borderRadius: m.isAdmin ? '12px 12px 2px 12px' : '12px 12px 12px 2px', border: m.isAdmin ? 'none' : '1px solid var(--echo-border)' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.25rem', opacity: 0.85 }}>{m.senderName} · {new Date(m.timestamp).toLocaleString()}</div>
                          <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{m.content}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <input type="text" placeholder="Write a reply..." value={replyInput[a._id] || ''} onChange={e => setReplyInput(p => ({ ...p, [a._id]: e.target.value }))} style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--echo-border)', background: 'var(--echo-bg)', color: 'var(--echo-text)', fontSize: '0.875rem' }} />
                      <button onClick={async () => { if (!replyInput[a._id]?.trim()) return; setLoading(true); await fetch('/api/appeals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send', appealId: a._id, content: replyInput[a._id].trim() }) }); setReplyInput(p => ({ ...p, [a._id]: '' })); loadAppeals(); setLoading(false); }} disabled={loading || !replyInput[a._id]?.trim()} style={{ background: currentTheme.primary, color: 'white', border: 'none', padding: '0 1.25rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Reply 📤</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

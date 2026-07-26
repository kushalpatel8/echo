'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import BackButton from '@/components/BackButton';
import BanAppealBanner from '@/components/BanAppealBanner';
import { HandHeart, MessageSquare, ClipboardList, User, LogOut, Sparkles, Star, Activity, Menu } from 'lucide-react';

type Tab = 'overview' | 'chats' | 'tasks' | 'profile';
type DashTheme = 'celestial' | 'forest' | 'sunset' | 'ocean' | 'aurora';

const DASH_THEMES: Record<DashTheme, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
  celestial: { name: '🌌 Celestial', primary: '#7c3aed', secondary: '#06b6d4', glow: 'rgba(124,58,237,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.12) 0%, transparent 60%)' },
  forest:    { name: '🌲 Forest',    primary: '#059669', secondary: '#10b981', glow: 'rgba(5,150,105,0.25)',  bgGrad: 'radial-gradient(ellipse at top right, rgba(5,150,105,0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.12) 0%, transparent 60%)' },
  sunset:    { name: '🌅 Sunset',    primary: '#f59e0b', secondary: '#e11d48', glow: 'rgba(245,158,11,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225, 29, 72, 0.12) 0%, transparent 60%)' },
  ocean:     { name: '🌊 Ocean',     primary: '#3b82f6', secondary: '#0ea5e9', glow: 'rgba(59,130,246,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(14, 165, 233, 0.12) 0%, transparent 60%)' },
  aurora:    { name: '✨ Aurora',    primary: '#a855f7', secondary: '#10b981', glow: 'rgba(168,85,247,0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(10, 200, 120, 0.12) 0%, transparent 60%)' },
};

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: '📊 Overview',      icon: <Activity size={15} /> },
  { id: 'chats',    label: '💬 User Chats',    icon: <MessageSquare size={15} /> },
  { id: 'tasks',    label: '📋 Assign Tasks',  icon: <ClipboardList size={15} /> },
  { id: 'profile',  label: '👤 Profile',        icon: <User size={15} /> },
];

export default function VolunteerDashboard() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [dashTheme, setDashTheme] = useState<DashTheme>('forest');
  const [dbUser, setDbUser] = useState<Record<string, unknown> | null>(null);
  const [chats, setChats] = useState<Record<string, unknown>[]>([]);
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeId: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentTheme = DASH_THEMES[dashTheme];
  const appStatus = dbUser?.applicationStatus;

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (d.user) {
        if (d.user.role !== 'volunteer' && d.user.role !== 'doctor') { router.push('/dashboard'); return; }
        if (d.user.applicationStatus !== 'approved') { router.push('/apply/status'); return; }
        setDbUser(d.user);
        setEditName(d.user.name);
      } else router.push('/role-selection');
    });
    fetch('/api/chat').then(r => r.json()).then(d => setChats(d.chats || []));
    fetch('/api/tasks').then(r => r.json()).then(d => setTasks(d.tasks || []));
  }, [router]);

  const createTask = async () => {
    if (!newTask.title || !newTask.assigneeId) return;
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask) });
    const data = await res.json();
    if (data.task) { setTasks(prev => [data.task, ...prev]); setNewTask({ title: '', description: '', assigneeId: '' }); }
  };

  const saveProfile = async () => {
    setSaving(true);
    await fetch('/api/users/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName }) });
    setDbUser(prev => prev ? { ...prev, name: editName } : prev);
    setSaving(false);
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    await fetch('/api/users/profile', { method: 'DELETE' });
    router.push('/');
  };

  const deleteChat = async (chatId: string) => {
    if (!confirm('Delete this chat permanently?')) return;
    const res = await fetch(`/api/chat?chatId=${chatId}`, { method: 'DELETE' });
    if (res.ok) setChats(prev => prev.filter((c: any) => c._id !== chatId));
  };

  const activeChats = chats.filter((c: any) => c.isActive).length;
  const rating = (dbUser?.volunteerProfile as Record<string, unknown>)?.rating as number || 0;

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
              {(dbUser?.name as string) || clerkUser?.username || 'Volunteer'}
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
            Volunteer Hub
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

        {/* Pending Application Banner */}
        {appStatus === 'pending' && (
          <div style={{ padding: '1rem 1.5rem', borderRadius: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>⏳</span>
            <span style={{ color: '#fde047', fontSize: '0.875rem' }}>Your application is under review. You'll be able to help users once approved.</span>
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
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.25rem', borderRadius: '12px', border: 'none',
                  background: isActive ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` : 'transparent',
                  color: isActive ? '#fff' : 'var(--echo-text-muted)',
                  fontWeight: isActive ? '700' : '600', fontSize: '0.875rem',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  boxShadow: isActive ? `0 4px 15px ${currentTheme.glow}` : 'none',
                  flexShrink: 0,
                }}>
                  {t.icon}<span>{t.label}</span>
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
                  <Sparkles size={13} /><span>Your Volunteer Dashboard</span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>
                  Welcome back, <span style={{ color: currentTheme.primary }}>{(dbUser?.name as string)?.split(' ')[0] || 'Friend'}</span> 🤝
                </h1>
                <p style={{ color: 'var(--echo-text-muted)', fontSize: '1rem', marginBottom: '2rem', margin: '0 auto 2rem', maxWidth: '600px' }}>
                  You are making a difference in people's lives every day.
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { label: 'Active Chats', value: activeChats, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
                    { label: 'Tasks Created', value: tasks.length, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
                    { label: 'Rating', value: `${rating}/5 ⭐`, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
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
              </div>
            </div>
          </div>
        )}

        {/* ── CHATS ── */}
        {tab === 'chats' && (
          <div className="animate-fade-in-up">
            <h2 className="section-heading">💬 User Chats</h2>
            {chats.length === 0 ? (
              <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                <p style={{ color: 'var(--echo-text-muted)' }}>No active chats yet. Users will reach out to you soon!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chats.map((chat: Record<string, unknown>) => {
                  const participants = chat.participantNames as string[];
                  const myIndex = (chat.participants as string[]).indexOf(dbUser?.clerkId as string);
                  const otherName = participants[1 - myIndex] || 'User';
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
                      <button onClick={() => deleteChat(chat._id as string)} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>🗑️</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TASKS ── */}
        {tab === 'tasks' && (
          <div className="animate-fade-in-up">
            <h2 className="section-heading">📋 Assign Tasks</h2>
            <div className="glass" style={{ padding: '1.75rem', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)', marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: '700', fontSize: '1.0625rem', color: 'var(--echo-text)', marginBottom: '1.25rem' }}>Create New Task</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><label className="echo-label">Task Title</label><input className="echo-input" placeholder="e.g., Daily journaling" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} /></div>
                <div><label className="echo-label">Description</label><textarea className="echo-input" placeholder="Describe the task..." value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} style={{ minHeight: '80px' }} /></div>
                <div><label className="echo-label">User Clerk ID</label><input className="echo-input" placeholder="Enter the user's Clerk ID" value={newTask.assigneeId} onChange={e => setNewTask(p => ({ ...p, assigneeId: e.target.value }))} /><p style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', marginTop: '0.25rem' }}>Found in the chat window of the user.</p></div>
                <button className="btn-primary" onClick={createTask} style={{ background: currentTheme.primary }}>Assign Task</button>
              </div>
            </div>
            {tasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.map((task: Record<string, unknown>) => (
                  <div key={task._id as string} className="glass echo-card" style={{ padding: '1.25rem 1.5rem', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><div style={{ fontWeight: '700', color: 'var(--echo-text)' }}>{task.title as string}</div><div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>{task.description as string}</div></div>
                      <span className={`badge badge-${task.status === 'completed' ? 'green' : task.status === 'in-progress' ? 'yellow' : 'purple'}`}>{task.status as string}</span>
                    </div>
                  </div>
                ))}
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
      </main>
    </div>
  );
}

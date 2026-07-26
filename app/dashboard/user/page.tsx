'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import MobileDashboard from '@/components/MobileDashboard';
import BackButton from '@/components/BackButton';
import { LayoutDashboard, CheckSquare, BarChart2, User, LogOut, Sparkles, Heart, Clock, Menu } from 'lucide-react';

type Tab = 'overview' | 'tasks' | 'mood-history' | 'profile';
type DashTheme = 'celestial' | 'forest' | 'sunset' | 'ocean' | 'aurora';

const DASH_THEMES: Record<DashTheme, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
  celestial: {
    name: '🌌 Celestial',
    primary: '#7c3aed',
    secondary: '#06b6d4',
    glow: 'rgba(124, 58, 237, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.12) 0%, transparent 60%)',
  },
  forest: {
    name: '🌲 Forest',
    primary: '#059669',
    secondary: '#10b981',
    glow: 'rgba(5, 150, 105, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(5, 150, 105, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
  },
  sunset: {
    name: '🌅 Sunset',
    primary: '#f59e0b',
    secondary: '#e11d48',
    glow: 'rgba(245, 158, 11, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225, 29, 72, 0.12) 0%, transparent 60%)',
  },
  ocean: {
    name: '🌊 Ocean',
    primary: '#3b82f6',
    secondary: '#0ea5e9',
    glow: 'rgba(59, 130, 246, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(14, 165, 233, 0.12) 0%, transparent 60%)',
  },
  aurora: {
    name: '✨ Aurora',
    primary: '#a855f7',
    secondary: '#10b981',
    glow: 'rgba(168, 85, 247, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(10, 200, 120, 0.12) 0%, transparent 60%)',
  },
};

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',      label: '🏠 Overview',      icon: <LayoutDashboard size={16} /> },
  { id: 'tasks',         label: '✅ My Tasks',       icon: <CheckSquare size={16} /> },
  { id: 'mood-history',  label: '📊 Mood History',   icon: <BarChart2 size={16} /> },
  { id: 'profile',       label: '👤 Profile',        icon: <User size={16} /> },
];

const moodColors: Record<string, string> = {
  Radiant: '#fde047', Calm: '#86efac', Neutral: '#93c5fd',
  Uneasy: '#fdba74', Distressed: '#fca5a5', Critical: '#f87171',
};

export default function UserDashboard() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [dashTheme, setDashTheme] = useState<DashTheme>('celestial');
  const [dbUser, setDbUser] = useState<Record<string, unknown> | null>(null);
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);
  const [moodLogs, setMoodLogs] = useState<Record<string, unknown>[]>([]);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentTheme = DASH_THEMES[dashTheme];

  useEffect(() => {
    const syncUser = async () => {
      if (clerkUser) await clerkUser.reload();
      const res = await fetch('/api/users/me');
      const data = await res.json();
      if (data.user) {
        setDbUser(data.user);
        if (data.user.name) setEditName(data.user.name as string);
      } else router.push('/role-selection');
    };
    syncUser();
    fetch('/api/tasks').then(r => r.json()).then(d => setTasks(d.tasks || []));
    fetch('/api/mood').then(r => r.json()).then(d => setMoodLogs(d.logs || []));
  }, [router, clerkUser]);

  const updateTask = async (taskId: string, status: string) => {
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, status }) });
    setTasks(prev => prev.map((t: Record<string, unknown>) => t._id === taskId ? { ...t, status } : t));
  };

  const saveProfile = async () => {
    setSaving(true);
    await fetch('/api/users/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName }) });
    setDbUser(prev => prev ? { ...prev, name: editName } : prev);
    setSaving(false);
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    await fetch('/api/users/profile', { method: 'DELETE' });
    router.push('/');
  };

  const pendingTasks = tasks.filter((t: Record<string, unknown>) => t.status === 'pending').length;
  const completedTasks = tasks.filter((t: Record<string, unknown>) => t.status === 'completed').length;
  const latestMood = moodLogs[0] as Record<string, unknown> | undefined;

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
              {(dbUser?.name as string) || clerkUser?.username || 'User'}
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
        <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--echo-border)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.625rem', color: 'var(--echo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 1rem', marginBottom: '0.25rem' }}>Quick access</div>
          <Link href="/companion" style={{ textDecoration: 'none' }} onClick={() => setIsSidebarOpen(false)}><button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>🤖 AI Companion</button></Link>
          <Link href="/volunteers" style={{ textDecoration: 'none' }} onClick={() => setIsSidebarOpen(false)}><button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>🤝 Peer Support</button></Link>
          <Link href="/doctors" style={{ textDecoration: 'none' }} onClick={() => setIsSidebarOpen(false)}><button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>👨‍⚕️ Doctors</button></Link>
          <Link href="/relaxation" style={{ textDecoration: 'none' }} onClick={() => setIsSidebarOpen(false)}><button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>🧘 Relaxation</button></Link>
          <Link href="/mood-tracker" style={{ textDecoration: 'none' }} onClick={() => setIsSidebarOpen(false)}><button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>📝 Mood Tracker</button></Link>
          <Link href="/games" style={{ textDecoration: 'none' }} onClick={() => setIsSidebarOpen(false)}><button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>🎮 Relax Games</button></Link>
          <Link href="/relaxation/books" style={{ textDecoration: 'none' }} onClick={() => setIsSidebarOpen(false)}><button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>📚 Curated Library</button></Link>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <SignOutButton><button className="btn-danger" style={{ width: '100%', padding: '0.6rem', fontSize: '0.8125rem' }}>Sign Out</button></SignOutButton>
        </div>
      </aside>

      {/* Dynamic Ambient Background Glow */}
      <div style={{ position: 'fixed', inset: 0, background: currentTheme.bgGrad, pointerEvents: 'none', transition: 'background 1s ease', zIndex: 0 }} />

      {/* ── Sticky Header matching Screenshot ── */}
      <header style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--echo-border)',
        background: 'var(--echo-surface)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Left Side Controls (Hamburger + Back + Dashboard Title) */}
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
        </div>

        {/* Right Side (Theme Toggle + Avatar) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          {clerkUser?.imageUrl
            ? <img src={clerkUser.imageUrl} alt="Avatar" onClick={() => setTab('profile')} style={{ width: '34px', height: '34px', borderRadius: '50%', border: `2px solid ${currentTheme.primary}`, cursor: 'pointer', objectFit: 'cover' }} />
            : <div onClick={() => setTab('profile')} style={{ width: '34px', height: '34px', borderRadius: '50%', background: currentTheme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#fff', fontWeight: '700' }}>
                {(dbUser?.name as string)?.[0] || '?'}
              </div>
          }
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="page-container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5rem' }}>

        {/* ── Tab Navigation ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', width: '100%' }}>
          <div className="glass" style={{
            display: 'inline-flex', padding: '0.375rem', borderRadius: '16px',
            border: '1px solid var(--echo-border)', background: 'var(--echo-surface)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)', gap: '0.25rem',
            overflowX: 'auto', maxWidth: '100%', scrollbarWidth: 'none',
          }}>
            {TABS.map(t => {
              const selected = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
                  background: selected ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` : 'transparent',
                  color: selected ? '#fff' : 'var(--echo-text-muted)',
                  fontWeight: selected ? '700' : '600', fontSize: '0.9rem',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  boxShadow: selected ? `0 4px 15px ${currentTheme.glow}` : 'none',
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
                <button key={key} onClick={() => setDashTheme(key)} className={isExtra ? 'hide-mobile' : ''} style={{
                  padding: '0.35rem 0.75rem', borderRadius: '999px', border: 'none',
                  background: isSel ? t.primary : 'transparent',
                  color: isSel ? '#fff' : 'var(--echo-text-muted)',
                  fontSize: '0.75rem', fontWeight: isSel ? '700' : '500',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}>
                  {t.name.split(' ')[0]} {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div className="animate-fade-in-up">
            {/* Mobile-only View */}
            <div className="show-mobile">
              <MobileDashboard />
            </div>

            {/* Desktop / Tablet View */}
            <div className="hide-mobile">
              {/* Hero Welcome Card */}
              <div className="glass" style={{
                padding: '2.5rem', borderRadius: '28px',
                border: '1px solid var(--echo-border)', background: 'var(--echo-surface)',
                boxShadow: `0 25px 60px rgba(0,0,0,0.12), 0 0 40px ${currentTheme.glow}`,
                marginBottom: '2rem', position: 'relative', overflow: 'hidden',
                textAlign: 'center'
              }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.12, filter: 'blur(35px)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                    <Sparkles size={13} /><span>Your Sanctuary</span>
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>
                    Welcome back, <span style={{ color: currentTheme.primary }}>{(dbUser?.name as string)?.split(' ')[0] || 'Friend'}</span> 👋
                  </h1>
                  <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.0625rem', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    You have <strong style={{ color: currentTheme.primary }}>{pendingTasks}</strong> pending task{pendingTasks !== 1 ? 's' : ''} today. Take a breath — you're doing great.
                  </p>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[
                      { label: 'Pending', value: pendingTasks, icon: <Clock size={18} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
                      { label: 'Completed', value: completedTasks, icon: <CheckSquare size={18} />, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
                      { label: 'Mood Checks', value: moodLogs.length, icon: <Heart size={18} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
                    ].map(stat => (
                      <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.375rem', borderRadius: '1.25rem', background: stat.bg, border: `1px solid ${stat.border}` }}>
                        <span style={{ color: stat.color }}>{stat.icon}</span>
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--echo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '0.125rem' }}>{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Latest Mood Banner */}
              {latestMood && (() => {
                const mood = latestMood.detectedMood as string;
                const score = latestMood.moodScore as number;
                const emoji = mood === 'Radiant' ? '😊' : mood === 'Calm' ? '😌' : mood === 'Neutral' ? '😐' : mood === 'Uneasy' ? '😟' : '😢';
                const col = moodColors[mood] || currentTheme.primary;
                return (
                  <Link href="/mood-tracker" style={{ textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
                    <div className="glass" style={{
                      padding: '1.25rem 1.75rem', borderRadius: '20px',
                      border: `1px solid ${col}44`,
                      background: `linear-gradient(135deg, ${col}12 0%, transparent 60%)`,
                      display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
                      cursor: 'pointer', transition: 'transform 0.28s ease, box-shadow 0.28s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                    >
                      <span style={{ fontSize: '2.75rem' }}>{emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--echo-text-muted)', fontWeight: '600', marginBottom: '0.2rem' }}>Latest Mood Check</div>
                        <div style={{ fontSize: '1.375rem', fontWeight: '800', color: col }}>{mood}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '2.25rem', fontWeight: '900', color: col }}>{score?.toFixed(1)}</span>
                        <span style={{ fontSize: '1rem', color: 'var(--echo-text-muted)' }}>/10</span>
                      </div>
                      <button style={{ background: 'transparent', border: `1px solid ${col}55`, borderRadius: '999px', padding: '0.45rem 1.125rem', fontSize: '0.8125rem', fontWeight: '700', cursor: 'pointer', color: col, transition: 'background 0.2s', fontFamily: 'var(--font-inter)' }}>
                        Check again →
                      </button>
                    </div>
                  </Link>
                );
              })()}

              {/* Quick-action Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {[
                  { href: '/doctors',         label: 'Expert Doctors',      desc: 'Book a verified professional', emoji: '🩺', color: '#5eead4' },
                  { href: '/volunteers',       label: 'Peer Support',        desc: 'Talk to a caring volunteer',   emoji: '🤝', color: '#86efac' },
                  { href: '/companion',        label: 'AI Companion',        desc: 'Empathetic AI, 24/7',          emoji: '🤖', color: '#99f6e4' },
                  { href: '/mood-tracker',     label: 'Mood Tracker',        desc: 'Log your emotional journey',   emoji: '💭', color: '#f9a8d4' },
                  { href: '/relaxation',       label: 'Relaxation Room',     desc: 'Breathe, read, and unwind',    emoji: '🧘', color: '#fde047' },
                  { href: '/games',            label: 'Relax Games',         desc: 'Calm your mind through play',  emoji: '🎮', color: '#c4b5fd' },
                  { href: '/relaxation/books', label: 'Curated Library',     desc: 'Timeless wisdom, curated',     emoji: '📚', color: '#fdba74' },
                  { href: '/community',        label: 'Community',           desc: 'Share stories, find strength', emoji: '🌍', color: '#67e8f9' },
                ].map((a, i) => (
                  <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
                    <div className="glass echo-card" style={{
                      padding: '1.5rem', borderRadius: '20px',
                      border: '1px solid var(--echo-border)', background: 'var(--echo-surface)',
                      display: 'flex', flexDirection: 'column', gap: '0.5rem',
                      height: '100%', cursor: 'pointer',
                      animation: `fade-in-up 0.45s ease both`,
                      animationDelay: `${i * 50}ms`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.875rem' }}>{a.emoji}</span>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--echo-text)' }}>{a.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--echo-text-muted)' }}>{a.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TASKS TAB ── */}
        {tab === 'tasks' && (
          <div className="animate-fade-in-up">
            <h2 className="section-heading">✅ My Tasks</h2>
            {tasks.length === 0 ? (
              <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <p style={{ color: 'var(--echo-text-muted)' }}>No tasks assigned yet. Connect with a volunteer to get started!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.map((task: Record<string, unknown>) => (
                  <div key={task._id as string} className="glass echo-card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: '700', fontSize: '1.0625rem', color: 'var(--echo-text)' }}>{task.title as string}</h3>
                      <span className={`badge badge-${task.status === 'completed' ? 'green' : task.status === 'in-progress' ? 'yellow' : 'purple'}`}>{task.status as string}</span>
                    </div>
                    <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{task.description as string}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {task.status !== 'completed' && (
                        <>
                          {task.status === 'pending' && (
                            <button className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem' }} onClick={() => updateTask(task._id as string, 'in-progress')}>Start Task</button>
                          )}
                          <button className="btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem', background: currentTheme.primary }} onClick={() => updateTask(task._id as string, 'completed')}>Mark Complete</button>
                        </>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', marginTop: '0.75rem' }}>Assigned by: {task.assignerName as string}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MOOD HISTORY TAB ── */}
        {tab === 'mood-history' && (
          <div className="animate-fade-in-up">
            <h2 className="section-heading">📊 Mood History</h2>
            {moodLogs.length === 0 ? (
              <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <p style={{ color: 'var(--echo-text-muted)', marginBottom: '1.5rem' }}>No mood checks yet.</p>
                <Link href="/mood-tracker"><button className="btn-primary" style={{ background: currentTheme.primary }}>Take Mood Check</button></Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {moodLogs.map((log: Record<string, unknown>) => {
                  const mood = log.detectedMood as string;
                  const emoji = mood === 'Radiant' ? '😊' : mood === 'Calm' ? '😌' : mood === 'Neutral' ? '😐' : mood === 'Uneasy' ? '😟' : '😢';
                  const col = moodColors[mood] || currentTheme.primary;
                  return (
                    <div key={log._id as string} className="glass echo-card" style={{ padding: '1.25rem 1.5rem', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '1.875rem' }}>{emoji}</span>
                          <div>
                            <div style={{ fontWeight: '700', color: col, fontSize: '1.0625rem' }}>{mood}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>Score: {(log.moodScore as number)?.toFixed(1)}/10</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>
                          {new Date(log.createdAt as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div className="animate-fade-in-up" style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 className="section-heading">👤 My Profile</h2>

            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                {clerkUser?.imageUrl
                  ? <img src={clerkUser.imageUrl} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', border: `3px solid ${currentTheme.primary}` }} />
                  : <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: currentTheme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', fontWeight: '800' }}>{(dbUser?.name as string)?.[0] || '?'}</div>
                }
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--echo-text)' }}>{dbUser?.name as string}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>{dbUser?.email as string}</div>
                </div>
              </div>
              <label className="echo-label">Display Name</label>
              <input className="echo-input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" style={{ marginBottom: '1.25rem' }} />
              <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ width: '100%', background: currentTheme.primary }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
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
              <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Permanently delete your account and all data.</p>
              <button className="btn-danger" onClick={deleteAccount} style={{ width: '100%' }}>Delete Account</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

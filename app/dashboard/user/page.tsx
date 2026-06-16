'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import MobileDashboard from '@/components/MobileDashboard';
import TabletDashboard from '@/components/TabletDashboard';
import BackButton from '@/components/BackButton';

type Tab = 'overview' | 'tasks' | 'mood-history' | 'profile';

export default function UserDashboard() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [dbUser, setDbUser] = useState<Record<string, unknown> | null>(null);
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);
  const [moodLogs, setMoodLogs] = useState<Record<string, unknown>[]>([]);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      // Force Clerk to refresh session data
      if (clerkUser) await clerkUser.reload();
      
      const res = await fetch('/api/users/me');
      const data = await res.json();
      
      if (data.user) { 
        setDbUser(data.user); 
        if (data.user.name) setEditName(data.user.name as string); 
      }
      else router.push('/role-selection');
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

  const sidebarItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'tasks', icon: '✅', label: 'My Tasks' },
    { id: 'mood-history', icon: '📈', label: 'Mood History' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];


  const moodColors: Record<string, string> = { Radiant: '#fde047', Calm: '#86efac', Neutral: '#93c5fd', Uneasy: '#fdba74', Distressed: '#fca5a5', Critical: '#f87171' };

  return (
    <>
      {/* ── Sidebar overlay — outside flex, always covers full viewport ── */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        style={{ zIndex: 190 }}
      />

      {/* ── Sidebar — outside flex, always fixed overlay on all screen sizes ── */}
      <aside
        className={`echo-sidebar ${isSidebarOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '240px',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          visibility: isSidebarOpen ? 'visible' : 'hidden',
          zIndex: 200,
          transition: 'transform 0.3s ease, visibility 0.3s',
          padding: '1.25rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isSidebarOpen ? '10px 0 40px rgba(0,0,0,0.3)' : 'none',
          overflowY: 'auto',
        }}
      >
        {/* ── Sidebar header ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Back / close button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--echo-border)',
              borderRadius: '0.625rem',
              color: 'var(--echo-text)',
              padding: '0.45rem 0.875rem',
              fontSize: '0.8125rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1.25rem',
              width: '100%',
              transition: 'background 0.2s',
              fontFamily: 'var(--font-inter)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            <span style={{ fontSize: '1rem' }}>←</span>
            <span>Close Menu</span>
          </button>

          {/* Logo + theme */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <img
                src="/favicon.ico"
                alt="Logo"
                style={{ width: '38px', height: '38px', borderRadius: '10px', cursor: 'pointer' }}
              />
            </Link>
            <ThemeToggle />
          </div>

          {/* User name */}
          <div style={{
            padding: '0.625rem 0.75rem',
            borderRadius: '0.625rem',
            background: 'var(--echo-primary-low)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--echo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Signed in as</div>
            <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--echo-text)' }}>
              {(dbUser?.name as string) || clerkUser?.firstName || 'User'}
            </div>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%', marginBottom: '0.25rem' }}>
              <span>🏠</span><span>Home</span>
            </button>
          </Link>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setIsSidebarOpen(false); }}
              className={`sidebar-link ${tab === item.id ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Quick links ── */}
        <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--echo-border)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.875rem' }}>
          <div style={{ fontSize: '0.625rem', color: 'var(--echo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 1rem', marginBottom: '0.25rem' }}>Quick access</div>
          <Link href="/companion" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>🤖 AI Companion</button>
          </Link>
          <Link href="/volunteers" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>🤝 Peer Support</button>
          </Link>
          <Link href="/doctors" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>👨‍⚕️ Doctors</button>
          </Link>
          <Link href="/relaxation" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>🧘 Relaxation</button>
          </Link>
          <Link href="/mood-tracker" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>📝 Mood Tracker</button>
          </Link>
          <Link href="/games" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>🎮 Relax Games</button>
          </Link>
          <Link href="/relaxation/books" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>📚 Curated Library</button>
          </Link>
        </div>

        <SignOutButton>
          <button className="btn-danger" style={{ width: '100%', padding: '0.6rem', fontSize: '0.8125rem' }}>Sign Out</button>
        </SignOutButton>
      </aside>

      {/* ── Main layout — full viewport width, never affected by sidebar ── */}
      <div style={{
        minHeight: '100vh',
        width: '100%',
        background: 'transparent',
        transition: 'filter 0.3s ease, opacity 0.3s ease',
        filter: isSidebarOpen ? 'blur(4px)' : 'none',
        opacity: isSidebarOpen ? 0.3 : 1,
        pointerEvents: isSidebarOpen ? 'none' : 'auto',
      }}>
        <main style={{ width: '100%', padding: 'clamp(1rem, 5vw, 2rem)', overflowY: 'auto', minWidth: 0 }}>


        {/* ── Universal top bar (all screen sizes) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.75rem',
        }}>
          {/* Left Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger / menu toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '0.75rem',
                background: 'var(--echo-glass-bg)',
                border: '1px solid var(--echo-border)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--echo-primary)'; e.currentTarget.style.background = 'var(--echo-primary-low)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--echo-border)'; e.currentTarget.style.background = 'var(--echo-glass-bg)'; }}
              aria-label="Open menu"
            >
              <span style={{ width: '18px', height: '2px', background: 'var(--echo-text)', borderRadius: '2px', display: 'block' }} />
              <span style={{ width: '13px', height: '2px', background: 'var(--echo-text-muted)', borderRadius: '2px', display: 'block', alignSelf: 'flex-start', marginLeft: '13px' }} />
              <span style={{ width: '18px', height: '2px', background: 'var(--echo-text)', borderRadius: '2px', display: 'block' }} />
            </button>
            <BackButton />
          </div>

          {/* Page title */}
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--echo-text)', margin: 0 }}>
            {tab === 'overview' ? 'Dashboard' : tab === 'tasks' ? 'My Tasks' : tab === 'mood-history' ? 'Mood History' : 'My Profile'}
          </h2>

          {/* Right: theme toggle + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ThemeToggle />
            <button
              onClick={() => setTab('profile')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {clerkUser?.imageUrl ? (
                <img
                  src={clerkUser.imageUrl}
                  alt="Profile"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--echo-primary)', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--echo-primary-low)', border: '2px solid var(--echo-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem',
                }}>👤</div>
              )}
            </button>
          </div>
        </div>

        {tab === 'overview' && (
          <>
            {/* Mobile-only view */}
            <div className="show-mobile animate-fade-in-up">
              <MobileDashboard />
            </div>

            {/* Tablet-only view */}
            <div className="show-tablet animate-fade-in-up">
              <TabletDashboard
                userName={(dbUser?.name as string) || undefined}
                tasksPending={tasks.filter((t: Record<string, unknown>) => t.status === 'pending').length}
                tasksCompleted={tasks.filter((t: Record<string, unknown>) => t.status === 'completed').length}
                moodChecks={moodLogs.length}
                latestMood={moodLogs[0] ? {
                  label: (moodLogs[0] as Record<string, unknown>).detectedMood as string,
                  score: (moodLogs[0] as Record<string, unknown>).moodScore as number,
                  emoji: (() => {
                    const m = (moodLogs[0] as Record<string, unknown>).detectedMood;
                    return m === 'Radiant' ? '😊' : m === 'Calm' ? '😌' : m === 'Neutral' ? '😐' : m === 'Uneasy' ? '😟' : '😢';
                  })(),
                  color: moodColors[(moodLogs[0] as Record<string, unknown>).detectedMood as string] || 'var(--echo-text)',
                } : null}
              />
            </div>

            {/* Desktop-only view */}
            <div className="hide-tablet animate-fade-in-up">

              {/* ── Desktop Hero ── */}
              <div className="dsk-hero">
                <div className="dsk-hero-orb dsk-orb-1" />
                <div className="dsk-hero-orb dsk-orb-2" />
                <div className="dsk-hero-orb dsk-orb-3" />

                <div className="dsk-hero-left">
                  <span className="dsk-badge">✨ Your sanctuary</span>
                  <h1 className="dsk-hero-title">
                    Welcome back,{' '}
                    <span className="gradient-text">
                      {(dbUser?.name as string)?.split(' ')[0] || 'Friend'}
                    </span>{' '}
                    👋
                  </h1>
                  <p className="dsk-hero-sub">
                    You have {tasks.filter((t: Record<string, unknown>) => t.status === 'pending').length} task{tasks.filter((t: Record<string, unknown>) => t.status === 'pending').length !== 1 ? 's' : ''} pending today.
                  </p>
                </div>

                {/* Stats */}
                <div className="dsk-stats">
                  {[
                    { label: 'Tasks Pending',   value: tasks.filter((t: Record<string, unknown>) => t.status === 'pending').length,   emoji: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
                    { label: 'Tasks Completed', value: tasks.filter((t: Record<string, unknown>) => t.status === 'completed').length, emoji: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)' },
                    { label: 'Mood Checks',     value: moodLogs.length,                                                                emoji: '💭', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
                  ].map(s => (
                    <div key={s.label} className="dsk-stat" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                      <span className="dsk-stat-emoji">{s.emoji}</span>
                      <div>
                        <div className="dsk-stat-val" style={{ color: s.color }}>{s.value}</div>
                        <div className="dsk-stat-lbl">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Mood banner ── */}
              {moodLogs[0] && (() => {
                const mood = (moodLogs[0] as Record<string, unknown>).detectedMood as string;
                const score = (moodLogs[0] as Record<string, unknown>).moodScore as number;
                const moodEmoji = mood === 'Radiant' ? '😊' : mood === 'Calm' ? '😌' : mood === 'Neutral' ? '😐' : mood === 'Uneasy' ? '😟' : mood === 'Distressed' ? '😰' : '😢';
                const col = moodColors[mood] || 'var(--echo-primary)';
                return (
                  <Link href="/mood-tracker" style={{ textDecoration: 'none' }}>
                    <div className="dsk-mood" style={{ borderColor: col + '44', background: `linear-gradient(135deg, ${col}12 0%, transparent 60%)` }}>
                      <div className="dsk-mood-orb" style={{ background: col + '25' }} />
                      <span className="dsk-mood-emoji">{moodEmoji}</span>
                      <div className="dsk-mood-info">
                        <div className="dsk-mood-eyebrow">Latest Mood Check</div>
                        <div className="dsk-mood-name" style={{ color: col }}>{mood}</div>
                      </div>
                      <div className="dsk-mood-score-wrap">
                        <span className="dsk-mood-score" style={{ color: col }}>{score?.toFixed(1)}</span>
                        <span className="dsk-mood-denom">/10</span>
                      </div>
                      <button className="dsk-mood-btn" style={{ borderColor: col + '55', color: col }}>
                        Check again →
                      </button>
                    </div>
                  </Link>
                );
              })()}

              {/* ── Quick-action grid ── */}
              <div className="dsk-grid">
                {[
                  { href: '/doctors',          label: 'Expert Doctors',       desc: 'Book a verified professional',    emoji: '🩺', color: '#5eead4', glow: 'rgba(94,234,212,0.2)',   grad: 'linear-gradient(135deg,rgba(94,234,212,0.15) 0%,rgba(94,234,212,0.03) 100%)',   border: 'rgba(94,234,212,0.3)' },
                  { href: '/volunteers',        label: 'Chat with Volunteer',  desc: 'Talk to a caring peer',           emoji: '🤝', color: '#86efac', glow: 'rgba(134,239,172,0.2)', grad: 'linear-gradient(135deg,rgba(134,239,172,0.15) 0%,rgba(134,239,172,0.03) 100%)', border: 'rgba(134,239,172,0.3)' },
                  { href: '/companion',         label: 'AI Companion',         desc: 'Empathetic AI, available 24/7',   emoji: '🤖', color: '#99f6e4', glow: 'rgba(153,246,228,0.2)', grad: 'linear-gradient(135deg,rgba(153,246,228,0.15) 0%,rgba(153,246,228,0.03) 100%)', border: 'rgba(153,246,228,0.3)' },
                  { href: '/mood-tracker',      label: 'Mood Tracker',         desc: 'Log & visualise your journey',    emoji: '💭', color: '#f9a8d4', glow: 'rgba(249,168,212,0.2)', grad: 'linear-gradient(135deg,rgba(249,168,212,0.15) 0%,rgba(249,168,212,0.03) 100%)', border: 'rgba(249,168,212,0.3)' },
                  { href: '/relaxation',        label: 'Relaxation Room',      desc: 'Breathe, read, and unwind',       emoji: '🧘', color: '#fde047', glow: 'rgba(253,224,71,0.2)',  grad: 'linear-gradient(135deg,rgba(253,224,71,0.15) 0%,rgba(253,224,71,0.03) 100%)',  border: 'rgba(253,224,71,0.3)' },
                  { href: '/games',             label: 'Relax Games',          desc: 'Calm your mind through play',     emoji: '🎮', color: '#c4b5fd', glow: 'rgba(196,181,253,0.2)', grad: 'linear-gradient(135deg,rgba(196,181,253,0.15) 0%,rgba(196,181,253,0.03) 100%)', border: 'rgba(196,181,253,0.3)' },
                  { href: '/relaxation/books',  label: 'Curated Library',      desc: 'Timeless wisdom, curated',        emoji: '📚', color: '#fdba74', glow: 'rgba(253,186,116,0.2)', grad: 'linear-gradient(135deg,rgba(253,186,116,0.15) 0%,rgba(253,186,116,0.03) 100%)', border: 'rgba(253,186,116,0.3)' },
                  { href: '/community',         label: 'Community',            desc: 'Share stories, find strength',    emoji: '🌍', color: '#67e8f9', glow: 'rgba(103,232,249,0.2)', grad: 'linear-gradient(135deg,rgba(103,232,249,0.15) 0%,rgba(103,232,249,0.03) 100%)', border: 'rgba(103,232,249,0.3)' },
                  { href: '/charity',           label: 'Our Cause',            desc: 'Support the global mission',      emoji: '🕊️', color: '#a3e635', glow: 'rgba(163,230,53,0.2)',  grad: 'linear-gradient(135deg,rgba(163,230,53,0.15) 0%,rgba(163,230,53,0.03) 100%)',  border: 'rgba(163,230,53,0.3)' },
                ].map((a, i) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    style={{ textDecoration: 'none', display: 'flex', animation: `dsk-up 0.45s ease both`, animationDelay: `${i * 50}ms` }}
                  >
                    <div
                      className="dsk-card"
                      style={{
                        '--dc-glow':   a.glow,
                        '--dc-grad':   a.grad,
                        '--dc-border': a.border,
                        '--dc-color':  a.color,
                      } as React.CSSProperties}
                    >
                      <div className="dsk-card-wash" />
                      <div className="dsk-card-corner" style={{ background: a.glow }} />

                      <div className="dsk-card-top">
                        <span className="dsk-card-emoji">{a.emoji}</span>
                        <span className="dsk-card-arrow" style={{ color: a.color }}>→</span>
                      </div>
                      <div className="dsk-card-label">{a.label}</div>
                      <div className="dsk-card-desc">{a.desc}</div>
                      <div className="dsk-card-line" style={{ background: a.color }} />
                    </div>
                  </Link>
                ))}
              </div>

              <style>{`
                @keyframes dsk-up {
                  from { opacity: 0; transform: translateY(16px); }
                  to   { opacity: 1; transform: translateY(0); }
                }

                /* Hero */
                .dsk-hero {
                  position: relative;
                  border-radius: 2rem;
                  padding: 2.25rem 2.5rem;
                  margin-bottom: 1.5rem;
                  overflow: hidden;
                  background: var(--echo-glass-bg);
                  border: 1px solid var(--echo-border);
                  backdrop-filter: blur(24px);
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 2rem;
                  flex-wrap: wrap;
                }

                .dsk-hero-orb {
                  position: absolute;
                  border-radius: 50%;
                  pointer-events: none;
                }
                .dsk-orb-1 {
                  top: -80px; left: -80px;
                  width: 280px; height: 280px;
                  background: radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%);
                }
                .dsk-orb-2 {
                  bottom: -60px; right: 30%;
                  width: 220px; height: 220px;
                  background: radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%);
                }
                .dsk-orb-3 {
                  top: -50px; right: -50px;
                  width: 200px; height: 200px;
                  background: radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%);
                }

                .dsk-hero-left { position: relative; z-index: 1; }

                .dsk-badge {
                  display: inline-flex;
                  align-items: center;
                  padding: 0.3rem 0.9rem;
                  border-radius: 999px;
                  background: var(--echo-primary-low);
                  border: 1px solid rgba(245,158,11,0.3);
                  color: var(--echo-primary-light);
                  font-size: 0.7rem;
                  font-weight: 700;
                  letter-spacing: 0.05em;
                  text-transform: uppercase;
                  margin-bottom: 0.875rem;
                }

                .dsk-hero-title {
                  font-size: clamp(1.75rem, 3vw, 2.5rem);
                  font-weight: 900;
                  letter-spacing: -0.04em;
                  line-height: 1.1;
                  color: var(--echo-text);
                  margin-bottom: 0.5rem;
                }

                .dsk-hero-sub {
                  color: var(--echo-text-muted);
                  font-size: 1rem;
                  font-weight: 500;
                }

                /* Stats */
                .dsk-stats {
                  display: flex;
                  gap: 0.875rem;
                  flex-wrap: wrap;
                  position: relative;
                  z-index: 1;
                }

                .dsk-stat {
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                  padding: 0.875rem 1.375rem;
                  border-radius: 1.25rem;
                  backdrop-filter: blur(12px);
                }

                .dsk-stat-emoji { font-size: 1.5rem; }

                .dsk-stat-val {
                  font-size: 1.5rem;
                  font-weight: 900;
                  line-height: 1;
                }

                .dsk-stat-lbl {
                  font-size: 0.6875rem;
                  color: var(--echo-text-muted);
                  text-transform: uppercase;
                  letter-spacing: 0.07em;
                  margin-top: 0.125rem;
                }

                /* Mood banner */
                .dsk-mood {
                  position: relative;
                  border-radius: 1.5rem;
                  border: 1px solid;
                  padding: 1.25rem 1.75rem;
                  margin-bottom: 1.5rem;
                  display: flex;
                  align-items: center;
                  gap: 1.25rem;
                  overflow: hidden;
                  backdrop-filter: blur(20px);
                  cursor: pointer;
                  transition: transform 0.28s cubic-bezier(0.23,1,0.32,1), box-shadow 0.28s ease;
                }

                .dsk-mood:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }

                .dsk-mood-orb {
                  position: absolute;
                  top: -40px; right: -40px;
                  width: 160px; height: 160px;
                  border-radius: 50%;
                  pointer-events: none;
                }

                .dsk-mood-emoji { font-size: 2.75rem; flex-shrink: 0; position: relative; z-index: 1; }

                .dsk-mood-info { position: relative; z-index: 1; }

                .dsk-mood-eyebrow {
                  font-size: 0.6875rem;
                  text-transform: uppercase;
                  letter-spacing: 0.07em;
                  color: var(--echo-text-muted);
                  font-weight: 600;
                  margin-bottom: 0.2rem;
                }

                .dsk-mood-name { font-size: 1.375rem; font-weight: 800; }

                .dsk-mood-score-wrap { margin-left: auto; line-height: 1; position: relative; z-index: 1; }
                .dsk-mood-score { font-size: 2.25rem; font-weight: 900; }
                .dsk-mood-denom { font-size: 1rem; color: var(--echo-text-muted); font-weight: 500; }

                .dsk-mood-btn {
                  position: relative; z-index: 1;
                  background: transparent;
                  border: 1px solid;
                  border-radius: 999px;
                  padding: 0.45rem 1.125rem;
                  font-size: 0.8125rem;
                  font-weight: 700;
                  cursor: pointer;
                  white-space: nowrap;
                  transition: background 0.2s, transform 0.2s;
                  font-family: var(--font-inter);
                }
                .dsk-mood-btn:hover { background: rgba(255,255,255,0.07); transform: translateX(2px); }

                /* Grid */
                .dsk-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 1.125rem;
                }

                /* Card */
                .dsk-card {
                  width: 100%;
                  position: relative;
                  border-radius: 1.5rem;
                  padding: 1.375rem 1.25rem;
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                  cursor: pointer;
                  background: var(--echo-glass-bg);
                  border: 1px solid var(--dc-border, var(--echo-border));
                  backdrop-filter: blur(20px);
                  transition: transform 0.28s cubic-bezier(0.23,1,0.32,1),
                              box-shadow 0.28s ease,
                              border-color 0.2s;
                }

                .dsk-card:hover {
                  transform: translateY(-6px) scale(1.02);
                  border-color: var(--dc-color, var(--echo-primary));
                  box-shadow: 0 18px 44px var(--dc-glow, rgba(0,0,0,0.15));
                }

                .dsk-card:active { transform: scale(0.97); }

                .dsk-card-wash {
                  position: absolute; inset: 0;
                  background: var(--dc-grad, transparent);
                  border-radius: inherit;
                  pointer-events: none; z-index: 0;
                  opacity: 0.9;
                  transition: opacity 0.3s;
                }
                .dsk-card:hover .dsk-card-wash { opacity: 1; }

                .dsk-card-corner {
                  position: absolute;
                  bottom: -20px; right: -20px;
                  width: 90px; height: 90px;
                  border-radius: 50%;
                  filter: blur(22px);
                  pointer-events: none; z-index: 0;
                  transition: transform 0.3s ease;
                }
                .dsk-card:hover .dsk-card-corner { transform: scale(1.4); }

                .dsk-card-top {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  position: relative; z-index: 1;
                  margin-bottom: 0.25rem;
                }

                .dsk-card-emoji { font-size: 1.75rem; line-height: 1; }

                .dsk-card-arrow {
                  font-size: 1.125rem;
                  font-weight: 800;
                  opacity: 0;
                  transform: translateX(-5px);
                  transition: opacity 0.2s, transform 0.2s;
                }
                .dsk-card:hover .dsk-card-arrow { opacity: 1; transform: translateX(0); }

                .dsk-card-label {
                  font-size: 1rem;
                  font-weight: 700;
                  color: var(--echo-text);
                  line-height: 1.2;
                  position: relative; z-index: 1;
                }

                .dsk-card-desc {
                  font-size: 0.78rem;
                  color: var(--echo-text-muted);
                  line-height: 1.5;
                  position: relative; z-index: 1;
                }

                .dsk-card-line {
                  position: absolute;
                  bottom: 0; left: 0; right: 0;
                  height: 2.5px;
                  border-radius: 0 0 1.5rem 1.5rem;
                  opacity: 0.5;
                  transform: scaleX(0.3);
                  transform-origin: left;
                  transition: transform 0.3s ease, opacity 0.3s;
                }
                .dsk-card:hover .dsk-card-line { transform: scaleX(1); opacity: 1; }
              `}</style>
            </div>

            <style>{`
              /* Tablet range: 769px – 1024px */
              .show-tablet { display: none !important; }
              .hide-tablet { display: block !important; }

              @media (min-width: 769px) and (max-width: 1024px) {
                .show-tablet { display: block !important; }
                .hide-tablet { display: none !important; }
              }

              /* hide-tablet on mobile still hides */
              @media (max-width: 768px) {
                .hide-tablet { display: none !important; }
              }
            `}</style>
          </>
        )}


        {tab === 'tasks' && (
          <div className="animate-fade-in-up">
            <h1 className="section-heading">✅ My Tasks</h1>
            {tasks.length === 0 ? (
              <div className="echo-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <p style={{ color: 'var(--echo-text-muted)' }}>No tasks assigned yet. Connect with a volunteer to get started!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.map((task: Record<string, unknown>) => (
                  <div key={task._id as string} className="echo-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: '600' }}>{task.title as string}</h3>
                      <span className={`badge badge-${task.status === 'completed' ? 'green' : task.status === 'in-progress' ? 'yellow' : 'purple'}`}>
                        {task.status as string}
                      </span>
                    </div>
                    <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{task.description as string}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {task.status !== 'completed' && (
                        <>
                          {task.status === 'pending' && (
                            <button className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem' }} onClick={() => updateTask(task._id as string, 'in-progress')}>
                              Start Task
                            </button>
                          )}
                          <button className="btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem' }} onClick={() => updateTask(task._id as string, 'completed')}>
                            Mark Complete
                          </button>
                        </>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', marginTop: '0.75rem' }}>
                      Assigned by: {task.assignerName as string}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'mood-history' && (
          <div className="animate-fade-in-up">
            <h1 className="section-heading">📊 Mood History</h1>
            {moodLogs.length === 0 ? (
              <div className="echo-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <p style={{ color: 'var(--echo-text-muted)' }}>No mood checks yet.</p>
                <Link href="/mood-tracker"><button className="btn-primary" style={{ marginTop: '1rem' }}>Take Mood Check</button></Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {moodLogs.map((log: Record<string, unknown>) => (
                  <div key={log._id as string} className="echo-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.75rem' }}>
                          {log.detectedMood === 'Radiant' ? '😊' : log.detectedMood === 'Calm' ? '😌' : log.detectedMood === 'Neutral' ? '😐' : log.detectedMood === 'Uneasy' ? '😟' : '😢'}
                        </span>
                        <div>
                          <div style={{ fontWeight: '700', color: moodColors[log.detectedMood as string] || 'var(--echo-text)' }}>{log.detectedMood as string}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>Score: {(log.moodScore as number)?.toFixed(1)}/10</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>
                        {new Date(log.createdAt as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div className="animate-fade-in-up">
            <h1 className="section-heading">👤 My Profile</h1>
            <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="echo-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  {clerkUser?.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={clerkUser.imageUrl} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid var(--echo-primary)' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: '700' }}>{dbUser?.name as string}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>{dbUser?.email as string}</div>
                  </div>
                </div>

                <label className="echo-label">Display Name</label>
                <input className="echo-input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" style={{ marginBottom: '1rem' }} />

                <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ width: '100%' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>



              <div className="echo-card" style={{ border: '1px solid var(--echo-border)', background: 'var(--echo-danger-low)' }}>
                <div style={{ fontWeight: '700', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>⚠️ Danger Zone</div>
                <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Permanently delete your account and all data.</p>
                <button className="btn-danger" onClick={deleteAccount} style={{ width: '100%' }}>Delete Account</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </>
  );
}

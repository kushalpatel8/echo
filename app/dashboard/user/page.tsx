'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import MobileDashboard from '@/components/MobileDashboard';

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
          <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>{(dbUser?.name as string) || clerkUser?.firstName}</div>
          <div style={{ fontSize: '0.75rem' }}>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%', marginBottom: '0.5rem' }}>
              <span>🏠</span>
              <span>Home</span>
            </button>
          </Link>
          <div style={{ height: '1px', background: 'var(--echo-border)', margin: '0.5rem 0' }} />
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

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--echo-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          <Link href="/companion" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%'}}>🤖 AI Companion</button>
          </Link>
          <Link href="/volunteers" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%'}}>🙏 Find Help</button>
          </Link>
          <Link href="/relaxation" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%'}}>🧘 Relaxation</button>
          </Link>
          <Link href="/mood-tracker" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%'}}>📝 Mood Tracker</button>
          </Link>
          <Link href="/games" style={{ textDecoration: 'none' }}>
            <button className="sidebar-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>🎮 Relax Games</button>
          </Link>
        </div>
        <SignOutButton>
          <button className="btn-danger" style={{ width: '100%', padding: '0.6rem', fontSize: '0.8125rem' }}>Sign Out</button>
        </SignOutButton>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 'clamp(1rem, 5vw, 2rem)', overflowY: 'auto', minWidth: 0 }}>
        {/* Mobile Header */}
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
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', textAlign: 'center' }}>Dashboard</h2>
          <div style={{ width: '40px' }} /> {/* Spacer to center the title */}
        </div>
        {tab === 'overview' && (
          <>
            {/* Mobile-only view */}
            <div className="show-mobile animate-fade-in-up">
              <MobileDashboard />
            </div>

            {/* Desktop-only view */}
            <div className="hide-mobile animate-fade-in-up">
              <h1 className="section-heading">Welcome back, {(dbUser?.name as string)?.split(' ')[0] || 'Friend'} 👋</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Tasks Pending', value: tasks.filter((t: Record<string, unknown>) => t.status === 'pending').length, icon: '⏳', color: '#f59e0b' },
                  { label: 'Tasks Completed', value: tasks.filter((t: Record<string, unknown>) => t.status === 'completed').length, icon: '✅', color: '#22c55e' },
                  { label: 'Mood Checks', value: moodLogs.length, icon: '💭', color: '#a78bfa' },
                ].map(stat => (
                  <div key={stat.label} className="echo-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Mood */}
              {moodLogs[0] && (
                <div className="echo-card" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--echo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Mood Check</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>
                      {(moodLogs[0] as Record<string, unknown>).detectedMood === 'Radiant' ? '😊' :
                       (moodLogs[0] as Record<string, unknown>).detectedMood === 'Calm' ? '😌' :
                       (moodLogs[0] as Record<string, unknown>).detectedMood === 'Neutral' ? '😐' :
                       (moodLogs[0] as Record<string, unknown>).detectedMood === 'Uneasy' ? '😟' :
                       (moodLogs[0] as Record<string, unknown>).detectedMood === 'Distressed' ? '😰' : '😢'}
                    </span>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.25rem', color: moodColors[(moodLogs[0] as Record<string, unknown>).detectedMood as string] || 'var(--echo-text)' }}>
                        {(moodLogs[0] as Record<string, unknown>).detectedMood as string}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>Score: {((moodLogs[0] as Record<string, unknown>).moodScore as number)?.toFixed(1)}/10</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {[
                  { href: '/companion', label: 'Chat with AI', icon: '🤖' },
                  { href: '/volunteers', label: 'Find Support', icon: '🙏' },
                  { href: '/mood-tracker', label: 'Check Mood', icon: '📝' },
                  { href: '/relaxation', label: 'Relax Now', icon: '🧘' },
                  { href: '/games', label: 'Relax Games', icon: '🎮' },
                ].map(action => (
                  <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
                    <div className="echo-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{action.icon}</div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{action.label}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
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
  );
}

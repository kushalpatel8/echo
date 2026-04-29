'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

type Tab = 'overview' | 'chats' | 'tasks' | 'profile';

export default function VolunteerDashboard() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [dbUser, setDbUser] = useState<Record<string, unknown> | null>(null);
  const [chats, setChats] = useState<Record<string, unknown>[]>([]);
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeId: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (d.user) {
        if (d.user.role !== 'volunteer' && d.user.role !== 'doctor') {
          router.push('/dashboard');
          return;
        }
        setDbUser(d.user);
        setEditName(d.user.name);
      } else {
        router.push('/role-selection');
      }
    });
    fetch('/api/chat').then(r => r.json()).then(d => setChats(d.chats || []));
    fetch('/api/tasks').then(r => r.json()).then(d => setTasks(d.tasks || []));
  }, [router]);

  const createTask = async () => {
    if (!newTask.title || !newTask.assigneeId) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
    const data = await res.json();
    if (data.task) {
      setTasks(prev => [data.task, ...prev]);
      setNewTask({ title: '', description: '', assigneeId: '' });
    }
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

  const appStatus = dbUser?.applicationStatus;
  const sidebarItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'chats', icon: '💬', label: 'User Chats' },
    { id: 'tasks', icon: '📋', label: 'Assign Tasks' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

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
          <span className={`badge badge-${appStatus === 'approved' ? 'green' : appStatus === 'pending' ? 'yellow' : 'red'}`}>
            {dbUser?.role === 'doctor' ? '👨‍⚕️ Doctor' : '🤝 Volunteer'} · {appStatus as string || 'pending'}
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
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setIsSidebarOpen(false); }} className={`sidebar-link ${tab === item.id ? 'active' : ''}`} style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%' }}>
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
            <h2 style={{ fontSize: '1.125rem', fontWeight: '800', textAlign: 'center', margin: 0 }}>Volunteer Hub</h2>
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
        {/* Pending Application Banner */}
        {appStatus === 'pending' && (
          <div style={{ padding: '1rem 1.5rem', borderRadius: '0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>⏳</span>
            <span style={{ color: '#fde047', fontSize: '0.875rem' }}>Your application is under review. You'll be able to help users once approved by admin.</span>
          </div>
        )}

        {/* Mobile Navigation Grid */}
        <div className="show-mobile animate-fade-in-up" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              { id: 'overview', icon: '📊', label: 'Overview' },
              { id: 'chats', icon: '💬', label: 'User Chats', badge: chats.filter((c: any) => c.isActive).length },
              { id: 'tasks', icon: '📋', label: 'Assign Tasks', badge: tasks.length },
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
            <h1 className="section-heading hide-mobile">Volunteer Dashboard 🤝</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Active Chats', value: chats.filter((c: Record<string, unknown>) => c.isActive).length, icon: '💬', color: '#a78bfa' },
                { label: 'Tasks Created', value: tasks.length, icon: '📋', color: '#22c55e' },
                { label: 'Rating', value: `${(dbUser?.volunteerProfile as Record<string, unknown>)?.rating || 0}/5 ⭐`, icon: '⭐', color: '#fbbf24' },
                { label: 'Status', value: appStatus as string || 'Pending', icon: '🔄', color: appStatus === 'approved' ? '#22c55e' : '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} className="echo-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'chats' && (
          <div className="animate-fade-in-up">
            <h1 className="section-heading">💬 User Chats</h1>
            {chats.length === 0 ? (
              <div className="echo-card" style={{ textAlign: 'center', padding: '3rem' }}>
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
                        <div className="echo-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingRight: '3.5rem' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>
                            {otherName[0]}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{otherName}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {lastMsg ? (lastMsg.content as string) : 'No messages yet'}
                            </div>
                          </div>
                          <span className={`status-dot ${chat.isActive ? 'online' : 'offline'}`} />
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

        {tab === 'tasks' && (
          <div className="animate-fade-in-up">
            <h1 className="section-heading">📋 Assign Tasks</h1>
            <div className="echo-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Create New Task</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="echo-label">Task Title</label>
                  <input className="echo-input" placeholder="e.g., Daily journaling" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="echo-label">Description</label>
                  <textarea className="echo-input" placeholder="Describe the task..." value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} style={{ minHeight: '80px' }} />
                </div>
                <div>
                  <label className="echo-label">User Clerk ID</label>
                  <input className="echo-input" placeholder="Enter the user's Clerk ID" value={newTask.assigneeId} onChange={e => setNewTask(p => ({ ...p, assigneeId: e.target.value }))} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', marginTop: '0.25rem' }}>Found in the chat window of the user.</p>
                </div>
                <button className="btn-primary" onClick={createTask}>Assign Task</button>
              </div>
            </div>

            {tasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.map((task: Record<string, unknown>) => (
                  <div key={task._id as string} className="echo-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{task.title as string}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>{task.description as string}</div>
                      </div>
                      <span className={`badge badge-${task.status === 'completed' ? 'green' : task.status === 'in-progress' ? 'yellow' : 'purple'}`}>{task.status as string}</span>
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

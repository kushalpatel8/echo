'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

type Tab = 'applications' | 'users' | 'volunteers' | 'doctors';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('applications');
  const [dbUser, setDbUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (d.user?.role !== 'admin') { router.push('/dashboard'); return; }
      setDbUser(d.user);
    });
    loadApplications();
  }, [router]);

  const loadApplications = () => {
    fetch('/api/admin').then(r => r.json()).then(d => setApplications(d.applications || []));
  };

  const loadUsers = (role?: string) => {
    const url = role ? `/api/admin/users?role=${role}` : '/api/admin/users';
    fetch(url).then(r => r.json()).then(d => setUsers(d.users || []));
  };

  useEffect(() => {
    if (tab === 'users') loadUsers('user');
    else if (tab === 'volunteers') loadUsers('volunteer');
    else if (tab === 'doctors') loadUsers('doctor');
    else loadApplications();
  }, [tab]);

  const adminAction = async (targetUserId: string, action: string) => {
    setLoading(true);
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, action }),
    });
    // Refresh list
    if (tab === 'applications') loadApplications();
    else if (tab === 'users') loadUsers('user');
    else if (tab === 'volunteers') loadUsers('volunteer');
    else if (tab === 'doctors') loadUsers('doctor');
    setLoading(false);
  };

  const sidebarItems = [
    { id: 'applications', icon: '📋', label: 'Applications', badge: applications.length },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'volunteers', icon: '🤝', label: 'Volunteers' },
    { id: 'doctors', icon: '👨‍⚕️', label: 'Doctors' },
  ];

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
          <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>{dbUser?.name || 'Admin'}</div>
          <span className="badge badge-yellow">Admin Panel</span>
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
              onClick={() => { setTab(item.id as Tab); setIsSidebarOpen(false); }} 
              className={`sidebar-link ${tab === item.id ? 'active' : ''}`} 
              style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{ background: '#7c3aed', color: 'white', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: '700' }}>{item.badge}</span>
              )}
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
            <h2 style={{ fontSize: '1.125rem', fontWeight: '800', textAlign: 'center', margin: 0 }}>Admin Panel</h2>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                cursor: 'pointer',
                color: 'var(--echo-text)'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--echo-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--echo-surface)' }}>
                ☰
              </div>
            </button>
          </div>
        </div>
        {/* Mobile Navigation Grid */}
        <div className="show-mobile animate-fade-in-up" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {sidebarItems.map(item => (
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

        {tab === 'applications' && (
          <div className="animate-fade-in-up">
            <h1 className="section-heading hide-mobile">📋 Pending Applications</h1>
            {applications.length === 0 ? (
              <div className="echo-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <p style={{ color: 'var(--echo-text-muted)' }}>No pending applications. All caught up!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.map((app: any) => {
                  const profile = app.role === 'doctor' ? app.doctorProfile : app.volunteerProfile;
                  return (
                    <div key={app._id} className="echo-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '1rem' }}>{app.name}</span>
                            <span className={`badge badge-${app.role === 'doctor' ? 'cyan' : 'purple'}`}>{app.role}</span>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>{app.email}</div>
                        </div>
                      </div>
                      {profile && (
                        <div style={{ background: 'var(--echo-surface-2)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>📞 Phone:</strong> <span style={{ color: 'var(--echo-text-muted)' }}>{profile.phoneNo}</span>
                          </div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>💬 Reason:</strong> <span style={{ color: 'var(--echo-text-muted)' }}>{profile.whyVolunteer || profile.whyDoctor}</span>
                          </div>
                          {profile.degree && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>🎓 Degree:</strong> <span style={{ color: 'var(--echo-text-muted)' }}>{profile.degree}</span>
                            </div>
                          )}
                          {profile.experience && (
                            <div>
                              <strong>💼 Experience:</strong> <span style={{ color: 'var(--echo-text-muted)' }}>{profile.experience}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', background: 'linear-gradient(135deg, #16a34a, #15803d)' }} onClick={() => adminAction(app._id, 'approve')} disabled={loading}>
                          ✓ Approve
                        </button>
                        <button className="btn-danger" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }} onClick={() => adminAction(app._id, 'reject')} disabled={loading}>
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(tab === 'users' || tab === 'volunteers' || tab === 'doctors') && (
          <div className="animate-fade-in-up" key={tab}>
            <h1 className="section-heading">
              {tab === 'users' ? '👥 All Users' : tab === 'volunteers' ? '🤝 All Volunteers' : '👨‍⚕️ All Doctors'}
            </h1>
            {users.length === 0 ? (
              <div className="echo-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--echo-text-muted)' }}>No {tab} found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {users.map((u: any) => (
                  <div key={u._id} className="echo-card animate-fade-in-up">
                    <div className="flex-mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: (tab === 'volunteers' || tab === 'doctors') ? '1rem' : '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                          {(u.name)?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                            {u.name}
                            {u.isBanned && <span className="badge badge-red">Banned</span>}
                            {u.applicationStatus && <span className={`badge badge-${u.applicationStatus === 'approved' ? 'green' : u.applicationStatus === 'pending' ? 'yellow' : 'red'}`}>{u.applicationStatus}</span>}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                      <div className="admin-actions-mobile" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>
                        {u.isBanned ? (
                          <button className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem', borderRadius: '8px' }} onClick={() => adminAction(u._id, 'unban')} disabled={loading}>
                            Unban
                          </button>
                        ) : (
                          <button className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem', borderRadius: '8px' }} onClick={() => adminAction(u._id, 'ban')} disabled={loading}>
                            Ban
                          </button>
                        )}
                        <button className="btn-danger" style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem', borderRadius: '8px' }} onClick={() => adminAction(u._id, 'delete')} disabled={loading}>
                          Delete
                        </button>
                      </div>
                    </div>

                    {(tab === 'volunteers' || tab === 'doctors') && (
                      <div style={{ 
                        background: 'var(--echo-surface-2)', 
                        borderRadius: '12px', 
                        padding: '1.25rem', 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '1.25rem',
                        border: '1px solid var(--echo-border)',
                        marginTop: '0.5rem'
                      }}>
                        {u[tab === 'volunteers' ? 'volunteerProfile' : 'doctorProfile'] ? (
                          <>
                            <div>
                              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>📞 Phone Number</div>
                              <div style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{u[tab === 'volunteers' ? 'volunteerProfile' : 'doctorProfile'].phoneNo || 'Not provided'}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>💬 WhatsApp</div>
                              <div style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{u[tab === 'volunteers' ? 'volunteerProfile' : 'doctorProfile'].whatsappNumber || 'Not provided'}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>🎓 Degree</div>
                              <div style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{u[tab === 'volunteers' ? 'volunteerProfile' : 'doctorProfile'].degree || 'Not provided'}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--echo-text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>💼 Experience</div>
                              <div style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{u[tab === 'volunteers' ? 'volunteerProfile' : 'doctorProfile'].experience || 'None listed'}</div>
                            </div>
                          </>
                        ) : (
                          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>
                            Profile details not available.
                          </div>
                        )}
                      </div>
                    )}
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

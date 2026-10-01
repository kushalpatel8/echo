'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import BackButton from '@/components/BackButton';
import ThemeToggle from '@/components/ThemeToggle';
import { Heart, Sparkles, MessageSquare, Search, X, Users, Radio, Bookmark } from 'lucide-react';
import { formatName } from '@/lib/utils';

interface Helper {
  clerkId: string;
  name: string;
  imageUrl: string;
  role: 'volunteer' | 'doctor';
  volunteerProfile: {
    rating: number;
    totalRatings: number;
    experience: string;
  };
  doctorProfile?: {
    degree: string;
  };
  isOnline?: boolean;
}

type ThemeKey = 'celestial' | 'forest' | 'sunset' | 'ocean' | 'aurora';
type StatusFilter = 'all' | 'online' | 'offline' | 'saved';

const THEMES: Record<ThemeKey, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
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

function AmbientSelector({ activeTheme, setActiveTheme }: { activeTheme: ThemeKey; setActiveTheme: (k: ThemeKey) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--echo-surface-2)', padding: '0.35rem 0.5rem', borderRadius: '999px', border: '1px solid var(--echo-border)' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--echo-text-muted)', paddingLeft: '0.5rem' }}>Mood:</span>
      {(Object.keys(THEMES) as ThemeKey[]).map(key => {
        const t = THEMES[key];
        const isSel = activeTheme === key;
        const isExtra = key === 'ocean' || key === 'aurora';
        return (
          <button key={key} onClick={() => setActiveTheme(key)} className={isExtra ? 'hide-mobile' : ''} style={{
            padding: '0.35rem 0.75rem', borderRadius: '999px', border: 'none',
            background: isSel ? t.primary : 'transparent', color: isSel ? '#fff' : 'var(--echo-text-muted)',
            fontSize: '0.75rem', fontWeight: isSel ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s ease',
          }}>
            {t.name.split(' ')[0]} {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

export default function VolunteersListPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [savedVolunteerId, setSavedVolunteerId] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('celestial');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentTheme = THEMES[activeTheme];

  useEffect(() => {
    const loadVolunteers = () => {
      fetch(`/api/volunteers?type=volunteer`)
        .then(r => r.json())
        .then(data => {
          setHelpers(data.helpers || []);
          setSavedVolunteerId(data.savedVolunteer || null);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    setLoading(true);
    loadVolunteers();

    // Poll every 15s to keep live online status fresh
    const interval = setInterval(loadVolunteers, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleBookmark = async (targetId: string) => {
    setSaveLoading(true);
    const action = savedVolunteerId === targetId ? 'remove' : 'save';
    try {
      const res = await fetch('/api/volunteers/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, action })
      });
      if (res.ok) {
        setSavedVolunteerId(action === 'save' ? targetId : null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaveLoading(false);
    }
  };

  const startChat = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', targetUserId }),
      });
      const data = await res.json();
      if (res.ok && data.chat) {
        router.push(`/chat/${data.chat._id}`);
      } else {
        alert(data.error || 'Unable to start chat. Please try again.');
      }
    } catch (err) {
      console.error('Chat creation failed:', err);
      alert('Network error. Please check your connection or sign in again.');
    }
  };

  const onlineCount = helpers.filter(h => h.isOnline).length;
  const offlineCount = helpers.filter(h => !h.isOnline).length;
  const savedCount = helpers.filter(h => h.clerkId === savedVolunteerId).length;

  const filteredHelpers = helpers.filter(helper => {
    if (statusFilter === 'online' && !helper.isOnline) return false;
    if (statusFilter === 'offline' && helper.isOnline) return false;
    if (statusFilter === 'saved' && helper.clerkId !== savedVolunteerId) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (helper.name || '').toLowerCase().includes(q);
      const expMatch = (helper.volunteerProfile?.experience || '').toLowerCase().includes(q);
      if (!nameMatch && !expMatch) return false;
    }
    return true;
  });

  if (!userLoaded) return <div style={{ minHeight: '100vh', background: 'var(--echo-bg)' }} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', color: 'var(--echo-text)', position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        .volunteers-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--echo-border);
          background: var(--echo-surface);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .volunteers-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .volunteers-logo-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .volunteers-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-tab-btn {
          padding: 0.5rem 1rem;
          border-radius: 999px;
          border: 1px solid var(--echo-border);
          background: var(--echo-surface);
          color: var(--echo-text-muted);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          white-space: nowrap;
        }

        .filter-tab-btn.active {
          background: var(--echo-primary);
          color: #ffffff;
          border-color: var(--echo-primary);
          box-shadow: 0 4px 12px var(--echo-primary-low);
        }

        .filter-tab-btn:hover:not(.active) {
          background: var(--echo-surface-2);
          color: var(--echo-text);
        }

        @media (max-width: 640px) {
          .volunteers-header {
            flex-direction: column;
            align-items: center;
            padding: 0.75rem 1rem;
            gap: 0.75rem;
          }

          .volunteers-header-left {
            width: 100%;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .volunteers-back-container {
            display: none !important;
          }

          .volunteers-logo-wrapper {
            justify-content: center;
            width: 100%;
          }

          .volunteers-header-right {
            width: 100%;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }

          .volunteers-theme-selector {
            width: 100%;
            display: flex;
            justify-content: center;
          }
        }
      `}</style>

      {/* Dynamic Ambient Background Glow */}
      <div style={{ position: 'fixed', inset: 0, background: currentTheme.bgGrad, pointerEvents: 'none', zIndex: 0, transition: 'background 1s ease' }} />

      {/* Sticky Header */}
      <header className="volunteers-header">
        <div className="volunteers-header-left">
          <div className="volunteers-back-container">
            <BackButton />
          </div>
          <div className="volunteers-logo-wrapper hide-desktop">
            <Heart size={24} style={{ color: currentTheme.primary }} />
            <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--echo-text)' }}>
              Peer Support
            </span>
          </div>
        </div>

        <div className="volunteers-header-right">
          <div className="volunteers-theme-selector">
            <AmbientSelector activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="page-container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5rem' }}>

        {/* Hero Welcome Banner */}
        <div className="glass hide-mobile" style={{
          padding: '2.5rem', borderRadius: '28px',
          border: '1px solid var(--echo-border)', background: 'var(--echo-surface)',
          boxShadow: `0 25px 60px rgba(0,0,0,0.12), 0 0 40px ${currentTheme.glow}`,
          marginBottom: '2.5rem', position: 'relative', overflow: 'hidden',
          textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.12, filter: 'blur(35px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              <Heart size={14} /><span>Peer Support Community</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>
              All Compassionate Volunteers
            </h1>
            <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.0625rem', lineHeight: '1.6', margin: '0 auto 1.25rem', maxWidth: '600px' }}>
              Connect with certified peer support volunteers. Browse available helpers online now or send a message to receive support.
            </p>

            {/* Live Stats Pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'var(--echo-surface-2)', padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1px solid var(--echo-border)', fontSize: '0.8125rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#22c55e', fontWeight: '700' }}>
                <span className="status-dot online" style={{ width: '8px', height: '8px' }} />
                {onlineCount} Online Now
              </span>
              <span style={{ color: 'var(--echo-border)' }}>|</span>
              <span style={{ color: 'var(--echo-text-muted)', fontWeight: '600' }}>
                {offlineCount} Offline
              </span>
              <span style={{ color: 'var(--echo-border)' }}>|</span>
              <span style={{ color: 'var(--echo-text)', fontWeight: '700' }}>
                {helpers.length} Total Helpers
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            
            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className={`filter-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <Users size={14} />
                <span>All Volunteers ({helpers.length})</span>
              </button>

              <button
                type="button"
                className={`filter-tab-btn ${statusFilter === 'online' ? 'active' : ''}`}
                onClick={() => setStatusFilter('online')}
              >
                <span className="status-dot online" style={{ width: '7px', height: '7px' }} />
                <span>Online ({onlineCount})</span>
              </button>

              <button
                type="button"
                className={`filter-tab-btn ${statusFilter === 'offline' ? 'active' : ''}`}
                onClick={() => setStatusFilter('offline')}
              >
                <span className="status-dot offline" style={{ width: '7px', height: '7px' }} />
                <span>Offline ({offlineCount})</span>
              </button>

              {savedCount > 0 && (
                <button
                  type="button"
                  className={`filter-tab-btn ${statusFilter === 'saved' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('saved')}
                >
                  <Bookmark size={13} style={{ fill: 'currentColor' }} />
                  <span>Saved ({savedCount})</span>
                </button>
              )}
            </div>

            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--echo-surface)',
              border: '1px solid var(--echo-border)',
              borderRadius: '999px',
              padding: '0.45rem 1rem',
              minWidth: '240px',
              maxWidth: '100%',
            }}>
              <Search size={15} style={{ color: 'var(--echo-text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search volunteer by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--echo-text)',
                  fontSize: '0.8125rem',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--echo-text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Volunteers Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--echo-text-muted)' }}>Loading all volunteers...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}>
            {filteredHelpers.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }} className="glass echo-card">
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {statusFilter === 'online' ? 'No volunteers currently online' : 'No volunteers found'}
                </h3>
                <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  {statusFilter === 'online'
                    ? 'You can switch to "All Volunteers" to view and message offline helpers.'
                    : searchQuery
                    ? `No volunteers matching "${searchQuery}".`
                    : 'Please check back shortly.'}
                </p>
                {(statusFilter !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              filteredHelpers.map(helper => {
                const isSaved = savedVolunteerId === helper.clerkId;
                const isOnline = Boolean(helper.isOnline);

                return (
                  <div 
                    key={helper.clerkId} 
                    className="glass echo-card animate-fade-in-up"
                    style={{
                      padding: '1.75rem',
                      borderRadius: '24px',
                      background: 'var(--echo-surface)',
                      border: isOnline 
                        ? `1px solid ${currentTheme.primary}44` 
                        : '1px solid var(--echo-border)',
                      boxShadow: isOnline 
                        ? `0 10px 30px rgba(0,0,0,0.06), 0 0 20px ${currentTheme.primary}10` 
                        : '0 10px 30px rgba(0,0,0,0.04)',
                      transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease, border-color 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 15px 35px ${currentTheme.primary}18, 0 0 20px ${currentTheme.primary}12`;
                      (e.currentTarget as HTMLDivElement).style.borderColor = currentTheme.primary;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'none';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = isOnline 
                        ? `0 10px 30px rgba(0,0,0,0.06), 0 0 20px ${currentTheme.primary}10` 
                        : '0 10px 30px rgba(0,0,0,0.04)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = isOnline 
                        ? `${currentTheme.primary}44` 
                        : 'var(--echo-border)';
                    }}
                  >
                    <div>
                      {/* Card Header: Avatar, Name, Status, Bookmark */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div style={{ position: 'relative' }}>
                          <div style={{
                            width: '58px',
                            height: '58px',
                            borderRadius: '50%',
                            background: 'var(--echo-surface-2)',
                            overflow: 'hidden',
                            border: isOnline ? `2px solid #22c55e` : `2px solid var(--echo-border)`,
                            boxShadow: isOnline ? '0 0 12px rgba(34, 197, 94, 0.3)' : 'none',
                          }}>
                            {helper.imageUrl ? (
                              <img src={helper.imageUrl} alt={helper.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--echo-text-muted)' }}>
                                {helper.name?.[0] || 'V'}
                              </div>
                            )}
                          </div>
                          {/* Live Indicator Dot badge */}
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: isOnline ? '#22c55e' : '#64748b',
                              border: '2.5px solid var(--echo-surface)',
                              boxShadow: isOnline ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none',
                            }}
                            title={isOnline ? 'Online now' : 'Offline'}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                            <div style={{ fontWeight: '800', fontSize: '1.0625rem', color: 'var(--echo-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {formatName(helper.name, helper.role)}
                            </div>
                            <button 
                              onClick={() => toggleBookmark(helper.clerkId)}
                              disabled={saveLoading}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: isSaved ? '#ef4444' : 'var(--echo-text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0.25rem',
                                flexShrink: 0,
                              }}
                              title={isSaved ? "Remove bookmark" : "Bookmark this volunteer"}
                            >
                              <svg xmlns="http://www.svg.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.15rem 0.55rem',
                              borderRadius: '999px',
                              background: isOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(148, 163, 184, 0.1)',
                              border: isOnline ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                              color: isOnline ? '#22c55e' : 'var(--echo-text-muted)',
                              fontSize: '0.6875rem',
                              fontWeight: '700',
                              letterSpacing: '0.02em',
                            }}>
                              <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} style={{ width: '6px', height: '6px' }} />
                              {isOnline ? 'Online' : 'Offline'}
                            </span>

                            {isSaved && (
                              <span style={{
                                fontSize: '0.6875rem',
                                fontWeight: '700',
                                color: '#ef4444',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '999px',
                              }}>
                                ★ Saved
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ratings row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'var(--echo-surface-2)', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--echo-text-muted)', fontWeight: '600' }}>Certified Helper</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontWeight: '800', color: '#fbbf24' }}>⭐ {helper.volunteerProfile?.rating || 'New'}</span>
                          <span style={{ color: 'var(--echo-text-muted)' }}>({helper.volunteerProfile?.totalRatings || 0} chats)</span>
                        </div>
                      </div>

                      {/* Bio / Experience */}
                      <p style={{
                        fontSize: '0.875rem',
                        lineClamp: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        color: 'var(--echo-text-muted)',
                        marginBottom: '1.5rem',
                        height: '2.75rem',
                        lineHeight: '1.375rem',
                      }}>
                        {helper.volunteerProfile?.experience || 'Ready to listen and support you on your wellness journey with empathy and care.'}
                      </p>
                    </div>

                    {/* Chat CTA Button */}
                    <button
                      className={isOnline ? "btn-primary" : "btn-secondary"}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontWeight: '700',
                        fontSize: '0.875rem',
                      }}
                      onClick={() => startChat(helper.clerkId)}
                    >
                      <MessageSquare size={16} />
                      {isOnline ? 'Chat Now (Live)' : 'Send Message'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}

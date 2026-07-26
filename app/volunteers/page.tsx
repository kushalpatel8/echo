'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import BackButton from '@/components/BackButton';
import ThemeToggle from '@/components/ThemeToggle';
import { Heart, Sparkles, MessageSquare } from 'lucide-react';

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
}

type ThemeKey = 'celestial' | 'forest' | 'sunset';

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
};

function AmbientSelector({ activeTheme, setActiveTheme }: { activeTheme: ThemeKey; setActiveTheme: (k: ThemeKey) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--echo-surface-2)', padding: '0.35rem 0.5rem', borderRadius: '999px', border: '1px solid var(--echo-border)' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--echo-text-muted)', paddingLeft: '0.5rem' }}>Ambient:</span>
      {(Object.keys(THEMES) as ThemeKey[]).map(key => {
        const t = THEMES[key];
        const isSel = activeTheme === key;
        return (
          <button key={key} onClick={() => setActiveTheme(key)} style={{
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
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('celestial');

  const currentTheme = THEMES[activeTheme];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/volunteers?type=volunteer`)
      .then(r => r.json())
      .then(data => {
        setHelpers(data.helpers || []);
      })
      .finally(() => setLoading(false));
  }, []);

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
          <div className="volunteers-logo-wrapper">
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
          marginBottom: '3rem', position: 'relative', overflow: 'hidden',
          textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.12, filter: 'blur(35px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              <Heart size={14} /><span>Peer Support</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>
              Compassionate Peer Support
            </h1>
            <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.0625rem', lineHeight: '1.6', margin: '0 auto', maxWidth: '600px' }}>
              Talk to trained volunteers who are here to listen, support, and help you navigate your wellness journey with empathy and care.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--echo-text-muted)' }}>Connecting you with volunteers...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {helpers.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }} className="glass echo-card">
                <p style={{ color: 'var(--echo-text-muted)' }}>No volunteers currently available. Please check back shortly.</p>
              </div>
            ) : (
              helpers.map(helper => (
                <div 
                  key={helper.clerkId} 
                  className="glass echo-card animate-fade-in-up"
                  style={{
                    padding: '2rem',
                    borderRadius: '24px',
                    background: 'var(--echo-surface)',
                    border: '1px solid var(--echo-border)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                    transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease, border-color 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 15px 35px ${currentTheme.primary}18, 0 0 20px ${currentTheme.primary}12`;
                    (e.currentTarget as HTMLDivElement).style.borderColor = currentTheme.primary;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'none';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--echo-border)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--echo-border)', overflow: 'hidden', border: `2px solid ${currentTheme.primary}` }}>
                      {helper.imageUrl && <img src={helper.imageUrl} alt={helper.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--echo-text)' }}>{helper.name}</div>
                      <div style={{ color: 'var(--echo-text-muted)', fontSize: '0.8125rem' }}>
                        Certified Support Volunteer
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: '800', color: '#fbbf24' }}>⭐ {helper.volunteerProfile.rating || 'New'}</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--echo-text-muted)' }}>({helper.volunteerProfile.totalRatings || 0} chats)</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--echo-text-muted)', marginBottom: '1.5rem', height: '2.75rem', lineHeight: '1.375rem' }}>
                    {helper.volunteerProfile.experience || 'Ready to listen and support you on your wellness journey.'}
                  </p>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}
                    onClick={() => startChat(helper.clerkId)}
                  >
                    <MessageSquare size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Chat Now
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

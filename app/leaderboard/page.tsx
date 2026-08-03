'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';
import ThemeToggle from '@/components/ThemeToggle';
import BubbleLoader from '@/components/BubbleLoader';
import { Trophy, Star, Medal, Heart, Stethoscope, ChevronRight } from 'lucide-react';
import { formatName } from '@/lib/utils';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface LeaderboardUser {
  _id: string;
  clerkId: string;
  name: string;
  imageUrl: string;
  role: 'doctor' | 'volunteer';
  doctorProfile?: { rating: number; totalRatings: number; degree: string };
  volunteerProfile?: { rating: number; totalRatings: number };
}

type ThemeKey = 'celestial' | 'forest' | 'sunset' | 'ocean' | 'aurora';
const THEMES: Record<ThemeKey, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
  celestial: { name: '🌌 Celestial', primary: '#7c3aed', secondary: '#06b6d4', glow: 'rgba(124, 58, 237, 0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.12) 0%, transparent 60%)' },
  forest: { name: '🌲 Forest', primary: '#059669', secondary: '#10b981', glow: 'rgba(5, 150, 105, 0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(5, 150, 105, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.12) 0%, transparent 60%)' },
  sunset: { name: '🌅 Sunset', primary: '#f59e0b', secondary: '#e11d48', glow: 'rgba(245, 158, 11, 0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225, 29, 72, 0.12) 0%, transparent 60%)' },
  ocean: { name: '🌊 Ocean', primary: '#3b82f6', secondary: '#0ea5e9', glow: 'rgba(59, 130, 246, 0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(14, 165, 233, 0.12) 0%, transparent 60%)' },
  aurora: { name: '✨ Aurora', primary: '#a855f7', secondary: '#10b981', glow: 'rgba(168, 85, 247, 0.25)', bgGrad: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(10, 200, 120, 0.12) 0%, transparent 60%)' },
};

export default function LeaderboardPage() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<LeaderboardUser[]>([]);
  const [volunteers, setVolunteers] = useState<LeaderboardUser[]>([]);
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('celestial');
  const [activeTab, setActiveTab] = useState<'doctors' | 'volunteers'>('doctors');

  const currentTheme = THEMES[activeTheme];

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        setDoctors(data.doctors || []);
        setVolunteers(data.volunteers || []);
      })
      .catch(err => console.error('Failed to load leaderboard', err))
      .finally(() => setLoading(false));
  }, []);

  const getMedalColor = (index: number) => {
    if (index === 0) return '#fbbf24'; // Gold
    if (index === 1) return '#94a3b8'; // Silver
    if (index === 2) return '#b45309'; // Bronze
    return 'var(--echo-text-muted)';
  };

  const getRankIcon = (index: number) => {
    if (index < 3) return <Medal size={24} color={getMedalColor(index)} style={{ filter: `drop-shadow(0 2px 4px ${getMedalColor(index)}40)` }} />;
    return <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--echo-border)' }}>#{index + 1}</span>;
  };

  if (loading) return <BubbleLoader message="Loading rankings..." />;

  const currentList = activeTab === 'doctors' ? doctors : volunteers;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', color: 'var(--echo-text)', position: 'relative', overflowX: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, background: currentTheme.bgGrad, pointerEvents: 'none', zIndex: 0, transition: 'background 1s ease' }} />

      {/* Header */}
      <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--echo-border)', background: 'var(--echo-surface)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BackButton />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={22} style={{ color: currentTheme.primary }} />
            <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>Leaderboard</span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="page-container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5rem', paddingTop: '2rem' }}>
        
        {/* Hero */}
        <div className="glass" style={{ padding: '3rem 2rem', borderRadius: '32px', textAlign: 'center', marginBottom: '3rem', position: 'relative', overflow: 'hidden', border: '1px solid var(--echo-border)', boxShadow: `0 25px 60px rgba(0,0,0,0.1), 0 0 40px ${currentTheme.glow}` }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.15, filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: currentTheme.primary, fontSize: '0.8125rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
            <Star size={14} fill="currentColor" /> Echo Community Heroes
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.1' }}>
            Wall of <span style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Excellence</span>
          </h1>
          <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
            Recognizing the outstanding professionals and volunteers who go above and beyond to support the mental wellbeing of our community.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <div className="glass" style={{ display: 'inline-flex', padding: '0.375rem', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)', gap: '0.375rem' }}>
            <button 
              onClick={() => setActiveTab('doctors')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', borderRadius: '16px', border: 'none',
                background: activeTab === 'doctors' ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` : 'transparent',
                color: activeTab === 'doctors' ? '#fff' : 'var(--echo-text-muted)',
                fontWeight: activeTab === 'doctors' ? '700' : '600', fontSize: '0.9375rem', cursor: 'pointer', transition: 'all 0.3s',
                boxShadow: activeTab === 'doctors' ? `0 8px 25px ${currentTheme.glow}` : 'none'
              }}
            >
              <Stethoscope size={18} /> Top Doctors
            </button>
            <button 
              onClick={() => setActiveTab('volunteers')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', borderRadius: '16px', border: 'none',
                background: activeTab === 'volunteers' ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` : 'transparent',
                color: activeTab === 'volunteers' ? '#fff' : 'var(--echo-text-muted)',
                fontWeight: activeTab === 'volunteers' ? '700' : '600', fontSize: '0.9375rem', cursor: 'pointer', transition: 'all 0.3s',
                boxShadow: activeTab === 'volunteers' ? `0 8px 25px ${currentTheme.glow}` : 'none'
              }}
            >
              <Heart size={18} /> Top Volunteers
            </button>
          </div>
        </div>

        {/* Leaderboard List */}
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {clerkUser && currentList.some(u => u.clerkId === clerkUser.id) && (
            <div className="glass echo-card" style={{ padding: '1.25rem 1.5rem', borderRadius: '24px', border: `1px solid ${currentTheme.primary}`, background: `linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.secondary}15)`, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '40px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                {getRankIcon(currentList.findIndex(u => u.clerkId === clerkUser.id))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--echo-text)' }}>Your Current Rank</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)' }}>Keep up the great work!</div>
              </div>
            </div>
          )}
          {currentList.length === 0 ? (
            <div className="glass echo-card" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
              <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.125rem' }}>No rankings available yet. Be the first to earn a rating!</p>
            </div>
          ) : (
            currentList.map((user, index) => {
              const isTop3 = index < 3;
              const rating = activeTab === 'doctors' ? user.doctorProfile?.rating : user.volunteerProfile?.rating;
              const totalRatings = activeTab === 'doctors' ? user.doctorProfile?.totalRatings : user.volunteerProfile?.totalRatings;
              const degree = user.doctorProfile?.degree;

              return (
                <div 
                  key={user._id} 
                  className={`glass echo-card animate-fade-in-up ${isTop3 ? 'top-rank' : ''}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem', borderRadius: '24px',
                    border: isTop3 ? `1px solid ${getMedalColor(index)}40` : '1px solid var(--echo-border)',
                    background: isTop3 ? `linear-gradient(to right, ${getMedalColor(index)}08, transparent)` : 'var(--echo-surface)',
                    animationDelay: `${index * 0.05}s`,
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  {isTop3 && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: getMedalColor(index) }} />}
                  
                  <div style={{ width: '40px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                    {getRankIcon(index)}
                  </div>

                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${isTop3 ? getMedalColor(index) : 'var(--echo-border)'}`, flexShrink: 0, background: 'var(--echo-surface-2)' }}>
                    {user.imageUrl ? <img src={user.imageUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--echo-text-muted)' }}>{user.name?.[0]}</div>}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--echo-text)' }}>{formatName(user.name, user.role)}</span>
                      {degree && <span style={{ fontSize: '0.75rem', fontWeight: '700', color: currentTheme.primary, background: `${currentTheme.primary}15`, padding: '0.15rem 0.5rem', borderRadius: '999px' }}>{degree}</span>}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)' }}>
                      {totalRatings || 0} {(totalRatings === 1) ? 'review' : 'reviews'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#fbbf24', fontWeight: '900', fontSize: '1.25rem' }}>
                      {rating ? rating.toFixed(1) : '0.0'} <Star size={20} fill="currentColor" />
                    </div>
                  </div>
                  
                  <Link href={`/${activeTab === 'doctors' ? 'doctors' : 'volunteers'}`} style={{ textDecoration: 'none', display: 'flex' }}>
                    <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'var(--echo-surface-2)', color: 'var(--echo-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '0.5rem', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = currentTheme.primary} onMouseLeave={e => e.currentTarget.style.background = 'var(--echo-surface-2)'}>
                      <ChevronRight size={20} />
                    </button>
                  </Link>

                </div>
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}

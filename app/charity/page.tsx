'use client';

import { useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { Globe, Heart, Shield, Zap, Info, DollarSign, Sparkles } from 'lucide-react';

type RoomTheme = 'celestial' | 'forest' | 'sunset' | 'ocean' | 'aurora';

const ROOM_THEMES: Record<RoomTheme, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
  celestial: {
    name: '🌌 Celestial Twilight',
    primary: '#7c3aed',
    secondary: '#06b6d4',
    glow: 'rgba(124, 58, 237, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.12) 0%, transparent 60%)',
  },
  forest: {
    name: '🌲 Deep Forest Sanctuary',
    primary: '#059669',
    secondary: '#10b981',
    glow: 'rgba(5, 150, 105, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(5, 150, 105, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
  },
  sunset: {
    name: '🌅 Amber Serenity',
    primary: '#f59e0b',
    secondary: '#e11d48',
    glow: 'rgba(245, 158, 11, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225, 29, 72, 0.12) 0%, transparent 60%)',
  },
  ocean: {
    name: '🌊 Deep Ocean Calm',
    primary: '#3b82f6',
    secondary: '#0ea5e9',
    glow: 'rgba(59, 130, 246, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(14, 165, 233, 0.12) 0%, transparent 60%)',
  },
  aurora: {
    name: '✨ Northern Lights',
    primary: '#a855f7',
    secondary: '#10b981',
    glow: 'rgba(168, 85, 247, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(10, 200, 120, 0.12) 0%, transparent 60%)',
  },
};

export default function CharityPage() {
  const [roomTheme, setRoomTheme] = useState<RoomTheme>('celestial');
  const currentTheme = ROOM_THEMES[roomTheme];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--echo-bg)',
        color: 'var(--echo-text)',
        position: 'relative',
        overflowX: 'hidden',
        transition: 'background-color 0.5s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Dynamic Ambient Background Glows */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: currentTheme.bgGrad,
          pointerEvents: 'none',
          transition: 'background 1s ease',
          zIndex: 0,
        }}
      />

      <style>{`
        .charity-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--echo-border);
          background: var(--echo-surface);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .charity-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .charity-theme-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--echo-surface-2);
          padding: 0.35rem 0.5rem;
          borderRadius: 999px;
          border: 1px solid var(--echo-border);
        }

        @media (max-width: 640px) {
          .charity-header {
            flex-direction: column;
            align-items: center;
            padding: 0.75rem 1rem;
            gap: 0.75rem;
          }

          .charity-header-left {
            width: 100%;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }

          .charity-back-container {
            display: none !important;
          }

          .charity-header-left a {
            justify-content: center;
            width: 100%;
          }

          .charity-theme-selector {
            display: flex !important;
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* Header */}
      <header className="charity-header">
        <div className="charity-header-left">
          <div className="charity-back-container">
            <BackButton />
          </div>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 15px ${currentTheme.glow}`,
              }}
            >
              <Globe size={18} style={{ color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontWeight: '800', fontSize: '1.125rem', letterSpacing: '-0.01em', color: 'var(--echo-text)', lineHeight: '1.2' }}>
                ECHO Mission
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--echo-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', lineHeight: '1.2', marginTop: '0.15rem' }}>
                <span className="status-dot online" style={{ width: '6px', height: '6px' }} />
                <span>Global Wellbeing Support</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="charity-theme-selector" style={{ borderRadius: '999px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--echo-text-muted)', paddingLeft: '0.5rem' }} className="hide-mobile">
            Mood:
          </span>
          {(Object.keys(ROOM_THEMES) as RoomTheme[]).map(key => {
            const t = ROOM_THEMES[key];
            const isSelected = roomTheme === key;
            const isExtra = key === 'ocean' || key === 'aurora';
            return (
              <button
                key={key}
                onClick={() => setRoomTheme(key)}
                className={isExtra ? 'hide-mobile' : ''}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: isSelected ? t.primary : 'transparent',
                  color: isSelected ? '#fff' : 'var(--echo-text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {t.name.split(' ')[0]} {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '3.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        
        {/* Hero Section */}
        <div className="glass hide-mobile" style={{
          padding: '2.5rem', borderRadius: '28px',
          border: '1px solid var(--echo-border)', background: 'var(--echo-surface)',
          boxShadow: `0 25px 60px rgba(0,0,0,0.12), 0 0 40px ${currentTheme.glow}`,
          marginBottom: '4rem', position: 'relative', overflow: 'hidden',
          textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.12, filter: 'blur(35px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                padding: '0.35rem 0.875rem', 
                borderRadius: '999px', 
                background: 'var(--echo-surface-2)', 
                color: currentTheme.primary, 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em', 
                marginBottom: '1rem',
                border: `1px solid ${currentTheme.primary}30`
              }}
            >
              <Sparkles size={13} />
              <span>Global Impact Cause</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: '900',
              lineHeight: '1.15',
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              color: 'var(--echo-text)'
            }}>
              Our <span 
                key={roomTheme}
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent'
                }}
              >
                Mission
              </span> for a Better Tomorrow
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 3.5vw, 1.15rem)',
              color: 'var(--echo-text-muted)',
              lineHeight: '1.7',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              At ECHO, we believe mental health support is a basic human right. We bridge the gap between technology and human compassion to help everyone find their voice, completely cost-free.
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '2rem', 
          marginBottom: '5rem'
        }}>
          {/* Card 1: Our Mission */}
          <div 
            className="glass" 
            style={{ 
              padding: '2.5rem 2rem', 
              borderRadius: '28px',
              border: '1px solid var(--echo-border)',
              background: 'var(--echo-surface)',
              boxShadow: `0 15px 35px rgba(0, 0, 0, 0.1), 0 0 20px ${currentTheme.glow}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.secondary})` }} />
            
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: `${currentTheme.primary}15`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '1.5rem',
              color: currentTheme.primary
            }}>
              <Heart size={28} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--echo-text)' }}>Our Mission</h2>
            
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              color: 'var(--echo-text-muted)', 
              lineHeight: '1.7',
            }}>
              <li style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: currentTheme.primary, fontWeight: 'bold' }}>✓</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Democratize Healthcare</strong>: We provide world-class, zero-cost support to anyone, breaking financial barriers.</span>
              </li>
              <li style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: currentTheme.primary, fontWeight: 'bold' }}>✓</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Empathetic Tech</strong>: We blend advanced AI companions with dedicated human volunteers to create a 24/7 ecosystem.</span>
              </li>
              <li style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: currentTheme.primary, fontWeight: 'bold' }}>✓</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Absolute Sanctuary</strong>: We offer anonymous, judgment-free space to speak with complete confidentiality.</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: currentTheme.primary, fontWeight: 'bold' }}>✓</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Global Support</strong>: We unify listeners and certified experts worldwide under a shared healing mission.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Why ECHO is Needed */}
          <div 
            className="glass" 
            style={{ 
              padding: '2.5rem 2rem', 
              borderRadius: '28px',
              border: '1px solid var(--echo-border)',
              background: 'var(--echo-surface)',
              boxShadow: `0 15px 35px rgba(0, 0, 0, 0.1), 0 0 20px ${currentTheme.glow}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${currentTheme.secondary}, ${currentTheme.primary})` }} />
            
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: `${currentTheme.secondary}15`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '1.5rem',
              color: currentTheme.secondary
            }}>
              <Shield size={28} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--echo-text)' }}>Why ECHO is Needed</h2>
            
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              color: 'var(--echo-text-muted)', 
              lineHeight: '1.7',
            }}>
              <li style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: currentTheme.secondary, fontWeight: 'bold' }}>✦</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Cost Barriers</strong>: Professional mental healthcare is a luxury, excluding millions in deep economic need.</span>
              </li>
              <li style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: currentTheme.secondary, fontWeight: 'bold' }}>✦</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Wait times</strong>: Clinical wait lists take months. Our AI and volunteers respond instantly in critical times.</span>
              </li>
              <li style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: currentTheme.secondary, fontWeight: 'bold' }}>✦</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Stigma Barriers</strong>: Fear of labels keeps individuals silent. Absolute anonymity breaks this shell.</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: currentTheme.secondary, fontWeight: 'bold' }}>✦</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Midnight Struggles</strong>: Crisis has no business hours. ECHO is alive through the quietest hours.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Donation Scan Area */}
        <div 
          className="glass" 
          style={{ 
            textAlign: 'center', 
            padding: '3.5rem 2rem', 
            background: 'var(--echo-surface)',
            border: '1px solid var(--echo-border)',
            maxWidth: '700px',
            margin: '0 auto',
            borderRadius: '32px',
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.15), 0 0 30px ${currentTheme.glow}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.15, filter: 'blur(20px)' }} />

          <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--echo-text)', letterSpacing: '-0.01em' }}>
            Support Our <span 
              key={roomTheme}
              style={{
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent'
              }}
            >
              Cause
            </span>
          </h3>
          
          <p style={{ color: 'var(--echo-text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
            Your donations help keep ECHO 100% free and sustainable for everyone. Scan the secure QR code below to contribute directly to our mission.
          </p>
          
          <div style={{
            background: 'white',
            padding: '1.25rem',
            borderRadius: '24px',
            display: 'inline-block',
            boxShadow: '0 20px 45px rgba(0,0,0,0.2)',
            marginBottom: '2rem',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            cursor: 'pointer'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06) rotate(1.5deg)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/qr.jpg" 
              alt="Donation QR Code" 
              style={{ width: '220px', height: '220px', borderRadius: '12px', display: 'block' }} 
            />
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Zap size={14} style={{ color: currentTheme.primary }} />
            <span>Secure & Direct Platform Support</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '3rem 1.5rem',
        borderTop: '1px solid var(--echo-border)',
        textAlign: 'center',
        color: 'var(--echo-text-muted)',
        fontSize: '0.875rem',
        background: 'var(--echo-surface)',
        backdropFilter: 'blur(10px)',
        marginTop: '5rem',
        position: 'relative',
        zIndex: 1
      }}>
        <p>© 2026 ECHO Mental Health Platform. Supporting global wellbeing. 💜</p>
      </footer>
    </div>
  );
}


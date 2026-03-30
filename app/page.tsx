'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MouseGlow from '@/components/MouseGlow';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetch('/api/users/me')
        .then(r => r.json())
        .then(d => {
          if (d.user) setRole(d.user.role);
        });
    }
  }, [user]);

  return (
    <main className="mouse-glow-container" style={{ minHeight: '100vh', background: 'var(--echo-bg)' }}>
      <MouseGlow />
      <Navbar />

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(4rem, 10vw, 8rem) 1.5rem',
        textAlign: 'center',
      }}>
        {/* Background orbs - Responsive sizing */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: 'min(600px, 120vw)', height: 'min(600px, 120vw)', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="hide-mobile" style={{
          position: 'absolute', top: '200px', left: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="hide-mobile" style={{
          position: 'absolute', top: '100px', right: '-100px',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }} className="animate-fade-in-up">
          <div className="glass-light" style={{ 
            display: 'inline-flex', 
            padding: '0.5rem 1.25rem', 
            borderRadius: '999px',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--echo-primary-light)',
            border: '1px solid rgba(124, 58, 237, 0.2)'
          }}>
            🌿 Your Mental Health Sanctuary
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
            fontWeight: '900',
            lineHeight: '1.05',
            letterSpacing: '-0.04em',
            marginBottom: '1.5rem',
          }}>
            Healing Starts With a<br />
            <span className="gradient-text">Single Echo</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
            color: 'var(--echo-text-muted)',
            lineHeight: '1.6',
            marginBottom: '3rem',
            maxWidth: '650px',
            margin: '0 auto 3rem',
          }}>
            Connect with compassionate volunteers, expert doctors, and your personal AI companion.
            A multi-sided platform where healing happens through human connection and technology.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
            {isLoaded && user ? (
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}>
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/sign-up" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
                    Start Journey
                  </button>
                </Link>
                <Link href="/sign-in" style={{ textDecoration: 'none' }}>
                  <button className="btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
                    Sign In
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Floating Feature Cards */}
        <div className="feature-grid" style={{
          maxWidth: '1000px',
          margin: 'clamp(4rem, 12vw, 6rem) auto 0',
          padding: '0 1.5rem',
          width: '100%',
        }}>
          {[
            { emoji: '🤖', title: 'AI Companion', desc: 'Chat with ECHO, your empathetic AI friend, anytime you need support.', delay: '0s' },
            { emoji: '🙏', title: 'Volunteer Connect', desc: 'Talk to trained volunteers who genuinely care about your wellbeing.', delay: '0.1s' },
            { emoji: '👨‍⚕️', title: 'Doctor Access', desc: 'Get professional guidance from certified mental health professionals.', delay: '0.2s' },
            { emoji: '🧘', title: 'Relaxation Room', desc: 'Find peace with curated quotes, breathing exercises, and mind games.', delay: '0.3s' },
          ].map((f) => (
            <div key={f.title} className="glass-panel" style={{
              textAlign: 'center',
              padding: '2.5rem 1.5rem',
              animationDelay: f.delay,
              transition: 'all 0.4s ease',
              cursor: 'default'
            }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                filter: 'drop-shadow(0 0 15px rgba(124, 58, 237, 0.3))' 
              }}>{f.emoji}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--echo-text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Charity CTA Section */}
      <section style={{
        padding: '6rem 1.5rem',
        textAlign: 'center',
        background: 'var(--echo-surface)',
        borderTop: '1px solid var(--echo-border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle glow effect */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in-up">
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🕊️</div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Supporting Our <span className="gradient-text">Global Mission</span>
          </h2>
          <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.125rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Learn how Echo connects technology and human compassion to 
            bridge the gap in mental healthcare accessibility worldwide.
          </p>
          <Link href="/charity">
            <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem', boxShadow: '0 10px 30px rgba(124, 58, 237, 0.2)' }}>
              Explore Our Cause
            </button>
          </Link>
        </div>
      </section>

      <footer style={{
        padding: '4rem 1.5rem',
        borderTop: '1px solid var(--echo-border)',
        textAlign: 'center',
        color: 'var(--echo-text-muted)',
        fontSize: '0.875rem',
        width: '100%',
        background: 'var(--echo-nav-bg)',
        backdropFilter: 'blur(10px)'
      }}>
        <p>© 2025 ECHO Mental Health Platform. Built with compassion. 💜</p>
      </footer>
    </main>
  );
}
'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MouseGlow from '@/components/MouseGlow';

export default function CharityPage() {
  return (
    <main className="mouse-glow-container" style={{ minHeight: '100vh', background: 'var(--echo-bg)' }}>
      <MouseGlow />
      <Navbar />

      <section style={{
        padding: 'clamp(4rem, 10vw, 6rem) 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Decorative background effects */}
        <div style={{
          position: 'absolute', top: '10%', left: '10%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 10vw, 5rem)' }} className="animate-fade-in-up">
          <div className="badge badge-purple" style={{ marginBottom: '1.5rem' }}>🌍 Global Impact</div>
          <h1 style={{
            fontSize: 'clamp(2.25rem, 8vw, 4rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            letterSpacing: '-0.04em',
            marginBottom: '1.5rem',
            padding: '0 1rem'
          }}>
            Our <span className="gradient-text">Mission</span> for a Better Tomorrow
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 4vw, 1.25rem)',
            color: 'var(--echo-text-muted)',
            lineHeight: '1.6',
            maxWidth: '700px',
            margin: '0 auto',
            padding: '0 1.5rem'
          }}>
            At ECHO, we believe mental health support is a basic human right. We bridge the gap between 
            technology and human compassion to help everyone find their voice.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: 'clamp(4rem, 15vw, 8rem)',
          padding: '0 1rem'
        }}>
          <div className="glass-panel animate-fade-in-up" style={{ 
            padding: 'clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2rem)', 
            animationDelay: '0.1s',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🎯</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>Our Mission</h2>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              color: 'var(--echo-text-muted)', 
              lineHeight: '1.8',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>✨</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Democratize Mental Healthcare</strong>: We believe well-being is a fundamental right. We are breaking down financial barriers to provide world-class, zero-cost support to anyone, anywhere.</span>
              </li>
              <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🤝</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Harmonize Technology & Humanity</strong>: By blending advanced AI companions with compassionate human volunteers, we create an always-on, deeply empathetic healing ecosystem.</span>
              </li>
              <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🛡️</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Guarantee Absolute Sanctuary</strong>: We provide a completely anonymous, judgment-free space where vulnerable individuals can voice their deepest struggles with total peace of mind.</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🌍</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Mobilize Global Compassion</strong>: We empower a worldwide network of dedicated listeners and certified professionals united by a shared purpose to heal and uplift.</span>
              </li>
            </ul>
          </div>

          <div className="glass-panel animate-fade-in-up" style={{ 
            padding: 'clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2rem)', 
            animationDelay: '0.2s',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>💡</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>Why ECHO is Needed</h2>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              color: 'var(--echo-text-muted)', 
              lineHeight: '1.8',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>💸</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>The Cost Crisis</strong>: Traditional therapy is increasingly unaffordable, systematically excluding the most vulnerable populations from receiving life-saving care.</span>
              </li>
              <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>⌛</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>Critical Delays</strong>: Public health systems are overwhelmed. When individuals face an acute crisis, month-long waiting lists can be devastating.</span>
              </li>
              <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🤐</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>The Weight of Stigma</strong>: Societal pressure and fear of judgment silence millions. We dismantle this barrier with absolute anonymity, letting people speak safely.</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🌙</span> 
                <span><strong style={{ color: 'var(--echo-text)' }}>The Midnight Struggle</strong>: Distress doesn't adhere to business hours. ECHO ensures no one has to face the isolating hours of the night alone.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="glass-panel animate-fade-in-up" style={{ 
          textAlign: 'center', 
          padding: 'clamp(2.5rem, 8vw, 4rem) 1.5rem', 
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(6, 182, 212, 0.08))',
          border: '1px solid var(--echo-border)',
          maxWidth: '650px',
          margin: '0 auto',
          borderRadius: '2rem'
        }}>
          <h3 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: '800', marginBottom: '1rem', color: 'var(--echo-text)' }}>Support Our <span className="gradient-text">Cause</span></h3>
          <p style={{ color: 'var(--echo-text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
            Your donations help us keep ECHO free for everyone. Scan the QR code below to contribute to our mission.
          </p>
          
          <div style={{
            background: 'white',
            padding: '1.25rem',
            borderRadius: '1.5rem',
            display: 'inline-block',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            marginBottom: '2rem',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05) rotate(2deg)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/qr.jpg" 
              alt="Donation QR Code" 
              style={{ width: 'clamp(180px, 50vw, 250px)', height: 'clamp(180px, 50vw, 250px)', borderRadius: '0.75rem', display: 'block' }} 
            />
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)', fontWeight: '500' }}>
            🔒 Secure & Direct Support
          </div>
        </div>
      </section>

      <footer style={{
        padding: '4rem 1.5rem',
        borderTop: '1px solid var(--echo-border)',
        textAlign: 'center',
        color: 'var(--echo-text-muted)',
        fontSize: '0.875rem',
        background: 'var(--echo-surface-2)',
        backdropFilter: 'blur(10px)'
      }}>
        <p>© 2026 ECHO Mental Health Platform. Supporting global wellbeing. 💜</p>
      </footer>
    </main>
  );
}

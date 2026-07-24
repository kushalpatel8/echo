'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MouseGlow from '@/components/MouseGlow';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [suggestionText, setSuggestionText] = useState('');
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [suggestionSent, setSuggestionSent] = useState(false);

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    setIsSubmittingSuggestion(true);
    try {
      await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: suggestionText, role: role || 'anonymous' })
      });
      setSuggestionSent(true);
      setSuggestionText('');
      setTimeout(() => setSuggestionSent(false), 5000);
    } catch (error) {
      console.error(error);
      alert('Failed to send suggestion. Please try again.');
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

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
        padding: 'clamp(2rem, 5vw, 4rem) 1.5rem 2rem',
        textAlign: 'center',
      }}>
        {/* Background orbs - Responsive sizing */}
        <div style={{
          position: 'absolute', top: '-150px', left: '50%', transform: 'translateX(-50%)',
          width: 'min(800px, 140vw)', height: 'min(800px, 140vw)', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,153,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="hide-mobile" style={{
          position: 'absolute', top: '100px', left: '-50px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,153,0.05) 0%, transparent 70%)',
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
            Experience a revolutionary mental health sanctuary. We blend the limitless availability of advanced AI with the profound empathy of expert doctors and compassionate volunteers to guide you through your darkest moments.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%', marginBottom: '1.5rem' }}>
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
          
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Link href="/community" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: 'transparent', border: '1px solid var(--echo-primary)', color: 'var(--echo-primary-light)' }}>
                🌍 Explore Echo Community
              </button>
            </Link>
          </div>
        </div>

      </section>

      {/* Detailed Features Section */}
      <section style={{ padding: '4rem 1.5rem 8rem', background: 'var(--echo-bg)', position: 'relative' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 className="gradient-text" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
              Designed for Your Mental Wellbeing
            </h2>
            <p style={{ color: 'var(--echo-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.125rem', lineHeight: '1.6' }}>
              We have meticulously crafted an ecosystem where advanced technology and human empathy converge to provide the comprehensive, zero-cost support you deserve.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            <div className="echo-card glass-panel" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🤖</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Always-On AI Companionship</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Meet Echo, your proprietary AI companion trained in deep, empathetic communication. Whether it's a 3 AM panic attack or a midday moment of isolation, Echo provides instant, non-judgmental support 24/7.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>Available 24/7 • Private • Empathetic</div>
            </div>

            <div className="echo-card glass-panel" style={{ padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>A Global Network of Care</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Access a worldwide ecosystem of certified mental health professionals and dedicated, trained volunteers. We bridge the gap between human compassion and those in need, ensuring you never have to walk alone.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>Professional Doctors • Verified Volunteers</div>
            </div>

            <div className="echo-card glass-panel" style={{ padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🧘</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>The Serenity Sanctuary</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Escape into a curated digital oasis designed to ground your mind. From interactive sensory exercises and guided breathing techniques to a library of calming wisdom, find the peace you deserve.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>Interactive Games • Curated Library</div>
            </div>

            <div className="echo-card glass-panel" style={{ padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🛡️</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Absolute Anonymity & Privacy</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Your healing journey is profoundly personal. We employ uncompromising, bank-grade encryption and strictly anonymous support channels to guarantee your safety. You can speak your truth without fear.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>Encrypted • Secure • Safe Space</div>
            </div>

            <div className="echo-card glass-panel" style={{ padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🌟</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>A Community That Understands</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Step into a sanctuary of shared experiences. Read anonymous stories, share your own struggles, and find immense strength in a community that truly understands the weight you carry.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>Community • Anonymity • Support</div>
            </div>

            <div className="echo-card glass-panel" style={{ padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>📊</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Insightful Mood Analytics</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Visualize the trajectory of your emotional well-being. Our intuitive analytics help you identify hidden emotional patterns, set achievable goals, and celebrate every victory on your road to recovery.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>Insightful • Private Tracking • Progress</div>
            </div>
          </div>
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
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,153,0.04) 0%, transparent 70%)',
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
        color: 'var(--echo-text-muted)',
        width: '100%',
        background: 'var(--echo-surface-2)',
        backdropFilter: 'blur(10px)'
      }}>
        {role !== 'admin' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'space-between' }}>
            {/* Contact Section */}
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ color: 'var(--echo-text)', fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Contact Us</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>✉️</span> 
                  <a href="mailto:support@echo.com" style={{ color: 'var(--echo-primary)', textDecoration: 'none', fontWeight: '500' }}>support@echo.com</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>📞</span> 
                  <span style={{ fontWeight: '500', color: 'var(--echo-text)' }}>+91 8869452123</span>
                </div>
              </div>
            </div>
            
            {/* Suggestion Box */}
            <div style={{ flex: '1 1 400px' }}>
              <h3 style={{ color: 'var(--echo-text)', fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Suggestions</h3>
              {suggestionSent ? (
                <div style={{ padding: '1.5rem', background: 'var(--echo-success-low)', color: 'var(--echo-text)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  ✅ Thank you! Your suggestion has been sent.
                </div>
              ) : (
                <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSuggestionSubmit}>
                  <textarea 
                    className="echo-input" 
                    placeholder="Share your thoughts or suggestions to help us improve..." 
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem', fontSize: '0.875rem' }} disabled={isSubmittingSuggestion}>
                    {isSubmittingSuggestion ? 'Sending...' : 'Send Suggestion'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--echo-border)', fontSize: '0.875rem' }}>
          <p>© 2026 ECHO Mental Health Platform. Built with compassion. 💜</p>
        </div>
      </footer>
    </main>
  );
}

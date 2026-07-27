'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MouseGlow from '@/components/MouseGlow';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Leaf, Globe, Bot, Handshake, Sparkles, Shield, Users, Camera, Heart, Mail, Phone, CheckCircle2 } from 'lucide-react';

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

      {/* Dynamic Ambient Background Glows matching celestial theme */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(2rem, 5vw, 4rem) 1.5rem 2rem',
        textAlign: 'center',
      }}>

        <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }} className="animate-fade-in-up">
          <div className="glass-light" style={{ 
            display: 'inline-flex', 
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem', 
            borderRadius: '999px',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--echo-primary-light)',
            border: '1px solid rgba(124, 58, 237, 0.2)'
          }}>
            <Leaf size={16} /> Your Mental Health Sanctuary
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
              <button className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontSize: '1rem', background: 'transparent', border: '1px solid var(--echo-primary)', color: 'var(--echo-primary-light)' }}>
                <Globe size={18} /> Explore Echo Community
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
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <Bot size={40} style={{ color: 'var(--echo-primary-light)' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>24/7 AI Companion</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Connect with Echo, your compassionate AI companion trained in mindful communication. Access instant, private, and non-judgmental comfort whenever you need it, night or day.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>Always Available • Non-Judgmental • Immediate Support</div>
            </div>

            <div className="echo-card glass-panel" style={{ padding: '3rem' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <Handshake size={40} style={{ color: 'var(--echo-primary-light)' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Professional & Peer Network</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Bridge the gap with human empathy. Consult verified medical practitioners or connect with dedicated peer volunteers who are ready to listen, share, and support you on your path.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>Verified Doctors • Peer Volunteers • Active Support</div>
            </div>

            <div className="echo-card glass-panel" style={{ padding: '3rem' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <Sparkles size={40} style={{ color: 'var(--echo-primary-light)' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>The Serenity Sanctuary</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Reclaim your inner calm inside our digital oasis. Experience interactive sensory games, customized deep breathing guides, calming audio soundscapes, and our custom AI Personal Exercise Trainer.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>AI Workout Trainer • Soundscapes • Guided Breathing</div>
            </div>

            <div className="echo-card glass-panel" style={{ padding: '3rem' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <Shield size={40} style={{ color: 'var(--echo-primary-light)' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Complete Anonymity & Security</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Your healing journey is secure. We use advanced client-side processing and secure data standards so you can speak your truth and track your mental health with complete peace of mind.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>100% Private • Local Processing • Secure Data</div>
            </div>

            <div className="echo-card glass-panel" style={{ padding: '3rem' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <Users size={40} style={{ color: 'var(--echo-primary-light)' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Global Support Community</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Step into a sanctuary of shared stories. Browse anonymous community posts, write down your thoughts, and find strength in a supportive community that understands your daily weight.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>Anonymous Sharing • Shared Wisdom • Peer Connections</div>
            </div>

            <div className="echo-card glass-panel" style={{ padding: '3rem' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <Camera size={40} style={{ color: 'var(--echo-primary-light)' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>AI Face Scan & Mood Analytics</h3>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Track your emotional growth. Scan your facial expressions in real-time with browser-run AI, log daily questionnaires, and view detailed progress trends to recognize your healing patterns.
              </p>
              <div style={{ color: 'var(--echo-primary-light)', fontWeight: '700', fontSize: '0.875rem' }}>Real-Time Face Scan • Guided Assessments • Visual Trends</div>
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
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Heart size={40} style={{ color: 'var(--echo-primary-light)' }} />
          </div>
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
                  <Mail size={18} style={{ color: 'var(--echo-primary)' }} />
                  <a href="mailto:support@echo.com" style={{ color: 'var(--echo-primary)', textDecoration: 'none', fontWeight: '500' }}>support@echo.com</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem' }}>
                  <Phone size={18} style={{ color: 'var(--echo-primary)' }} />
                  <span style={{ fontWeight: '500', color: 'var(--echo-text)' }}>+91 8869452123</span>
                </div>
              </div>
            </div>
            
            {/* Suggestion Box */}
            {user && (
              <div style={{ flex: '1 1 400px' }}>
                <h3 style={{ color: 'var(--echo-text)', fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Suggestions</h3>
                {suggestionSent ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', background: 'var(--echo-success-low)', color: 'var(--echo-text)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <CheckCircle2 size={20} style={{ color: '#22c55e' }} /> Thank you! Your suggestion has been sent.
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
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--echo-border)', fontSize: '0.875rem' }}>
          <p>© 2026 ECHO Mental Health Platform. Built with compassion <Heart size={14} style={{ color: '#8b5cf6', display: 'inline-flex', alignSelf: 'center', margin: '0 2px' }} />.</p>
        </div>
      </footer>
    </main>
  );
}

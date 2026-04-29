'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const QUOTES = [
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious. Having feelings doesn't make you a negative person. It makes you human.", author: "Lori Deschene" },
  { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "Sometimes the people around you won't understand your journey. They don't need to, it's not for them.", author: "Joubert Botha" },
  { text: "Self-care is how you take your power back.", author: "Lalah Delia" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "Tough times never last, but tough people do.", author: "Robert H. Schuller" },
  { text: "You are stronger than you think, braver than you believe, and smarter than you know.", author: "A.A. Milne" },
  { text: "Every day is a new beginning. Take a deep breath, smile, and start again.", author: "Unknown" },
  { text: "You are enough. You have enough. You do enough.", author: "Unknown" },
  { text: "Healing is not linear. You can have hard days and still be getting better.", author: "Unknown" },
  { text: "Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.", author: "Max Ehrmann" },
  { text: "Your feelings are valid. You deserve to be heard and understood.", author: "Unknown" },
  { text: "The present moment is the only time over which we have dominion.", author: "Thich Nhat Hanh" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "You can't go back and change the beginning, but you can start where you are and change the ending.", author: "C.S. Lewis" },
  { text: "In the middle of difficulty lies opportunity. In the middle of struggle is where resilience is formed.", author: "Albert Einstein" },
  { text: "It's okay not to be okay — as long as you don't give up.", author: "Unknown" },
  { text: "Promise me you'll always remember: you're braver than you believe, stronger than you seem, and smarter than you think.", author: "Christopher Robin" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
];

export default function RelaxationPage() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentQuote(prev => (prev + 1) % QUOTES.length);
        setFade(true);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const nextQuote = () => {
    setFade(false);
    setTimeout(() => { setCurrentQuote(prev => (prev + 1) % QUOTES.length); setFade(true); }, 300);
  };

  const prevQuote = () => {
    setFade(false);
    setTimeout(() => { setCurrentQuote(prev => (prev - 1 + QUOTES.length) % QUOTES.length); setFade(true); }, 300);
  };

  const q = QUOTES[currentQuote];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)' }}>
      {/* Header */}
      <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--echo-border)', background: 'var(--echo-surface)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>← Back</Link>
        <div style={{ fontWeight: '700' }}>🧘 Relaxation Room</div>
      </header>

      {/* Hero Quote */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at center, var(--echo-primary-low) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✨</div>
          <blockquote style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.5s ease', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', lineHeight: '1.7', fontStyle: 'italic', fontWeight: '500', color: 'var(--echo-text)', marginBottom: '1.25rem' }}>
              "{q.text}"
            </p>
            <footer style={{ color: 'var(--echo-primary-light)', fontWeight: '600', fontSize: '0.9375rem' }}>
              — {q.author}
            </footer>
          </blockquote>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={prevQuote} className="btn-secondary" style={{ padding: '0.625rem 1.25rem' }}>← Prev</button>
            <span style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>{currentQuote + 1} / {QUOTES.length}</span>
            <button onClick={nextQuote} className="btn-secondary" style={{ padding: '0.625rem 1.25rem' }}>Next →</button>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginTop: '1.25rem' }}>
            {QUOTES.map((_, i) => (
              <button key={i} onClick={() => { setFade(false); setTimeout(() => { setCurrentQuote(i); setFade(true); }, 300); }}
                style={{ width: i === currentQuote ? '20px' : '8px', height: '8px', borderRadius: '999px', background: i === currentQuote ? 'var(--echo-primary)' : 'var(--echo-border)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
            ))}
          </div>
        </div>
      </section>
      {/* Library CTA */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--echo-bg)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at bottom right, var(--echo-primary-low) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }} className="animate-fade-in-up">
          <div style={{ display: 'inline-block', padding: '1rem', background: 'var(--echo-surface-2)', borderRadius: '1.5rem', marginBottom: '1.5rem', fontSize: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            📚
          </div>
          <h2 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            The Curated Library
          </h2>
          <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.125rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            We've moved our book collection to a dedicated sanctuary. Explore centuries of wisdom in our new, immersive library environment.
          </p>
          <Link href="/relaxation/books" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 auto' }}>
              <span>Enter the Library</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </Link>
        </div>
      </section>

      {/* All Affirmations Grid */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--echo-surface-2)', borderTop: '1px solid var(--echo-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
            🌿 All Affirmations
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {QUOTES.map((quote, i) => (
              <div key={i} className="echo-card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => { setCurrentQuote(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.65', fontStyle: 'italic', color: 'var(--echo-text-muted)', marginBottom: '0.75rem' }}>
                  "{quote.text}"
                </p>
                <footer style={{ color: 'var(--echo-primary-light)', fontWeight: '600', fontSize: '0.8125rem' }}>
                  — {quote.author}
                </footer>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

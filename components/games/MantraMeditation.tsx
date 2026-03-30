'use client';
import { useState, useEffect } from 'react';

const MANTRAS = [
  "I am exactly where I need to be.",
  "I inhale peace, I exhale tension.",
  "This moment is a fresh start.",
  "I am safe, I am loved, I am enough.",
  "I release what I cannot control.",
  "My breath is my anchor in this moment.",
  "I am deserving of this stillness.",
  "I am in harmony with the current flow."
];

export default function MantraMeditation() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % MANTRAS.length);
        setFade(true);
      }, 1000);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="echo-card animate-fade-in-up" style={{ 
      textAlign: 'center', 
      padding: '6rem 2rem', 
      background: 'var(--echo-surface-2)',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Soft Glow Background Animation */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'glow-pulse 8s ease-in-out infinite',
        zIndex: 0
      }} />

      <style>{`
        @keyframes glow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0.8; }
        }
      `}</style>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '4rem', color: 'var(--echo-text)' }}>
          Guided Meditation
        </h2>
        
        <p style={{ 
          fontSize: '2rem', 
          fontWeight: '500', 
          color: 'var(--echo-primary-light)',
          opacity: fade ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
          minHeight: '120px',
          maxWidth: '600px',
          lineHeight: '1.6',
          margin: '0 auto'
        }}>
          "{MANTRAS[index]}"
        </p>
        
        <p style={{ color: 'var(--echo-text-muted)', marginTop: '4rem', fontSize: '0.875rem' }}>
          Cycle of grounded affirmations. Breathe with each phrase.
        </p>
      </div>
    </div>
  );
}

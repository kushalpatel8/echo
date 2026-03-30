'use client';
import { useState, useCallback } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
}

export default function CalmClick() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const colors = ['#f472b6', '#7c3aed', '#06b6d4', '#34d399', '#fbbf24'];

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const newRipple = { id: Date.now(), x, y, color };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 2000);
  }, []);

  return (
    <div 
      className="echo-card animate-fade-in-up" 
      onClick={handleClick}
      style={{ 
        textAlign: 'center', 
        padding: '5rem 2rem', 
        background: 'var(--echo-surface-2)',
        minHeight: '500px',
        cursor: 'crosshair',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {ripples.map(ripple => (
        <div 
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            background: ripple.color,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'ripple-out 2s cubic-bezier(0, 0.2, 0.8, 1) forwards',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      ))}

      <style>{`
        @keyframes ripple-out {
          0% { width: 0; height: 0; opacity: 1; }
          100% { width: 400px; height: 400px; opacity: 0; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--echo-text)' }}>
          Calm Click
        </h2>
        <p style={{ color: 'var(--echo-text-muted)', marginBottom: '3rem', maxWidth: '400px', margin: '0 auto 3rem', lineHeight: '1.8' }}>
          Tap anywhere to release digital ripples. Focus on the soft colors and rhythmic motion for grounding.
        </p>
        
        <div style={{ 
          marginTop: '2rem',
          opacity: 0.5,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          Sensory Interaction Mode
        </div>
      </div>
    </div>
  );
}

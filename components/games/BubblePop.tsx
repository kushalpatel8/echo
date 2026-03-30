'use client';
import { useState, useEffect } from 'react';

type Bubble = { id: number; x: number; y: number; size: number; color: string; speed: number; opacity: number };

export default function BubblePop() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (bubbles.length < 15) {
        const newBubble: Bubble = {
          id: Date.now(),
          x: Math.random() * 90, // Percentage
          y: 110, // Start below viewport
          size: 40 + Math.random() * 60,
          color: `hsl(${200 + Math.random() * 40}, 70%, 70%)`,
          speed: 0.2 + Math.random() * 0.5,
          opacity: 0.4 + Math.random() * 0.4,
        };
        setBubbles(prev => [...prev, newBubble]);
      }
    }, 1000);

    const moveInterval = setInterval(() => {
      setBubbles(prev => prev.map(b => ({ ...b, y: b.y - b.speed })).filter(b => b.y > -20));
    }, 30);

    return () => { clearInterval(interval); clearInterval(moveInterval); };
  }, [bubbles.length]);

  const pop = (id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
  };

  return (
    <div className="echo-card animate-fade-in-up" style={{ textAlign: 'center', background: 'var(--echo-surface-2)', padding: '2rem', height: '500px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <div>
          <h2 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Bubble Pop</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>Tap bubbles to release tension and focus.</p>
        </div>
        <div className="badge badge-cyan">Popped: {score}</div>
      </div>

      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          onClick={() => pop(bubble.id)}
          style={{
            position: 'absolute',
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, white 0%, transparent 10%, ${bubble.color} 50%)`,
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.2)',
            opacity: bubble.opacity,
            cursor: 'pointer',
            transition: 'transform 0.2s',
            backdropFilter: 'blur(2px)',
          }}
          className="bubble-item"
        />
      ))}

      <style jsx>{`
        .bubble-item:hover { transform: scale(1.1); }
        .bubble-item:active { transform: scale(0.8); transition: transform 0.1s; }
      `}</style>
    </div>
  );
}

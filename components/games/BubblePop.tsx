'use client';
import { useState, useEffect } from 'react';

type Bubble = { id: number; x: number; y: number; size: number; color: string; speed: number; opacity: number };

export default function BubblePop() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);

  // Timer effect
  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver]);

  // Bubble generation and movement effect
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setBubbles(prev => {
        if (prev.length < 15) {
          const newBubble: Bubble = {
            id: Date.now(),
            x: Math.random() * 90, // Percentage
            y: 110, // Start below viewport
            size: 40 + Math.random() * 60,
            color: `hsl(${200 + Math.random() * 40}, 70%, 70%)`,
            speed: 0.2 + Math.random() * 0.5,
            opacity: 0.4 + Math.random() * 0.4,
          };
          return [...prev, newBubble];
        }
        return prev;
      });
    }, 1000);

    const moveInterval = setInterval(() => {
      setBubbles(prev => prev.map(b => ({ ...b, y: b.y - b.speed })).filter(b => b.y > -20));
    }, 30);

    return () => { clearInterval(interval); clearInterval(moveInterval); };
  }, [isGameOver]);

  const pop = (id: number) => {
    if (isGameOver) return;
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(60);
    setBubbles([]);
    setIsGameOver(false);
  };

  return (
    <div className="echo-card animate-fade-in-up" style={{ textAlign: 'center', background: 'var(--echo-surface-2)', padding: '2rem', height: '500px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Bubble Pop</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>Tap bubbles to release tension.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="badge badge-cyan" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>⏱ {timeLeft}s</div>
        </div>
      </div>

      {!isGameOver && bubbles.map(bubble => (
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

      {isGameOver && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)', zIndex: 20, backdropFilter: 'blur(4px)'
        }}>
          <div className="animate-fade-in-up" style={{
            background: 'var(--echo-surface)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--echo-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>Time's Up!</h3>
            <p style={{ color: 'var(--echo-text-muted)', marginBottom: '1.5rem', fontSize: '1.125rem' }}>You popped <strong style={{ color: 'var(--echo-primary)' }}>{score}</strong> bubbles.</p>
            <button className="btn-primary" onClick={restart} style={{ padding: '0.75rem 2.5rem', fontSize: '1.0625rem' }}>Play Again</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .bubble-item:hover { transform: scale(1.1); }
        .bubble-item:active { transform: scale(0.8); transition: transform 0.1s; }
      `}</style>
    </div>
  );
}

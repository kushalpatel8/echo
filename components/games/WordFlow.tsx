'use client';
import { useState, useEffect } from 'react';

const CALM_WORDS = ['Serenity', 'Peace', 'Harmony', 'Gentle', 'Kindness', 'Breath', 'Stillness', 'Calm', 'Breeze', 'Light', 'Grace', 'Mercy', 'Love', 'Wisdom', 'Growth', 'Nature'];

type FlowWord = { id: number; text: string; x: number; y: number; speed: number; opacity: number };

export default function WordFlow() {
  const [words, setWords] = useState<FlowWord[]>([]);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (words.length < 5) {
        const newWord: FlowWord = {
          id: Date.now(),
          text: CALM_WORDS[Math.floor(Math.random() * CALM_WORDS.length)],
          x: -150, // Start left of viewport
          y: 50 + Math.random() * 300,
          speed: 1 + Math.random() * 2,
          opacity: 0.6 + Math.random() * 0.4,
        };
        setWords(prev => [...prev, newWord]);
      }
    }, 2000);

    const moveInterval = setInterval(() => {
      setWords(prev => prev.map(w => ({ ...w, x: w.x + w.speed })).filter(w => w.x < 1000));
    }, 30);

    return () => { clearInterval(interval); clearInterval(moveInterval); };
  }, [words.length]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTyped(val);
    
    const matched = words.find(w => w.text.toLowerCase() === val.toLowerCase());
    if (matched) {
       setWords(prev => prev.filter(w => w.id !== matched.id));
       setTyped('');
       setScore(s => s + 1);
    }
  };

  return (
    <div className="echo-card animate-fade-in-up" style={{ textAlign: 'center', background: 'var(--echo-surface-2)', padding: '2rem', height: '500px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Word Flow</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>Focus on the words as they drift by.</p>
        </div>
        <div className="badge badge-purple">Words Acknowledged: {score}</div>
      </div>

      <div style={{ position: 'absolute', inset: 0 }}>
        {words.map(word => (
          <div
            key={word.id}
            style={{
              position: 'absolute',
              left: `${word.x}px`,
              top: `${word.y}px`,
              fontSize: '2rem',
              fontWeight: '800',
              color: 'var(--echo-primary)',
              opacity: word.opacity,
              whiteSpace: 'nowrap',
              filter: 'blur(1px)',
              transition: 'all 0.1s linear',
            }}
          >
            {word.text}
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <input 
          autoFocus 
          className="echo-input" 
          value={typed} 
          onChange={handleInput} 
          placeholder="Acknowledge the flow..." 
          style={{ width: '300px', textAlign: 'center', background: 'var(--echo-surface)', border: '2px solid var(--echo-primary)' }}
        />
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';

type Flower = { id: number; text: string; color: string; x: number; y: number };

export default function GratitudeBloom() {
  const [gratitudes, setGratitudes] = useState<Flower[]>([]);
  const [input, setInput] = useState('');

  const addBloom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newFlower: Flower = {
      id: Date.now(),
      text: input.trim(),
      color: `hsl(${Math.random() * 360}, 70%, 75%)`,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    };

    setGratitudes([...gratitudes, newFlower]);
    setInput('');
  };

  return (
    <div className="echo-card animate-fade-in-up" style={{ 
      textAlign: 'center', 
      background: 'linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%)', 
      padding: '2rem', 
      height: '500px', 
      position: 'relative', 
      overflow: 'hidden',
      border: '1px solid #f9a8d4'
    }}>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#be185d' }}>Gratitude Bloom</h2>
        <p style={{ fontSize: '0.8125rem', color: '#db2777' }}>Plant a thought of gratitude and watch your garden grow.</p>
        
        <form onSubmit={addBloom} style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <input 
            className="echo-input" 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="What are you grateful for today?" 
            style={{ maxWidth: '400px', background: 'white', border: '1px solid #f9a8d4' }}
          />
          <button className="btn-primary" style={{ background: '#ec4899' }}>Plant</button>
        </form>
      </div>

      <div style={{ position: 'absolute', inset: 0 }}>
        {gratitudes.map(flower => (
          <div
            key={flower.id}
            style={{
              position: 'absolute',
              left: `${flower.x}%`,
              top: `${flower.y}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              animation: 'flower-grow 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🌸</div>
            <div style={{ 
              background: 'rgba(255,255,255,0.8)', 
              padding: '0.2rem 0.6rem', 
              borderRadius: '999px', 
              fontSize: '0.75rem', 
              color: '#be185d',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              border: `1px solid ${flower.color}`
            }}>
              {flower.text}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes flower-grow {
          from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

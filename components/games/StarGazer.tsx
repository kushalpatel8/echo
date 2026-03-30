'use client';
import { useState, useEffect } from 'react';

type Star = { id: number; x: number; y: number; label: string };

export default function StarGazer() {
  const [stars, setStars] = useState<Star[]>([]);
  const [connections, setConnections] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Generate a random constellation
    const starData = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      label: String.fromCharCode(65 + i),
    }));
    setStars(starData);
  }, []);

  const connect = (id: number) => {
    if (isFinished || (connections.length > 0 && connections[connections.length - 1] === id)) return;
    
    const newConnections = [...connections, id];
    setConnections(newConnections);
    
    if (newConnections.length === stars.length) {
      setIsFinished(true);
    }
  };

  const reset = () => {
    setConnections([]);
    setIsFinished(false);
  };

  return (
    <div className="echo-card animate-fade-in-up" style={{ textAlign: 'center', background: '#020617', padding: '2rem', height: '500px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontWeight: '800', fontSize: '1.25rem', color: 'white' }}>Star Gazer</h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Connect the stars through your own pattern.</p>
        </div>
        <button onClick={reset} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 1rem' }}>Rebuild Universe</button>
      </div>

      <svg style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        {connections.map((starId, index) => {
          if (index === 0) return null;
          const from = stars.find(s => s.id === connections[index - 1])!;
          const to = stars.find(s => s.id === starId)!;
          return (
            <line
              key={`${index}-line`}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="rgba(124, 58, 237, 0.4)"
              strokeWidth="2"
              className="line-animation"
            />
          );
        })}
      </svg>

      {stars.map(star => (
        <div
          key={star.id}
          onClick={() => connect(star.id)}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: '12px',
            height: '12px',
            background: connections.includes(star.id) ? '#7c3aed' : 'white',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer',
            transition: 'all 0.5s',
            boxShadow: connections.includes(star.id) ? '0 0 15px #7c3aed' : '0 0 10px rgba(255,255,255,0.3)',
            zIndex: 20
          }}
          className="star-item"
        />
      ))}

      {isFinished && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 30 }} className="animate-fade-in-up">
           <h3 style={{ color: 'white', fontWeight: '800', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Ethereal Pattern Complete</h3>
           <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Focused breathing while connecting stars helps settle the mind.</p>
        </div>
      )}

      <style jsx>{`
        @keyframes line-glow {
          0% { stroke-opacity: 0.2; }
          50% { stroke-opacity: 0.6; }
          100% { stroke-opacity: 0.2; }
        }
        .line-animation {
          animation: line-glow 3s infinite;
        }
      `}</style>
    </div>
  );
}

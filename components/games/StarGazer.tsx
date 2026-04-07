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
    <div className="echo-card animate-fade-in-up star-gazer-card" style={{ textAlign: 'center', padding: '2rem', height: '500px', position: 'relative', overflow: 'hidden' }}>
      {/* Sky background — dark in both modes so stars are always visible */}
      <div className="star-gazer-sky" />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 className="star-gazer-title" style={{ fontWeight: '800', fontSize: '1.25rem', color: 'white' }}>Star Gazer</h2>
          <p className="star-gazer-subtitle" style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>Connect the stars through your own pattern.</p>
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
            boxShadow: connections.includes(star.id) ? '0 0 15px #7c3aed' : '0 0 10px rgba(255,255,255,0.6)',
            zIndex: 20
          }}
          className="star-item"
        />
      ))}

      {isFinished && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 30 }} className="animate-fade-in-up">
           <h3 className="star-gazer-complete-title" style={{ color: 'white', fontWeight: '800', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Ethereal Pattern Complete</h3>
           <p className="star-gazer-complete-subtitle" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Focused breathing while connecting stars helps settle the mind.</p>
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

        /* Sky overlay — deep space in dark mode */
        .star-gazer-sky {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0a0f2c 0%, #0d1b4b 50%, #020617 100%);
          border-radius: inherit;
          z-index: 0;
        }

        /* Light mode sky — soft dusk/dawn gradient matching emerald theme */
        [data-theme='light'] .star-gazer-sky {
          background: linear-gradient(160deg, #dbeafe 0%, #ede9fe 35%, #d1fae5 70%, #a7f3d0 100%);
        }

        /* Ensure the card itself doesn't fight the sky background */
        .star-gazer-card {
          background: transparent !important;
        }

        /* Light mode text overrides */
        [data-theme='light'] .star-gazer-title {
          color: #064e3b !important;
        }
        [data-theme='light'] .star-gazer-subtitle {
          color: #065f46 !important;
        }
        [data-theme='light'] .star-gazer-complete-title {
          color: #064e3b !important;
        }
        [data-theme='light'] .star-gazer-complete-subtitle {
          color: #047857 !important;
        }

        /* Light mode star dots — use deep emerald so they pop on the dusk sky */
        [data-theme='light'] .star-item {
          background: #065f46 !important;
          box-shadow: 0 0 8px rgba(6, 95, 70, 0.6) !important;
        }
      `}</style>
    </div>
  );
}

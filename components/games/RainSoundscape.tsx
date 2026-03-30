'use client';
import { useState, useEffect } from 'react';

export default function RainSoundscape() {
  const [intensity, setIntensity] = useState(50);
  const [isThunder, setIsThunder] = useState(false);
  const [drops, setDrops] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate rain particles
    const count = Math.floor(intensity * 2);
    const newDrops = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.5 + Math.random() * 0.5,
    }));
    setDrops(newDrops);
  }, [intensity]);

  return (
    <div className="echo-card animate-fade-in-up" style={{ 
      textAlign: 'center', 
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', 
      padding: '2rem', 
      height: '500px', 
      position: 'relative', 
      overflow: 'hidden',
      border: '1px solid #334155'
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        {drops.map(drop => (
          <div
            key={drop.id}
            style={{
              position: 'absolute',
              left: `${drop.left}%`,
              top: '-20px',
              width: '1px',
              height: '15px',
              background: 'white',
              opacity: 0.3,
              animation: `rain-fall ${drop.duration}s linear infinite`,
              animationDelay: `${drop.delay}s`,
            }}
          />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontWeight: '800', fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}>Rain Soundscape</h2>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Adjust the rain to match your mental pace.</p>
        
        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '300px', margin: '3rem auto' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Rain Intensity</label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={intensity} 
              onChange={e => setIntensity(parseInt(e.target.value))} 
              style={{ width: '100%' }} 
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'white' }}>Distant Thunder (Visual Only)</span>
            <button 
              onClick={() => setIsThunder(!isThunder)}
              className={`btn-${isThunder ? 'primary' : 'secondary'}`}
              style={{ padding: '0.3rem 1rem', fontSize: '0.75rem' }}
            >
              {isThunder ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}>🌧️</div>
      </div>

      <style jsx>{`
        @keyframes rain-fall {
          to { transform: translateY(520px); }
        }
        @keyframes thunder-flash {
          0%, 90%, 100% { background: transparent; }
          95% { background: rgba(255, 255, 255, 0.1); }
        }
      `}</style>
      
      {isThunder && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          animation: 'thunder-flash 5s infinite ease-out',
          pointerEvents: 'none' 
        }} />
      )}
    </div>
  );
}

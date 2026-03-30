'use client';
import { useState, useEffect } from 'react';

export default function ForestWalk() {
  const [step, setStep] = useState(0);
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWalking) {
      interval = setInterval(() => {
        setStep(s => (s + 1) % 100);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isWalking]);

  return (
    <div className="echo-card animate-fade-in-up" style={{ 
      textAlign: 'center', 
      padding: '4rem 2rem', 
      background: 'linear-gradient(to bottom, #064e3b, #022c22)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Moving Forest Background (Simplified) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.2,
        backgroundImage: 'radial-gradient(circle at 50% 50%, #059669 2px, transparent 0)',
        backgroundSize: '40px 40px',
        transform: `translateY(${isWalking ? step : 0}px)`,
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          fontSize: '5rem', 
          marginBottom: '2rem',
          transform: isWalking ? `translateY(${Math.sin(step * 0.2) * 10}px)` : 'none',
          transition: 'transform 0.1s linear'
        }}>🌲</div>
        
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: '#6ee7b7' }}>
          Tranquil Forest Walk
        </h2>
        
        <p style={{ color: '#a7f3d0', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: '1.8' }}>
          Take a virtual stroll through a digital pine forest. Focus on the steady rhythmic movement and breathe with the environment.
        </p>

        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(110, 231, 183, 0.2)',
          borderRadius: '2px',
          marginBottom: '3rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${isWalking ? step : 0}%`,
            height: '100%',
            background: '#6ee7b7',
            transition: 'width 0.1s linear'
          }} />
        </div>

        <button 
          className="btn-primary" 
          onClick={() => setIsWalking(!isWalking)} 
          style={{ 
            minWidth: '200px', 
            background: 'linear-gradient(135deg, #059669, #047857)',
            borderColor: '#065f46'
          }}
        >
          {isWalking ? 'Pause Walk' : 'Start Walking'}
        </button>
      </div>
    </div>
  );
}

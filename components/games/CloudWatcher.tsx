'use client';
import { useState, useEffect } from 'react';

export default function CloudWatcher() {
  const [clouds, setClouds] = useState<{ id: number; left: number; top: number; size: number; speed: number }[]>([]);

  useEffect(() => {
    // Initial clouds
    const initialClouds = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      left: Math.random() * 80,
      top: 10 + Math.random() * 40,
      size: 40 + Math.random() * 100,
      speed: 0.05 + Math.random() * 0.1
    }));
    setClouds(initialClouds);

    const interval = setInterval(() => {
      setClouds(prev => prev.map(c => ({
        ...c,
        left: c.left > 110 ? -20 : c.left + c.speed
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="echo-card animate-fade-in-up" style={{ 
      textAlign: 'center', 
      padding: '5rem 2rem', 
      background: 'linear-gradient(to bottom, #7dd3fc, #38bdf8)',
      minHeight: '400px',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: 'inset 0 0 100px rgba(255,255,255,0.4)',
      borderRadius: '2rem'
    }}>
      {clouds.map(cloud => (
        <div 
          key={cloud.id}
          style={{
            position: 'absolute',
            left: `${cloud.left}%`,
            top: `${cloud.top}%`,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: '50%',
            filter: 'blur(25px)',
            transition: 'left 0.05s linear',
            zIndex: 0
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          Cloud Watcher
        </h2>
        <p style={{ color: '#f0f9ff', marginBottom: '3rem', maxWidth: '450px', margin: '0 auto 3rem', lineHeight: '1.8', fontWeight: '500' }}>
          Gaze at the virtual sky and watch the clouds drift slowly by. Let your thoughts pass like clouds in the sky.
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', fontSize: '0.75rem', color: 'white' }}>☁️ Sky-gazing</span>
          <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', fontSize: '0.75rem', color: 'white' }}>🌀 Flow</span>
          <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', fontSize: '0.75rem', color: 'white' }}>🧘 Presence</span>
        </div>
      </div>
    </div>
  );
}

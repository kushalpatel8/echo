'use client';
import { useState, useEffect } from 'react';

export default function BreathingGame() {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timer, setTimer] = useState(4);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running) {
      interval = setInterval(() => {
        setTimer(t => {
          if (t === 1) {
            if (phase === 'Inhale') { setPhase('Hold'); return 7; }
            if (phase === 'Hold') { setPhase('Exhale'); return 8; }
            if (phase === 'Exhale') { setPhase('Inhale'); return 4; }
          }
          return t - 1;
        });
      }, 1000);
    } else {
      setTimer(4);
      setPhase('Inhale');
    }
    return () => clearInterval(interval);
  }, [running, phase]);

  const duration = phase === 'Inhale' ? 4 : phase === 'Hold' ? 7 : 8;
  const size = phase === 'Inhale' ? 1.6 : phase === 'Hold' ? 1.6 : 1.0;
  const opacity = phase === 'Inhale' ? 0.8 : phase === 'Hold' ? 1.0 : 0.4;

  return (
    <div className="echo-card animate-fade-in-up" style={{ textAlign: 'center', padding: '5rem 3rem', background: 'var(--echo-surface-2)' }}>
      <div style={{
        width: '240px', height: '240px', borderRadius: '50%',
        background: phase === 'Inhale' ? 'radial-gradient(circle, #7c3aed 0%, transparent 80%)' : phase === 'Hold' ? 'radial-gradient(circle, #06b6d4 0%, transparent 80%)' : 'radial-gradient(circle, #f472b6 0%, transparent 80%)',
        margin: '0 auto 4rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${running ? size : 1})`, 
        transition: running ? `transform ${duration}s linear, opacity ${duration}s ease` : 'transform 1s ease',
        opacity: running ? opacity : 0.6,
        boxShadow: running ? `0 0 ${phase === 'Inhale' ? '60px' : '30px'} rgba(124, 58, 237, 0.4)` : 'none'
      }}>
        <div style={{ fontSize: '4rem', fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{timer}</div>
      </div>
      <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: phase === 'Inhale' ? '#a78bfa' : phase === 'Hold' ? '#67e8f9' : '#f9a8d4' }}>
        {running ? phase : 'Ready?'}
      </h2>
      <p style={{ color: 'var(--echo-text-muted)', marginBottom: '3rem', maxWidth: '400px', margin: '0 auto 3rem', lineHeight: '1.8' }}>
        {phase === 'Inhale' && "Breathe in slowly through your nose..."}
        {phase === 'Hold' && "Hold your breath, feeling the stillness..."}
        {phase === 'Exhale' && "Exhale completely through your mouth..."}
        {!running && "Prepare to start a guided 4-7-8 breathing session."}
      </p>
      <button className="btn-primary" onClick={() => setRunning(!running)} style={{ minWidth: '240px', padding: '1rem' }}>
        {running ? 'Stop Session' : 'Start 4-7-8 Breathing'}
      </button>
    </div>
  );
}

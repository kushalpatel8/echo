'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, CloudRain, Waves as WavesIcon, Wind, Bell, Radio } from 'lucide-react';

type SoundscapeType = 'rain' | 'ocean' | 'breeze' | 'bowl' | 'drone' | null;

interface SoundscapeOption {
  id: SoundscapeType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

const SOUNDSCAPES: SoundscapeOption[] = [
  { id: 'rain', label: 'Gentle Rain', desc: 'Soft rainfall filtering through canopy leaves', icon: <CloudRain size={18} />, color: '#38bdf8' },
  { id: 'ocean', label: 'Ocean Waves', desc: 'Rhythmic tides washing over warm sands', icon: <WavesIcon size={18} />, color: '#06b6d4' },
  { id: 'breeze', label: 'Forest Breeze', desc: 'Gentle wind rushing through pine branches', icon: <Wind size={18} />, color: '#10b981' },
  { id: 'bowl', label: '432Hz Meditation Bowl', desc: 'Harmonic resonance that dissolves inner tension', icon: <Bell size={18} />, color: '#f59e0b' },
  { id: 'drone', label: 'Deep Grounding Drone', desc: 'Warm 108Hz binaural ambient frequencies', icon: <Radio size={18} />, color: '#a855f7' },
];

export function RelaxationSoundscapes() {
  const [activeSound, setActiveSound] = useState<SoundscapeType>(null);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or update volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  const stopAllAudio = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    sourceNodesRef.current.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    sourceNodesRef.current = [];
    setIsPlaying(false);
  };

  // Helper to create pink/white noise buffer
  const createNoiseBuffer = (ctx: AudioContext, type: 'white' | 'pink' = 'pink') => {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  };

  const startSoundscape = (type: SoundscapeType) => {
    stopAllAudio();
    if (!type || activeSound === type && isPlaying) {
      setActiveSound(null);
      return;
    }

    setActiveSound(type);
    setIsPlaying(true);

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    if (type === 'rain') {
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 'pink');
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      sourceNodesRef.current.push(noise, filter);
    } 
    else if (type === 'ocean') {
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 'pink');
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);

      // Sweep filter frequency to mimic waves
      const sweepWave = () => {
        if (!ctx || !filter) return;
        const now = ctx.currentTime;
        filter.frequency.exponentialRampToValueAtTime(700, now + 3.5);
        filter.frequency.exponentialRampToValueAtTime(180, now + 7.0);
      };

      sweepWave();
      intervalRef.current = setInterval(sweepWave, 7000);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      sourceNodesRef.current.push(noise, filter);
    } 
    else if (type === 'breeze') {
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 'pink');
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      const sweepWind = () => {
        if (!ctx || !filter) return;
        const now = ctx.currentTime;
        filter.frequency.exponentialRampToValueAtTime(800, now + 4.0);
        filter.frequency.exponentialRampToValueAtTime(350, now + 8.0);
      };

      sweepWind();
      intervalRef.current = setInterval(sweepWind, 8000);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      sourceNodesRef.current.push(noise, filter);
    } 
    else if (type === 'bowl') {
      // Harmonic singing bowl chime
      const playBowlChime = () => {
        if (!ctx || !masterGain) return;
        const now = ctx.currentTime;
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(432, now); // 432 Hz root
        osc2.frequency.setValueAtTime(436, now); // 4 Hz binaural beat

        chimeGain.gain.setValueAtTime(0, now);
        chimeGain.gain.linearRampToValueAtTime(0.7, now + 0.1);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 6.5);

        osc1.connect(chimeGain);
        osc2.connect(chimeGain);
        chimeGain.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 6.6);
        osc2.stop(now + 6.6);
      };

      playBowlChime();
      intervalRef.current = setInterval(playBowlChime, 7500);
    } 
    else if (type === 'drone') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(108, ctx.currentTime); // Deep grounding frequency
      osc2.frequency.setValueAtTime(162, ctx.currentTime); // Perfect fifth harmony

      droneGain.gain.setValueAtTime(0.4, ctx.currentTime);

      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 'pink');
      noise.loop = true;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc1.connect(droneGain);
      osc2.connect(droneGain);
      noise.connect(noiseGain);
      droneGain.connect(masterGain);
      noiseGain.connect(masterGain);

      osc1.start();
      osc2.start();
      noise.start();
      sourceNodesRef.current.push(osc1, osc2, noise, droneGain, noiseGain);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  return (
    <div
      className="glass"
      style={{
        padding: '2rem',
        borderRadius: '24px',
        border: '1px solid var(--echo-border)',
        background: 'var(--echo-surface)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
        marginTop: '2rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <Sparkles size={20} style={{ color: '#f59e0b' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--echo-text)' }}>
              Ambient Audio & Nature Soundscapes
            </h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>
            Real-time synthesized audio soundscapes designed to calm brainwave activity and promote relaxation.
          </p>
        </div>

        {/* Volume Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--echo-surface-2)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--echo-border)' }}>
          {volume === 0 ? <VolumeX size={16} style={{ color: 'var(--echo-text-muted)' }} /> : <Volume2 size={16} style={{ color: 'var(--echo-primary-light)' }} />}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            style={{ width: '90px', cursor: 'pointer', accentColor: 'var(--echo-primary)' }}
            title="Adjust soundscape volume"
          />
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--echo-text)', width: '32px', textAlign: 'right' }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Soundscape Buttons Grid */}
      <div className="soundscapes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <style>{`
          @media (max-width: 640px) {
            .soundscapes-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 0.75rem !important;
            }
            .soundscapes-grid button {
              padding: 1rem 0.75rem !important;
              border-radius: 12px !important;
            }
            .soundscapes-grid button .soundscape-title {
              font-size: 0.85rem !important;
            }
            .soundscapes-grid button .soundscape-desc {
              font-size: 0.6875rem !important;
              line-height: 1.3 !important;
            }
          }
        `}</style>
        {SOUNDSCAPES.map(snd => {
          const isSelected = activeSound === snd.id && isPlaying;
          return (
            <button
              key={snd.id}
              onClick={() => startSoundscape(snd.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '1.25rem',
                borderRadius: '16px',
                border: isSelected ? '1.5px solid var(--echo-primary)' : '1px solid var(--echo-border)',
                background: isSelected ? 'var(--echo-primary-low)' : 'var(--echo-surface-2)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease',
                boxShadow: isSelected ? '0 8px 25px var(--echo-primary-low)' : 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: isSelected ? 'var(--echo-primary)' : 'var(--echo-border)',
                    color: isSelected ? '#ffffff' : 'var(--echo-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.25s ease',
                    boxShadow: isSelected ? '0 4px 12px var(--echo-primary-low)' : 'none',
                  }}
                >
                  {snd.icon}
                </div>
                {isSelected && (
                  <div style={{ display: 'flex', gap: '2.5px', alignItems: 'flex-end', height: '16px' }}>
                    <span style={{ width: '3px', height: '10px', background: 'var(--echo-primary)', borderRadius: '2px', animation: 'pulse-glow 0.6s infinite ease' }} />
                    <span style={{ width: '3px', height: '16px', background: 'var(--echo-primary)', borderRadius: '2px', animation: 'pulse-glow 0.6s infinite 0.2s ease' }} />
                    <span style={{ width: '3px', height: '8px', background: 'var(--echo-primary)', borderRadius: '2px', animation: 'pulse-glow 0.6s infinite 0.4s ease' }} />
                  </div>
                )}
              </div>
              <div className="soundscape-title" style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--echo-text)', marginBottom: '0.25rem' }}>
                {snd.label}
              </div>
              <div className="soundscape-desc" style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', lineHeight: '1.4' }}>
                {snd.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

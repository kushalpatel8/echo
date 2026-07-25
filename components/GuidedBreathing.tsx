'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Wind, CheckCircle2 } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';

type BreathingMode = 'box' | 'relax' | 'calm';

interface BreathStage {
  label: string;
  duration: number; // in seconds
  scale: number; // visual scale of orb
  color: string; // gradient color
  instruction: string;
}

const MODES: Record<BreathingMode, { name: string; desc: string; stages: BreathStage[] }> = {
  box: {
    name: 'Box Breathing (4-4-4-4)',
    desc: 'Used by athletes and first responders to instantly calm the nervous system and regain focus.',
    stages: [
      { label: 'Inhale', duration: 4, scale: 1.5, color: '#0284c7', instruction: 'Breathe in slowly through your nose...' },
      { label: 'Hold', duration: 4, scale: 1.5, color: '#6366f1', instruction: 'Hold your breath gently...' },
      { label: 'Exhale', duration: 4, scale: 1.0, color: '#9333ea', instruction: 'Release slowly through your mouth...' },
      { label: 'Hold', duration: 4, scale: 1.0, color: '#0d9488', instruction: 'Rest in stillness...' },
    ],
  },
  relax: {
    name: 'Sleep & Anxiety (4-7-8)',
    desc: 'A natural tranquilizer for the nervous system, helping release deep tension and prepare for rest.',
    stages: [
      { label: 'Inhale', duration: 4, scale: 1.5, color: '#0284c7', instruction: 'Inhale quietly through your nose...' },
      { label: 'Hold', duration: 7, scale: 1.55, color: '#9333ea', instruction: 'Hold your breath comfortably...' },
      { label: 'Exhale', duration: 8, scale: 1.0, color: '#e11d48', instruction: 'Exhale completely with a soft whoosh...' },
    ],
  },
  calm: {
    name: 'Coherent Calm (5-5)',
    desc: 'Balances heart rate variability and creates immediate emotional equilibrium.',
    stages: [
      { label: 'Inhale', duration: 5, scale: 1.5, color: '#059669', instruction: 'Draw breath deep into your belly...' },
      { label: 'Exhale', duration: 5, scale: 1.0, color: '#0284c7', instruction: 'Let all stress flow out as you release...' },
    ],
  },
};

export function GuidedBreathing() {
  const [mode, setMode] = useState<BreathingMode>('box');
  const [isActive, setIsActive] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [voiceGuide, setVoiceGuide] = useState(true);

  const { speak, stopSpeaking, hasSynthesisSupport } = useVoice();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentMode = MODES[mode];
  const currentStage = currentMode.stages[stageIndex];

  // Handle stage transitions and timer
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Speak initial stage instruction
    if (voiceGuide && hasSynthesisSupport) {
      speak(currentStage.label, `breath-${stageIndex}`);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Transition to next stage
          setStageIndex(currentIdx => {
            const nextIdx = (currentIdx + 1) % currentMode.stages.length;
            if (nextIdx === 0) {
              setCyclesCompleted(c => c + 1);
            }
            return nextIdx;
          });
          return 0; // Will be updated by useEffect on stageIndex change
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, stageIndex, mode, voiceGuide, hasSynthesisSupport, speak]);

  // Reset timer when stage changes while active
  useEffect(() => {
    if (isActive) {
      const stage = currentMode.stages[stageIndex];
      setTimeLeft(stage.duration);
      if (voiceGuide && hasSynthesisSupport) {
        speak(`${stage.label}... ${stage.instruction}`, `breath-stage-${stageIndex}`);
      }
    }
  }, [stageIndex, mode, isActive]);

  const startSession = () => {
    setIsActive(true);
    setStageIndex(0);
    setTimeLeft(currentMode.stages[0].duration);
    if (voiceGuide && hasSynthesisSupport) {
      speak(`Starting ${currentMode.name}... Let's begin. ${currentMode.stages[0].label}...`, 'breath-start');
    }
  };

  const pauseSession = () => {
    setIsActive(false);
    stopSpeaking();
  };

  const resetSession = () => {
    setIsActive(false);
    setStageIndex(0);
    setTimeLeft(currentMode.stages[0].duration);
    setCyclesCompleted(0);
    stopSpeaking();
  };

  return (
    <div
      className="glass"
      style={{
        padding: '2.5rem 2rem',
        borderRadius: '24px',
        border: '1px solid var(--echo-border)',
        background: 'var(--echo-surface)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${currentStage.color} 0%, transparent 70%)`,
          opacity: isActive ? 0.25 : 0.08,
          transition: 'all 2s ease',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      {/* Header & Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Wind className="animate-pulse" size={26} style={{ color: currentStage.color }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--echo-text)', letterSpacing: '-0.01em', textAlign: 'center', margin: 0 }}>
              Guided Breathing Space
            </h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--echo-text-muted)', maxWidth: '550px', lineHeight: '1.6', textAlign: 'center', margin: '0 auto 1rem' }}>
            {currentMode.desc}
          </p>
        </div>

        {/* Voice guidance toggle */}
        {hasSynthesisSupport && (
          <button
            onClick={() => setVoiceGuide(!voiceGuide)}
            className="glass-light"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              border: `1px solid ${voiceGuide ? '#0284c7' : 'var(--echo-border)'}`,
              background: voiceGuide ? 'var(--echo-primary-low)' : 'var(--echo-surface-2)',
              color: voiceGuide ? 'var(--echo-primary-light)' : 'var(--echo-text-muted)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              margin: '0 auto',
            }}
          >
            {voiceGuide ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>Voice Guide: {voiceGuide ? 'ON' : 'OFF'}</span>
          </button>
        )}
      </div>

      {/* Mode Selector Pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '3rem', position: 'relative', zIndex: 2 }}>
        {(Object.keys(MODES) as BreathingMode[]).map(key => {
          const m = MODES[key];
          const selected = mode === key;
          return (
            <button
              key={key}
              onClick={() => {
                setMode(key);
                setIsActive(false);
                setStageIndex(0);
                setTimeLeft(m.stages[0].duration);
              }}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '12px',
                border: selected ? '1.5px solid var(--echo-primary)' : '1px solid var(--echo-border)',
                background: selected ? 'var(--echo-primary)' : 'var(--echo-surface-2)',
                color: selected ? '#ffffff' : 'var(--echo-text-muted)',
                fontWeight: selected ? '700' : '500',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selected ? '0 4px 15px var(--echo-primary-low)' : 'none',
              }}
            >
              {m.name}
            </button>
          );
        })}
      </div>

      {/* Breathing Visualizer Orb */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', margin: '2rem 0', position: 'relative', zIndex: 2 }}>
        <div
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${currentStage.color}, #1e293b)`,
            border: `2px solid ${currentStage.color}`,
            boxShadow: `0 0 40px ${currentStage.color}66, inset 0 0 20px rgba(255, 255, 255, 0.2)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isActive ? `scale(${currentStage.scale})` : 'scale(1)',
            transition: `transform ${currentStage.duration}s cubic-bezier(0.4, 0, 0.2, 1), background-color 1s ease, border-color 1s ease`,
            cursor: 'pointer',
          }}
          onClick={() => (isActive ? pauseSession() : startSession())}
        >
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)', marginBottom: '0.25rem' }}>
            {currentStage.label}
          </span>
          <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {timeLeft}s
          </span>
          {!isActive && (
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
              Click to {timeLeft === currentStage.duration ? 'Start' : 'Resume'}
            </span>
          )}
        </div>

        {/* Real-time Stage Instruction */}
        <div style={{ marginTop: '3.5rem', textAlign: 'center', minHeight: '60px' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: '600', color: currentStage.color, transition: 'color 0.5s ease', marginBottom: '0.5rem' }}>
            {isActive ? currentStage.instruction : 'Ready when you are. Take a deep, gentle breath.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>
            <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
            <span>Completed Cycles: <strong style={{ color: 'var(--echo-text)' }}>{cyclesCompleted}</strong></span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', position: 'relative', zIndex: 2 }}>
        <button
          onClick={isActive ? pauseSession : startSession}
          className="btn-primary"
          style={{
            padding: '0.875rem 2.5rem',
            fontSize: '1rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            borderRadius: '14px',
            background: isActive ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'var(--echo-primary)',
            boxShadow: isActive ? '0 8px 25px rgba(239, 68, 68, 0.35)' : '0 8px 25px var(--echo-primary-low)',
          }}
        >
          {isActive ? (
            <>
              <Pause size={18} />
              <span>Pause Session</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>{cyclesCompleted > 0 || timeLeft < currentStage.duration ? 'Resume Breathing' : 'Start Session'}</span>
            </>
          )}
        </button>

        <button
          onClick={resetSession}
          className="btn-secondary"
          style={{
            padding: '0.875rem 1.5rem',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
          }}
          title="Reset timer and cycle count"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}

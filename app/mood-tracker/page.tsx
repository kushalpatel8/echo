'use client';
import { useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import ThemeToggle from '@/components/ThemeToggle';
import { Brain, Camera, History, Sparkles } from 'lucide-react';
import FaceMoodDetector from '@/components/mood/FaceMoodDetector';

const MOOD_QUESTIONS = [
  { id: 'q1', text: 'How would you rate your overall mood right now?', type: 'scale' },
  { id: 'q2', text: 'How well did you sleep last night?', type: 'scale' },
  { id: 'q3', text: 'How is your energy level today?', type: 'scale' },
  { id: 'q4', text: 'How do you feel physically today?', type: 'scale' },
  { id: 'q5', text: 'How are your stress levels right now?', type: 'scale_inverted' },
  { id: 'q6', text: 'How connected do you feel to people around you?', type: 'scale' },
  { id: 'q7', text: 'How well can you focus or concentrate today?', type: 'scale' },
  { id: 'q8', text: 'Are you feeling any anxiety or worry?', type: 'scale_inverted' },
  { id: 'q9', text: 'How motivated do you feel to do daily activities?', type: 'scale' },
  { id: 'q10', text: 'How often have you felt sad or low in the past few days?', type: 'scale_inverted' },
  { id: 'q11', text: 'Do you have things you are looking forward to?', type: 'scale' },
  { id: 'q12', text: 'How well are you taking care of yourself (eating, hygiene, etc.)?', type: 'scale' },
  { id: 'q13', text: 'Have you experienced any feelings of hopelessness recently?', type: 'scale_inverted' },
  { id: 'q14', text: 'How often do you feel grateful today?', type: 'scale' },
  { id: 'q15', text: 'Are you having thoughts that make you feel worse about yourself?', type: 'scale_inverted' },
  { id: 'q16', text: 'How able are you to handle challenges or setbacks today?', type: 'scale' },
  { id: 'q17', text: 'Do you feel safe and secure right now?', type: 'scale' },
  { id: 'q18', text: 'How present and mindful do you feel?', type: 'scale' },
  { id: 'q19', text: 'How much joy have you experienced today?', type: 'scale' },
  { id: 'q20', text: 'Overall, how optimistic are you feeling about the future?', type: 'scale' },
];

const MOOD_EMOJIS: Record<string, string> = {
  Radiant: '🌟', Calm: '😌', Neutral: '😐', Uneasy: '😟', Distressed: '😰', Critical: '😢'
};
const MOOD_COLORS: Record<string, string> = {
  Radiant: '#fde047', Calm: '#86efac', Neutral: '#93c5fd', Uneasy: '#fdba74', Distressed: '#fca5a5', Critical: '#f87171'
};

type ThemeKey = 'celestial' | 'forest' | 'sunset';

const THEMES: Record<ThemeKey, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
  celestial: {
    name: '🌌 Celestial',
    primary: '#7c3aed',
    secondary: '#06b6d4',
    glow: 'rgba(124, 58, 237, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.12) 0%, transparent 60%)',
  },
  forest: {
    name: '🌲 Forest',
    primary: '#059669',
    secondary: '#10b981',
    glow: 'rgba(5, 150, 105, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(5, 150, 105, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
  },
  sunset: {
    name: '🌅 Sunset',
    primary: '#f59e0b',
    secondary: '#e11d48',
    glow: 'rgba(245, 158, 11, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225, 29, 72, 0.12) 0%, transparent 60%)',
  },
};

function AmbientSelector({ activeTheme, setActiveTheme }: { activeTheme: ThemeKey; setActiveTheme: (k: ThemeKey) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--echo-surface-2)', padding: '0.35rem 0.5rem', borderRadius: '999px', border: '1px solid var(--echo-border)' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--echo-text-muted)', paddingLeft: '0.5rem' }}>Ambient:</span>
      {(Object.keys(THEMES) as ThemeKey[]).map(key => {
        const t = THEMES[key];
        const isSel = activeTheme === key;
        return (
          <button key={key} onClick={() => setActiveTheme(key)} style={{
            padding: '0.35rem 0.75rem', borderRadius: '999px', border: 'none',
            background: isSel ? t.primary : 'transparent', color: isSel ? '#fff' : 'var(--echo-text-muted)',
            fontSize: '0.75rem', fontWeight: isSel ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s ease',
          }}>
            {t.name.split(' ')[0]} {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

export default function MoodTrackerPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ mood: string; score: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFaceDetector, setShowFaceDetector] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('celestial');

  const currentTheme = THEMES[activeTheme];
  const currentQ = MOOD_QUESTIONS[step - 1];
  const progress = (step / 20) * 100;

  const selectAnswer = async (value: number) => {
    const qId = currentQ.id;
    const finalValue = currentQ.type === 'scale_inverted' ? 11 - value : value;
    const newAnswers = { ...answers, [qId]: finalValue };
    setAnswers(newAnswers);
    if (step === 20) {
      setLoading(true);
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers }),
      });
      const data = await res.json();
      setResult(data);
      setStep(21);
      setLoading(false);
    } else {
      setStep(step + 1);
    }
  };

  const handleFaceMoodDetected = (mood: string, score: number) => {
    setResult({ mood, score });
    setStep(21);
    setShowFaceDetector(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', color: 'var(--echo-text)', position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        .show-mobile-flex {
          display: none !important;
        }
        @media (max-width: 768px) {
          .show-mobile-flex {
            display: flex !important;
          }
        }
      `}</style>
      {/* Ambient Background */}
      <div style={{ position: 'fixed', inset: 0, background: currentTheme.bgGrad, pointerEvents: 'none', zIndex: 0, transition: 'background 1s ease' }} />

      {/* Sticky Header */}
      <header style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--echo-border)',
        background: 'var(--echo-surface)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BackButton />
          <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--echo-text)' }}>Mood Tracker</span>
          {step > 0 && step <= 20 && (
            <span style={{ background: 'var(--echo-surface-2)', border: '1px solid var(--echo-border)', borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--echo-text-muted)' }}>{step} / 20</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="hide-mobile">
            <AmbientSelector activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="page-container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5rem' }}>

        {/* Mobile Ambient */}
        <div className="show-mobile-flex" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <AmbientSelector activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
        </div>

        {/* ── INTRO ── */}
        {step === 0 && (
          <div className="animate-fade-in-up" style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Hero Banner */}
            <div style={{
              padding: '2.5rem', borderRadius: '28px',
              background: 'var(--echo-surface)', border: '1px solid var(--echo-border)',
              boxShadow: `0 25px 60px rgba(0,0,0,0.1), 0 0 40px ${currentTheme.glow}`,
              marginBottom: '2rem', position: 'relative', overflow: 'hidden', textAlign: 'center',
            }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.1, filter: 'blur(30px)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧠</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                  <Brain size={13} /><span>Mental Wellness</span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
                  How are you feeling?
                </h1>
                <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '2rem', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                  This 20-question assessment takes about 3 minutes and helps us understand your emotional state so we can provide better support.
                </p>
                <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  {['🔒 Confidential', '⏱ 3 minutes', '✨ Accurate insights'].map(f => (
                    <span key={f} style={{ padding: '0.3rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', border: '1px solid var(--echo-border)', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--echo-text-muted)' }}>{f}</span>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setStep(1)} style={{ width: '100%', padding: '1.1rem', fontSize: '1.0625rem', borderRadius: '14px', marginBottom: '0.875rem' }}>
                  Begin Assessment →
                </button>
                <Link href="/mood-tracker/camera" style={{ textDecoration: 'none', display: 'block' }}>
                  <button className="btn-secondary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '14px', borderColor: currentTheme.primary, color: currentTheme.primary }}>
                    <Camera size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Detect via Camera
                  </button>
                </Link>
              </div>
            </div>

            {/* History card */}
            <Link href="/mood-tracker/history" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                padding: '1.375rem 1.5rem', borderRadius: '20px',
                background: 'var(--echo-surface)', border: '1px solid var(--echo-border)',
                display: 'flex', alignItems: 'center', gap: '1rem',
                transition: 'transform 0.25s ease, border-color 0.2s ease, box-shadow 0.25s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = currentTheme.primary; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 30px ${currentTheme.glow}`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--echo-border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--echo-surface-2)', border: '1px solid var(--echo-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <History size={22} color={currentTheme.primary} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.15rem' }}>Mood History</div>
                  <div style={{ color: 'var(--echo-text-muted)', fontSize: '0.8125rem' }}>Review your emotional trends over time</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--echo-text-muted)', fontSize: '1.25rem' }}>→</span>
              </div>
            </Link>
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {step > 0 && step <= 20 && currentQ && (
          <div className="animate-fade-in-up" key={step} style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Progress bar */}
            <div style={{ height: '6px', background: 'var(--echo-surface-2)', borderRadius: '999px', marginBottom: '2rem', overflow: 'hidden', border: '1px solid var(--echo-border)' }}>
              <div style={{ height: '100%', width: `${progress}%`, borderRadius: '999px', background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.secondary})`, transition: 'width 0.4s ease' }} />
            </div>

            <div style={{
              padding: '2.5rem', borderRadius: '28px',
              background: 'var(--echo-surface)', border: '1px solid var(--echo-border)',
              boxShadow: `0 20px 50px rgba(0,0,0,0.08), 0 0 30px ${currentTheme.glow}`,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', width: '160px', height: '160px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.08, filter: 'blur(25px)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', marginBottom: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Question {step} of 20
                </div>
                <h2 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: '800', marginBottom: '2.25rem', lineHeight: '1.5', letterSpacing: '-0.01em' }}>
                  {currentQ.text}
                </h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem', fontSize: '0.75rem', color: 'var(--echo-text-muted)', fontWeight: '600' }}>
                  <span>{currentQ.type === 'scale_inverted' ? 'Not at all' : 'Very poor'}</span>
                  <span>{currentQ.type === 'scale_inverted' ? 'Extremely' : 'Excellent'}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button
                      key={n}
                      onClick={() => selectAnswer(n)}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '0.875rem 0',
                        borderRadius: '10px',
                        border: '1.5px solid var(--echo-border)',
                        background: 'var(--echo-surface-2)',
                        color: n <= 3 ? '#f87171' : n <= 6 ? '#fbbf24' : '#86efac',
                        fontWeight: '800',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        fontSize: '0.9375rem',
                      }}
                      onMouseEnter={e => {
                        (e.target as HTMLElement).style.transform = 'translateY(-4px) scale(1.05)';
                        (e.target as HTMLElement).style.borderColor = currentTheme.primary;
                        (e.target as HTMLElement).style.boxShadow = `0 6px 18px ${currentTheme.glow}`;
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLElement).style.transform = 'none';
                        (e.target as HTMLElement).style.borderColor = 'var(--echo-border)';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="btn-secondary" onClick={() => setStep(s => Math.max(1, s - 1))} style={{ marginTop: '1.25rem', fontSize: '0.875rem' }}>
              ← Previous
            </button>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === 21 && result && (
          <div className="animate-fade-in-up" style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{
              padding: '2.5rem', borderRadius: '28px', textAlign: 'center',
              background: 'var(--echo-surface)', border: '1px solid var(--echo-border)',
              boxShadow: `0 25px 60px rgba(0,0,0,0.1), 0 0 40px ${currentTheme.glow}`,
              marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '250px', height: '250px', background: `radial-gradient(circle, ${MOOD_COLORS[result.mood] || currentTheme.primary} 0%, transparent 70%)`, opacity: 0.1, filter: 'blur(35px)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{MOOD_EMOJIS[result.mood] || '💭'}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                  <Sparkles size={13} /><span>Assessment Complete</span>
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: MOOD_COLORS[result.mood] || 'var(--echo-text)', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>
                  {result.mood}
                </h2>
                <p style={{ color: 'var(--echo-text-muted)', marginBottom: '1.75rem', fontSize: '0.9375rem' }}>
                  Mood score: <strong style={{ color: 'var(--echo-text)', fontWeight: '800' }}>{result.score.toFixed(1)} / 10</strong>
                </p>

                <div style={{ background: 'var(--echo-surface-2)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.75rem', textAlign: 'left', border: '1px solid var(--echo-border)' }}>
                  <p style={{ fontSize: '0.9375rem', lineHeight: '1.7', color: 'var(--echo-text-muted)', margin: 0 }}>
                    {result.mood === 'Radiant' && "You're in a wonderful state! Keep nurturing what's working for you and share that positive energy with others. 🌟"}
                    {result.mood === 'Calm' && "You seem to be in a balanced, peaceful state. This is a great time to reflect and set intentions. 🌿"}
                    {result.mood === 'Neutral' && "You're in a steady place. Consider trying some relaxation activities or talking to someone you trust. 💙"}
                    {result.mood === 'Uneasy' && "It sounds like you're going through some challenges. Talking to a volunteer might help ease what you're feeling. 🤝"}
                    {result.mood === 'Distressed' && "You seem to be struggling right now. Please reach out to one of our volunteers or try the AI Companion. You're not alone. 💜"}
                    {result.mood === 'Critical' && "I'm concerned about how you're feeling. Please connect with a volunteer or doctor right away. You matter and help is here. ❤️"}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <Link href="/companion" style={{ textDecoration: 'none' }}>
                    <button className="btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', borderRadius: '14px' }}>Talk to AI Companion 🤖</button>
                  </Link>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link href="/volunteers" style={{ textDecoration: 'none', flex: 1 }}>
                      <button className="btn-secondary" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}>Talk to Peers 🤝</button>
                    </Link>
                    {result.mood === 'Critical' && (
                      <Link href="/doctors" style={{ textDecoration: 'none', flex: 1 }}>
                        <button className="btn-secondary" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', borderColor: '#f87171', color: '#f87171' }}>Professional Care 👨‍⚕️</button>
                      </Link>
                    )}
                  </div>
                </div>

                <button onClick={() => { setStep(0); setAnswers({}); setResult(null); }} style={{ marginTop: '1.25rem', background: 'none', border: 'none', color: 'var(--echo-text-muted)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'underline' }}>
                  Take again
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

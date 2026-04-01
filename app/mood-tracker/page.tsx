'use client';
import { useState } from 'react';
import Link from 'next/link';

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

export default function MoodTrackerPage() {
  const [step, setStep] = useState(0); // 0 = intro, 1-20 = questions, 21 = result
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ mood: string; score: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const currentQ = MOOD_QUESTIONS[step - 1];
  const progress = ((step) / 20) * 100;

  const selectAnswer = async (value: number) => {
    const qId = currentQ.id;
    const finalValue = currentQ.type === 'scale_inverted' ? 11 - value : value;
    const newAnswers = { ...answers, [qId]: finalValue };
    setAnswers(newAnswers);

    if (step === 20) {
      // Submit
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--echo-border)', background: 'var(--echo-surface)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>← Back</Link>
        <div style={{ fontWeight: '700' }}>📝 Mood Tracker</div>
        {step > 0 && step <= 20 && (
          <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--echo-text-muted)' }}>{step} / 20</div>
        )}
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '580px', width: '100%' }}>
          {/* Intro */}
          {step === 0 && (
            <div className="echo-card animate-fade-in-up" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.25rem' }}>🧠</div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>How are you feeling?</h1>
              <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.7', marginBottom: '2rem' }}>
                This 20-question assessment takes about 3 minutes and will help us understand your emotional state so we can provide better support.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {['Completely confidential', '3 minutes', 'Accurate insights'].map(f => (
                  <span key={f} className="badge badge-purple">{f}</span>
                ))}
              </div>
              <button className="btn-primary" onClick={() => setStep(1)} style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                Begin Assessment →
              </button>
              <Link href="/mood-tracker/history" style={{ textDecoration: 'none', display: 'block', marginTop: '1rem' }}>
                <button className="btn-secondary" style={{ width: '100%', padding: '0.875rem' }}>
                  View History 🕒
                </button>
              </Link>
            </div>
          )}

          {/* Questions */}
          {step > 0 && step <= 20 && currentQ && (
            <div className="animate-fade-in-up" key={step}>
              {/* Progress bar */}
              <div className="progress-bar-track" style={{ marginBottom: '2rem' }}>
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>

              <div className="echo-card">
                <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Question {step} of 20
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '2rem', lineHeight: '1.5' }}>
                  {currentQ.text}
                </h2>

                {/* Scale buttons */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>
                    <span>{currentQ.type === 'scale_inverted' ? 'Not at all' : 'Very poor'}</span>
                    <span>{currentQ.type === 'scale_inverted' ? 'Extremely' : 'Excellent'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <button
                        key={n}
                        onClick={() => selectAnswer(n)}
                        disabled={loading}
                        style={{
                          flex: 1,
                          padding: '0.875rem 0',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--echo-border)',
                          background: 'var(--echo-surface-2)',
                          color: n <= 3 ? '#f87171' : n <= 6 ? '#fbbf24' : '#86efac',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          fontSize: '0.875rem',
                        }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-3px)'; (e.target as HTMLElement).style.borderColor = '#7c3aed'; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.borderColor = 'var(--echo-border)'; }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n} style={{ flex: 1, textAlign: 'center' }}>{n}</span>)}
                  </div>
                </div>
              </div>

              <button className="btn-secondary" onClick={() => setStep(s => Math.max(1, s - 1))} style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                ← Previous
              </button>
            </div>
          )}

          {/* Result */}
          {step === 21 && result && (
            <div className="echo-card animate-fade-in-up" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{MOOD_EMOJIS[result.mood] || '💭'}</div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: MOOD_COLORS[result.mood] || 'var(--echo-text)', marginBottom: '0.5rem' }}>
                {result.mood}
              </h2>
              <p style={{ color: 'var(--echo-text-muted)', marginBottom: '0.5rem' }}>Your mood score: <strong style={{ color: 'var(--echo-text)' }}>{result.score.toFixed(1)}/10</strong></p>
              
              <div style={{ background: 'var(--echo-surface-2)', borderRadius: '0.75rem', padding: '1.25rem', margin: '1.5rem 0', textAlign: 'left' }}>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.7', color: 'var(--echo-text-muted)' }}>
                  {result.mood === 'Radiant' && "You're in a wonderful state! Keep nurturing what's working for you and share that positive energy with others. 🌟"}
                  {result.mood === 'Calm' && "You seem to be in a balanced, peaceful state. This is a great time to reflect and set intentions. 🌿"}
                  {result.mood === 'Neutral' && "You're in a steady place. Consider trying some relaxation activities or talking to someone you trust. 💙"}
                  {result.mood === 'Uneasy' && "It sounds like you're going through some challenges. Talking to a volunteer might help ease what you're feeling. 🤝"}
                  {result.mood === 'Distressed' && "You seem to be struggling right now. Please reach out to one of our volunteers or try the AI Companion. You're not alone. 💜"}
                  {result.mood === 'Critical' && "I'm concerned about how you're feeling. Please connect with a volunteer or doctor right away. You matter and help is here. ❤️"}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flexDirection: 'column' }}>
                <Link href="/companion" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Talk to AI Companion 🤖</button>
                </Link>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link href="/volunteers" style={{ textDecoration: 'none', flex: 1 }}>
                    <button className="btn-secondary" style={{ width: '100%', padding: '0.875rem' }}>Talk to Peers 🤝</button>
                  </Link>
                  {result.mood === 'Critical' && (
                    <Link href="/doctors" style={{ textDecoration: 'none', flex: 1 }}>
                      <button className="btn-secondary" style={{ width: '100%', padding: '0.875rem', borderColor: 'var(--echo-accent)', color: 'var(--echo-accent)' }}>
                        Professional Care 👨‍⚕️
                      </button>
                    </Link>
                  )}
                </div>
              </div>
              <button onClick={() => { setStep(0); setAnswers({}); setResult(null); }} style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--echo-text-muted)', cursor: 'pointer', fontSize: '0.875rem' }}>
                Take again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

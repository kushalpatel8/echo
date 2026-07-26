'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

const MOOD_EMOJIS: Record<string, string> = {
  Radiant: '🌟', Calm: '😌', Neutral: '😐', Uneasy: '😟', Distressed: '😰', Critical: '😢'
};
const MOOD_COLORS: Record<string, string> = {
  Radiant: '#fde047', Calm: '#86efac', Neutral: '#93c5fd', Uneasy: '#fdba74', Distressed: '#fca5a5', Critical: '#f87171'
};

interface MoodLog {
  _id: string;
  detectedMood: string;
  moodScore: number;
  createdAt: string;
}

export default function MoodHistoryPage() {
  const { isLoaded, user } = useUser();
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetch('/api/mood')
        .then(res => res.json())
        .then(data => {
          setLogs(data.logs || []);
        })
        .finally(() => setLoading(false));
    }
  }, [isLoaded, user]);

  const deleteEntry = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this mood log?')) return;
    try {
      const res = await fetch('/api/mood', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
      });
      if (res.ok) {
        setLogs(prev => prev.filter(log => log._id !== logId));
      }
    } catch (err) {
      alert('Failed to delete log');
    }
  };

  const clearAllHistory = async () => {
    if (!confirm('This will PERMANENTLY delete all your assessment history. Are you absolutely sure?')) return;
    try {
      const res = await fetch('/api/mood', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteAll: true })
      });
      if (res.ok) {
        setLogs([]);
      }
    } catch (err) {
      alert('Failed to clear history');
    }
  };

  if (!isLoaded) return <div style={{ minHeight: '100vh', background: 'var(--echo-bg)' }} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
      {/* Dynamic Ambient Background Glow */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--echo-border)', background: 'var(--echo-surface)', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 10 }}>
        <Link href="/mood-tracker" style={{ textDecoration: 'none', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>← Back</Link>
        <div className="hide-desktop" style={{ fontWeight: '700' }}>🕒 Mood History</div>
        <div style={{ flex: 1 }} />
        {logs.length > 0 && (
          <button 
            onClick={() => clearAllHistory()}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ef4444', 
              fontSize: '0.8125rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            Clear History
          </button>
        )}
      </header>

      <div className="page-container" style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem' }}>Your Journey</h1>
          <p style={{ color: 'var(--echo-text-muted)' }}>Reflect on your emotional trends over the past few assessments.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--echo-text-muted)' }}>Retrieving your emotional history...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="echo-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📖</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Your story begins here</h2>
            <p style={{ color: 'var(--echo-text-muted)', marginBottom: '1.5rem' }}>You haven't completed any mood assessments yet.</p>
            <Link href="/mood-tracker">
              <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Start your first check-in</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {logs.map((log) => (
              <div key={log._id} className="echo-card animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem' }}>
                  {MOOD_EMOJIS[log.detectedMood] || '💭'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontWeight: '800', color: MOOD_COLORS[log.detectedMood] || 'var(--echo-text)' }}>
                      {log.detectedMood}
                    </h3>
                    <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '4px', background: 'var(--echo-surface-2)', color: 'var(--echo-text-muted)', fontWeight: '600' }}>
                      {log.moodScore.toFixed(1)}/10
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)', marginTop: '0.125rem' }}>
                    {new Date(log.createdAt).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div style={{ 
                  width: '4px', 
                  height: '40px', 
                  borderRadius: '2px', 
                  background: MOOD_COLORS[log.detectedMood] || 'var(--echo-border)' 
                }} />
                <button 
                  onClick={() => deleteEntry(log._id)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--echo-text-muted)', 
                    cursor: 'pointer', 
                    padding: '0.5rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--echo-text-muted)'}
                >
                  <span style={{ fontSize: '1.25rem' }}>🗑️</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

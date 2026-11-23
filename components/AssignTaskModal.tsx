'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, ClipboardList } from 'lucide-react';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  currentThemePrimary?: string;
  onSuccess?: () => void;
}

const TEMPLATES = [
  {
    title: '🧘 10-Min Mindful Breathing',
    desc: 'Take 10 minutes in a quiet space to focus on slow diaphragmatic breathing (inhale 4s, hold 4s, exhale 6s).',
  },
  {
    title: '📝 Daily Gratitude Journaling',
    desc: 'Write down 3 specific things you are genuinely grateful for today, along with one sentence explaining why.',
  },
  {
    title: '🚶 15-Min Gentle Nature Walk',
    desc: 'Step outside for a 15-minute screen-free walk. Notice 5 sights, 4 sounds, and 3 physical sensations around you.',
  },
  {
    title: '💧 Hydration & Screen Break',
    desc: 'Drink a full glass of water and rest your eyes away from any phone or monitor screens for 10 minutes.',
  },
];

export default function AssignTaskModal({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
  currentThemePrimary = '#a78bfa',
  onSuccess,
}: AssignTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both title and description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          assigneeId: targetUserId,
          assigneeName: targetUserName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign task');
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setDescription('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--echo-surface)',
          border: '1px solid var(--echo-border)',
          borderRadius: '24px',
          padding: '1.75rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={20} style={{ color: currentThemePrimary }} />
            <h3 style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--echo-text)', margin: 0 }}>
              Assign Task to {targetUserName}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--echo-text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={42} style={{ color: '#22c55e', margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontWeight: '700', color: 'var(--echo-text)', marginBottom: '0.25rem' }}>
              Task Assigned!
            </h4>
            <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>
              {targetUserName} can now view this wellness task on their dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.8125rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Templates */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
                <Sparkles size={12} color={currentThemePrimary} /> Quick Templates:
              </span>
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
                {TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(tmpl.title);
                      setDescription(tmpl.desc);
                    }}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      border: '1px solid var(--echo-border)',
                      background: 'var(--echo-surface-2)',
                      color: 'var(--echo-text)',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                    }}
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="echo-label">Task Title</label>
                <input
                  type="text"
                  className="echo-input"
                  placeholder="e.g., 10-Minute Mindful Breathing"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="echo-label">Description / Guidance</label>
                <textarea
                  className="echo-input"
                  placeholder="Provide instructions or mindful encouragement..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  rows={3}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim()}
                className="btn-primary"
                style={{
                  background: currentThemePrimary,
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  opacity: (!title.trim() || !description.trim()) ? 0.6 : 1,
                }}
              >
                {submitting ? 'Assigning...' : 'Assign Task'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  User,
  Users,
  ChevronRight,
  X,
  AlertCircle,
  ClipboardList
} from 'lucide-react';
import type { AssigneeCandidate } from '@/types';

interface TaskAssignmentSectionProps {
  currentThemePrimary: string;
  role: 'volunteer' | 'doctor';
  preselectedUserId?: string;
  onTasksUpdated?: (newCount: number) => void;
}

const TEMPLATES = [
  {
    title: '🧘 10-Min Mindful Breathing',
    desc: 'Take 10 minutes in a quiet space to focus on slow, diaphragmatic breathing (inhale 4s, hold 4s, exhale 6s).',
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
  {
    title: '😴 Relaxing Bedtime Wind-Down',
    desc: 'Dim the room lights 45 minutes before sleep, turn off device notifications, and listen to calming ambient audio.',
  },
];

export default function TaskAssignmentSection({
  currentThemePrimary,
  role,
  preselectedUserId,
  onTasksUpdated,
}: TaskAssignmentSectionProps) {
  const [candidates, setCandidates] = useState<AssigneeCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AssigneeCandidate | null>(null);

  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct'>('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch candidates
  useEffect(() => {
    let isMounted = true;
    setLoadingCandidates(true);
    fetch('/api/tasks/candidates')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const list: AssigneeCandidate[] = data.users || [];
        setCandidates(list);

        if (preselectedUserId) {
          const found = list.find(u => u.clerkId === preselectedUserId);
          if (found) setSelectedUser(found);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingCandidates(false);
      });

    return () => { isMounted = false; };
  }, [preselectedUserId]);

  // Fetch created tasks
  const loadTasks = () => {
    setLoadingTasks(true);
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        const fetchedTasks = data.tasks || [];
        setTasks(fetchedTasks);
        if (onTasksUpdated) onTasksUpdated(fetchedTasks.length);
      })
      .catch(() => {})
      .finally(() => setLoadingTasks(false));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(user => {
      if (filterType === 'direct' && !user.isDirect) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        user.name?.toLowerCase().includes(q) ||
        user.relationship?.toLowerCase().includes(q)
      );
    });
  }, [candidates, filterType, searchQuery]);

  const directCount = useMemo(() => candidates.filter(c => c.isDirect).length, [candidates]);

  // Assign task handler
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setFeedback({ type: 'error', message: 'Please select a user first.' });
      return;
    }
    if (!title.trim() || !description.trim()) {
      setFeedback({ type: 'error', message: 'Please provide both a title and description.' });
      return;
    }

    setAssigning(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          assigneeId: selectedUser.clerkId,
          assigneeName: selectedUser.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign task');
      }

      setFeedback({
        type: 'success',
        message: `Task successfully assigned to ${selectedUser.name}!`,
      });
      setTitle('');
      setDescription('');
      loadTasks();

      setTimeout(() => {
        setFeedback(prev => (prev?.type === 'success' ? null : prev));
      }, 5000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Something went wrong.' });
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setDeletingId(taskId);
    try {
      const res = await fetch(`/api/tasks?taskId=${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter((t: any) => t._id !== taskId));
        if (onTasksUpdated) onTasksUpdated(Math.max(0, tasks.length - 1));
      } else {
        alert('Could not delete task.');
      }
    } catch {
      alert('Network error while deleting task.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTasks = useMemo(() => {
    if (taskStatusFilter === 'all') return tasks;
    return tasks.filter((t: any) => t.status === taskStatusFilter);
  }, [tasks, taskStatusFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── CREATE / ASSIGN TASK CARD ── */}
      <div
        className="glass"
        style={{
          padding: '2rem',
          borderRadius: '24px',
          border: '1px solid var(--echo-border)',
          background: 'var(--echo-surface)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--echo-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={22} style={{ color: currentThemePrimary }} />
              Assign Personalized Wellness Task
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)', marginTop: '0.25rem' }}>
              Select a {role === 'doctor' ? 'patient' : 'user'}, choose or write a mindful micro-habit, and guide their recovery.
            </p>
          </div>
          {selectedUser && (
            <button
              onClick={() => setSelectedUser(null)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <X size={14} /> Change User
            </button>
          )}
        </div>

        {feedback && (
          <div
            style={{
              padding: '0.875rem 1.25rem',
              borderRadius: '14px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: feedback.type === 'success' ? '#22c55e' : '#ef4444',
            }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* ── STEP 1: USER SELECTION ── */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label className="echo-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: currentThemePrimary, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>1</span>
            <span>Select Recipient ({role === 'doctor' ? 'Patient' : 'User'})</span>
          </label>

          {selectedUser ? (
            /* Selected User Display Card */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: '16px',
                border: `2px solid ${currentThemePrimary}88`,
                background: 'var(--echo-surface-2)',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${currentThemePrimary}, #7c3aed)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: '800',
                    fontSize: '1.125rem',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {selectedUser.imageUrl ? (
                    <img src={selectedUser.imageUrl} alt={selectedUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    selectedUser.name?.[0] || 'U'
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--echo-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{selectedUser.name}</span>
                    <span className={`status-dot ${selectedUser.isOnline ? 'online' : 'offline'}`} />
                    <span style={{ fontSize: '0.7rem', color: selectedUser.isOnline ? '#22c55e' : 'var(--echo-text-muted)' }}>
                      {selectedUser.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.6875rem' }}>{selectedUser.relationship}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                style={{
                  background: 'none',
                  border: '1px solid var(--echo-border)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '10px',
                  color: 'var(--echo-text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                Change
              </button>
            </div>
          ) : (
            /* User Search and Selection List */
            <div
              style={{
                borderRadius: '16px',
                border: '1px solid var(--echo-border)',
                background: 'var(--echo-surface-2)',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--echo-text-muted)' }} />
                  <input
                    type="text"
                    className="echo-input"
                    placeholder={`Search ${role === 'doctor' ? 'patients' : 'users'} by name...`}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '2.5rem', background: 'var(--echo-bg)', fontSize: '0.875rem' }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--echo-text-muted)', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: 'none',
                      background: filterType === 'all' ? currentThemePrimary : 'var(--echo-bg)',
                      color: filterType === 'all' ? '#fff' : 'var(--echo-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    All ({candidates.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('direct')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: 'none',
                      background: filterType === 'direct' ? currentThemePrimary : 'var(--echo-bg)',
                      color: filterType === 'direct' ? '#fff' : 'var(--echo-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {role === 'doctor' ? 'My Patients' : 'My Chats'} ({directCount})
                  </button>
                </div>
              </div>

              {loadingCandidates ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>
                  Loading available users...
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>
                  No users found matching "{searchQuery}".
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: '230px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    paddingRight: '0.25rem',
                  }}
                >
                  {filteredCandidates.map(cand => (
                    <div
                      key={cand.clerkId}
                      onClick={() => {
                        setSelectedUser(cand);
                        setFeedback(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '12px',
                        background: 'var(--echo-bg)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: '1px solid transparent',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `${currentThemePrimary}66`;
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${currentThemePrimary}, #8b5cf6)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          {cand.imageUrl ? (
                            <img src={cand.imageUrl} alt={cand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            cand.name?.[0] || 'U'
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--echo-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>{cand.name}</span>
                            <span className={`status-dot ${cand.isOnline ? 'online' : 'offline'}`} />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>
                            {cand.relationship}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          className={`badge ${cand.isDirect ? 'badge-green' : 'badge-purple'}`}
                          style={{ fontSize: '0.6875rem' }}
                        >
                          {cand.relationship}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: currentThemePrimary, display: 'flex', alignItems: 'center' }}>
                          Select <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── STEP 2: TASK DETAILS & TEMPLATES ── */}
        <form onSubmit={handleAssignTask}>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label className="echo-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: currentThemePrimary, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>2</span>
                <span>Task Information & Guidance</span>
              </label>

              <span style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sparkles size={12} color={currentThemePrimary} /> Quick Templates:
              </span>
            </div>

            {/* Quick Templates Pill Row */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTitle(tmpl.title);
                    setDescription(tmpl.desc);
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '1px solid var(--echo-border)',
                    background: 'var(--echo-surface-2)',
                    color: 'var(--echo-text)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = currentThemePrimary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--echo-border)'; }}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="echo-label">Task Title *</label>
                <input
                  type="text"
                  className="echo-input"
                  placeholder="e.g., 10-Minute Morning Mindful Breathing"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="echo-label">Instructions / Description *</label>
                <textarea
                  className="echo-input"
                  placeholder="Describe the steps, encouragement, or frequency for this self-care task..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  rows={3}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={assigning || !selectedUser || !title.trim() || !description.trim()}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '14px',
              background: currentThemePrimary,
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: (!selectedUser || !title.trim() || !description.trim()) ? 'not-allowed' : 'pointer',
              opacity: (!selectedUser || !title.trim() || !description.trim()) ? 0.6 : 1,
            }}
          >
            {assigning ? (
              'Assigning Task...'
            ) : selectedUser ? (
              <>
                <CheckCircle2 size={16} /> Assign Task to {selectedUser.name}
              </>
            ) : (
              'Select a User to Assign Task'
            )}
          </button>
        </form>
      </div>

      {/* ── ASSIGNED TASKS HISTORY SECTION ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--echo-text)' }}>
              Assigned Tasks History ({tasks.length})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>
              Track the progress of wellness tasks you have prescribed.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {(['all', 'pending', 'in-progress', 'completed'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setTaskStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: 'none',
                  background: taskStatusFilter === st ? currentThemePrimary : 'var(--echo-surface)',
                  color: taskStatusFilter === st ? '#fff' : 'var(--echo-text-muted)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {st === 'all' ? `All (${tasks.length})` : st}
              </button>
            ))}
          </div>
        </div>

        {loadingTasks ? (
          <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
            <p style={{ color: 'var(--echo-text-muted)' }}>Loading assigned tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="glass" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
            <p style={{ color: 'var(--echo-text)', fontWeight: '600', marginBottom: '0.25rem' }}>No tasks found</p>
            <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.8125rem' }}>
              {tasks.length === 0
                ? `You haven't assigned any wellness tasks yet. Select a ${role === 'doctor' ? 'patient' : 'user'} above to get started!`
                : `No tasks matching the "${taskStatusFilter}" filter.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredTasks.map((t: any) => (
              <div
                key={t._id}
                className="glass echo-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '20px',
                  border: '1px solid var(--echo-border)',
                  background: 'var(--echo-surface)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--echo-text)', margin: 0 }}>
                      {t.title}
                    </h4>
                    <span
                      className={`badge badge-${
                        t.status === 'completed' ? 'green' : t.status === 'in-progress' ? 'yellow' : 'purple'
                      }`}
                      style={{ fontSize: '0.6875rem' }}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--echo-text-muted)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                    {t.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--echo-text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={13} style={{ color: currentThemePrimary }} />
                      Assigned to: <strong style={{ color: 'var(--echo-text)' }}>{t.assigneeName || 'User'}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(t._id)}
                  disabled={deletingId === t._id}
                  title="Delete task"
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

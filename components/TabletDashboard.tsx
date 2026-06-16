'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageCircle, Heart, Quote, Bot, Stethoscope,
  Gamepad2, BookOpen, Sparkles, TrendingUp, CheckCircle2, Activity,
} from 'lucide-react';

const ACTIONS = [
  {
    href: '/doctors',
    label: 'Expert Doctors',
    description: 'Book a verified professional',
    emoji: '🩺',
    icon: Stethoscope,
    color: '#5eead4',
    glow: 'rgba(94,234,212,0.2)',
    grad: 'linear-gradient(135deg,rgba(94,234,212,0.15) 0%,rgba(94,234,212,0.03) 100%)',
    border: 'rgba(94,234,212,0.3)',
  },
  {
    href: '/volunteers',
    label: 'Chat with Volunteer',
    description: 'Talk to a caring peer',
    emoji: '🤝',
    icon: MessageCircle,
    color: '#86efac',
    glow: 'rgba(134,239,172,0.2)',
    grad: 'linear-gradient(135deg,rgba(134,239,172,0.15) 0%,rgba(134,239,172,0.03) 100%)',
    border: 'rgba(134,239,172,0.3)',
  },
  {
    href: '/mood-tracker',
    label: 'Mood Tracker',
    description: 'Log & visualise your mood',
    emoji: '💭',
    icon: Heart,
    color: '#f9a8d4',
    glow: 'rgba(249,168,212,0.2)',
    grad: 'linear-gradient(135deg,rgba(249,168,212,0.15) 0%,rgba(249,168,212,0.03) 100%)',
    border: 'rgba(249,168,212,0.3)',
  },
  {
    href: '/relaxation',
    label: 'Relaxation Room',
    description: 'Breathe & unwind',
    emoji: '🧘',
    icon: Quote,
    color: '#fde047',
    glow: 'rgba(253,224,71,0.2)',
    grad: 'linear-gradient(135deg,rgba(253,224,71,0.15) 0%,rgba(253,224,71,0.03) 100%)',
    border: 'rgba(253,224,71,0.3)',
  },
  {
    href: '/companion',
    label: 'AI Companion',
    description: 'Empathetic AI, 24/7',
    emoji: '🤖',
    icon: Bot,
    color: '#99f6e4',
    glow: 'rgba(153,246,228,0.2)',
    grad: 'linear-gradient(135deg,rgba(153,246,228,0.15) 0%,rgba(153,246,228,0.03) 100%)',
    border: 'rgba(153,246,228,0.3)',
  },
  {
    href: '/games',
    label: 'Relax Games',
    description: 'Calm your mind through play',
    emoji: '🎮',
    icon: Gamepad2,
    color: '#c4b5fd',
    glow: 'rgba(196,181,253,0.2)',
    grad: 'linear-gradient(135deg,rgba(196,181,253,0.15) 0%,rgba(196,181,253,0.03) 100%)',
    border: 'rgba(196,181,253,0.3)',
  },
  {
    href: '/relaxation/books',
    label: 'Curated Library',
    description: 'Timeless wisdom, curated',
    emoji: '📚',
    icon: BookOpen,
    color: '#fdba74',
    glow: 'rgba(253,186,116,0.2)',
    grad: 'linear-gradient(135deg,rgba(253,186,116,0.15) 0%,rgba(253,186,116,0.03) 100%)',
    border: 'rgba(253,186,116,0.3)',
  },
];

interface TabletDashboardProps {
  userName?: string;
  tasksPending?: number;
  tasksCompleted?: number;
  moodChecks?: number;
  latestMood?: {
    label: string;
    score: number;
    emoji: string;
    color: string;
  } | null;
}

export default function TabletDashboard({
  userName,
  tasksPending = 0,
  tasksCompleted = 0,
  moodChecks = 0,
  latestMood = null,
}: TabletDashboardProps) {
  const firstName = userName?.split(' ')[0] || null;

  const stats = [
    { label: 'Tasks Pending',   value: tasksPending,   icon: TrendingUp,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
    { label: 'Tasks Completed', value: tasksCompleted, icon: CheckCircle2,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)' },
    { label: 'Mood Checks',     value: moodChecks,     icon: Activity,      color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
  ];

  return (
    <div className="tdb-root">

      {/* ── Hero header ── */}
      <div className="tdb-hero">
        <div className="tdb-hero-orb tdb-hero-orb-1" />
        <div className="tdb-hero-orb tdb-hero-orb-2" />

        <div className="tdb-hero-content">
          <span className="tdb-badge">
            <Sparkles size={12} style={{ display:'inline', verticalAlign:'middle', marginRight:'5px' }} />
            Your sanctuary
          </span>
          <h1 className="tdb-hero-title">
            {firstName ? (
              <>Welcome back, <span className="gradient-text">{firstName}</span> 👋</>
            ) : (
              <>Welcome to <span className="gradient-text">Echo</span> 👋</>
            )}
          </h1>
          <p className="tdb-hero-sub">How are you feeling today?</p>
        </div>

        {/* ── Stat chips ── */}
        <div className="tdb-stats-row">
          {stats.map(s => (
            <div
              key={s.label}
              className="tdb-stat"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <div className="tdb-stat-icon-wrap" style={{ color: s.color }}>
                <s.icon size={18} strokeWidth={2} />
              </div>
              <div>
                <div className="tdb-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="tdb-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Latest mood banner ── */}
      {latestMood && (
        <Link href="/mood-tracker" className="tdb-mood-link">
          <div
            className="tdb-mood-banner"
            style={{ borderColor: latestMood.color + '55', background: `linear-gradient(135deg, ${latestMood.color}14 0%, transparent 70%)` }}
          >
            <div className="tdb-mood-orb" style={{ background: latestMood.color + '28' }} />
            <span className="tdb-mood-emoji">{latestMood.emoji}</span>
            <div className="tdb-mood-info">
              <div className="tdb-mood-eyebrow">Latest Mood Check</div>
              <div className="tdb-mood-name" style={{ color: latestMood.color }}>{latestMood.label}</div>
            </div>
            <div className="tdb-mood-score-wrap">
              <span className="tdb-mood-score" style={{ color: latestMood.color }}>{latestMood.score.toFixed(1)}</span>
              <span className="tdb-mood-denom">/10</span>
            </div>
            <div className="tdb-mood-cta">
              <span>Check again</span>
              <span className="tdb-mood-arrow" style={{ color: latestMood.color }}>→</span>
            </div>
          </div>
        </Link>
      )}

      {/* ── Action grid ── */}
      <div className="tdb-grid">
        {ACTIONS.map((a, i) => (
          <Link
            key={a.href}
            href={a.href}
            className="tdb-card-link"
            style={{ '--delay': `${i * 55}ms` } as React.CSSProperties}
          >
            <div
              className="tdb-card"
              style={{
                '--c-glow':   a.glow,
                '--c-grad':   a.grad,
                '--c-border': a.border,
                '--c-color':  a.color,
              } as React.CSSProperties}
            >
              {/* gradient wash */}
              <div className="tdb-card-wash" />
              {/* corner glow */}
              <div className="tdb-card-corner" style={{ background: a.glow }} />

              {/* top row: emoji tag + arrow */}
              <div className="tdb-card-top">
                <span className="tdb-card-emoji">{a.emoji}</span>
                <span className="tdb-card-arrow" style={{ color: a.color }}>→</span>
              </div>

              {/* icon */}
              <div
                className="tdb-card-icon"
                style={{ background: a.glow, border: `1px solid ${a.border}` }}
              >
                <a.icon size={22} color={a.color} strokeWidth={1.5} />
              </div>

              {/* text */}
              <div className="tdb-card-text">
                <div className="tdb-card-label">{a.label}</div>
                <div className="tdb-card-desc">{a.description}</div>
              </div>

              {/* bottom accent */}
              <div className="tdb-card-line" style={{ background: a.color }} />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        .tdb-root {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 0.25rem 0 1rem;
        }

        /* Hero */
        .tdb-hero {
          position: relative;
          border-radius: 1.75rem;
          padding: 1.75rem 1.5rem;
          overflow: hidden;
          background: var(--echo-glass-bg);
          border: 1px solid var(--echo-border);
          backdrop-filter: blur(24px);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .tdb-hero-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .tdb-hero-orb-1 {
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%);
        }
        .tdb-hero-orb-2 {
          bottom: -40px; left: -40px;
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%);
        }

        .tdb-hero-content { position: relative; z-index: 1; }

        .tdb-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.28rem 0.8rem;
          border-radius: 999px;
          background: var(--echo-primary-low);
          border: 1px solid rgba(245,158,11,0.3);
          color: var(--echo-primary-light);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .tdb-hero-title {
          font-size: clamp(1.5rem, 3vw, 1.875rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--echo-text);
          margin-bottom: 0.4rem;
        }

        .tdb-hero-sub {
          color: var(--echo-text-muted);
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Stats row */
        .tdb-stats-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .tdb-stat {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.6rem 1rem;
          border-radius: 1rem;
          backdrop-filter: blur(12px);
        }

        .tdb-stat-icon-wrap {
          width: 32px; height: 32px;
          border-radius: 0.6rem;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.07);
          flex-shrink: 0;
        }

        .tdb-stat-value {
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1;
        }

        .tdb-stat-label {
          font-size: 0.625rem;
          color: var(--echo-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-top: 0.1rem;
        }

        /* Mood banner */
        .tdb-mood-link { text-decoration: none; display: block; }

        .tdb-mood-banner {
          position: relative;
          border-radius: 1.375rem;
          border: 1px solid;
          padding: 1.125rem 1.375rem;
          display: flex;
          align-items: center;
          gap: 1.125rem;
          overflow: hidden;
          backdrop-filter: blur(20px);
          cursor: pointer;
          transition: transform 0.28s cubic-bezier(0.23,1,0.32,1), box-shadow 0.28s ease;
        }

        .tdb-mood-banner:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12);
        }

        .tdb-mood-orb {
          position: absolute;
          top: -30px; right: -30px;
          width: 130px; height: 130px;
          border-radius: 50%;
          pointer-events: none;
        }

        .tdb-mood-emoji { font-size: 2.25rem; flex-shrink: 0; position: relative; z-index: 1; }

        .tdb-mood-info { position: relative; z-index: 1; }

        .tdb-mood-eyebrow {
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--echo-text-muted);
          margin-bottom: 0.2rem;
          font-weight: 600;
        }

        .tdb-mood-name {
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1;
        }

        .tdb-mood-score-wrap {
          margin-left: auto;
          line-height: 1;
          position: relative;
          z-index: 1;
        }

        .tdb-mood-score { font-size: 2rem; font-weight: 900; }
        .tdb-mood-denom { font-size: 0.875rem; color: var(--echo-text-muted); font-weight: 500; }

        .tdb-mood-cta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.15rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--echo-text-muted);
          white-space: nowrap;
          position: relative;
          z-index: 1;
          padding-left: 0.5rem;
        }

        .tdb-mood-arrow {
          font-size: 1rem;
          font-weight: 800;
          transition: transform 0.2s ease;
        }

        .tdb-mood-banner:hover .tdb-mood-arrow { transform: translateX(3px); }

        /* Grid */
        .tdb-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.9rem;
        }

        .tdb-card-link {
          text-decoration: none;
          display: flex;
          animation: tdb-up 0.45s ease both;
          animation-delay: var(--delay, 0ms);
        }

        @keyframes tdb-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Card */
        .tdb-card {
          width: 100%;
          position: relative;
          border-radius: 1.375rem;
          padding: 1.125rem 1rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          cursor: pointer;
          background: var(--echo-glass-bg);
          border: 1px solid var(--c-border, var(--echo-border));
          backdrop-filter: blur(18px);
          transition: transform 0.28s cubic-bezier(0.23,1,0.32,1),
                      box-shadow 0.28s ease,
                      border-color 0.2s;
        }

        .tdb-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: var(--c-color, var(--echo-primary));
          box-shadow: 0 16px 40px var(--c-glow, rgba(0,0,0,0.15));
        }

        .tdb-card:active { transform: scale(0.97); }

        .tdb-card-wash {
          position: absolute; inset: 0;
          background: var(--c-grad, transparent);
          border-radius: inherit;
          pointer-events: none; z-index: 0;
          opacity: 0.9;
          transition: opacity 0.3s;
        }
        .tdb-card:hover .tdb-card-wash { opacity: 1; }

        .tdb-card-corner {
          position: absolute;
          bottom: -20px; right: -20px;
          width: 80px; height: 80px;
          border-radius: 50%;
          filter: blur(20px);
          pointer-events: none; z-index: 0;
          transition: transform 0.3s ease;
        }
        .tdb-card:hover .tdb-card-corner { transform: scale(1.4); }

        .tdb-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative; z-index: 1;
        }

        .tdb-card-emoji { font-size: 1.5rem; line-height: 1; }

        .tdb-card-arrow {
          font-size: 1rem;
          font-weight: 800;
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s, transform 0.2s;
        }
        .tdb-card:hover .tdb-card-arrow { opacity: 1; transform: translateX(0); }

        .tdb-card-icon {
          width: 44px; height: 44px;
          border-radius: 0.875rem;
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1;
          transition: transform 0.25s ease;
          flex-shrink: 0;
        }
        .tdb-card:hover .tdb-card-icon { transform: rotate(-8deg) scale(1.1); }

        .tdb-card-text {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 0.2rem;
        }

        .tdb-card-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--echo-text);
          line-height: 1.2;
        }

        .tdb-card-desc {
          font-size: 0.7rem;
          color: var(--echo-text-muted);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tdb-card-line {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2.5px;
          border-radius: 0 0 1.375rem 1.375rem;
          opacity: 0.5;
          transform: scaleX(0.35);
          transform-origin: left;
          transition: transform 0.3s ease, opacity 0.3s;
        }
        .tdb-card:hover .tdb-card-line { transform: scaleX(1); opacity: 1; }
      `}</style>
    </div>
  );
}

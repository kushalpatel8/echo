'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, Quote, Bot, Stethoscope, Gamepad2, Sparkles, BookOpen } from 'lucide-react';

const ACTIONS = [
  {
    href: '/doctors',
    label: 'Expert Doctors',
    emoji: '🩺',
    icon: Stethoscope,
    color: '#5eead4',
    glow: 'rgba(94,234,212,0.22)',
    grad: 'linear-gradient(135deg, rgba(94,234,212,0.18) 0%, rgba(94,234,212,0.04) 100%)',
    border: 'rgba(94,234,212,0.35)',
    tag: 'Book now',
  },
  {
    href: '/volunteers',
    label: 'Chat with Volunteer',
    emoji: '🤝',
    icon: MessageCircle,
    color: '#86efac',
    glow: 'rgba(134,239,172,0.22)',
    grad: 'linear-gradient(135deg, rgba(134,239,172,0.18) 0%, rgba(134,239,172,0.04) 100%)',
    border: 'rgba(134,239,172,0.35)',
    tag: 'Online',
  },
  {
    href: '/mood-tracker',
    label: 'Mood Tracker',
    emoji: '💭',
    icon: Heart,
    color: '#f9a8d4',
    glow: 'rgba(249,168,212,0.22)',
    grad: 'linear-gradient(135deg, rgba(249,168,212,0.18) 0%, rgba(249,168,212,0.04) 100%)',
    border: 'rgba(249,168,212,0.35)',
    tag: 'Log today',
  },
  {
    href: '/relaxation',
    label: 'Relaxation Room',
    emoji: '🧘',
    icon: Quote,
    color: '#fde047',
    glow: 'rgba(253,224,71,0.22)',
    grad: 'linear-gradient(135deg, rgba(253,224,71,0.18) 0%, rgba(253,224,71,0.04) 100%)',
    border: 'rgba(253,224,71,0.35)',
    tag: 'Breathe',
  },
  {
    href: '/companion',
    label: 'AI Companion',
    emoji: '🤖',
    icon: Bot,
    color: '#99f6e4',
    glow: 'rgba(153,246,228,0.22)',
    grad: 'linear-gradient(135deg, rgba(153,246,228,0.18) 0%, rgba(153,246,228,0.04) 100%)',
    border: 'rgba(153,246,228,0.35)',
    tag: '24/7',
  },
  {
    href: '/games',
    label: 'Relax Games',
    emoji: '🎮',
    icon: Gamepad2,
    color: '#c4b5fd',
    glow: 'rgba(196,181,253,0.22)',
    grad: 'linear-gradient(135deg, rgba(196,181,253,0.18) 0%, rgba(196,181,253,0.04) 100%)',
    border: 'rgba(196,181,253,0.35)',
    tag: 'Play',
  },
  {
    href: '/relaxation/books',
    label: 'Curated Library',
    emoji: '📚',
    icon: BookOpen,
    color: '#fdba74',
    glow: 'rgba(253,186,116,0.22)',
    grad: 'linear-gradient(135deg, rgba(253,186,116,0.18) 0%, rgba(253,186,116,0.04) 100%)',
    border: 'rgba(253,186,116,0.35)',
    tag: 'Read',
  },
];

export default function MobileDashboard() {
  return (
    <div className="mdb-root">

      {/* ── Hero banner ── */}
      <div className="mdb-hero">
        <div className="mdb-hero-orb" />
        <div className="mdb-hero-inner">
          <span className="mdb-hero-badge">
            <Sparkles size={13} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
            Your sanctuary
          </span>
          <h1 className="mdb-hero-title">
            Welcome to<br />
            <span className="gradient-text">Echo</span>
          </h1>
          <p className="mdb-hero-sub">How are you feeling today?</p>
        </div>
      </div>

      {/* ── Featured "AI Companion" wide card ── */}
      <Link href="/companion" className="mdb-featured-link">
        <div className="mdb-featured-card mdb-card-companion">
          <div className="mdb-featured-orb" />
          <div className="mdb-featured-content">
            <span className="mdb-tag" style={{ background: 'rgba(153,246,228,0.18)', color: '#99f6e4', borderColor: 'rgba(153,246,228,0.35)' }}>24/7 Available</span>
            <div className="mdb-featured-title">AI Companion</div>
            <div className="mdb-featured-desc">Your empathetic AI, always here for you</div>
          </div>
          <div className="mdb-featured-icon-wrap">
            <Bot size={36} color="#99f6e4" strokeWidth={1.4} />
          </div>
          <div className="mdb-featured-arrow">→</div>
        </div>
      </Link>

      {/* ── 2-column grid (remaining 5 actions) ── */}
      <div className="mdb-grid">
        {ACTIONS.filter(a => a.href !== '/companion').map((action, i) => (
          <Link
            key={action.href}
            href={action.href}
            className="mdb-card-link"
            style={{ '--delay': `${i * 60}ms` } as React.CSSProperties}
          >
            <div
              className={`mdb-card mdb-card-${action.href.replace(/\//g, '')}`}
              style={{
                '--card-glow':   action.glow,
                '--card-grad':   action.grad,
                '--card-border': action.border,
                '--card-color':  action.color,
              } as React.CSSProperties}
            >
              {/* gradient bg */}
              <div className="mdb-card-bg" />

              {/* corner glow */}
              <div className="mdb-card-corner-glow" />

              {/* Tag pill */}
              <span
                className="mdb-tag mdb-card-tag"
                style={{
                  background: action.glow,
                  color: action.color,
                  borderColor: action.border,
                }}
              >
                {action.tag}
              </span>

              {/* Icon */}
              <div className="mdb-card-icon-wrap">
                <span className="mdb-card-emoji">{action.emoji}</span>
                <div
                  className="mdb-card-icon-ring"
                  style={{ borderColor: action.border, background: action.glow }}
                >
                  <action.icon size={24} color={action.color} strokeWidth={1.5} />
                </div>
              </div>

              <span className="mdb-card-label">{action.label}</span>

              {/* bottom accent line */}
              <div className="mdb-card-line" style={{ background: action.color }} />
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        /* ── Root ── */
        .mdb-root {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 0.25rem 0 1rem;
        }

        /* ── Hero ── */
        .mdb-hero {
          position: relative;
          border-radius: 1.75rem;
          padding: 2rem 1.5rem 1.75rem;
          overflow: hidden;
          background: var(--echo-surface);
          border: 1px solid var(--echo-border);
        }

        .mdb-hero-orb {
          position: absolute;
          top: -60px;
          right: -60px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%);
          pointer-events: none;
        }

        .mdb-hero-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .mdb-hero-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.3rem 0.875rem;
          border-radius: 999px;
          background: var(--echo-primary-low);
          border: 1px solid rgba(245,158,11,0.3);
          color: var(--echo-primary-light);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          margin-bottom: 0.875rem;
        }

        .mdb-hero-title {
          font-size: 2.25rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: var(--echo-text);
          margin-bottom: 0.625rem;
        }

        .mdb-hero-sub {
          color: var(--echo-text-muted);
          font-size: 0.9375rem;
          font-weight: 500;
        }

        /* ── Tag pill (reusable) ── */
        .mdb-tag {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          border: 1px solid transparent;
          text-transform: uppercase;
        }

        /* ── Featured card ── */
        .mdb-featured-link { text-decoration: none; display: block; }

        .mdb-featured-card {
          position: relative;
          border-radius: 1.5rem;
          padding: 1.375rem 1.375rem 1.375rem 1.5rem;
          overflow: hidden;
          background: var(--echo-surface);
          border: 1px solid var(--echo-border);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.28s cubic-bezier(0.23,1,0.32,1), box-shadow 0.28s ease, border-color 0.2s;
        }

        .mdb-featured-card:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: rgba(153,246,228,0.55);
          box-shadow: 0 16px 40px rgba(153,246,228,0.15);
        }

        .mdb-featured-card:active { transform: scale(0.98); }

        .mdb-featured-orb {
          position: absolute;
          top: -40px; right: -40px;
          width: 150px; height: 150px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(153,246,228,0.3) 0%, transparent 70%);
          pointer-events: none;
        }

        .mdb-featured-content {
          flex: 1;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .mdb-featured-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--echo-text);
          letter-spacing: -0.02em;
          margin-top: 0.35rem;
        }

        .mdb-featured-desc {
          font-size: 0.8125rem;
          color: var(--echo-text-muted);
          line-height: 1.4;
        }

        .mdb-featured-icon-wrap {
          flex-shrink: 0;
          width: 68px; height: 68px;
          border-radius: 1.25rem;
          background: rgba(153,246,228,0.12);
          border: 1px solid rgba(153,246,228,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          transition: transform 0.25s ease;
        }

        .mdb-featured-card:hover .mdb-featured-icon-wrap {
          transform: rotate(-6deg) scale(1.08);
        }

        .mdb-featured-arrow {
          position: absolute;
          bottom: 1.125rem;
          right: 1.125rem;
          font-size: 1rem;
          color: #99f6e4;
          font-weight: 700;
          opacity: 0.7;
          transition: opacity 0.2s, transform 0.2s;
        }

        .mdb-featured-card:hover .mdb-featured-arrow {
          opacity: 1;
          transform: translateX(3px);
        }

        /* ── Grid ── */
        .mdb-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .mdb-card-link {
          text-decoration: none;
          display: flex;
          animation: mdb-slide-up 0.5s ease both;
          animation-delay: var(--delay, 0ms);
        }

        @keyframes mdb-slide-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Card ── */
        .mdb-card {
          width: 100%;
          position: relative;
          border-radius: 1.5rem;
          padding: 1.25rem 1rem 1.125rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          background: var(--echo-surface);
          border: 1px solid var(--card-border, var(--echo-border));
          transition: transform 0.28s cubic-bezier(0.23,1,0.32,1),
                      box-shadow 0.28s ease,
                      border-color 0.2s;
        }

        .mdb-card:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: var(--card-color, var(--echo-primary));
          box-shadow: 0 14px 36px var(--card-glow, rgba(0,0,0,0.15));
        }

        .mdb-card:active { transform: scale(0.97); }

        /* gradient background fill */
        .mdb-card-bg {
          position: absolute;
          inset: 0;
          background: var(--card-grad, transparent);
          border-radius: inherit;
          pointer-events: none;
          z-index: 0;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .mdb-card:hover .mdb-card-bg { opacity: 1; }

        /* corner glow blob */
        .mdb-card-corner-glow {
          position: absolute;
          bottom: -20px; right: -20px;
          width: 90px; height: 90px;
          border-radius: 50%;
          background: var(--card-glow, transparent);
          filter: blur(24px);
          pointer-events: none;
          z-index: 0;
          transition: transform 0.3s ease;
        }

        .mdb-card:hover .mdb-card-corner-glow { transform: scale(1.3); }

        /* tag */
        .mdb-card-tag {
          position: relative;
          z-index: 1;
          align-self: flex-end;
        }

        /* icon area */
        .mdb-card-icon-wrap {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .mdb-card-emoji {
          font-size: 1.625rem;
          line-height: 1;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));
        }

        .mdb-card-icon-ring {
          width: 38px; height: 38px;
          border-radius: 0.75rem;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s ease;
        }

        .mdb-card:hover .mdb-card-icon-ring { transform: rotate(-8deg) scale(1.1); }

        /* label */
        .mdb-card-label {
          color: var(--echo-text);
          font-size: 0.8125rem;
          font-weight: 700;
          line-height: 1.3;
          position: relative;
          z-index: 1;
        }

        /* bottom accent line */
        .mdb-card-line {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2.5px;
          border-radius: 0 0 1.5rem 1.5rem;
          opacity: 0.6;
          transform: scaleX(0.4);
          transform-origin: left;
          transition: transform 0.3s ease, opacity 0.3s;
        }

         .mdb-card:hover .mdb-card-line {
          transform: scaleX(1);
          opacity: 1;
        }

        /* Light mode tag overrides for high contrast readability */
        [data-theme='light'] .mdb-tag {
          font-weight: 800;
        }
        [data-theme='light'] .mdb-card-doctors .mdb-tag {
          color: #0f766e !important;
          background: rgba(15, 118, 110, 0.1) !important;
          border-color: rgba(15, 118, 110, 0.2) !important;
        }
        [data-theme='light'] .mdb-card-volunteers .mdb-tag {
          color: #15803d !important;
          background: rgba(21, 128, 61, 0.1) !important;
          border-color: rgba(21, 128, 61, 0.2) !important;
        }
        [data-theme='light'] .mdb-card-mood-tracker .mdb-tag {
          color: #be185d !important;
          background: rgba(190, 24, 93, 0.1) !important;
          border-color: rgba(190, 24, 93, 0.2) !important;
        }
        [data-theme='light'] .mdb-card-relaxation .mdb-tag {
          color: #b45309 !important;
          background: rgba(180, 83, 9, 0.1) !important;
          border-color: rgba(180, 83, 9, 0.2) !important;
        }
        [data-theme='light'] .mdb-card-companion .mdb-tag {
          color: #0f766e !important;
          background: rgba(15, 118, 110, 0.1) !important;
          border-color: rgba(15, 118, 110, 0.2) !important;
        }
        [data-theme='light'] .mdb-card-games .mdb-tag {
          color: #6d28d9 !important;
          background: rgba(109, 40, 217, 0.1) !important;
          border-color: rgba(109, 40, 217, 0.2) !important;
        }
        [data-theme='light'] .mdb-card-relaxationbooks .mdb-tag {
          color: #b45309 !important;
          background: rgba(180, 83, 9, 0.1) !important;
          border-color: rgba(180, 83, 9, 0.2) !important;
        }
      `}</style>
    </div>
  );
}

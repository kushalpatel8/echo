'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface BubbleLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
}

// ── Dark Mode Palette (Serene Midnight & Pastel Sky) ──
const darkBubbles = [
  { size: 18, x: 50, y: 50, delay: 0,    dur: 4.2, color: 'rgba(147,197,253,0.55)' },
  { size: 11, x: 28, y: 62, delay: 0.6,  dur: 3.8, color: 'rgba(167,243,208,0.50)' },
  { size: 14, x: 70, y: 38, delay: 1.1,  dur: 4.6, color: 'rgba(196,181,253,0.50)' },
  { size:  8, x: 20, y: 36, delay: 1.7,  dur: 3.4, color: 'rgba(253,186,116,0.45)' },
  { size: 22, x: 75, y: 68, delay: 0.3,  dur: 5.0, color: 'rgba(125,211,252,0.45)' },
  { size:  9, x: 60, y: 22, delay: 2.1,  dur: 3.6, color: 'rgba(249,168,212,0.45)' },
  { size: 13, x: 38, y: 80, delay: 1.4,  dur: 4.8, color: 'rgba(134,239,172,0.45)' },
  { size:  7, x: 82, y: 48, delay: 2.6,  dur: 3.2, color: 'rgba(216,180,254,0.50)' },
  { size: 16, x: 15, y: 72, delay: 0.9,  dur: 4.4, color: 'rgba(147,197,253,0.40)' },
  { size: 10, x: 55, y: 88, delay: 1.8,  dur: 3.9, color: 'rgba(253,186,116,0.40)' },
  { size: 20, x: 32, y: 18, delay: 0.4,  dur: 5.2, color: 'rgba(167,243,208,0.42)' },
  { size:  6, x: 90, y: 25, delay: 2.9,  dur: 3.0, color: 'rgba(249,168,212,0.42)' },
];

// ── Light Mode Palette (Warm Sunset & Calming Sage) ──
const lightBubbles = [
  { size: 18, x: 50, y: 50, delay: 0,    dur: 4.2, color: 'rgba(245,158,11,0.50)' },
  { size: 11, x: 28, y: 62, delay: 0.6,  dur: 3.8, color: 'rgba(16,185,129,0.45)' },
  { size: 14, x: 70, y: 38, delay: 1.1,  dur: 4.6, color: 'rgba(225,29,72,0.40)' },
  { size:  8, x: 20, y: 36, delay: 1.7,  dur: 3.4, color: 'rgba(59,130,246,0.45)' },
  { size: 22, x: 75, y: 68, delay: 0.3,  dur: 5.0, color: 'rgba(251,146,60,0.48)' },
  { size:  9, x: 60, y: 22, delay: 2.1,  dur: 3.6, color: 'rgba(168,85,247,0.42)' },
  { size: 13, x: 38, y: 80, delay: 1.4,  dur: 4.8, color: 'rgba(20,184,166,0.45)' },
  { size:  7, x: 82, y: 48, delay: 2.6,  dur: 3.2, color: 'rgba(244,63,94,0.45)' },
  { size: 16, x: 15, y: 72, delay: 0.9,  dur: 4.4, color: 'rgba(217,119,6,0.45)' },
  { size: 10, x: 55, y: 88, delay: 1.8,  dur: 3.9, color: 'rgba(16,185,129,0.40)' },
  { size: 20, x: 32, y: 18, delay: 0.4,  dur: 5.2, color: 'rgba(59,130,246,0.40)' },
  { size:  6, x: 90, y: 25, delay: 2.9,  dur: 3.0, color: 'rgba(251,146,60,0.45)' },
];

const ripples = [0, 1, 2];

export default function BubbleLoader({
  message = 'A moment of calm\u2026',
  size = 'md',
  fullscreen = true,
}: BubbleLoaderProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === 'light';
  const activeBubbles = isLight ? lightBubbles : darkBubbles;

  const sizeMap = { sm: 260, md: 340, lg: 420 };
  const stageSize = sizeMap[size];
  const themeClass = isLight ? 'bubble-theme-light' : 'bubble-theme-dark';

  return (
    <div
      className={`bubble-loader-root ${themeClass}${fullscreen ? ' bubble-loader-fullscreen' : ''}`}
      role="status"
      aria-label={message}
    >
      <div className="bubble-loader-ambient" />

      <div
        className="bubble-loader-stage"
        style={{ width: stageSize, height: stageSize }}
      >
        {ripples.map((i) => (
          <span key={i} className="bubble-ripple" style={{ animationDelay: `${i * 1.1}s` }} />
        ))}

        {activeBubbles.map((b, i) => (
          <span
            key={i}
            className="bubble-orb"
            style={{
              width: b.size,
              height: b.size,
              left: `${b.x}%`,
              top: `${b.y}%`,
              background: b.color,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.dur}s`,
            }}
          >
            <span className="bubble-shine" />
          </span>
        ))}

        <div className="bubble-center-orb">
          <div className="bubble-center-inner">
            <div className="bubble-center-core" />
          </div>
        </div>
      </div>

      <p className="bubble-loader-label">{message}</p>

      <style>{`
        .bubble-loader-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          position: relative;
          overflow: hidden;
          transition: background 0.5s ease;
        }

        .bubble-theme-dark.bubble-loader-fullscreen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: radial-gradient(ellipse at 40% 40%, #0f1e3a 0%, #0a1628 60%, #06111f 100%);
        }
        .bubble-theme-dark .bubble-loader-ambient {
          background:
            radial-gradient(circle at 25% 30%, rgba(125,211,252,0.09) 0%, transparent 55%),
            radial-gradient(circle at 75% 65%, rgba(196,181,253,0.09) 0%, transparent 55%),
            radial-gradient(circle at 55% 80%, rgba(134,239,172,0.07) 0%, transparent 50%);
        }
        .bubble-theme-dark .bubble-ripple {
          border: 1.5px solid rgba(147,197,253,0.22);
        }
        .bubble-theme-dark .bubble-center-inner {
          background: radial-gradient(circle at 35% 35%,
            rgba(147,197,253,0.35) 0%,
            rgba(99,179,237,0.20) 40%,
            rgba(56,152,220,0.10) 100%
          );
          border: 1.5px solid rgba(147,197,253,0.35);
          box-shadow:
            0 0 40px rgba(147,197,253,0.25),
            0 0 80px rgba(147,197,253,0.10),
            inset 0 0 20px rgba(255,255,255,0.10);
        }
        .bubble-theme-dark .bubble-center-core {
          background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9) 0%, rgba(147,197,253,0.6) 60%, transparent 100%);
          box-shadow: 0 0 12px rgba(147,197,253,0.6);
        }
        .bubble-theme-dark .bubble-loader-label {
          color: rgba(147,197,253,0.7);
        }

        .bubble-theme-light.bubble-loader-fullscreen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: radial-gradient(ellipse at 40% 40%, #fffbf5 0%, #fff7ed 60%, #ffedd5 100%);
        }
        .bubble-theme-light .bubble-loader-ambient {
          background:
            radial-gradient(circle at 25% 30%, rgba(245,158,11,0.14) 0%, transparent 55%),
            radial-gradient(circle at 75% 65%, rgba(225,29,72,0.11) 0%, transparent 55%),
            radial-gradient(circle at 55% 80%, rgba(16,185,129,0.09) 0%, transparent 50%);
        }
        .bubble-theme-light .bubble-ripple {
          border: 1.5px solid rgba(217,119,6,0.28);
        }
        .bubble-theme-light .bubble-center-inner {
          background: radial-gradient(circle at 35% 35%,
            rgba(245,158,11,0.35) 0%,
            rgba(251,191,36,0.20) 40%,
            rgba(225,29,72,0.10) 100%
          );
          border: 1.5px solid rgba(217,119,6,0.35);
          box-shadow:
            0 0 40px rgba(245,158,11,0.25),
            0 0 80px rgba(225,29,72,0.12),
            inset 0 0 20px rgba(255,255,255,0.40);
        }
        .bubble-theme-light .bubble-center-core {
          background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(245,158,11,0.7) 60%, transparent 100%);
          box-shadow: 0 0 15px rgba(217,119,6,0.5);
        }
        .bubble-theme-light .bubble-loader-label {
          color: #9a3412;
        }

        .bubble-loader-ambient {
          position: absolute;
          inset: 0;
          pointer-events: none;
          animation: ambientShift 12s ease-in-out infinite alternate;
        }
        @keyframes ambientShift {
          0%   { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1.0; transform: scale(1.08); }
        }
        .bubble-loader-stage {
          position: relative;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .bubble-ripple {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          animation: rippleOut 3.3s ease-out infinite;
          transform-origin: center;
          transition: border-color 0.5s ease;
        }
        @keyframes rippleOut {
          0%   { transform: scale(0.35); opacity: 0.7; }
          60%  { opacity: 0.25; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        .bubble-orb {
          position: absolute;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          backdrop-filter: blur(2px);
          box-shadow:
            inset -3px -3px 6px rgba(255,255,255,0.18),
            inset  2px  2px 5px rgba(255,255,255,0.28),
            0 4px 16px rgba(0,0,0,0.20);
          animation: floatBubble linear infinite;
          will-change: transform, opacity;
          transition: background 0.5s ease;
        }
        @keyframes floatBubble {
          0%   { transform: translate(-50%, -50%) translateY(0px)   scale(1);    opacity: 0.55; }
          25%  { transform: translate(-50%, -50%) translateY(-12px) scale(1.06); opacity: 0.80; }
          50%  { transform: translate(-50%, -50%) translateY(-6px)  scale(0.96); opacity: 0.65; }
          75%  { transform: translate(-50%, -50%) translateY(-16px) scale(1.04); opacity: 0.75; }
          100% { transform: translate(-50%, -50%) translateY(0px)   scale(1);    opacity: 0.55; }
        }
        .bubble-shine {
          position: absolute;
          top: 20%;
          left: 22%;
          width: 28%;
          height: 28%;
          border-radius: 50%;
          background: rgba(255,255,255,0.55);
          filter: blur(1px);
        }
        .bubble-center-orb {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bubble-center-inner {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: breathOrb 4s ease-in-out infinite;
          transition: all 0.5s ease;
        }
        @keyframes breathOrb {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.18); }
        }
        .bubble-center-core {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          animation: coreGlow 4s ease-in-out infinite;
          transition: all 0.5s ease;
        }
        @keyframes coreGlow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50%       { opacity: 1.0; transform: scale(1.12); }
        }
        .bubble-loader-label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.9rem;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: lowercase;
          animation: labelBreath 4s ease-in-out infinite;
          user-select: none;
          transition: color 0.5s ease;
        }
        @keyframes labelBreath {
          0%, 100% { opacity: 0.55; letter-spacing: 0.12em; }
          50%       { opacity: 0.90; letter-spacing: 0.18em; }
        }
      `}</style>
    </div>
  );
}

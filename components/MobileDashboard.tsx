'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { MessageCircle, Heart, Quote, Bot, Stethoscope, Gamepad2 } from 'lucide-react';

const ACTIONS = [
  {
    href: '/doctors',
    label: 'Expert Doctors',
    icon: Stethoscope,
    color: '#00ff99', // Vibrant Emerald
    bgGlow: 'rgba(0, 255, 153, 0.15)',
    iconBg: 'rgba(0, 255, 153, 0.1)'
  },
  {
    href: '/volunteers',
    label: 'Chat with Volunteer',
    icon: MessageCircle,
    color: '#4ade80', // Light Green
    bgGlow: 'rgba(74, 222, 128, 0.15)',
    iconBg: 'rgba(74, 222, 128, 0.1)'
  },
  {
    href: '/mood-tracker',
    label: 'Mood Tracker',
    icon: Heart,
    color: '#f472b6', // Pink
    bgGlow: 'rgba(244, 114, 182, 0.15)',
    iconBg: 'rgba(244, 114, 182, 0.1)'
  },
  {
    href: '/relaxation',
    label: 'Relaxation Room',
    icon: Quote,
    color: '#fbbf24', // Yellow
    bgGlow: 'rgba(251, 191, 36, 0.15)',
    iconBg: 'rgba(251, 191, 36, 0.1)'
  },
  {
    href: '/companion',
    label: 'AI Companion',
    icon: Bot,
    color: '#34d399', // Green
    bgGlow: 'rgba(52, 211, 153, 0.15)',
    iconBg: 'rgba(52, 211, 153, 0.1)'
  },
  {
    href: '/games',
    label: 'Relax Games',
    icon: Gamepad2,
    color: '#a78bfa', // Purple
    bgGlow: 'rgba(167, 139, 250, 0.15)',
    iconBg: 'rgba(167, 139, 250, 0.1)'
  }
];

export default function MobileDashboard() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ minHeight: '80vh' }} />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '1.5rem',
      background: isDark 
        ? 'radial-gradient(circle at top, #0a1a12, #040d08)' 
        : 'radial-gradient(circle at top, #f0fdf4, #ffffff)',
      borderRadius: '2rem',
      gap: '2.5rem',
      border: isDark ? 'none' : '1px solid #e2e8f0',
      boxShadow: isDark ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.05)'
    }}>
      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: '800',
        textAlign: 'center',
        color: isDark ? '#ffffff' : '#064e3b',
        marginBottom: '0.5rem',
        letterSpacing: '-0.025em'
      }}>
        Welcome to Echo
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem'
      }}>
        {ACTIONS.map((action) => (
          <Link 
            key={action.href} 
            href={action.href} 
            style={{ textDecoration: 'none' }}
          >
            <div 
              className="glass"
              style={{
                borderRadius: '1.5rem',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.03)'
              }}
            >
              {/* Icon Glow */}
              <div style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                background: action.bgGlow,
                borderRadius: '50%',
                filter: 'blur(20px)',
                zIndex: 0
              }} />

              {/* Icon Container */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '1.25rem',
                background: action.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                position: 'relative',
                zIndex: 1,
                border: `1px solid ${action.color}33`
              }}>
                <action.icon 
                  size={32} 
                  color={action.color} 
                  strokeWidth={1.5}
                />
              </div>

              <span style={{
                color: isDark ? '#e2e8f0' : '#1e293b',
                fontSize: '0.875rem',
                fontWeight: '600',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
              }}>
                {action.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

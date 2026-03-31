'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, Quote, Bot, Stethoscope, Gamepad2 } from 'lucide-react';

const ACTIONS = [
  {
    href: '/doctors',
    label: 'Expert Doctors',
    icon: Stethoscope,
    color: '#10b981', // Emerald/Green for Doctors
    bgGlow: 'rgba(16, 185, 129, 0.15)',
    iconBg: 'rgba(16, 185, 129, 0.1)'
  },
  {
    href: '/volunteers',
    label: 'Chat with Volunteer',
    icon: MessageCircle,
    color: '#60a5fa', // Blue
    bgGlow: 'rgba(59, 130, 246, 0.15)',
    iconBg: 'rgba(59, 130, 246, 0.1)'
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
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at top, #1e293b, #0f172a)',
      borderRadius: '2rem',
      gap: '2.5rem'
    }}>
      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: '800',
        textAlign: 'center',
        color: '#ffffff',
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
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
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
                color: '#e2e8f0',
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

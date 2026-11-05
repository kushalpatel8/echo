'use client';

import React from 'react';
import type {
  MoodTheme,
  MoodThemeKey,
  RoomTheme,
  DashTheme,
  ThemeKey,
  LibraryTheme,
  ThemeConfig,
  AmbientSelectorProps
} from '@/types';

export type {
  MoodTheme,
  MoodThemeKey,
  RoomTheme,
  DashTheme,
  ThemeKey,
  LibraryTheme,
  ThemeConfig,
  AmbientSelectorProps
};

// ==========================================
// Room Themes (Relaxation, Charity, Community)
// ==========================================

export const ROOM_THEMES: Record<RoomTheme, MoodTheme> = {
  celestial: {
    name: '🌌 Celestial Twilight',
    primary: '#7c3aed',
    secondary: '#06b6d4',
    glow: 'rgba(124, 58, 237, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.12) 0%, transparent 60%)',
  },
  forest: {
    name: '🌲 Deep Forest Sanctuary',
    primary: '#059669',
    secondary: '#10b981',
    glow: 'rgba(5, 150, 105, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(5, 150, 105, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
  },
  sunset: {
    name: '🌅 Amber Serenity',
    primary: '#f59e0b',
    secondary: '#e11d48',
    glow: 'rgba(245, 158, 11, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225, 29, 72, 0.12) 0%, transparent 60%)',
  },
  ocean: {
    name: '🌊 Deep Ocean Calm',
    primary: '#3b82f6',
    secondary: '#0ea5e9',
    glow: 'rgba(59, 130, 246, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(14, 165, 233, 0.12) 0%, transparent 60%)',
  },
  aurora: {
    name: '✨ Northern Lights',
    primary: '#a855f7',
    secondary: '#10b981',
    glow: 'rgba(168, 85, 247, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(10, 200, 120, 0.12) 0%, transparent 60%)',
  },
};

export const ROOM_THEME = ROOM_THEMES;

// ==========================================
// Dashboard Themes (Admin, Doctor, User, Volunteer, Ambient)
// ==========================================

export const DASH_THEMES: Record<DashTheme, MoodTheme> = {
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
  ocean: {
    name: '🌊 Ocean',
    primary: '#3b82f6',
    secondary: '#0ea5e9',
    glow: 'rgba(59, 130, 246, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(14, 165, 233, 0.12) 0%, transparent 60%)',
  },
  aurora: {
    name: '✨ Aurora',
    primary: '#a855f7',
    secondary: '#10b981',
    glow: 'rgba(168, 85, 247, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(10, 200, 120, 0.12) 0%, transparent 60%)',
  },
};

export const DASH_THEME = DASH_THEMES;
export const THEMES = DASH_THEMES;

// ==========================================
// Library Themes (Books / Study)
// ==========================================

export const LIBRARY_THEMES: Record<LibraryTheme, MoodTheme> = {
  celestial: {
    name: '🌌 Celestial Library',
    primary: '#7c3aed',
    secondary: '#06b6d4',
    glow: 'rgba(124, 58, 237, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.12) 0%, transparent 60%)',
  },
  forest: {
    name: '🌲 Forest Sanctuary',
    primary: '#059669',
    secondary: '#10b981',
    glow: 'rgba(5, 150, 105, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(5, 150, 105, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
  },
  sunset: {
    name: '🌅 Golden Study',
    primary: '#f59e0b',
    secondary: '#e11d48',
    glow: 'rgba(245, 158, 11, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225, 29, 72, 0.12) 0%, transparent 60%)',
  },
  ocean: {
    name: '🌊 Deep Ocean Calm',
    primary: '#3b82f6',
    secondary: '#0ea5e9',
    glow: 'rgba(59, 130, 246, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(14, 165, 233, 0.12) 0%, transparent 60%)',
  },
  aurora: {
    name: '✨ Northern Lights',
    primary: '#a855f7',
    secondary: '#10b981',
    glow: 'rgba(168, 85, 247, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(10, 200, 120, 0.12) 0%, transparent 60%)',
  },
};

// ==========================================
// Ambient Theme Selector Component
// ==========================================

export function AmbientSelector({
  activeTheme,
  setActiveTheme,
  themes = DASH_THEMES,
}: AmbientSelectorProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: '0.25rem',
        borderRadius: '999px',
        background: 'var(--echo-surface)',
        border: '1px solid var(--echo-border)',
        gap: '0.25rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      {(Object.keys(themes) as MoodThemeKey[]).map((key) => {
        const t = themes[key];
        const isSelected = activeTheme === key;
        return (
          <button
            key={key}
            onClick={() => setActiveTheme(key)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              border: 'none',
              background: isSelected ? t.primary : 'transparent',
              color: isSelected ? '#fff' : 'var(--echo-text-muted)',
              fontSize: '0.75rem',
              fontWeight: isSelected ? '700' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>{t.name.split(' ')[0]}</span>
            <span className="hide-mobile">{t.name.split(' ').slice(1).join(' ')}</span>
          </button>
        );
      })}
    </div>
  );
}


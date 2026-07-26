'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import BackButton from '@/components/BackButton';
import ThemeToggle from '@/components/ThemeToggle';
import { Sparkles, Gamepad2 } from 'lucide-react';

// Game Components
import BreathingGame from '@/components/games/BreathingGame';
import MemoryGame from '@/components/games/MemoryGame';
import ZenGarden from '@/components/games/ZenGarden';
import BubblePop from '@/components/games/BubblePop';
import StarGazer from '@/components/games/StarGazer';
import WordFlow from '@/components/games/WordFlow';
import GratitudeBloom from '@/components/games/GratitudeBloom';

type GameID = 'breathing' | 'memory' | 'zen-garden' | 'bubble-pop' | 'stargazer' | 'wordflow' | 'gratitude' | null;

interface GameConfig {
  id: GameID;
  title: string;
  description: string;
  icon: string;
  color: string;
  delay: string;
}

const GAMES: GameConfig[] = [
  { id: 'breathing', title: 'Breathing Guide', description: 'Calm your mind with the guided 4-7-8 breathing method.', icon: '🌬️', color: '#06b6d4', delay: '0s' },
  { id: 'memory', title: 'Memory Match', description: 'Gently sharpen focus through soothing pattern recognition.', icon: '🧩', color: '#7c3aed', delay: '0.1s' },
  { id: 'zen-garden', title: 'Zen Sand Garden', description: 'Rake the virtual sand to create peaceful, flowing patterns.', icon: '⏳', color: '#f59e0b', delay: '0.2s' },
  { id: 'bubble-pop', title: 'Bubble Pop', description: 'A satisfying sensory experience to release immediate tension.', icon: '🫧', color: '#10b981', delay: '0.3s' },
  { id: 'stargazer', title: 'Star Gazer', description: 'Connect distant stars to form beautiful, ethereal constellations.', icon: '✨', color: '#a78bfa', delay: '0.5s' },
  { id: 'wordflow', title: 'Word Flow', description: 'Acknowledge calming words as they drift gently across your screen.', icon: '📝', color: '#c4b5fd', delay: '0.6s' },
  { id: 'gratitude', title: 'Gratitude Bloom', description: 'Plant seeds of gratitude and watch your visual garden grow.', icon: '🌸', color: '#f472b6', delay: '0.7s' },
];

type ThemeKey = 'celestial' | 'forest' | 'sunset' | 'ocean' | 'aurora';

const THEMES: Record<ThemeKey, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
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

function AmbientSelector({ activeTheme, setActiveTheme }: { activeTheme: ThemeKey; setActiveTheme: (k: ThemeKey) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--echo-surface-2)', padding: '0.35rem 0.5rem', borderRadius: '999px', border: '1px solid var(--echo-border)' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--echo-text-muted)', paddingLeft: '0.5rem' }}>Mood:</span>
      {(Object.keys(THEMES) as ThemeKey[]).map(key => {
        const t = THEMES[key];
        const isSel = activeTheme === key;
        const isExtra = key === 'ocean' || key === 'aurora';
        return (
          <button key={key} onClick={() => setActiveTheme(key)} className={isExtra ? 'hide-mobile' : ''} style={{
            padding: '0.35rem 0.75rem', borderRadius: '999px', border: 'none',
            background: isSel ? t.primary : 'transparent', color: isSel ? '#fff' : 'var(--echo-text-muted)',
            fontSize: '0.75rem', fontWeight: isSel ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s ease',
          }}>
            {t.name.split(' ')[0]} {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

export default function GamesPage() {
  const [currentGame, setCurrentGame] = useState<GameID>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('celestial');
  const { isLoaded } = useUser();

  const currentTheme = THEMES[activeTheme];

  if (!isLoaded) return <div style={{ minHeight: '100vh', background: 'var(--echo-bg)' }} />;

  const SelectedGame = () => {
    switch (currentGame) {
      case 'breathing': return <BreathingGame />;
      case 'memory': return <MemoryGame />;
      case 'zen-garden': return <ZenGarden />;
      case 'bubble-pop': return <BubblePop />;
      case 'stargazer': return <StarGazer />;
      case 'wordflow': return <WordFlow />;
      case 'gratitude': return <GratitudeBloom />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', color: 'var(--echo-text)', position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        .games-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--echo-border);
          background: var(--echo-surface);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .games-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .games-logo-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .games-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .games-header {
            flex-direction: column;
            align-items: center;
            padding: 0.75rem 1rem;
            gap: 0.75rem;
          }

          .games-header-left {
            width: 100%;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .games-back-container {
            display: none !important;
          }

          .games-logo-wrapper {
            justify-content: center;
            width: 100%;
          }

          .games-header-right {
            width: 100%;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }

          .games-theme-selector {
            width: 100%;
            display: flex;
            justify-content: center;
          }

          .games-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }

          .games-grid .echo-card {
            padding: 1.25rem 0.75rem !important;
            border-radius: 20px !important;
          }

          .games-grid .echo-card .game-icon {
            font-size: 2.25rem !important;
            margin-bottom: 0.5rem !important;
          }

          .games-grid .echo-card h2 {
            font-size: 0.95rem !important;
            margin-bottom: 0.25rem !important;
          }

          .games-grid .echo-card p {
            font-size: 0.7rem !important;
            line-height: 1.3 !important;
          }
        }
      `}</style>
      {/* Dynamic Ambient Background Glow */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: currentTheme.bgGrad,
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'background 1s ease',
        }}
      />

      {/* Sticky Header */}
      <header className="games-header">
        <div className="games-header-left">
          <div className="games-back-container">
            <BackButton />
          </div>
          <div className="games-logo-wrapper hide-desktop">
            <Gamepad2 size={24} style={{ color: currentTheme.primary }} />
            <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--echo-text)' }}>
              Games Room
            </span>
          </div>
        </div>

        <div className="games-header-right">
          <div className="games-theme-selector">
            <AmbientSelector activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
          </div>

          <ThemeToggle />

          {currentGame && (
            <button 
              onClick={() => setCurrentGame(null)} 
              className="btn-secondary" 
              style={{ padding: '0.45rem 1.125rem', fontSize: '0.8125rem' }}
            >
              ← Exit Game
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="page-container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5rem' }}>

        {!currentGame ? (
          <>
            {/* Hero Banner */}
            <div className="glass hide-mobile" style={{
              padding: '2.5rem', borderRadius: '28px',
              border: '1px solid var(--echo-border)', background: 'var(--echo-surface)',
              boxShadow: `0 25px 60px rgba(0,0,0,0.12), 0 0 40px ${currentTheme.glow}`,
              marginBottom: '3rem', position: 'relative', overflow: 'hidden',
              textAlign: 'center'
            }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.12, filter: 'blur(35px)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                  <Gamepad2 size={14} /><span>Mindful Play</span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>
                  Relaxation Games Room
                </h1>
                <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.0625rem', lineHeight: '1.6', margin: '0 auto', maxWidth: '600px' }}>
                  Soothe your mind and gently refocus your attention with our collection of interactive experiences.
                </p>
              </div>
            </div>

            {/* Grid list */}
            <div className="games-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {GAMES.map((game, i) => (
                <div 
                  key={game.id} 
                  className="glass echo-card animate-fade-in-up" 
                  onClick={() => setCurrentGame(game.id)} 
                  style={{ 
                    cursor: 'pointer', 
                    textAlign: 'center', 
                    padding: '2.5rem 1.5rem',
                    borderRadius: '24px',
                    background: 'var(--echo-surface)',
                    border: '1px solid var(--echo-border)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                    transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease, border-color 0.3s ease',
                    animationDelay: game.delay,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 15px 35px ${game.color}20, 0 0 20px ${game.color}15`;
                    (e.currentTarget as HTMLDivElement).style.borderColor = game.color;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'none';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--echo-border)';
                  }}
                >
                  <div className="game-icon" style={{ 
                    fontSize: '3.5rem', 
                    marginBottom: '1rem', 
                    filter: `drop-shadow(0 0 10px ${game.color}44)` 
                  }}>{game.icon}</div>
                  <h2 style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.125rem', color: 'var(--echo-text)' }}>{game.title}</h2>
                  <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.8125rem', lineHeight: '1.5' }}>{game.description}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="glass animate-fade-in-up" style={{ padding: '2.5rem', borderRadius: '28px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)', boxShadow: `0 20px 50px rgba(0,0,0,0.1), 0 0 35px ${currentTheme.glow}` }}>
            <SelectedGame />
          </div>
        )}
      </main>
    </div>
  );
}

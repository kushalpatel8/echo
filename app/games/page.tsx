'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

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
  { id: 'breathing', title: 'Breathing Guide', description: 'Calm your mind with the guided 4-7-8 breathing method.', icon: '🌬️', color: 'rgba(6,182,212,0.5)', delay: '0s' },
  { id: 'memory', title: 'Memory Match', description: 'Gently sharpen focus through soothing pattern recognition.', icon: '🧩', color: 'rgba(124,58,237,0.5)', delay: '0.1s' },
  { id: 'zen-garden', title: 'Zen Sand Garden', description: 'Rake the virtual sand to create peaceful, flowing patterns.', icon: '⏳', color: 'rgba(245,158,11,0.5)', delay: '0.2s' },
  { id: 'bubble-pop', title: 'Bubble Pop', description: 'A satisfying sensory experience to release immediate tension.', icon: '🫧', color: 'rgba(34,197,94,0.5)', delay: '0.3s' },
  { id: 'stargazer', title: 'Star Gazer', description: 'Connect distant stars to form beautiful, ethereal constellations.', icon: '✨', color: 'rgba(124,58,237,0.5)', delay: '0.5s' },
  { id: 'wordflow', title: 'Word Flow', description: 'Acknowledge calming words as they drift gently across your screen.', icon: '📝', color: 'rgba(167,139,250,0.5)', delay: '0.6s' },
  { id: 'gratitude', title: 'Gratitude Bloom', description: 'Plant seeds of gratitude and watch your visual garden grow.', icon: '🌸', color: 'rgba(244,114,182,0.5)', delay: '0.7s' },
];

export default function GamesPage() {
  const [currentGame, setCurrentGame] = useState<GameID>(null);
  const { isLoaded } = useUser();

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
    <main style={{ minHeight: '100vh', background: 'var(--echo-bg)', padding: 'clamp(1rem, 5vw, 2rem)' }}>
      <header style={{ maxWidth: '1000px', margin: '0 auto 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to Dashboard
            </span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }} className="gradient-text">Relaxation Games</h1>
        </div>
        
        {currentGame && (
          <button 
            onClick={() => setCurrentGame(null)} 
            className="btn-secondary" 
            style={{ fontSize: '0.8125rem' }}
          >
            ← Exit Game
          </button>
        )}
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {!currentGame ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {GAMES.map(game => (
              <div 
                key={game.id} 
                className="echo-card animate-fade-in-up" 
                onClick={() => setCurrentGame(game.id)} 
                style={{ 
                  cursor: 'pointer', 
                  textAlign: 'center', 
                  padding: '2.5rem 1.5rem',
                  animationDelay: game.delay,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                <div style={{ 
                  fontSize: '3.5rem', 
                  marginBottom: '1rem', 
                  filter: `drop-shadow(0 0 10px ${game.color})` 
                }}>{game.icon}</div>
                <h2 style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.125rem' }}>{game.title}</h2>
                <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.8125rem', lineHeight: '1.5' }}>{game.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-fade-in-up">
             <SelectedGame />
          </div>
        )}
      </div>
    </main>
  );
}

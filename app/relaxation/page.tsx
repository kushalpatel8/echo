'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { GuidedBreathing } from '@/components/GuidedBreathing';
import { RelaxationSoundscapes } from '@/components/RelaxationSoundscapes';
import { VoiceMessageButton } from '@/components/VoiceControls';
import { useVoice } from '@/hooks/useVoice';
import { Sparkles, Wind, BookOpen, Copy, Check, ArrowRight } from 'lucide-react';

type RoomTheme = 'celestial' | 'forest' | 'sunset';
type TabType = 'breathing' | 'affirmations' | 'library';

interface QuoteItem {
  text: string;
  author: string;
  category: 'Self-Compassion' | 'Resilience' | 'Mindfulness' | 'Inner Peace';
}

const QUOTES: QuoteItem[] = [
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious. Having feelings doesn't make you a negative person. It makes you human.", author: "Lori Deschene", category: "Self-Compassion" },
  { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer", category: "Mindfulness" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush", category: "Self-Compassion" },
  { text: "Sometimes the people around you won't understand your journey. They don't need to, it's not for them.", author: "Joubert Botha", category: "Inner Peace" },
  { text: "Self-care is how you take your power back.", author: "Lalah Delia", category: "Self-Compassion" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", category: "Resilience" },
  { text: "Tough times never last, but tough people do.", author: "Robert H. Schuller", category: "Resilience" },
  { text: "You are stronger than you think, braver than you believe, and smarter than you know.", author: "A.A. Milne", category: "Resilience" },
  { text: "Every day is a new beginning. Take a deep breath, smile, and start again.", author: "Unknown", category: "Mindfulness" },
  { text: "You are enough. You have enough. You do enough.", author: "Unknown", category: "Self-Compassion" },
  { text: "Healing is not linear. You can have hard days and still be getting better.", author: "Unknown", category: "Resilience" },
  { text: "Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.", author: "Max Ehrmann", category: "Inner Peace" },
  { text: "Your feelings are valid. You deserve to be heard and understood.", author: "Unknown", category: "Self-Compassion" },
  { text: "The present moment is the only time over which we have dominion.", author: "Thich Nhat Hanh", category: "Mindfulness" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", category: "Inner Peace" },
  { text: "You can't go back and change the beginning, but you can start where you are and change the ending.", author: "C.S. Lewis", category: "Resilience" },
  { text: "In the middle of difficulty lies opportunity. In the middle of struggle is where resilience is formed.", author: "Albert Einstein", category: "Resilience" },
  { text: "It's okay not to be okay — as long as you don't give up.", author: "Unknown", category: "Self-Compassion" },
  { text: "Promise me you'll always remember: you're braver than you believe, stronger than you seem, and smarter than you think.", author: "Christopher Robin", category: "Self-Compassion" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", category: "Mindfulness" },
];

const ROOM_THEMES: Record<RoomTheme, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
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
};

export default function RelaxationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('breathing');
  const [roomTheme, setRoomTheme] = useState<RoomTheme>('celestial');
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [fade, setFade] = useState(true);
  const [copied, setCopied] = useState(false);

  const { speak, stopSpeaking, speakingId, hasSynthesisSupport } = useVoice();
  const currentTheme = ROOM_THEMES[roomTheme];

  const filteredQuotes = selectedCategory === 'All'
    ? QUOTES
    : QUOTES.filter(q => q.category === selectedCategory);

  const q = filteredQuotes[currentQuoteIndex % filteredQuotes.length] || QUOTES[0];

  // Rotate quotes automatically
  useEffect(() => {
    if (activeTab !== 'affirmations') return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentQuoteIndex(prev => (prev + 1) % filteredQuotes.length);
        setFade(true);
      }, 400);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, filteredQuotes.length]);

  const nextQuote = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % filteredQuotes.length);
      setFade(true);
    }, 300);
  };

  const prevQuote = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentQuoteIndex(prev => (prev - 1 + filteredQuotes.length) % filteredQuotes.length);
      setFade(true);
    }, 300);
  };

  const copyToClipboard = (text: string, author: string) => {
    navigator.clipboard.writeText(`"${text}" — ${author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--echo-bg)',
        color: 'var(--echo-text)',
        position: 'relative',
        overflowX: 'hidden',
        transition: 'background-color 0.5s ease',
      }}
    >
      {/* Dynamic Ambient Background Glows */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: currentTheme.bgGrad,
          pointerEvents: 'none',
          transition: 'background 1s ease',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--echo-border)',
          background: 'var(--echo-surface)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BackButton />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 15px ${currentTheme.glow}`,
              }}
            >
              <Sparkles size={18} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
                Mindful Sanctuary
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--echo-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="status-dot online" style={{ width: '6px', height: '6px' }} />
                <span>Relaxation & Recovery Space</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Room Theme Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--echo-surface-2)', padding: '0.35rem 0.5rem', borderRadius: '999px', border: '1px solid var(--echo-border)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--echo-text-muted)', paddingLeft: '0.5rem' }}>
            Ambient Mood:
          </span>
          {(Object.keys(ROOM_THEMES) as RoomTheme[]).map(key => {
            const t = ROOM_THEMES[key];
            const isSelected = roomTheme === key;
            return (
              <button
                key={key}
                onClick={() => setRoomTheme(key)}
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
                }}
              >
                {t.name.split(' ')[0]} {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="page-container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5rem' }}>
        {/* Navigation Tabs (Desktop/Tablet) */}
        <div className="hide-mobile" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', width: '100%' }}>
          <div
            className="glass"
            style={{
              display: 'inline-flex',
              padding: '0.375rem',
              borderRadius: '16px',
              border: '1px solid var(--echo-border)',
              background: 'var(--echo-surface)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              gap: '0.25rem',
              overflowX: 'auto',
              maxWidth: '100%',
              scrollbarWidth: 'none',
            }}
          >
            {[
              { id: 'breathing', label: 'Breathing & Sounds', icon: <Wind size={16} /> },
              { id: 'affirmations', label: 'Wisdom & Affirmations', icon: <Sparkles size={16} /> },
              { id: 'library', label: 'Curated Library', icon: <BookOpen size={16} /> },
            ].map(tab => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: selected ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` : 'transparent',
                    color: selected ? '#fff' : 'var(--echo-text-muted)',
                    fontWeight: selected ? '700' : '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: selected ? `0 4px 15px ${currentTheme.glow}` : 'none',
                    flexShrink: 0,
                  }}
                >
                  {tab.icon}
                  <span className={selected ? '' : 'hide-mobile'}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dropdown Tab Selector (Mobile) */}
        <div className="show-mobile" style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabType)}
              style={{
                width: '100%',
                padding: '0.875rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid var(--echo-border)',
                background: 'var(--echo-surface)',
                color: 'var(--echo-text)',
                fontWeight: '700',
                fontSize: '0.9rem',
                appearance: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                outline: 'none',
              }}
            >
              <option value="breathing">🧘 Guided Breathing & Sounds</option>
              <option value="affirmations">✨ Wisdom & Affirmations</option>
              <option value="library">📚 Curated Library</option>
            </select>
            <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--echo-text-muted)', fontSize: '0.8rem' }}>
              ▼
            </div>
          </div>
        </div>

        {/* TAB 1: BREATHING & SOUNDSCAPES */}
        {activeTab === 'breathing' && (
          <div className="animate-fade-in-up">
            <GuidedBreathing />
            <RelaxationSoundscapes />
          </div>
        )}

        {/* TAB 2: AFFIRMATIONS & WISDOM */}
        {activeTab === 'affirmations' && (
          <div className="animate-fade-in-up">
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              {['All', 'Self-Compassion', 'Resilience', 'Mindfulness', 'Inner Peace'].map(cat => {
                const isSel = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentQuoteIndex(0);
                    }}
                    style={{
                      padding: '0.5rem 1.125rem',
                      borderRadius: '999px',
                      border: isSel ? `1px solid ${currentTheme.primary}` : '1px solid var(--echo-border)',
                      background: isSel ? `${currentTheme.primary}25` : 'var(--echo-surface-2)',
                      color: isSel ? '#fff' : 'var(--echo-text-muted)',
                      fontSize: '0.8125rem',
                      fontWeight: isSel ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSel ? `0 4px 12px ${currentTheme.glow}` : 'none',
                    }}
                  >
                    {cat === 'Self-Compassion' ? '💖 ' : cat === 'Resilience' ? '🛡️ ' : cat === 'Mindfulness' ? '🌿 ' : cat === 'Inner Peace' ? '🕊️ ' : '🌟 '}
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Hero Affirmation Display */}
            <div
              className="glass"
              style={{
                padding: '3.5rem 2.5rem',
                borderRadius: '28px',
                border: '1px solid var(--echo-border)',
                background: 'var(--echo-surface)',
                boxShadow: `0 25px 60px rgba(0, 0, 0, 0.15), 0 0 40px ${currentTheme.glow}`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '3.5rem',
              }}
            >
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.15, filter: 'blur(30px)' }} />

              <div style={{ maxWidth: '750px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.75rem' }}>
                  <Sparkles size={13} />
                  <span>{q.category}</span>
                </div>

                <blockquote style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease', marginBottom: '2.5rem', minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', lineHeight: '1.65', fontStyle: 'italic', fontWeight: '600', color: 'var(--echo-text)', marginBottom: '1.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    "{q.text}"
                  </p>
                  <footer style={{ color: 'var(--echo-primary)', fontWeight: '700', fontSize: '1rem', letterSpacing: '0.02em' }}>
                    — {q.author}
                  </footer>
                </blockquote>

                {/* Audio Reader & Action Pills */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                  {hasSynthesisSupport && (
                    <VoiceMessageButton
                      text={`${q.text} by ${q.author}`}
                      messageId={`quote-${currentQuoteIndex}`}
                      speakingId={speakingId}
                      speak={speak}
                      stopSpeaking={stopSpeaking}
                      hasSynthesisSupport={hasSynthesisSupport}
                      label="Listen to Affirmation"
                    />
                  )}

                  <button
                    onClick={() => copyToClipboard(q.text, q.author)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.875rem',
                      borderRadius: '999px',
                      border: '1px solid var(--echo-border)',
                      background: 'var(--echo-surface-2)',
                      color: copied ? '#22c55e' : 'var(--echo-text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy Quote'}</span>
                  </button>
                </div>

                {/* Navigation Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid rgba(148, 163, 184, 0.15)', paddingTop: '1.75rem' }}>
                  <button onClick={prevQuote} className="btn-secondary" style={{ padding: '0.625rem 1.25rem', borderRadius: '12px' }}>← Previous</button>
                  <span style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>
                    <strong>{currentQuoteIndex % filteredQuotes.length + 1}</strong> of {filteredQuotes.length}
                  </span>
                  <button onClick={nextQuote} className="btn-secondary" style={{ padding: '0.625rem 1.25rem', borderRadius: '12px' }}>Next →</button>
                </div>
              </div>
            </div>

            {/* All Affirmations Grid */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.375rem', fontWeight: '800', color: 'var(--echo-text)' }}>
                  🌿 All Affirmations ({filteredQuotes.length})
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>
                  Click any card to feature in the sanctuary
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {filteredQuotes.map((quote, i) => (
                  <div
                    key={i}
                    className="glass echo-card"
                    style={{
                      padding: '1.5rem',
                      borderRadius: '20px',
                      border: '1px solid var(--echo-border)',
                      background: 'var(--echo-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => {
                      setCurrentQuoteIndex(i);
                      window.scrollTo({ top: 150, behavior: 'smooth' });
                    }}
                  >
                    <p style={{ fontSize: '0.9375rem', lineHeight: '1.65', fontStyle: 'italic', color: 'var(--echo-text)', marginBottom: '1.25rem', opacity: 0.9 }}>
                      "{quote.text}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--echo-border)', paddingTop: '0.75rem' }}>
                      <span style={{ color: 'var(--echo-primary)', fontWeight: '700', fontSize: '0.8125rem' }}>
                        — {quote.author}
                      </span>
                      <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'var(--echo-surface-2)', color: 'var(--echo-text-muted)' }}>
                        {quote.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: THE CURATED LIBRARY */}
        {activeTab === 'library' && (
          <div className="animate-fade-in-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div
              className="glass"
              style={{
                padding: '4rem 3rem',
                borderRadius: '32px',
                border: '1px solid var(--echo-border)',
                background: 'var(--echo-surface)',
                boxShadow: `0 30px 70px rgba(0, 0, 0, 0.15), 0 0 50px ${currentTheme.glow}`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at bottom right, ${currentTheme.primary}22 0%, transparent 70%)`, pointerEvents: 'none' }} />

              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: `0 10px 30px ${currentTheme.glow}` }}>
                <BookOpen size={40} style={{ color: '#fff' }} />
              </div>

              <h2 style={{ fontSize: '2.75rem', fontWeight: '900', marginBottom: '1.25rem', letterSpacing: '-0.02em', color: 'var(--echo-text)' }}>
                The Curated Wisdom Library
              </h2>

              <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.1875rem', maxWidth: '650px', margin: '0 auto 3rem', lineHeight: '1.7' }}>
                We have moved our literary collection into a dedicated, distraction-free reading sanctuary. Explore centuries of philosophical and psychological wisdom designed to nourish the mind.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <Link href="/relaxation/books" style={{ textDecoration: 'none' }}>
                  <button
                    className="btn-primary"
                    style={{
                      padding: '1.125rem 3rem',
                      fontSize: '1.0625rem',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                      boxShadow: `0 10px 30px ${currentTheme.glow}`,
                    }}
                  >
                    <span>Enter the Library</span>
                    <ArrowRight size={18} />
                  </button>
                </Link>

                <button
                  onClick={() => setActiveTab('affirmations')}
                  className="btn-secondary"
                  style={{ padding: '1.125rem 2rem', borderRadius: '16px', fontSize: '1rem', fontWeight: '600' }}
                >
                  Return to Affirmations
                </button>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
              {[
                { title: 'Philosophical Classics', desc: 'Timeless reflections on resilience and human stoicism.', icon: '📜' },
                { title: 'Mindfulness & Meditation', desc: 'Practical guides to calming the nervous system and being present.', icon: '🧘' },
                { title: 'Psychology & Growth', desc: 'Modern scientific insights into emotional healing and self-care.', icon: '🧠' },
              ].map((feat, idx) => (
                <div key={idx} className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feat.icon}</div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>{feat.title}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)', lineHeight: '1.5' }}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

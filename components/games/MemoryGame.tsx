'use client';
import { useState, useEffect } from 'react';

export default function MemoryGame() {
  const emojis = ['🍀', '🌙', '🌊', '🌸', '🧘', '🍵', '🕯️', '🕊️'];
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const init = () => {
    const deck = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));
    setCards(deck);
    setSelected([]);
    setMoves(0);
    setGameFinished(false);
  };

  useEffect(() => {
    init();
  }, []);

  const handleFlip = (id: number) => {
    if (selected.length === 2 || cards[id].flipped || cards[id].matched) return;
    
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    
    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newSelected;
      if (cards[first].emoji === cards[second].emoji) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setSelected([]);
        if (newCards.every(c => c.matched)) {
          setGameFinished(true);
        }
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setSelected([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="echo-card animate-fade-in-up" style={{ textAlign: 'center', background: 'var(--echo-surface-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="badge badge-purple" style={{ fontSize: '0.875rem' }}>Moves: {moves}</div>
        </div>
        <button onClick={init} className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Reset Game</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className="glass-light"
            style={{
              aspectRatio: '1', borderRadius: '1rem', 
              background: card.flipped || card.matched ? 'rgba(124,58,237,0.1)' : 'var(--echo-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'none',
              border: card.matched ? '2px solid #22c55e' : '1px solid var(--echo-border)',
              boxShadow: card.matched ? '0 0 15px rgba(34,197,94,0.3)' : 'none'
            }}
          >
            <div style={{ transform: 'rotateY(180deg)', display: (card.flipped || card.matched) ? 'block' : 'none' }}>
              {card.emoji}
            </div>
          </div>
        ))}
      </div>

      {gameFinished && (
        <div style={{ marginTop: '3rem' }} className="animate-fade-in-up">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ color: '#86efac', fontWeight: '800', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Namaste. You found them all!</h3>
          <p style={{ color: 'var(--echo-text-muted)', marginBottom: '1.5rem' }}>Completing this pattern helps calm the amygdala.</p>
          <button className="btn-primary" onClick={init}>Play Again</button>
        </div>
      )}
    </div>
  );
}

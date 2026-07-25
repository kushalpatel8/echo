'use client';
import { useState, useEffect } from 'react';

interface BanAppealBannerProps {
  dbUser: any;
}

export default function BanAppealBanner({ dbUser }: BanAppealBannerProps) {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const fetchAppeals = async () => {
    try {
      const res = await fetch('/api/appeals');
      const data = await res.json();
      if (data.appeals) {
        setAppeals(data.appeals);
      }
    } catch (err) {
      console.error('Failed to load appeals', err);
    }
  };

  useEffect(() => {
    if (dbUser?.isBanned) {
      fetchAppeals();
      const interval = setInterval(fetchAppeals, 5000); // poll for admin replies
      return () => clearInterval(interval);
    }
  }, [dbUser?.isBanned]);

  if (!dbUser?.isBanned) return null;

  const currentAppeal = appeals[0]; // most recent appeal

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const action = currentAppeal && currentAppeal.status === 'pending' ? 'send' : 'create';
      const body: any = { action, content: input.trim() };
      if (action === 'send') body.appealId = currentAppeal._id;

      const res = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setInput('');
        fetchAppeals();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to send message');
      }
    } catch (err) {
      alert('Error sending message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.25))',
      border: '2px solid #ef4444',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)',
      color: 'var(--echo-text)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: isOpen ? '1.25rem' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ fontSize: '2.25rem', background: '#ef4444', color: 'white', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚫</div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f87171', margin: 0 }}>Account Suspended (3rd Offense Ban)</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)', margin: '0.25rem 0 0' }}>
              Your account has been restricted due to repeated abusive or emotionally harmful language in user sessions.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.25rem',
            borderRadius: '99px',
            fontWeight: '700',
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}
        >
          {isOpen ? 'Close Appeal Box ▲' : '📬 Contact Admin / Appeal Ban ▼'}
        </button>
      </div>

      {isOpen && (
        <div style={{
          background: 'var(--echo-surface)',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid var(--echo-border)',
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--echo-border)', paddingBottom: '0.75rem' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📬 Admin Appeal Chat
              {currentAppeal && (
                <span className={`badge badge-${currentAppeal.status === 'resolved' ? 'green' : currentAppeal.status === 'rejected' ? 'red' : 'yellow'}`}>
                  {currentAppeal.status.toUpperCase()}
                </span>
              )}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>
              {currentAppeal ? `Appeal started on ${new Date(currentAppeal.createdAt).toLocaleDateString()}` : 'No active appeals yet'}
            </span>
          </div>

          <div style={{
            maxHeight: '280px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            padding: '0.5rem',
            background: 'var(--echo-bg)',
            borderRadius: '8px',
            border: '1px solid var(--echo-border)'
          }}>
            {!currentAppeal || currentAppeal.messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>
                You have not sent an appeal message yet. Explain your situation below to contact the Admin team.
              </div>
            ) : (
              currentAppeal.messages.map((msg: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.isAdmin ? 'flex-start' : 'flex-end',
                    maxWidth: '80%',
                    background: msg.isAdmin ? 'linear-gradient(135deg, #4f46e5, #4338ca)' : 'var(--echo-surface-2)',
                    color: msg.isAdmin ? 'white' : 'var(--echo-text)',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.isAdmin ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                    border: msg.isAdmin ? 'none' : '1px solid var(--echo-border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.25rem', opacity: 0.85 }}>
                    {msg.senderName} {msg.isAdmin && '👑'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {(!currentAppeal || currentAppeal.status === 'pending') ? (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Write an explanation or reply to Admin..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--echo-border)',
                  background: 'var(--echo-bg)',
                  color: 'var(--echo-text)',
                  fontSize: '0.875rem'
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                style={{
                  background: 'var(--echo-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0 1.5rem',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: sending || !input.trim() ? 0.6 : 1
                }}
              >
                {sending ? 'Sending...' : 'Send Appeal 📤'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--echo-surface-2)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', color: currentAppeal.status === 'resolved' ? '#22c55e' : '#ef4444' }}>
              {currentAppeal.status === 'resolved' ? '🎉 This appeal was resolved and your ban was revoked!' : '❌ This appeal was rejected by Admin.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

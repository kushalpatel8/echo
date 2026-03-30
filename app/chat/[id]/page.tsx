'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Message {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface Chat {
  _id: string;
  participants: string[];
  participantNames: string[];
  messages: Message[];
  isActive: boolean;
}

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/chat?chatId=${id}`);
        const data = await res.json();
        if (data.chat) {
          setChat(data.chat);
        } else {
          router.push('/dashboard');
        }
      } catch {
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
    const interval = setInterval(fetchChat, 5000); // Simple polling every 5s
    return () => clearInterval(interval);
  }, [id, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', chatId: id, content: input.trim() }),
      });
      if (res.ok) {
        setInput('');
        const data = await res.json();
        setChat(data.chat);
      }
    } catch {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleRate = async (val: number) => {
    setRating(val);
    const volunteerId = chat?.participants.find(p => p !== user?.id);
    if (!volunteerId) return;

    try {
      await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId, rating: val }),
      });
      setRated(true);
      setTimeout(() => setRated(false), 3000);
    } catch {
      alert('Failed to rate');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this chat permanently?')) return;
    try {
      const res = await fetch(`/api/chat?chatId=${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard');
      }
    } catch {
      alert('Failed to delete chat');
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Joining session...</p></div>;
  if (!chat) return null;

  const otherName = chat.participantNames.find(n => n !== user?.fullName && n !== `${user?.firstName} ${user?.lastName}`) || 'Participant';
  const otherId = chat.participants.find(p => p !== user?.id);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--echo-border)', background: 'var(--echo-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>← Back</Link>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--echo-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{otherName[0]}</div>
          <div>
            <div style={{ fontWeight: '700' }}>{otherName}</div>
            <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>Online Support</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Rating component for users only */}
          {user?.id !== otherId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>{rated ? 'Thanks!' : 'Rate volunteer:'}</span>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className="star"
                  style={{ color: star <= rating ? '#fbbf24' : 'var(--echo-border)' }}
                  onClick={() => handleRate(star)}
                >★</span>
              ))}
            </div>
          )}
          
          <button 
            onClick={handleDelete}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ef4444', 
              fontSize: '0.75rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '6px',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            Delete Chat
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div className="badge badge-purple" style={{ opacity: 0.6 }}>Connected to {otherName}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', marginTop: '0.5rem' }}>This session is private and supportive.</p>
        </div>

        {chat.messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                {!isMe && <span style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--echo-primary-light)' }}>{msg.senderName}</span>}
                <span style={{ fontSize: '0.625rem', color: 'var(--echo-text-muted)' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={isMe ? 'message-sent' : 'message-received'}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--echo-border)', background: 'var(--echo-surface)', display: 'flex', gap: '1rem' }}>
        <input
          className="echo-input"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1, background: 'var(--echo-bg)' }}
        />
        <button className="btn-primary" onClick={sendMessage} disabled={sending || !input.trim()}>
          {sending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

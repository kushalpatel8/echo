'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICompanionPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello, ${user?.firstName || 'friend'} 💜 I'm ECHO, your mental health companion. I'm here to listen, support, and journey with you. How are you feeling today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'I\'m here for you. 💜' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I\'m having trouble connecting right now. Please try again in a moment. 💜' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--echo-border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--echo-surface)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>← Back</Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }} className="animate-pulse-glow">🤖</div>
          <div>
            <div style={{ fontWeight: '700' }}>ECHO AI Companion</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#22c55e' }}>
              <span className="status-dot online" />
              Always here for you
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>🤖</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>ECHO</span>
              </div>
            )}
            <div className={msg.role === 'user' ? 'message-sent' : 'message-received'} style={{ lineHeight: '1.6', fontSize: '0.9375rem' }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>🤖</div>
            <div className="message-received" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--echo-primary-light)', animation: 'pulse-glow 1s ease infinite' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--echo-primary-light)', animation: 'pulse-glow 1s ease 0.2s infinite' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--echo-primary-light)', animation: 'pulse-glow 1s ease 0.4s infinite' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length === 1 && (
        <div style={{ padding: '0 1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {["I'm feeling anxious", "I need to talk", "Help me relax", "I feel lonely"].map(suggestion => (
            <button key={suggestion} onClick={() => setInput(suggestion)} style={{ padding: '0.4rem 0.875rem', borderRadius: '999px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface-2)', color: 'var(--echo-text-muted)', cursor: 'pointer', fontSize: '0.8125rem', transition: 'all 0.2s ease' }}>
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--echo-border)', background: 'var(--echo-surface)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input
          className="echo-input"
          placeholder="Type your message... I'm here to listen 💜"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          style={{ flex: 1, background: 'var(--echo-bg)' }}
        />
        <button className="btn-primary" onClick={sendMessage} disabled={!input.trim() || loading} style={{ padding: '0.75rem 1.25rem', flexShrink: 0, opacity: !input.trim() || loading ? 0.5 : 1 }}>
          Send →
        </button>
      </div>
    </div>
  );
}

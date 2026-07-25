'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import BackButton from '@/components/BackButton';
import { useVoice } from '@/hooks/useVoice';
import { VoiceHeaderControls, VoiceMessageButton, VoiceInputButton } from '@/components/VoiceControls';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICompanionPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello, ${user?.username || 'friend'} 💜 I'm ECHO, your mental health companion. I'm here to listen, support, and journey with you. How are you feeling today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    voices,
    settings,
    updateSettings,
    speakingId,
    speak,
    stopSpeaking,
    isListening,
    startListening,
    stopListening,
    hasSpeechSupport,
    hasSynthesisSupport,
  } = useVoice();

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json())
      .then(d => {
        if (d.user?.name) {
          setMessages(prev => {
            if (prev.length === 1 && prev[0].role === 'assistant') {
              return [{
                ...prev[0],
                content: `Hello, ${d.user.name} 💜 I'm ECHO, your mental health companion. I'm here to listen, support, and journey with you. How are you feeling today?`
              }];
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, []);

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
      const replyText = data.message || 'I\'m here for you. 💜';
      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
      if (settings.autoSpeak) {
        speak(replyText, `msg-${messages.length + 1}`);
      }
    } catch {
      const errorText = 'I\'m having trouble connecting right now. Please try again in a moment. 💜';
      setMessages(prev => [...prev, { role: 'assistant', content: errorText }]);
      if (settings.autoSpeak) {
        speak(errorText, `msg-${messages.length + 1}`);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--echo-border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--echo-surface)', flexWrap: 'wrap' }}>
        <BackButton />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 'fit-content' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }} className="animate-pulse-glow">🤖</div>
          <div>
            <div style={{ fontWeight: '700' }}>ECHO AI Companion</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#22c55e' }}>
              <span className="status-dot online" />
              Always here for you
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          <VoiceHeaderControls
            voices={voices}
            settings={settings}
            updateSettings={updateSettings}
            speak={speak}
            stopSpeaking={stopSpeaking}
            speakingId={speakingId}
            hasSynthesisSupport={hasSynthesisSupport}
          />
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
            {msg.role === 'assistant' && (
              <VoiceMessageButton
                text={msg.content}
                messageId={`msg-${i}`}
                speakingId={speakingId}
                speak={speak}
                stopSpeaking={stopSpeaking}
                hasSynthesisSupport={hasSynthesisSupport}
                label="Listen"
              />
            )}
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
        <VoiceInputButton
          isListening={isListening}
          onStart={() => {
            const baseText = input.trim();
            startListening((text) => setInput(baseText ? `${baseText} ${text}` : text));
          }}
          onStop={stopListening}
          hasSpeechSupport={hasSpeechSupport}
        />
        <input
          className="echo-input"
          placeholder="Type or speak your message... I'm here to listen 💜"
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

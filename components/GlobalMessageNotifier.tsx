'use client';

import React, { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { MessageSquare, ExternalLink } from 'lucide-react';

function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Smooth chime: E5 (659Hz) -> A5 (880Hz)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.46);
  } catch {
    // Audio autoplay restrictions or unsupported
  }
}

export function GlobalMessageNotifier() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const seenMessagesRef = useRef<Set<string>>(new Set());
  const isInitialFetchRef = useRef(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let isSubscribed = true;

    const checkNewMessages = async () => {
      try {
        const res = await fetch('/api/chat/notifications');
        if (!res.ok) return;
        const data = await res.json();
        const messages = data.messages || [];

        if (!isSubscribed) return;

        // On first run, mark existing latest messages as already seen
        if (isInitialFetchRef.current) {
          messages.forEach((msg: any) => {
            seenMessagesRef.current.add(msg.messageId);
          });
          isInitialFetchRef.current = false;
          return;
        }

        // Check for new incoming messages
        messages.forEach((msg: any) => {
          if (!msg.isFromMe && !seenMessagesRef.current.has(msg.messageId)) {
            seenMessagesRef.current.add(msg.messageId);

            // Don't show toast if user is already looking at this exact chat and tab is focused
            const isViewingThisChat = pathname === `/chat/${msg.chatId}` && document.hasFocus();

            if (!isViewingThisChat) {
              playChime();

              toast.custom((t) => (
                <div
                  onClick={() => {
                    toast.dismiss(t);
                    router.push(`/chat/${msg.chatId}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.875rem 1.125rem',
                    background: 'var(--echo-surface, #1e1e24)',
                    color: 'var(--echo-text, #ffffff)',
                    borderRadius: '16px',
                    border: '1px solid var(--echo-primary, #8b5cf6)',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), 0 0 16px rgba(139, 92, 246, 0.3)',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: '380px',
                    backdropFilter: 'blur(16px)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '1rem',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
                    }}
                  >
                    {msg.senderName?.[0] || '💬'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.125rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--echo-text, #fff)' }}>
                        {msg.senderName}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#22c55e', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                        New Message
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--echo-text-muted, #94a3b8)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.4',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.4rem',
                      borderRadius: '8px',
                      background: 'var(--echo-surface-2, rgba(255, 255, 255, 0.08))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--echo-primary-light, #a78bfa)',
                      flexShrink: 0,
                    }}
                  >
                    <ExternalLink size={16} />
                  </div>
                </div>
              ), {
                duration: 6000,
                position: 'top-right',
              });
            }
          }
        });
      } catch {
        // Silently ignore transient network errors
      }
    };

    checkNewMessages();
    const interval = setInterval(checkNewMessages, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isSignedIn, isLoaded, pathname, router, user?.id]);

  return null;
}

'use client';
import React, { useState } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Square, Settings, Sparkles, Play } from 'lucide-react';
import { VoiceSettings } from '@/hooks/useVoice';

interface VoiceHeaderControlsProps {
  voices: SpeechSynthesisVoice[];
  settings: VoiceSettings;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  speak: (text: string, id?: string | number) => void;
  stopSpeaking: () => void;
  speakingId: string | number | null;
  hasSynthesisSupport: boolean;
}

export function VoiceHeaderControls({
  voices,
  settings,
  updateSettings,
  speak,
  stopSpeaking,
  speakingId,
  hasSynthesisSupport,
}: VoiceHeaderControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

  if (!hasSynthesisSupport) return null;

  // Filter English voices or show first 15 readable voices
  const readableVoices = voices.filter(v => v.lang.startsWith('en') || v.default).slice(0, 15);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
      {/* Auto-Speak Toggle Pill */}
      <button
        onClick={() => {
          const nextVal = !settings.autoSpeak;
          updateSettings({ autoSpeak: nextVal });
          if (!nextVal && speakingId !== null) {
            stopSpeaking();
          }
        }}
        className="glass-light"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.875rem',
          borderRadius: '999px',
          border: `1px solid ${settings.autoSpeak ? '#22c55e' : 'var(--echo-border)'}`,
          background: settings.autoSpeak ? 'rgba(34, 197, 94, 0.15)' : 'var(--echo-surface-2)',
          color: settings.autoSpeak ? '#22c55e' : 'var(--echo-text-muted)',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: '600',
          transition: 'all 0.2s ease',
        }}
        title="Toggle automatic reading of AI responses"
      >
        {settings.autoSpeak ? (
          <>
            <Volume2 size={15} className="animate-pulse" />
            <span>Audio: ON</span>
            <span className="status-dot online" style={{ width: '6px', height: '6px' }} />
          </>
        ) : (
          <>
            <VolumeX size={15} />
            <span>Audio: OFF</span>
          </>
        )}
      </button>

      {/* Voice Preferences Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="glass-light"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '1px solid var(--echo-border)',
          background: showSettings ? 'var(--echo-primary-low)' : 'var(--echo-surface-2)',
          color: showSettings ? 'var(--echo-primary-light)' : 'var(--echo-text-muted)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        title="Voice Settings"
      >
        <Settings size={15} style={{ transform: showSettings ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s ease' }} />
      </button>

      {/* Voice Settings Popover */}
      {showSettings && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setShowSettings(false)}
          />
          <div
            className="glass"
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              width: '280px',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid var(--echo-border)',
              background: 'var(--echo-surface)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              animation: 'fade-in-up 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--echo-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.875rem' }}>
                <Sparkles size={16} style={{ color: 'var(--echo-primary-light)' }} />
                <span>Voice Preferences</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--echo-text-muted)' }}>TTS Audio</span>
            </div>

            {/* Voice Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--echo-text-muted)', marginBottom: '0.375rem' }}>
                Companion Voice
              </label>
              <select
                className="echo-input"
                value={settings.selectedVoiceURI}
                onChange={e => updateSettings({ selectedVoiceURI: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  background: 'var(--echo-bg)',
                  color: 'var(--echo-text)',
                  border: '1px solid var(--echo-border)',
                }}
              >
                {readableVoices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name.replace(/Google |Microsoft |English |\(.*?\)/g, '').trim() || v.name} ({v.lang})
                  </option>
                ))}
                {readableVoices.length === 0 && <option value="">Default System Voice</option>}
              </select>
            </div>

            {/* Speech Rate */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--echo-text-muted)', marginBottom: '0.375rem' }}>
                Speaking Speed ({settings.rate}x)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.375rem' }}>
                {[
                  { label: 'Relaxed', val: 0.85 },
                  { label: 'Normal', val: 1.0 },
                  { label: 'Dynamic', val: 1.25 },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => updateSettings({ rate: opt.val })}
                    style={{
                      padding: '0.4rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: settings.rate === opt.val ? '700' : '500',
                      background: settings.rate === opt.val ? 'var(--echo-primary)' : 'var(--echo-surface-2)',
                      color: settings.rate === opt.val ? '#fff' : 'var(--echo-text)',
                      border: '1px solid var(--echo-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--echo-text-muted)', marginBottom: '0.375rem' }}>
                Voice Tone ({settings.pitch === 0.9 ? 'Deep & Calm' : settings.pitch === 1.1 ? 'Bright & Crisp' : 'Balanced'})
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.375rem' }}>
                {[
                  { label: 'Deep', val: 0.9 },
                  { label: 'Calm', val: 1.0 },
                  { label: 'Bright', val: 1.1 },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => updateSettings({ pitch: opt.val })}
                    style={{
                      padding: '0.4rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: settings.pitch === opt.val ? '700' : '500',
                      background: settings.pitch === opt.val ? 'var(--echo-primary)' : 'var(--echo-surface-2)',
                      color: settings.pitch === opt.val ? '#fff' : 'var(--echo-text)',
                      border: '1px solid var(--echo-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Button */}
            <button
              onClick={() => {
                if (speakingId === 'test') {
                  stopSpeaking();
                } else {
                  speak("Hello! I am ECHO, your mental health companion. How does my voice sound to you?", 'test');
                }
              }}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '8px',
                background: speakingId === 'test' ? '#ef4444' : 'var(--echo-surface-2)',
                color: '#fff',
                border: '1px solid var(--echo-border)',
                fontWeight: '600',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                marginTop: '0.25rem',
                transition: 'all 0.2s ease',
              }}
            >
              {speakingId === 'test' ? (
                <>
                  <Square size={14} />
                  <span>Stop Preview</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Test Voice</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface VoiceMessageButtonProps {
  text: string;
  messageId: string | number;
  speakingId: string | number | null;
  speak: (text: string, id?: string | number) => void;
  stopSpeaking: () => void;
  hasSynthesisSupport: boolean;
  label?: string;
}

export function VoiceMessageButton({
  text,
  messageId,
  speakingId,
  speak,
  stopSpeaking,
  hasSynthesisSupport,
  label = "Listen",
}: VoiceMessageButtonProps) {
  if (!hasSynthesisSupport) return null;

  const isPlaying = speakingId === messageId;

  return (
    <button
      onClick={() => {
        if (isPlaying) {
          stopSpeaking();
        } else {
          speak(text, messageId);
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.6rem',
        borderRadius: '999px',
        border: '1px solid var(--echo-border)',
        background: isPlaying ? 'rgba(124, 58, 237, 0.25)' : 'var(--echo-surface-2)',
        color: isPlaying ? '#c084fc' : 'var(--echo-text-muted)',
        cursor: 'pointer',
        fontSize: '0.7rem',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        marginTop: '0.375rem',
      }}
      title={isPlaying ? "Stop reading" : "Read aloud"}
    >
      {isPlaying ? (
        <>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '12px' }}>
            <span style={{ width: '2px', height: '8px', background: '#c084fc', animation: 'pulse-glow 0.6s infinite ease' }} />
            <span style={{ width: '2px', height: '12px', background: '#c084fc', animation: 'pulse-glow 0.6s infinite 0.2s ease' }} />
            <span style={{ width: '2px', height: '6px', background: '#c084fc', animation: 'pulse-glow 0.6s infinite 0.4s ease' }} />
          </div>
          <span>Playing...</span>
          <Square size={10} style={{ marginLeft: '2px' }} />
        </>
      ) : (
        <>
          <Volume2 size={13} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

interface VoiceInputButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  hasSpeechSupport: boolean;
}

export function VoiceInputButton({
  isListening,
  onStart,
  onStop,
  hasSpeechSupport,
}: VoiceInputButtonProps) {
  if (!hasSpeechSupport) {
    return (
      <button
        disabled
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          border: '1px solid var(--echo-border)',
          background: 'var(--echo-surface-2)',
          color: 'var(--echo-text-muted)',
          opacity: 0.4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'not-allowed',
        }}
        title="Voice typing is not supported in this browser"
      >
        <MicOff size={18} />
      </button>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* Floating listening indicator banner */}
      {isListening && (
        <div
          className="animate-fade-in-up"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 0.75rem)',
            right: 0,
            background: 'linear-gradient(135deg, #ef4444, #f97316)',
            color: '#fff',
            padding: '0.4rem 0.875rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
            whiteSpace: 'nowrap',
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '14px' }}>
            <span style={{ width: '2.5px', height: '10px', background: '#fff', borderRadius: '2px', animation: 'pulse-glow 0.5s infinite ease' }} />
            <span style={{ width: '2.5px', height: '14px', background: '#fff', borderRadius: '2px', animation: 'pulse-glow 0.5s infinite 0.15s ease' }} />
            <span style={{ width: '2.5px', height: '8px', background: '#fff', borderRadius: '2px', animation: 'pulse-glow 0.5s infinite 0.3s ease' }} />
          </div>
          <span>🎙️ Listening... Speak naturally</span>
        </div>
      )}

      <button
        onClick={() => {
          if (isListening) {
            onStop();
          } else {
            onStart();
          }
        }}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          border: isListening ? '1px solid #ef4444' : '1px solid var(--echo-border)',
          background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'var(--echo-surface-2)',
          color: isListening ? '#ef4444' : 'var(--echo-text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'none',
        }}
        title={isListening ? "Stop listening" : "Click to speak (Voice Typing)"}
      >
        {isListening ? (
          <Mic size={20} className="animate-pulse" style={{ color: '#ef4444' }} />
        ) : (
          <Mic size={19} />
        )}
      </button>
    </div>
  );
}

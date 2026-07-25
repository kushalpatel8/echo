'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export interface VoiceSettings {
  selectedVoiceURI: string;
  rate: number;
  pitch: number;
  autoSpeak: boolean;
}

export function useVoice() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({
    selectedVoiceURI: '',
    rate: 1.0,
    pitch: 1.0,
    autoSpeak: false,
  });
  const [speakingId, setSpeakingId] = useState<string | number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [hasSynthesisSupport, setHasSynthesisSupport] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize browser support and voices
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check TTS support
    if ('speechSynthesis' in window) {
      setHasSynthesisSupport(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices && availableVoices.length > 0) {
          setVoices(availableVoices);
          
          // Load saved settings from localStorage
          const saved = localStorage.getItem('echo_voice_prefs');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setSettings(prev => ({ ...prev, ...parsed }));
            } catch (e) {
              console.error('Failed to parse voice prefs', e);
            }
          } else {
            // Find a nice default English voice (e.g. Google US English, Natural, or calm voice)
            const defaultVoice = availableVoices.find(v => 
              v.name.includes('Natural') || 
              v.name.includes('Google US English') || 
              v.name.includes('Samantha') || 
              (v.lang.startsWith('en') && !v.name.includes('compact'))
            ) || availableVoices[0];

            if (defaultVoice) {
              setSettings(prev => ({ ...prev, selectedVoiceURI: defaultVoice.voiceURI }));
            }
          }
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    // Check STT support
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setHasSpeechSupport(true);
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';
      recognitionRef.current = rec;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Save settings when modified
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('echo_voice_prefs', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Speak text
  const speak = useCallback((text: string, id?: string | number) => {
    if (!hasSynthesisSupport || typeof window === 'undefined') return;

    // Clean up markdown syntax or emojis for smoother reading
    const cleanText = text
      .replace(/(\*|_|#|`|~|-|\+|!|\[|\]|\(|\))/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .trim();

    if (!cleanText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    if (settings.selectedVoiceURI) {
      const voiceObj = voices.find(v => v.voiceURI === settings.selectedVoiceURI);
      if (voiceObj) {
        utterance.voice = voiceObj;
      }
    }

    const targetId = id !== undefined ? id : 'general';

    utterance.onstart = () => {
      setSpeakingId(targetId);
    };

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [hasSynthesisSupport, settings, voices]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  }, []);

  // Start voice recognition (STT)
  const startListening = useCallback((onTranscript: (text: string) => void) => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (e) {}

    let finalTranscript = '';

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const currentText = finalTranscript || interimTranscript;
      if (currentText) {
        onTranscript(currentText);
      }
    };

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  }, [isListening]);

  return {
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
  };
}

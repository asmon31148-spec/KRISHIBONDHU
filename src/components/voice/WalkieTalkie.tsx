'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Square, Play, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface WalkieTalkieProps {
  language: 'en' | 'bn' | 'hi';
  onSpeechFinal: (transcript: string) => void;
  lastAiResponse?: string;
  autoSpeakAiResponse?: boolean;
}

// Window augmented interface for speech recognition
interface IWindow extends Window {
  webkitSpeechRecognition?: new () => ISpeechRecognition;
  SpeechRecognition?: new () => ISpeechRecognition;
}

interface ISpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: () => void;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

export function WalkieTalkie({
  language,
  onSpeechFinal,
  lastAiResponse,
  autoSpeakAiResponse = true,
}: WalkieTalkieProps) {
  const toast = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [supported, setSupported] = useState(false);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const langCode = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

  // Initialize Speech APIs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRec) {
      setSupported(true);
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = langCode;

      rec.onstart = () => {
        setIsListening(true);
        setInterimText('');
        // Stop any ongoing speech playback when user starts talking
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
      };

      rec.onresult = (event: ISpeechRecognitionEvent) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (interimStr) {
          setInterimText(interimStr);
        }

        if (finalStr) {
          setInterimText('');
          onSpeechFinal(finalStr.trim());
        }
      };

      rec.onerror = (event: { error: string }) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
        setInterimText('');
        if (event.error !== 'no-speech') {
          toast.info(`Microphone: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = rec;
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort error
        }
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [langCode, onSpeechFinal, toast]);

  // Clean markdown text for natural TTS reading
  const cleanMarkdownForTts = (text: string): string => {
    return text
      .replace(/[#*_~`>]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, '. ')
      .trim();
  };

  // Speak AI response aloud
  const speakText = useCallback(
    (textToRead: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      const synth = window.speechSynthesis;
      synth.cancel(); // cancel previous

      const cleaned = cleanMarkdownForTts(textToRead);
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = langCode;
      utterance.rate = 0.95; // slightly slower for rural clarity

      // Find best regional voice if available
      const voices = synth.getVoices();
      const matchedVoice = voices.find((v) => v.lang.replace('_', '-').includes(langCode));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
    },
    [langCode]
  );

  // Auto-speak when new AI response arrives
  const lastSpokenRef = useRef<string | null>(null);
  useEffect(() => {
    if (autoSpeakAiResponse && lastAiResponse && lastAiResponse !== lastSpokenRef.current) {
      lastSpokenRef.current = lastAiResponse;
      speakText(lastAiResponse);
    }
  }, [lastAiResponse, autoSpeakAiResponse, speakText]);

  // Microphone toggle (tap or press)
  const startListening = () => {
    if (!recognitionRef.current) {
      toast.info('Speech recognition not supported on this device/browser.');
      return;
    }
    try {
      recognitionRef.current.lang = langCode;
      recognitionRef.current.start();
    } catch {
      // recognition may already be running
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // TTS Controls
  const togglePauseResume = () => {
    if (!synthRef.current) return;
    if (isSpeaking && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    } else if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const replayLast = () => {
    if (lastAiResponse) {
      speakText(lastAiResponse);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Walkie-Talkie Pulsing Mic Button */}
      <div className="relative">
        <button
          type="button"
          onClick={toggleMic}
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          disabled={!supported}
          title={
            !supported
              ? 'Voice recognition not supported in this browser'
              : isListening
              ? 'Listening... release to send'
              : 'Hold to Speak (Bengali/Hindi/English)'
          }
          className={`relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer select-none ${
            !supported
              ? 'bg-cream-300 text-brand-dark/40 cursor-not-allowed'
              : isListening
              ? 'bg-rose-600 text-white shadow-lg ring-4 ring-rose-400/50 scale-105'
              : 'bg-brand-forest hover:bg-brand-forest/90 text-white shadow-sm'
          }`}
        >
          {!supported ? (
            <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : isListening ? (
            <Mic className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          ) : (
            <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>

        {/* Ambient pulse effect while listening */}
        {isListening && (
          <span className="absolute inset-0 rounded-2xl bg-rose-500 animate-ping opacity-35 pointer-events-none" />
        )}
      </div>

      {/* Audio Playback Controls (Visible when AI is speaking or has spoken) */}
      {isSpeaking && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          <Volume2 className="w-4 h-4 text-emerald-700 animate-pulse" />
          <span className="font-semibold hidden sm:inline">Speaking</span>
          <button
            type="button"
            onClick={togglePauseResume}
            className="p-1 hover:bg-emerald-100 rounded-md transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={stopSpeaking}
            className="p-1 hover:bg-emerald-100 rounded-md transition-colors"
            title="Stop Speaking"
          >
            <VolumeX className="w-3.5 h-3.5 text-rose-600" />
          </button>
        </div>
      )}

      {!isSpeaking && lastAiResponse && (
        <button
          type="button"
          onClick={replayLast}
          className="p-2.5 rounded-xl bg-white border border-cream-200 hover:border-brand-leaf/40 text-brand-dark/70 hover:text-brand-forest transition-colors shadow-2xs"
          title="Replay Voice Advisory"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}

      {/* Real-time speech transcription tooltip */}
      {interimText && (
        <div className="absolute -top-10 left-4 right-4 p-2 bg-brand-forest text-white text-xs rounded-xl shadow-lg truncate z-30">
          🎙️ {interimText}
        </div>
      )}
    </div>
  );
}

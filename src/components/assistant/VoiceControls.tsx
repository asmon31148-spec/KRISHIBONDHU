'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Square } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface VoiceControlsProps {
  language: 'en' | 'bn' | 'hi';
  onSpeechInput: (text: string) => void;
  textToSpeak?: string;
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
}

interface ISpeechRecognitionEvent {
  results: Array<Array<{ transcript: string }>>;
}

export function VoiceControls({
  language,
  onSpeechInput,
  textToSpeak,
}: VoiceControlsProps) {
  const toast = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [synthSupported, setSynthSupported] = useState(false);

  const langCode = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const hasRecognition = Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
      setRecognitionSupported(hasRecognition);

      const hasSynth = 'speechSynthesis' in window;
      setSynthSupported(hasSynth);
    }
  }, []);

  // Speech to Text (Microphone)
  const toggleListening = useCallback(() => {
    if (!recognitionSupported) {
      toast.warning(
        'Speech recognition is not supported in this browser. Please use Chrome on Android or desktop.'
      );
      return;
    }

    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = langCode;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info(
          `Listening in ${
            language === 'bn' ? 'বাংলা' : language === 'hi' ? 'हिन्दी' : 'English'
          }... Speak now.`
        );
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onSpeechInput(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (err: { error: string }) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          toast.error('Microphone permission denied. Please allow microphone access.');
        } else {
          toast.warning('Could not capture audio clearly. Please try again or type.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setIsListening(false);
    }
  }, [isListening, langCode, language, onSpeechInput, recognitionSupported, toast]);

  // Text to Speech (Read Aloud)
  const toggleSpeak = useCallback(() => {
    if (!synthSupported || !window.speechSynthesis) {
      toast.warning('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!textToSpeak) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langCode;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) => v.lang.startsWith(language));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis failed:', err);
      setIsSpeaking(false);
    }
  }, [isSpeaking, langCode, language, synthSupported, textToSpeak, toast]);

  return (
    <div className="flex items-center gap-1.5">
      {/* Microphone Button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`p-2 rounded-xl transition-all ${
          isListening
            ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-400'
            : 'text-brand-dark/70 hover:text-brand-forest hover:bg-cream-200'
        }`}
        aria-label={isListening ? 'Stop recording voice' : 'Speak your question'}
        title="Voice Input (Speech-to-Text)"
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* Read Aloud Button */}
      {textToSpeak && synthSupported && (
        <button
          type="button"
          onClick={toggleSpeak}
          className={`p-2 rounded-xl transition-all ${
            isSpeaking
              ? 'bg-brand-forest text-white shadow-xs'
              : 'text-brand-dark/70 hover:text-brand-forest hover:bg-cream-200'
          }`}
          aria-label={isSpeaking ? 'Stop speaking' : 'Read answer aloud'}
          title="Read Answer Aloud"
        >
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

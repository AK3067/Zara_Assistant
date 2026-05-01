'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechSynthesisProps {
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface Voice {
  name: string;
  lang: string;
  default: boolean;
}

interface SpeechSynthesisHook {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: Voice[];
  selectedVoice: Voice | null;
  setSelectedVoice: (voice: Voice | null) => void;
  rate: number;
  setRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

// Check support once at module level
function getSpeechSynthesisSupport() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function useSpeechSynthesis({
  onEnd,
  onError,
}: UseSpeechSynthesisProps = {}): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check support - memoized
  const isSupported = getSpeechSynthesisSupport();

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const voiceList = availableVoices.map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        default: voice.default,
      }));
      setVoices(voiceList);

      // Set default voice if not already set
      if (voiceList.length > 0 && !selectedVoice) {
        const defaultVoice = voiceList.find((v) => v.default) || voiceList[0];
        setSelectedVoice(defaultVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isSupported, selectedVoice]);

  const speak = useCallback(
    async (text: string) => {
      if (!isSupported || !text) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      return new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);

        // Find and set the voice
        if (selectedVoice) {
          const voice = window.speechSynthesis
            .getVoices()
            .find((v) => v.name === selectedVoice.name);
          if (voice) {
            utterance.voice = voice;
          }
        }

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          onEnd?.();
          resolve();
        };

        utterance.onerror = (event) => {
          setIsSpeaking(false);
          setIsPaused(false);
          onError?.(event.error);
          reject(new Error(event.error));
        };

        utterance.onpause = () => {
          setIsPaused(true);
        };

        utterance.onresume = () => {
          setIsPaused(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      });
    },
    [isSupported, selectedVoice, rate, pitch, volume, onEnd, onError]
  );

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, isPaused]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
  };
}

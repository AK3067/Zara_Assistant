'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWakeWordProps {
  wakeWord?: string;
  onWakeWordDetected?: () => void;
  enabled?: boolean;
}

interface WakeWordHook {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  lastTranscript: string;
}

// Extend Window interface for webkit prefix
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Check support once at module level
function getSpeechRecognitionSupport() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useWakeWord({
  wakeWord = 'hey zara',
  onWakeWordDetected,
  enabled = true,
}: UseWakeWordProps = {}): WakeWordHook {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isProcessingRef = useRef(false);

  // Check support - memoized
  const isSupported = Boolean(getSpeechRecognitionSupport());

  // Normalize text for wake word detection
  const normalizeText = useCallback((text: string): string => {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  }, []);

  // Check if wake word is in transcript
  const checkForWakeWord = useCallback((transcript: string): boolean => {
    const normalized = normalizeText(transcript);
    const normalizedWakeWord = normalizeText(wakeWord);
    
    // Check for exact match or if wake word appears in the transcript
    return normalized.includes(normalizedWakeWord) || 
           normalized === normalizedWakeWord;
  }, [wakeWord, normalizeText]);

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionSupport();

    if (SpeechRecognitionAPI && enabled) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true; // Keep listening continuously
      recognition.interimResults = true; // Get partial results for faster detection
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        isProcessingRef.current = false;
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-restart if still enabled
        if (enabled && !isProcessingRef.current) {
          try {
            setTimeout(() => {
              if (recognitionRef.current && enabled) {
                recognitionRef.current.start();
              }
            }, 100);
          } catch (error) {
            console.error('Error restarting wake word detection:', error);
          }
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Get the latest result
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }

        setLastTranscript(fullTranscript);

        // Check for wake word
        if (checkForWakeWord(fullTranscript)) {
          console.log('Wake word detected:', fullTranscript);
          isProcessingRef.current = true;
          recognition.stop();
          onWakeWordDetected?.();
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Wake word detection error:', event.error);
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        isProcessingRef.current = true;
        recognitionRef.current.abort();
      }
    };
  }, [enabled, checkForWakeWord, onWakeWordDetected]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && enabled) {
      try {
        isProcessingRef.current = false;
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting wake word detection:', error);
      }
    }
  }, [isListening, enabled]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      isProcessingRef.current = true;
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    lastTranscript,
  };
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIAssistant } from '@/components/ai-assistant';
import { AssistantOverlay } from '@/components/assistant-overlay';
import { LandingScreen } from '@/components/landing-screen';
import { useWakeWord } from '@/hooks/use-wake-word';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useAssistantStore } from '@/store/assistant-store';

type AppState = 'landing' | 'overlay' | 'full';

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });
  const [appState, setAppState] = useState<AppState>('landing');
  const [isOpening, setIsOpening] = useState(false);
  const [overlayTranscript, setOverlayTranscript] = useState('');
  const [overlayResponse, setOverlayResponse] = useState('');
  const [isOverlayProcessing, setIsOverlayProcessing] = useState(false);

  const mountedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Get store actions
  const { setIsListening: setStoreListening, setIsSpeaking: setStoreSpeaking, setIsProcessing: setStoreProcessing, settings } = useAssistantStore();

  // Handle wake word detection
  const handleWakeWordDetected = useCallback(() => {
    console.log('Wake word detected! Opening overlay...');
    setAppState('overlay');
    setOverlayTranscript('');
    setOverlayResponse('');
  }, []);

  // Wake word detection hook
  const {
    isListening: isWakeWordListening,
    isSupported: isWakeWordSupported,
    startListening: startWakeWordListening,
    stopListening: stopWakeWordListening,
    lastTranscript: wakeWordTranscript,
  } = useWakeWord({
    wakeWord: 'hey zara',
    onWakeWordDetected: handleWakeWordDetected,
    enabled: appState === 'landing',
  });

  // Overlay speech recognition
  const {
    isListening: isOverlayListening,
    transcript,
    isSupported: isRecognitionSupported,
    startListening: startOverlayListening,
    stopListening: stopOverlayListening,
    resetTranscript,
  } = useSpeechRecognition({
    onResult: async (text) => {
      setOverlayTranscript(text);
    },
    language: settings.language,
    continuous: false,
    interimResults: true,
  });

  // Speech synthesis for overlay
  const {
    speak,
    isSpeaking: isOverlaySpeaking,
    isSupported: isSynthesisSupported,
    stop: stopSpeaking,
  } = useSpeechSynthesis({
    onEnd: () => {
      setStoreSpeaking(false);
      // Auto-restart listening after speaking
      if (appState === 'overlay') {
        setTimeout(() => startOverlayListening(), 500);
      }
    },
    onError: () => {
      setStoreSpeaking(false);
    },
  });

  // Process message in overlay mode
  const processOverlayMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsOverlayProcessing(true);
    setStoreProcessing(true);
    setOverlayTranscript(message);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
        }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        setOverlayResponse(data.message);

        // Speak the response
        if (settings.enableVoiceResponse) {
          setStoreSpeaking(true);
          const textContent = data.message
            .replace(/```[\s\S]*?```/g, 'code block')
            .replace(/`[^`]+`/g, 'code')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
          await speak(textContent);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setOverlayResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsOverlayProcessing(false);
      setStoreProcessing(false);
    }
  }, [settings.enableVoiceResponse, speak, setStoreProcessing, setStoreSpeaking]);

  // Auto-send transcript when speech ends
  useEffect(() => {
    if (transcript && !isOverlayListening && appState === 'overlay') {
      const timer = setTimeout(() => {
        processOverlayMessage(transcript);
        resetTranscript();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [transcript, isOverlayListening, appState, processOverlayMessage, resetTranscript]);

  // Update store listening state
  useEffect(() => {
    setStoreListening(isOverlayListening);
  }, [isOverlayListening, setStoreListening]);

  // Initialize
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const currentTheme = savedTheme || 'system';

    const root = document.documentElement;
    if (currentTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', currentTheme === 'dark');
    }

    requestAnimationFrame(() => {
      setIsReady(true);
    });
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (!mountedRef.current) return;

    const root = document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle opening app
  const handleOpenApp = useCallback(() => {
    setIsOpening(true);
    stopWakeWordListening();
    setTimeout(() => {
      setAppState('full');
      setIsOpening(false);
    }, 300);
  }, [stopWakeWordListening]);

  // Handle closing overlay
  const handleCloseOverlay = useCallback(() => {
    stopOverlayListening();
    stopSpeaking();
    setAppState('landing');
    setOverlayTranscript('');
    setOverlayResponse('');
    // Restart wake word listening
    setTimeout(() => {
      startWakeWordListening();
    }, 100);
  }, [stopOverlayListening, stopSpeaking, startWakeWordListening]);

  // Handle going back to landing from full UI
  const handleBackToLanding = useCallback(() => {
    setAppState('landing');
    // Restart wake word listening
    setTimeout(() => {
      startWakeWordListening();
    }, 100);
  }, [startWakeWordListening]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  // Check voice support
  const isVoiceSupported = isRecognitionSupported && isSynthesisSupported;

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-primary/20 rounded" />
            <div className="h-3 w-16 bg-primary/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {/* Landing Screen */}
        {appState === 'landing' && (
          <LandingScreen
            isOpening={isOpening}
            onOpen={handleOpenApp}
            wakeWordText={wakeWordTranscript}
            isWakeWordListening={isWakeWordListening}
          />
        )}
      </AnimatePresence>

      {/* Overlay Mode (triggered by wake word) */}
      <AssistantOverlay
        isOpen={appState === 'overlay'}
        isListening={isOverlayListening}
        isSpeaking={isOverlaySpeaking}
        isProcessing={isOverlayProcessing}
        transcript={overlayTranscript || transcript}
        response={overlayResponse}
        onClose={handleCloseOverlay}
        onStartListening={startOverlayListening}
        onStopListening={stopOverlayListening}
        isVoiceSupported={isVoiceSupported}
      />

      {/* Full UI Mode */}
      <AnimatePresence>
        {appState === 'full' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen"
          >
            <AIAssistant
              theme={theme}
              onThemeChange={handleThemeChange}
              onBack={handleBackToLanding}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

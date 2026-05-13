'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mic,
  MicOff,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Smartphone,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Maximize,
  Minimize,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

interface CleanViewModeProps {
  isActive: boolean;
  onDeactivate: () => void;
}

export function CleanViewMode({ isActive, onDeactivate }: CleanViewModeProps) {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [showUI, setShowUI] = useState(true);
  const [scrollCount, setScrollCount] = useState(0);
  const [mode, setMode] = useState<'instagram' | 'youtube' | 'general'>('general');
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Voice commands handler
  const handleVoiceCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    setLastCommand(command);

    // Clear previous timeout
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
    }

    // Process commands
    if (lowerCommand.includes('up') || lowerCommand === 'scroll up' || lowerCommand === 'previous') {
      performScroll('up');
    } else if (lowerCommand.includes('down') || lowerCommand === 'scroll down' || lowerCommand === 'next') {
      performScroll('down');
    } else if (lowerCommand.includes('stop') || lowerCommand === 'pause') {
      // Pause action
      simulateKey(' ');
    } else if (lowerCommand.includes('play') || lowerCommand === 'resume') {
      // Play action
      simulateKey(' ');
    } else if (lowerCommand.includes('hide') || lowerCommand.includes('clean')) {
      setShowUI(false);
    } else if (lowerCommand.includes('show') || lowerCommand.includes('display')) {
      setShowUI(true);
    } else if (lowerCommand.includes('exit') || lowerCommand.includes('close')) {
      onDeactivate();
    } else if (lowerCommand.includes('mute')) {
      setIsMuted(true);
    } else if (lowerCommand.includes('unmute')) {
      setIsMuted(false);
    }

    // Clear command display after 2 seconds
    commandTimeoutRef.current = setTimeout(() => {
      setLastCommand('');
    }, 2000);
  }, [onDeactivate]);

  // Speech recognition
  const {
    isListening: isVoiceListening,
    transcript,
    startListening,
    stopListening,
    isSupported: isVoiceSupported,
  } = useSpeechRecognition({
    onResult: handleVoiceCommand,
    language: 'en-US',
    continuous: true,
  });

  // Simulate scroll action
  const performScroll = useCallback((direction: 'up' | 'down') => {
    const scrollAmount = direction === 'up' ? -window.innerHeight * 0.8 : window.innerHeight * 0.8;
    window.scrollBy({
      top: scrollAmount,
      behavior: 'smooth',
    });
    setScrollCount(prev => prev + 1);

    // Also try to find video container and scroll within it
    const containers = document.querySelectorAll('[data-scroll-container], .scroll-container, [class*="scroll"]');
    containers.forEach(container => {
      container.scrollBy({
        top: direction === 'up' ? -300 : 300,
        behavior: 'smooth',
      });
    });
  }, []);

  // Simulate key press for play/pause
  const simulateKey = useCallback((key: string) => {
    const event = new KeyboardEvent('keydown', { key, code: key === ' ' ? 'Space' : key });
    document.dispatchEvent(event);
  }, []);

  // Toggle voice control
  const toggleListening = useCallback(() => {
    if (isVoiceListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isVoiceListening, startListening, stopListening]);

  // Manual scroll buttons
  const handleScrollUp = useCallback(() => {
    performScroll('up');
    setLastCommand('Scroll Up');
    setTimeout(() => setLastCommand(''), 1000);
  }, [performScroll]);

  const handleScrollDown = useCallback(() => {
    performScroll('down');
    setLastCommand('Scroll Down');
    setTimeout(() => setLastCommand(''), 1000);
  }, [performScroll]);

  // Auto-start listening when mode activates
  useEffect(() => {
    if (isActive && isVoiceSupported) {
      startListening();
    }
    return () => {
      if (isVoiceListening) {
        stopListening();
      }
    };
  }, [isActive, isVoiceSupported]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        handleScrollUp();
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        handleScrollDown();
      } else if (e.key === 'Escape') {
        onDeactivate();
      } else if (e.key === 'h') {
        setShowUI(prev => !prev);
      } else if (e.key === 'm') {
        setIsMuted(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleScrollUp, handleScrollDown, onDeactivate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
    };
  }, []);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      {/* Floating Controls */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 pointer-events-auto"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between bg-black/60 backdrop-blur-lg rounded-2xl p-3 border border-white/10">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isVoiceListening ? "bg-green-500/20" : "bg-white/10"
                )}>
                  {isVoiceListening ? (
                    <Mic className="w-5 h-5 text-green-400" />
                  ) : (
                    <MicOff className="w-5 h-5 text-white/40" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Clean View Mode</p>
                  <p className="text-xs text-white/40">
                    {isVoiceListening ? 'Listening for commands...' : 'Voice control off'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={cn(
                  "text-[10px]",
                  mode === 'instagram' ? "bg-pink-500/20 text-pink-400" :
                  mode === 'youtube' ? "bg-red-500/20 text-red-400" :
                  "bg-white/10 text-white/60"
                )}>
                  {mode === 'instagram' ? 'Instagram' : mode === 'youtube' ? 'YouTube' : 'General'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUI(false)}
                  className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDeactivate}
                  className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Display */}
      <AnimatePresence>
        {lastCommand && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
              <p className="text-2xl font-medium text-white text-center">{lastCommand}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 pointer-events-auto"
          >
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
              {/* Voice Commands Help */}
              <div className="mb-4 text-center">
                <p className="text-xs text-white/40 mb-2">Voice Commands</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['up', 'down', 'next', 'previous', 'play', 'pause', 'hide', 'show', 'exit'].map((cmd) => (
                    <span key={cmd} className="text-[10px] bg-white/5 text-white/50 px-2 py-1 rounded-full">
                      {cmd}
                    </span>
                  ))}
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-4">
                {/* Scroll Up Button */}
                <Button
                  onClick={handleScrollUp}
                  className="w-14 h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <ChevronUp className="w-6 h-6" />
                </Button>

                {/* Voice Control Toggle */}
                <Button
                  onClick={toggleListening}
                  className={cn(
                    "w-16 h-16 rounded-full",
                    isVoiceListening
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-white hover:bg-white/90 text-black"
                  )}
                >
                  {isVoiceListening ? (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Mic className="w-7 h-7" />
                    </motion.div>
                  ) : (
                    <Mic className="w-7 h-7" />
                  )}
                </Button>

                {/* Scroll Down Button */}
                <Button
                  onClick={handleScrollDown}
                  className="w-14 h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <ChevronDown className="w-6 h-6" />
                </Button>
              </div>

              {/* Transcript Display */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-center"
                >
                  <p className="text-xs text-white/60 italic">"{transcript}"</p>
                </motion.div>
              )}

              {/* Stats */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/30">
                <span>Scrolls: {scrollCount}</span>
                <span>|</span>
                <span className={cn(isVoiceListening ? "text-green-400" : "text-white/30")}>
                  {isVoiceListening ? "Voice Active" : "Voice Off"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap to show UI */}
      {!showUI && (
        <div
          className="absolute inset-0 pointer-events-auto"
          onClick={() => setShowUI(true)}
        />
      )}

      {/* Hidden UI indicator */}
      {!showUI && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-xs text-white/40">Tap anywhere to show controls</p>
          </div>
        </motion.div>
      )}

      {/* Floating Side Buttons (when UI hidden) */}
      {!showUI && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto flex flex-col gap-4">
          <Button
            onClick={handleScrollUp}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white/60 hover:text-white"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleScrollDown}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white/60 hover:text-white"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default CleanViewMode;

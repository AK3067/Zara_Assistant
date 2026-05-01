'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AIAvatar } from './ai-avatar';

interface AssistantOverlayProps {
  isOpen: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;
  response: string;
  onClose: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  isVoiceSupported: boolean;
}

export function AssistantOverlay({
  isOpen,
  isListening,
  isSpeaking,
  isProcessing,
  transcript,
  response,
  onClose,
  onStartListening,
  onStopListening,
  isVoiceSupported,
}: AssistantOverlayProps) {
  // Auto-start listening when overlay opens
  useEffect(() => {
    if (isOpen && isVoiceSupported && !isListening && !isProcessing && !isSpeaking) {
      const timer = setTimeout(() => {
        onStartListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVoiceSupported, isListening, isProcessing, isSpeaking, onStartListening]);

  // Stop listening when overlay closes
  useEffect(() => {
    if (!isOpen && isListening) {
      onStopListening();
    }
  }, [isOpen, isListening, onStopListening]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Blurred Background */}
          <motion.div
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(16px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Close Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            className="absolute top-4 right-4 z-10"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
            >
              <X className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 flex flex-col items-center justify-center p-8 max-w-lg w-full mx-4"
          >
            {/* AI Avatar */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, type: 'spring' }}
            >
              <AIAvatar
                isListening={isListening}
                isSpeaking={isSpeaking}
                isProcessing={isProcessing}
                size="xl"
                className="mb-6"
              />
            </motion.div>

            {/* Status Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
            >
              <motion.h2
                key={isListening ? 'listening' : isSpeaking ? 'speaking' : isProcessing ? 'processing' : 'ready'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-semibold mb-2"
              >
                {isListening
                  ? 'Listening...'
                  : isSpeaking
                  ? 'Speaking...'
                  : isProcessing
                  ? 'Thinking...'
                  : 'Hey, how can I help?'}
              </motion.h2>
              <p className="text-muted-foreground">
                {isListening
                  ? 'Speak naturally, I\'m ready'
                  : isSpeaking
                  ? 'Playing response...'
                  : isProcessing
                  ? 'Processing your request...'
                  : 'Say something or tap the mic'}
              </p>
            </motion.div>

            {/* Transcript Display */}
            <AnimatePresence>
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="w-full mb-4"
                >
                  <div className="bg-primary/10 rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">You said:</p>
                    <p className="text-lg font-medium">{transcript}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Response Display */}
            <AnimatePresence>
              {response && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="w-full mb-4"
                >
                  <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Zara:</p>
                    <p className="text-base">{response}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sound Wave Visualization */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-center gap-1.5 h-16">
                    {[...Array(7)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 bg-primary rounded-full"
                        animate={{
                          height: [16, 48, 16],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.08,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Microphone Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={isListening ? 'destructive' : 'default'}
                size="lg"
                onClick={isListening ? onStopListening : onStartListening}
                disabled={isProcessing || isSpeaking}
                className={cn(
                  'w-20 h-20 rounded-full shadow-lg',
                  isListening && 'animate-pulse ring-4 ring-primary/30'
                )}
              >
                {isProcessing || isSpeaking ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    {isSpeaking ? <Volume2 className="w-8 h-8" /> : <motion.div className="w-8 h-8 rounded-full border-4 border-t-transparent border-current animate-spin" />}
                  </motion.div>
                ) : isListening ? (
                  <VolumeX className="w-8 h-8" />
                ) : (
                  <Volume2 className="w-8 h-8" />
                )}
              </Button>
            </motion.div>

            {/* Hint Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground mt-6 text-center"
            >
              Say "Hey Zara" anytime to wake me up
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

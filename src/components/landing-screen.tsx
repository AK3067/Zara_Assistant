'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Mic, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AIAvatar } from './ai-avatar';

interface LandingScreenProps {
  isOpening: boolean;
  onOpen: () => void;
  wakeWordText: string;
  isWakeWordListening: boolean;
}

export function LandingScreen({
  isOpening,
  onOpen,
  wakeWordText,
  isWakeWordListening,
}: LandingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isOpening ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed inset-0 z-40 flex flex-col items-center justify-center p-8',
        'bg-gradient-to-b from-background via-background to-primary/5'
      )}
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '10%', left: '20%' }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ bottom: '20%', right: '15%' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo & Name */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-6">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <AIAvatar size="lg" />
          </div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">Zara AI</h1>
          <p className="text-muted-foreground text-center max-w-xs">
            Your intelligent assistant for everything
          </p>
        </motion.div>

        {/* Wake Word Listening Indicator */}
        {isWakeWordListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-green-500"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span>Listening for "Hey Zara"</span>
          </motion.div>
        )}

        {/* Wake Word Detection Text */}
        {wakeWordText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 px-4 py-2 bg-primary/10 rounded-full text-sm"
          >
            "{wakeWordText}"
          </motion.div>
        )}

        {/* Click to Open Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            size="lg"
            onClick={onOpen}
            className="h-14 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Open Zara AI
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          {[
            { icon: MessageSquare, label: 'Chat' },
            { icon: Mic, label: 'Voice' },
            { icon: Zap, label: 'Quick' },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 bg-muted/50 backdrop-blur-sm rounded-full text-sm"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              {feature.label}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8 left-0 right-0 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Say <span className="font-semibold text-foreground">"Hey Zara"</span> or click to start
        </p>
      </motion.div>
    </motion.div>
  );
}

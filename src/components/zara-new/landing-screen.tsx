'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ChevronRight, 
  Download, 
  Wifi, 
  WifiOff, 
  Cpu,
  MessageSquare,
  Mic,
  Zap,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePWA } from '@/hooks/use-pwa';

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
  const { canInstall, isInstalled, isOnline, installApp } = usePWA();

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isOpening ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-black"
    >
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Animated glow orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Status Bar */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
        
        {isInstalled && (
          <Badge className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
            <Cpu className="w-3 h-3 mr-1" />
            App
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="mb-10"
        >
          <motion.div
            className="relative w-24 h-24 rounded-2xl bg-white flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-10 h-10 text-black" />
            
            {/* Subtle pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl border border-white/20"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-3 tracking-tight">
            Zara
          </h1>
          <p className="text-lg text-white/40 font-light">
            Your AI assistant
          </p>
        </motion.div>

        {/* Wake Word Indicator */}
        {isWakeWordListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center gap-3 px-4 py-2 rounded-full border border-white/10"
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-white"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm text-white/60">Listening for "Hey Zara"</span>
          </motion.div>
        )}

        {/* Wake Word Text */}
        {wakeWordText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-5 py-2 rounded-full border border-white/20 text-white"
          >
            <span className="text-sm">"{wakeWordText}"</span>
          </motion.div>
        )}

        {/* Main Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-xs space-y-3"
        >
          <Button
            size="lg"
            onClick={onOpen}
            className="w-full h-14 rounded-xl text-base font-medium bg-white text-black hover:bg-white/90 transition-all duration-200"
          >
            Get Started
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>

          {canInstall && (
            <Button
              size="lg"
              variant="outline"
              onClick={installApp}
              className="w-full h-12 rounded-xl border-white/20 text-white hover:bg-white/5"
            >
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
          )}
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mt-10"
        >
          {[
            { icon: MessageSquare, label: 'Chat' },
            { icon: Mic, label: 'Voice' },
            { icon: Cpu, label: 'Local AI' },
            { icon: Shield, label: 'Private' },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02]"
            >
              <feature.icon className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/60">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 p-6 text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Offline</span>
          </div>
        </div>
        <p className="text-xs text-white/30">
          Say <span className="text-white/50">"Hey Zara"</span> or tap to start
        </p>
      </motion.div>
    </motion.div>
  );
}

export default LandingScreen;

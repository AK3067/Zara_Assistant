'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Brain,
  Palette,
  Target,
  Moon,
  Check,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AI_PERSONALITIES, AIName, AIPersonality } from '@/types/assistant';

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  brain: Brain,
  palette: Palette,
  target: Target,
  moon: Moon,
};

interface NameSelectionScreenProps {
  onComplete: (name: AIName) => void;
}

export function NameSelectionScreen({ onComplete }: NameSelectionScreenProps) {
  const [selectedName, setSelectedName] = useState<AIName>('Zara');
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [isVoicePlaying, setIsVoicePlaying] = useState<AIName | null>(null);

  const selectedPersonality = AI_PERSONALITIES.find(p => p.name === selectedName) || AI_PERSONALITIES[0];

  const handleSelect = (name: AIName) => {
    setSelectedName(name);
  };

  const handleContinue = () => {
    setStep('confirm');
  };

  const handleConfirm = () => {
    onComplete(selectedName);
  };

  const handleBack = () => {
    setStep('select');
  };

  const playVoiceSample = (personality: AIPersonality) => {
    setIsVoicePlaying(personality.name);
    
    // Use Web Speech API for voice sample
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(personality.greeting);
      utterance.pitch = personality.voicePitch;
      utterance.rate = personality.voiceRate;
      utterance.onend = () => setIsVoicePlaying(null);
      utterance.onerror = () => setIsVoicePlaying(null);
      speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsVoicePlaying(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-white mb-2">
              {step === 'select' ? 'Choose Your AI Assistant' : 'Confirm Your Choice'}
            </h1>
            <p className="text-white/50 text-sm">
              {step === 'select' 
                ? 'Select a personality that matches your style' 
                : 'This will be your AI companion\'s name and voice'}
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 pb-4">
          <AnimatePresence mode="wait">
            {step === 'select' ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                {AI_PERSONALITIES.map((personality, index) => {
                  const Icon = ICON_MAP[personality.icon] || Sparkles;
                  const isSelected = selectedName === personality.name;
                  const isPlaying = isVoicePlaying === personality.name;

                  return (
                    <motion.button
                      key={personality.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => handleSelect(personality.name)}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all text-left",
                        "hover:bg-white/5",
                        isSelected
                          ? "bg-white/10 border-white/30"
                          : "bg-white/[0.02] border-white/10"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                            `bg-gradient-to-br ${personality.gradient}`
                          )}
                          style={{ backgroundColor: isSelected ? personality.color : undefined }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">{personality.displayName}</h3>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 rounded-full bg-white flex items-center justify-center"
                              >
                                <Check className="w-4 h-4 text-black" />
                              </motion.div>
                            )}
                          </div>
                          <p className="text-sm text-white/50 mt-1">{personality.description}</p>
                          <p className="text-xs text-white/30 mt-1">{personality.personality}</p>
                        </div>
                      </div>

                      {/* Voice Sample Button */}
                      <div className="mt-3 flex items-center gap-2 ml-16">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playVoiceSample(personality);
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all",
                            isPlaying
                              ? "bg-white/20 text-white"
                              : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                          )}
                        >
                          <Volume2 className={cn("w-3 h-3", isPlaying && "animate-pulse")} />
                          {isPlaying ? 'Playing...' : 'Hear voice'}
                        </button>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center h-full"
              >
                {/* Selected Personality Card */}
                <div className="w-full max-w-sm">
                  <div
                    className={cn(
                      "p-6 rounded-3xl border border-white/10 bg-white/[0.02]",
                      "text-center"
                    )}
                  >
                    {/* Large Icon */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className={cn(
                        "w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                        `bg-gradient-to-br ${selectedPersonality.gradient}`
                      )}
                    >
                      {React.createElement(ICON_MAP[selectedPersonality.icon] || Sparkles, {
                        className: "w-10 h-10 text-white"
                      })}
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl font-bold text-white mb-2"
                    >
                      {selectedPersonality.displayName}
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-white/50 mb-4"
                    >
                      {selectedPersonality.description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-3 rounded-xl bg-white/5 mb-4"
                    >
                      <p className="text-sm text-white/70 italic">
                        "{selectedPersonality.greeting}"
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <button
                        onClick={() => playVoiceSample(selectedPersonality)}
                        className={cn(
                          "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all",
                          isVoicePlaying === selectedPersonality.name
                            ? "bg-white/20 text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        )}
                      >
                        <Volume2 className={cn("w-4 h-4", isVoicePlaying === selectedPersonality.name && "animate-pulse")} />
                        {isVoicePlaying === selectedPersonality.name ? 'Playing...' : 'Preview voice'}
                      </button>
                    </motion.div>
                  </div>

                  {/* Info Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 grid grid-cols-2 gap-2"
                  >
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-white/40 mb-1">Voice Pitch</p>
                      <p className="text-sm text-white font-medium">
                        {selectedPersonality.voicePitch < 1 ? 'Lower' : selectedPersonality.voicePitch > 1 ? 'Higher' : 'Neutral'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-white/40 mb-1">Speaking Speed</p>
                      <p className="text-sm text-white font-medium">
                        {selectedPersonality.voiceRate < 1 ? 'Slower' : selectedPersonality.voiceRate > 1 ? 'Faster' : 'Normal'}
                      </p>
                    </div>
                  </motion.div>

                  <p className="text-center text-xs text-white/30 mt-4">
                    You can change this later in Settings
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-white/10">
          {step === 'select' ? (
            <Button
              onClick={handleContinue}
              className="w-full bg-white text-black hover:bg-white/90 h-12 rounded-xl font-medium"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-white/20 text-white hover:bg-white/10 h-12 rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-white text-black hover:bg-white/90 h-12 rounded-xl font-medium"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NameSelectionScreen;

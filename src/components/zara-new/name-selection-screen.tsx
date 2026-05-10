'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Brain,
  Palette,
  Target,
  Moon,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AI_PERSONALITIES, AIName } from '@/types/assistant';

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
  const [selectedName, setSelectedName] = React.useState<AIName>('Zara');

  const handleSelect = (name: AIName) => {
    setSelectedName(name);
  };

  const handleConfirm = () => {
    onComplete(selectedName);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl font-semibold text-white mb-2">Choose your assistant</h1>
        <p className="text-white/40 text-sm">Select a name for your AI companion</p>
      </motion.div>

      {/* Name Options */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm space-y-2"
      >
        {AI_PERSONALITIES.map((personality, index) => {
          const Icon = ICON_MAP[personality.icon] || Sparkles;
          const isSelected = selectedName === personality.name;

          return (
            <motion.button
              key={personality.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              onClick={() => handleSelect(personality.name)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                isSelected
                  ? "bg-white/10 border-white/30"
                  : "bg-transparent border-white/10 hover:border-white/20"
              )}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: personality.color === '#ffffff' ? '#ffffff' : personality.color }}
              >
                <Icon className={cn("w-5 h-5", personality.color === '#ffffff' ? "text-black" : "text-white")} />
              </div>

              {/* Name & Description */}
              <div className="flex-1 text-left">
                <p className="text-white font-medium">{personality.displayName}</p>
                <p className="text-white/40 text-sm">{personality.description}</p>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-white flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-black" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Confirm Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleConfirm}
        className="mt-8 w-full max-w-sm py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
      >
        Continue
      </motion.button>
    </div>
  );
}

export default NameSelectionScreen;

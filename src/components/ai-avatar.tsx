'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AIAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isProcessing?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AIAvatar({
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  size = 'md',
  className,
}: AIAvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const innerSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size], className)}>
      {/* Outer ring - animated based on state */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full',
          isListening
            ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500'
            : isSpeaking
            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500'
            : isProcessing
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500'
            : 'bg-gradient-to-r from-primary/50 via-primary to-primary/50'
        )}
        animate={{
          rotate: isListening || isSpeaking || isProcessing ? 360 : 0,
          scale: isListening ? [1, 1.05, 1] : 1,
        }}
        transition={{
          rotate: {
            duration: isSpeaking ? 2 : 3,
            repeat: isListening || isSpeaking || isProcessing ? Infinity : 0,
            ease: 'linear',
          },
          scale: {
            duration: 1,
            repeat: isListening ? Infinity : 0,
            ease: 'easeInOut',
          },
        }}
      />

      {/* Middle ring - pulse effect */}
      {(isListening || isSpeaking || isProcessing) && (
        <motion.div
          className={cn(
            'absolute rounded-full',
            isListening
              ? 'bg-blue-500/30'
              : isSpeaking
              ? 'bg-purple-500/30'
              : 'bg-amber-500/30'
          )}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ inset: '-8px' }}
        />
      )}

      {/* Inner circle with AI icon */}
      <div
        className={cn(
          'relative z-10 rounded-full bg-background flex items-center justify-center',
          innerSizeClasses[size]
        )}
      >
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={cn(
            'text-foreground',
            size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-16 h-16'
          )}
          animate={{
            scale: isSpeaking ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isSpeaking ? Infinity : 0,
          }}
        >
          {/* AI Brain Icon */}
          <motion.path
            d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{
              stroke: isListening ? '#3b82f6' : isSpeaking ? '#8b5cf6' : 'currentColor',
            }}
          />
          <motion.path
            d="M12 9v4l2 2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.circle
            cx="12"
            cy="14"
            r="6"
            strokeDasharray="4 2"
            animate={{
              rotate: isProcessing ? 360 : 0,
              stroke: isProcessing ? '#f59e0b' : 'currentColor',
            }}
            transition={{
              rotate: { duration: 2, repeat: isProcessing ? Infinity : 0, ease: 'linear' },
            }}
          />
          <motion.path
            d="M8 14h8M12 10v8"
            strokeLinecap="round"
            opacity={isListening ? 1 : 0.5}
            animate={{
              opacity: isListening ? [0.5, 1, 0.5] : 0.5,
            }}
            transition={{
              duration: 1,
              repeat: isListening ? Infinity : 0,
            }}
          />
        </motion.svg>
      </div>

      {/* Sound waves when speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="absolute w-full h-full rounded-full border-2 border-purple-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.div
            className="absolute w-full h-full rounded-full border-2 border-purple-400"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.2,
            }}
          />
        </div>
      )}
    </div>
  );
}

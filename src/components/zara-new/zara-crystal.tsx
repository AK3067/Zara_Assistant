'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ZaraCrystalProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'idle' | 'listening' | 'processing' | 'speaking';
  color?: string;
  showGlow?: boolean;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  sm: { crystal: 40, glow: 80 },
  md: { crystal: 60, glow: 120 },
  lg: { crystal: 80, glow: 160 },
  xl: { crystal: 120, glow: 240 },
};

export function ZaraCrystal({
  size = 'md',
  state = 'idle',
  color = '#ffffff',
  showGlow = true,
  className,
  onClick,
}: ZaraCrystalProps) {
  const dimensions = SIZE_MAP[size];
  const controls = useAnimation();
  const glowOpacity = useMotionValue(0.3);
  const crystalScale = useMotionValue(1);
  
  // Pulse animation based on state
  useEffect(() => {
    switch (state) {
      case 'idle':
        controls.start({
          scale: [1, 1.02, 1],
          opacity: [0.9, 1, 0.9],
        }, {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        });
        glowOpacity.set(0.3);
        crystalScale.set(1);
        break;
      case 'listening':
        controls.start({
          scale: [1, 1.08, 1],
          opacity: [0.9, 1, 0.9],
        }, {
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        });
        glowOpacity.set(0.6);
        crystalScale.set(1.05);
        break;
      case 'processing':
        controls.start({
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }, {
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        });
        glowOpacity.set(0.8);
        crystalScale.set(1.1);
        break;
      case 'speaking':
        controls.start({
          scale: [1, 1.03, 1.06, 1.03, 1],
        }, {
          duration: 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        });
        glowOpacity.set(0.7);
        crystalScale.set(1.08);
        break;
    }
  }, [state, controls, glowOpacity, crystalScale]);

  // Inner particles for depth
  const particles = Array.from({ length: 6 }, (_, i) => i);

  return (
    <motion.div
      className={cn(
        'relative flex items-center justify-center cursor-pointer',
        className
      )}
      style={{ width: dimensions.glow, height: dimensions.glow }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Outer Glow */}
      {showGlow && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: dimensions.glow,
            height: dimensions.glow,
            background: `radial-gradient(circle, ${color}40 0%, ${color}10 40%, transparent 70%)`,
            opacity: glowOpacity,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Crystal Container */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={controls}
        style={{ width: dimensions.crystal, height: dimensions.crystal }}
      >
        {/* Hexagonal Crystal Shape */}
        <svg
          viewBox="0 0 100 100"
          className="absolute"
          style={{ width: dimensions.crystal, height: dimensions.crystal }}
        >
          <defs>
            {/* Crystal gradient */}
            <linearGradient id="crystalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="50%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0.3" />
            </linearGradient>
            
            {/* Inner shimmer gradient */}
            <linearGradient id="shimmerGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="crystalGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Main Hexagon Crystal */}
          <motion.polygon
            points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
            fill="url(#crystalGradient)"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.8"
            filter="url(#crystalGlow)"
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Inner Facet Lines */}
          <motion.line
            x1="50" y1="5" x2="50" y2="50"
            stroke="white"
            strokeOpacity="0.2"
            strokeWidth="0.5"
            animate={{ strokeOpacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.line
            x1="10" y1="27.5" x2="50" y2="50"
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="0.5"
            animate={{ strokeOpacity: [0.05, 0.25, 0.05] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
          />
          <motion.line
            x1="90" y1="27.5" x2="50" y2="50"
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="0.5"
            animate={{ strokeOpacity: [0.05, 0.25, 0.05] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: 0.6 }}
          />

          {/* Shimmer overlay */}
          <motion.polygon
            points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
            fill="url(#shimmerGradient)"
            animate={{
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>

        {/* Inner Core Glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: dimensions.crystal * 0.35,
            height: dimensions.crystal * 0.35,
            background: `radial-gradient(circle, ${color} 0%, ${color}80 50%, transparent 100%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Floating Particles */}
        {particles.map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              backgroundColor: color,
              top: '50%',
              left: '50%',
            }}
            animate={{
              x: [
                Math.cos((i * Math.PI * 2) / 6) * 10,
                Math.cos((i * Math.PI * 2) / 6) * 20,
                Math.cos((i * Math.PI * 2) / 6) * 10,
              ],
              y: [
                Math.sin((i * Math.PI * 2) / 6) * 10,
                Math.sin((i * Math.PI * 2) / 6) * 20,
                Math.sin((i * Math.PI * 2) / 6) * 10,
              ],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}

        {/* State-specific effects */}
        {state === 'listening' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: color }}
            animate={{
              scale: [1, 1.5, 2],
              opacity: [0.5, 0.2, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}

        {state === 'processing' && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{
                  borderColor: color,
                  width: dimensions.crystal * (0.6 + i * 0.2),
                  height: dimensions.crystal * (0.6 + i * 0.2),
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [0.8, 1.2],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.33,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}

        {state === 'speaking' && (
          <motion.div
            className="absolute"
            style={{
              width: dimensions.crystal * 0.8,
              height: dimensions.crystal * 0.8,
            }}
          >
            {/* Sound waves */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: `${color}60` }}
                animate={{
                  scale: [0.5, 1.5],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Compact version for floating overlay
export function ZaraCrystalFloating({
  state = 'idle',
  color = '#ffffff',
  onPress,
}: {
  state?: 'idle' | 'listening' | 'processing' | 'speaking';
  color?: string;
  onPress?: () => void;
}) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 -m-8 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <ZaraCrystal
        size="lg"
        state={state}
        color={color}
        onClick={onPress}
      />
      
      {/* Tap hint */}
      <motion.p
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs whitespace-nowrap"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Tap to talk
      </motion.p>
    </motion.div>
  );
}

export default ZaraCrystal;

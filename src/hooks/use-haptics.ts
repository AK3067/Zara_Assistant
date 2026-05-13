'use client';

/**
 * Haptic Feedback Hook for Mobile Devices
 * Provides tactile feedback for touch interactions on supported devices
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface HapticFeedback {
  isSupported: boolean;
  trigger: (style?: HapticStyle) => void;
  impact: (style?: 'light' | 'medium' | 'heavy') => void;
  notification: (type?: 'success' | 'warning' | 'error') => void;
  selection: () => void;
}

// Extend Navigator for Haptic API
declare global {
  interface Navigator {
    vibrate?: (pattern: number | number[]) => boolean;
  }
}

export function useHaptics(): HapticFeedback {
  // Check if vibration API is supported
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  /**
   * Trigger haptic feedback with a specific style
   */
  const trigger = (style: HapticStyle = 'medium') => {
    if (!isSupported) return;

    switch (style) {
      case 'light':
        navigator.vibrate?.(10);
        break;
      case 'medium':
        navigator.vibrate?.(20);
        break;
      case 'heavy':
        navigator.vibrate?.(40);
        break;
      case 'success':
        navigator.vibrate?.([20, 30, 40]);
        break;
      case 'warning':
        navigator.vibrate?.([30, 20, 30, 20, 30]);
        break;
      case 'error':
        navigator.vibrate?.([50, 20, 50, 20, 50]);
        break;
    }
  };

  /**
   * Impact feedback - for UI element interactions
   */
  const impact = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    trigger(style);
  };

  /**
   * Notification feedback - for success/warning/error states
   */
  const notification = (type: 'success' | 'warning' | 'error' = 'success') => {
    trigger(type);
  };

  /**
   * Selection feedback - for picker/selector changes
   */
  const selection = () => {
    if (isSupported) {
      navigator.vibrate?.(5);
    }
  };

  return {
    isSupported,
    trigger,
    impact,
    notification,
    selection,
  };
}

// Utility function for one-off haptic calls
export const haptics = {
  light: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(10);
    }
  },
  medium: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(20);
    }
  },
  heavy: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(40);
    }
  },
  success: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([20, 30, 40]);
    }
  },
  error: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([50, 20, 50, 20, 50]);
    }
  },
};

export default useHaptics;

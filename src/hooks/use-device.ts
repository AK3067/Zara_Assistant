'use client';

import { useState, useEffect, useCallback } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'tv' | 'desktop';
export type InputMode = 'touch' | 'dpad' | 'mouse';

interface DeviceInfo {
  type: DeviceType;
  inputMode: InputMode;
  isTouch: boolean;
  isTV: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
  hasFocusNavigation: boolean; // TV/keyboard navigation
}

/**
 * Hook to detect device type and capabilities
 * Provides unified device detection for responsive UI
 */
export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    inputMode: 'mouse',
    isTouch: false,
    isTV: false,
    isDesktop: true,
    isMobile: false,
    isLandscape: true,
    screenWidth: 1920,
    screenHeight: 1080,
    hasFocusNavigation: false,
  });

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;

      // Detect touch capability
      const isTouchDevice = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - legacy property
        navigator.msMaxTouchPoints > 0
      );

      // Detect TV mode - usually large screens with specific user agents or display patterns
      const isTVMode = (
        // Check for TV user agent
        /tv|smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast/i.test(navigator.userAgent) ||
        // Check for very large screens (typically TVs) in landscape
        (width >= 1920 && height >= 1080 && !isTouchDevice) ||
        // Check for Android TV specifically
        /android.*\b(mobile)\b/i.test(navigator.userAgent) === false && 
        /android/i.test(navigator.userAgent) && width >= 1280
      );

      // Detect device type
      let type: DeviceType;
      let inputMode: InputMode;
      let hasFocusNavigation: boolean;

      if (isTVMode) {
        type = 'tv';
        inputMode = 'dpad';
        hasFocusNavigation = true;
      } else if (width < 768) {
        type = 'mobile';
        inputMode = isTouchDevice ? 'touch' : 'mouse';
        hasFocusNavigation = false;
      } else if (width < 1024) {
        type = 'tablet';
        inputMode = isTouchDevice ? 'touch' : 'mouse';
        hasFocusNavigation = false;
      } else {
        type = 'desktop';
        inputMode = 'mouse';
        hasFocusNavigation = true; // Keyboard navigation on desktop
      }

      setDeviceInfo({
        type,
        inputMode,
        isTouch: isTouchDevice,
        isTV: isTVMode,
        isDesktop: type === 'desktop',
        isMobile: type === 'mobile',
        isLandscape,
        screenWidth: width,
        screenHeight: height,
        hasFocusNavigation,
      });
    };

    detectDevice();

    // Listen for resize and orientation changes
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return deviceInfo;
}

/**
 * Hook for focus navigation (TV/Keyboard)
 * Handles D-pad style navigation with focus management
 */
export function useFocusNavigation(
  containerRef: React.RefObject<HTMLElement | null>,
  itemSelector: string = '[data-focusable]'
) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [focusableItems, setFocusableItems] = useState<HTMLElement[]>([]);

  // Update focusable items
  useEffect(() => {
    if (!containerRef.current) return;
    
    const items = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(itemSelector)
    );
    setFocusableItems(items);
  }, [containerRef, itemSelector]);

  // Handle keyboard/DPAD navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const items = focusableItems;
      if (items.length === 0) return;

      const currentIndex = focusedIndex;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          items[currentIndex]?.click();
          break;
        case 'Backspace':
        case 'Escape':
          e.preventDefault();
          // Handle back action
          window.dispatchEvent(new CustomEvent('focusnav:back'));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, focusableItems]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusableItems[focusedIndex]) {
      focusableItems[focusedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
      focusableItems[focusedIndex].focus();
    }
  }, [focusedIndex, focusableItems]);

  return {
    focusedIndex,
    setFocusedIndex,
    focusableItems,
  };
}

/**
 * Hook for responsive font sizes
 * Scales text based on device type
 */
export function useResponsiveSize() {
  const { type, isTV } = useDevice();

  const getFontSize = useCallback((baseSize: number): number => {
    if (isTV) {
      // Scale up for TV (10-foot interface)
      return Math.round(baseSize * 1.8);
    }
    return baseSize;
  }, [isTV]);

  const getSpacing = useCallback((baseSpacing: number): number => {
    if (isTV) {
      return Math.round(baseSpacing * 1.5);
    }
    return baseSpacing;
  }, [isTV]);

  const getIconSize = useCallback((baseSize: number): number => {
    if (isTV) {
      return Math.round(baseSize * 1.6);
    }
    return baseSize;
  }, [isTV]);

  return {
    getFontSize,
    getSpacing,
    getIconSize,
    scale: isTV ? 1.8 : 1,
  };
}

export default useDevice;

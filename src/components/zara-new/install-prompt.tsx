'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/use-pwa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { isInstalled } = usePWA();

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = ('standalone' in window.navigator) && 
      (window.navigator as unknown as { standalone: boolean }).standalone;
    setIsStandalone(standalone || isInWebAppiOS);

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
      !(window as unknown as { MSStream: boolean }).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay (don't spam immediately)
      setTimeout(() => {
        const dismissed = localStorage.getItem('zara-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 10000); // 10 seconds delay
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt after delay if not installed
    if (isIOSDevice && !standalone && !isInWebAppiOS) {
      setTimeout(() => {
        const dismissed = localStorage.getItem('zara-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 15000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('zara-install-dismissed', 'true');
  };

  // Don't show if already installed
  if (isInstalled || isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50"
        >
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-black" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm">Install Zara AI</h3>
                <p className="text-xs text-white/60 mt-1">
                  Add to your home screen for the best experience with voice commands and offline access.
                </p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            {/* Install Instructions or Button */}
            <div className="mt-4">
              {isIOS ? (
                <div className="space-y-2">
                  <p className="text-xs text-white/50">How to install:</p>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span>1. Tap</span>
                    <Share className="w-4 h-4 text-white" />
                    <span>Share button</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span>2. Tap</span>
                    <Plus className="w-4 h-4 text-white" />
                    <span>"Add to Home Screen"</span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    className="flex-1 bg-white text-black hover:bg-white/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDismiss}
                    className="text-white/60 hover:text-white"
                  >
                    Not now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InstallPrompt;

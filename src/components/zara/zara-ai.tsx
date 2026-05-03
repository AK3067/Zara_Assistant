'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Settings,
  Home,
  Mic,
  Camera,
  Search,
  Brain,
  Calendar,
  Database,
  FileText,
  LayoutTemplate,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Import all Zara components
import { MobileZara } from './mobile-zara';
import { AmbientOverlay, AmbientSettings, defaultAmbientConfig } from './ambient-mode';
import { FABGroup, QuickActionsSettings, defaultQuickActions, defaultSwipeActions } from './quick-actions';
import { LocalAIPanel } from '@/components/local-ai-panel';

// Import types
import type { AmbientConfig, QuickAction, SwipeAction } from '@/types/zara-advanced';

// ===== ZARA AI MAIN INTERFACE =====

type ZaraMode = 'assistant' | 'local_ai' | 'settings';

interface ZaraAIProps {
  onWakeWord?: () => void;
}

export function ZaraAI({ onWakeWord }: ZaraAIProps) {
  // Core state
  const [mode, setMode] = useState<ZaraMode>('assistant');
  const [isAmbient, setIsAmbient] = useState(false);
  const [showFAB, setShowFAB] = useState(true);
  const [isFABExpanded, setIsFABExpanded] = useState(false);

  // Ambient config
  const [ambientConfig, setAmbientConfig] = useState<AmbientConfig>(defaultAmbientConfig);

  // Quick actions
  const [quickActions, setQuickActions] = useState<QuickAction[]>(defaultQuickActions);
  const [swipeActions] = useState<SwipeAction[]>(defaultSwipeActions);

  // Theme
  const [isDark, setIsDark] = useState(true);

  // Handle ambient activation
  const handleActivateAmbient = useCallback(() => {
    setIsAmbient(true);
    setMode('assistant');
  }, []);

  const handleDeactivateAmbient = useCallback(() => {
    setIsAmbient(false);
  }, []);

  // Handle quick action
  const handleQuickAction = useCallback((action: QuickAction) => {
    console.log('Quick action:', action);
    // Handle different actions
    switch (action.action) {
      case 'start_voice':
        // Trigger voice input
        break;
      case 'open_camera':
        // Open camera
        break;
      case 'open_search':
        // Open search
        break;
      case 'quick_note':
        // Quick note
        break;
    }
  }, []);

  // Update ambient config
  const handleUpdateAmbientConfig = useCallback((updates: Partial<AmbientConfig>) => {
    setAmbientConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className={cn(
      "h-screen flex flex-col overflow-hidden",
      isDark ? "dark" : ""
    )}>
      {/* Ambient Mode Overlay */}
      <AmbientOverlay
        isActive={isAmbient}
        config={ambientConfig}
        onDeactivate={handleDeactivateAmbient}
        onWakeWord={onWakeWord || (() => {})}
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!isAmbient && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Mode Selector */}
            <div className="flex items-center justify-between p-2 border-b bg-card/50 backdrop-blur-lg">
              <div className="flex items-center gap-1">
                <Button
                  variant={mode === 'assistant' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('assistant')}
                  className="gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Assistant</span>
                </Button>
                <Button
                  variant={mode === 'local_ai' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('local_ai')}
                  className="gap-1"
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Local AI</span>
                </Button>
                <Button
                  variant={mode === 'settings' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('settings')}
                  className="gap-1"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDark(!isDark)}
                >
                  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleActivateAmbient}
                >
                  <Moon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {mode === 'assistant' && (
                  <motion.div
                    key="assistant"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full"
                  >
                    <MobileZara onToggleMode={() => setMode('settings')} />
                  </motion.div>
                )}

                {mode === 'local_ai' && (
                  <motion.div
                    key="local_ai"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full"
                  >
                    <LocalAIPanel />
                  </motion.div>
                )}

                {mode === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full overflow-y-auto"
                  >
                    <div className="max-w-2xl mx-auto p-4 space-y-6">
                      <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold mb-2">Zara AI Settings</h1>
                        <p className="text-muted-foreground">
                          Customize your AI assistant experience
                        </p>
                      </div>

                      {/* Ambient Mode Settings */}
                      <AmbientSettings
                        config={ambientConfig}
                        onUpdateConfig={handleUpdateAmbientConfig}
                      />

                      {/* Quick Actions Settings */}
                      <QuickActionsSettings
                        actions={quickActions}
                        swipeActions={swipeActions}
                        onUpdateActions={setQuickActions}
                        onUpdateSwipeActions={() => {}}
                      />

                      {/* Info Card */}
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium mb-1">About Zara AI</p>
                              <p className="text-sm text-muted-foreground">
                                Zara is your personal AI assistant with advanced features including 
                                proactive suggestions, emotional intelligence, deep memory, 
                                and offline capabilities. Designed to surpass traditional assistants.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      {showFAB && !isAmbient && mode === 'assistant' && (
        <FABGroup
          actions={quickActions}
          onAction={handleQuickAction}
          isExpanded={isFABExpanded}
          onToggle={() => setIsFABExpanded(prev => !prev)}
        />
      )}
    </div>
  );
}

export default ZaraAI;

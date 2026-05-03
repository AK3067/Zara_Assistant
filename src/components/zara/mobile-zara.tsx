'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Camera,
  Image,
  Send,
  X,
  Sparkles,
  Brain,
  Sun,
  Moon,
  Battery,
  Wifi,
  WifiOff,
  Settings,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Home,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
  Eye,
  Bell,
  BellOff,
  Heart,
  Star,
  Grid,
  MapPin,
  Cloud,
  Gauge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { zaraEngine } from '@/lib/zara-engine';
import type {
  ZaraResponse,
  AssistantContext,
  ProactiveInsight,
  ContextCard,
  EmotionalState,
} from '@/types/zara-advanced';

// ===== VOICE WAVEFORM =====

function VoiceWaveform({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary rounded-full"
          animate={isActive ? {
            height: [8, 24, 8],
          } : { height: 8 }}
          transition={{
            duration: 0.5,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// ===== EMOTION INDICATOR =====

interface EmotionIndicatorProps {
  emotion: EmotionalState;
}

function EmotionIndicator({ emotion }: EmotionIndicatorProps) {
  const emotionColors: Record<string, string> = {
    happy: 'bg-yellow-500',
    sad: 'bg-blue-500',
    angry: 'bg-red-500',
    anxious: 'bg-purple-500',
    excited: 'bg-green-500',
    tired: 'bg-gray-500',
    confused: 'bg-orange-500',
    grateful: 'bg-pink-500',
    neutral: 'bg-slate-500',
  };

  const emotionEmojis: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    excited: '🤩',
    tired: '😴',
    confused: '🤔',
    grateful: '🙏',
    neutral: '😐',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "w-3 h-3 rounded-full",
        emotionColors[emotion.primary] || emotionColors.neutral
      )} />
      <span className="text-lg">{emotionEmojis[emotion.primary] || '😐'}</span>
      <span className="text-xs text-muted-foreground capitalize hidden sm:inline">{emotion.primary}</span>
      <Badge variant="outline" className="text-xs hidden sm:inline">
        {Math.round(emotion.intensity * 100)}%
      </Badge>
    </div>
  );
}

// ===== CONTEXT CARD WIDGET =====

interface ContextCardWidgetProps {
  card: ContextCard;
  onAction?: (action: string, params: Record<string, unknown>) => void;
  compact?: boolean;
}

function ContextCardWidget({ card, onAction, compact = false }: ContextCardWidgetProps) {
  const typeIcons: Record<string, React.ReactNode> = {
    weather: <Cloud className="w-5 h-5" />,
    calendar: <Calendar className="w-5 h-5" />,
    tasks: <CheckCircle2 className="w-5 h-5" />,
    news: <Info className="w-5 h-5" />,
    traffic: <MapPin className="w-5 h-5" />,
    health: <Heart className="w-5 h-5" />,
    finance: <Gauge className="w-5 h-5" />,
    smart_home: <Home className="w-5 h-5" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card rounded-xl shadow-sm border overflow-hidden",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {typeIcons[card.type]}
          </div>
          <div>
            <h3 className="font-medium text-sm">{card.title}</h3>
            {card.subtitle && (
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xl font-bold">{card.content.primary}</span>
          {card.content.icon && (
            <span className="text-3xl">{card.content.icon}</span>
          )}
        </div>
        {card.content.secondary && (
          <p className="text-sm text-muted-foreground">{card.content.secondary}</p>
        )}
        {card.content.tertiary && (
          <p className="text-xs text-muted-foreground mt-1">{card.content.tertiary}</p>
        )}

        {card.content.progress !== undefined && (
          <Progress value={card.content.progress * 100} className="mt-3 h-2" />
        )}

        {card.content.items && card.content.items.length > 0 && (
          <div className="mt-3 space-y-2">
            {card.content.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {item.icon && <span>{item.icon}</span>}
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {card.actions.length > 0 && !compact && (
        <div className="mt-4 flex gap-2">
          {card.actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onAction?.(action.action, action.params)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ===== INSIGHT BANNER =====

interface InsightBannerProps {
  insight: ProactiveInsight;
  onDismiss: () => void;
  onAction: () => void;
}

function InsightBanner({ insight, onDismiss, onAction }: InsightBannerProps) {
  const typeStyles = {
    reminder: 'bg-blue-500/10 border-blue-500/30',
    suggestion: 'bg-purple-500/10 border-purple-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
    opportunity: 'bg-green-500/10 border-green-500/30',
    information: 'bg-cyan-500/10 border-cyan-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "p-3 rounded-lg border",
        typeStyles[insight.type]
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-4 h-4 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{insight.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
          
          {insight.action && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={onAction}
            >
              {insight.action.label}
            </Button>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ===== MAIN MOBILE ASSISTANT =====

interface MobileZaraProps {
  onToggleMode?: () => void;
}

export function MobileZara({ onToggleMode }: MobileZaraProps) {
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; emotion?: EmotionalState }>>([]);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionalState>({
    primary: 'neutral',
    intensity: 0.5,
    confidence: 0.8,
    triggers: [],
    timestamp: Date.now(),
  });
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [contextCards, setContextCards] = useState<ContextCard[]>([]);
  const [isVisualMode, setIsVisualMode] = useState(false);
  const [isAmbient, setIsAmbient] = useState(false);
  const [showCards, setShowCards] = useState(true);

  // Context
  const [context] = useState<AssistantContext>({
    time: new Date().toISOString(),
    device: 'mobile',
    orientation: 'portrait',
    connectivity: 'online',
    batteryLevel: 80,
    isCharging: false,
    isMoving: false,
    nearbyDevices: [],
    activeApps: [],
    recentInteractions: [],
  });

  // Generate proactive insights
  useEffect(() => {
    const newInsights = zaraEngine.getInsights(context);
    if (newInsights.length > 0) {
      setInsights(prev => [...newInsights.filter(ni => !prev.some(p => p.id === ni.id)), ...prev].slice(0, 5));
    }
  }, [context]);

  // Generate context cards
  useEffect(() => {
    const cards = zaraEngine.getCards(context);
    setContextCards(cards);
  }, [context]);

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      const response = await zaraEngine.process(userMessage, context);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content,
        emotion: {
          primary: response.emotion,
          intensity: 0.6,
          confidence: response.confidence,
          triggers: [],
          timestamp: response.timestamp,
        },
      }]);

      const emotion = zaraEngine.getEmotionalEngine().analyzeText(userMessage);
      setCurrentEmotion(emotion);
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, context]);

  // Handle voice input
  const handleVoiceStart = useCallback(() => {
    setIsListening(true);
  }, []);

  const handleVoiceEnd = useCallback(() => {
    setIsListening(false);
    setInput("What's my schedule today?");
  }, []);

  // Handle camera/visual mode
  const handleVisualMode = useCallback(() => {
    setIsVisualMode(prev => !prev);
  }, []);

  // Handle insight dismiss
  const handleDismissInsight = useCallback((id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
    zaraEngine.getProactiveEngine().dismiss(id);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-3 sm:p-4 border-b bg-card/50 backdrop-blur-lg sticky top-0 z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: isListening ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="font-semibold text-base sm:text-lg">Zara AI</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {context.connectivity === 'online' ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span>{isAmbient ? 'Ambient' : 'Active'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <EmotionIndicator emotion={currentEmotion} />
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsAmbient(prev => !prev)}>
            {isAmbient ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggleMode}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </motion.header>

      {/* Proactive Insights */}
      <AnimatePresence>
        {insights.length > 0 && isExpanded && (
          <div className="p-3 space-y-2 border-b bg-muted/30">
            {insights.slice(0, 2).map(insight => (
              <InsightBanner
                key={insight.id}
                insight={insight}
                onDismiss={() => handleDismissInsight(insight.id)}
                onAction={() => {}}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Context Cards */}
      <AnimatePresence>
        {showCards && contextCards.length > 0 && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 overflow-x-auto"
          >
            <div className="flex gap-3 pb-2">
              {contextCards.slice(0, 3).map(card => (
                <div key={card.id} className="min-w-[260px] sm:min-w-[280px] flex-shrink-0">
                  <ContextCardWidget card={card} compact />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-primary/50 mb-4" />
            </motion.div>
            <h2 className="text-base sm:text-lg font-medium mb-2">Hey, I&apos;m Zara</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Your personal AI assistant. Ask me anything.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => setInput("What's on my schedule?")}>
                📅 Schedule
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput('Set a reminder')}>
                ⏰ Reminder
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput('Remember this: ')}>
                💾 Note
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.emotion && message.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <EmotionIndicator emotion={message.emotion} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <VoiceWaveform isActive />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Visual Mode Overlay */}
      <AnimatePresence>
        {isVisualMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 z-50 flex flex-col"
          >
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white">
                <Eye className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-base sm:text-lg font-medium">Visual AI Mode</p>
                <p className="text-xs sm:text-sm opacity-70">Point your camera at something</p>
              </div>
            </div>
            <div className="p-4 flex justify-center gap-3 sm:gap-4">
              <Button variant="outline" size="sm" className="rounded-full">
                <Image className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Gallery
              </Button>
              <Button size="sm" className="rounded-full" onClick={handleVisualMode}>
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Capture
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" onClick={handleVisualMode}>
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t bg-card/50 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVisualMode}
            className="flex-shrink-0"
          >
            <Camera className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? 'Listening...' : 'Ask Zara...'}
              disabled={isListening || isProcessing}
              className="pr-10 rounded-full h-10 sm:h-11"
            />
            {input && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleSend}
                disabled={isProcessing}
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Button
            variant={isListening ? 'default' : 'ghost'}
            size="icon"
            className={cn("flex-shrink-0", isListening && "animate-pulse")}
            onMouseDown={handleVoiceStart}
            onMouseUp={handleVoiceEnd}
            onMouseLeave={handleVoiceEnd}
            onTouchStart={handleVoiceStart}
            onTouchEnd={handleVoiceEnd}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCards(prev => !prev)}
          >
            <Grid className="w-4 h-4 mr-1" />
            Cards
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(prev => !prev)}
          >
            <Zap className="w-4 h-4 mr-1" />
            Insights
          </Button>
          <Button variant="ghost" size="sm">
            <Brain className="w-4 h-4 mr-1" />
            Memory
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MobileZara;

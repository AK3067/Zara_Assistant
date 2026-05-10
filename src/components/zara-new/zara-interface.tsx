'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Send,
  Sparkles,
  Settings,
  Home,
  Camera,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Bot,
  User,
  Cpu,
  Cloud,
  Wifi,
  WifiOff,
  Zap,
  Clock,
  Heart,
  Star,
  X,
  Brain,
  Palette,
  Target,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAssistantStore, getPersonality } from '@/store/assistant-store';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { usePWA } from '@/hooks/use-pwa';
import type { MemoryCategory } from '@/types/assistant';

// Icon mapping for AI personalities
const ICON_MAP: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  brain: Brain,
  palette: Palette,
  target: Target,
  moon: Moon,
};

// ===== MESSAGE TYPE =====
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ===== VOICE WAVEFORM =====
function VoiceWaveform({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-6">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-white"
          animate={isActive ? { height: [4, 16, 4] } : { height: 4 }}
          transition={{ duration: 0.4, repeat: isActive ? Infinity : 0, delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

// ===== TYPING INDICATOR =====
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-white/40"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// ===== MAIN ZARA INTERFACE =====
interface ZaraInterfaceProps {
  onHome?: () => void;
  onSettings?: () => void;
}

export function ZaraInterface({ onHome, onSettings }: ZaraInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisualMode, setIsVisualMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { settings, addMemory } = useAssistantStore();
  const { isOnline } = usePWA();

  // Get current AI personality
  const personality = getPersonality(settings.aiName);
  const AIIcon = ICON_MAP[personality.icon] || Sparkles;

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: isVoiceSupported,
  } = useSpeechRecognition({
    onResult: (text) => setInput(text),
    language: settings.language,
    continuous: false,
  });

  const { speak, isSpeaking, stop: stopSpeaking } = useSpeechSynthesis({ onEnd: () => {} });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-detect and store memories from conversation
  const detectAndStoreMemory = useCallback((userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Patterns that indicate personal information worth remembering
    const memoryPatterns = [
      // Name patterns
      { pattern: /(?:my name is|i'm|i am|call me)\s+([a-z]+)/i, category: 'personal' as MemoryCategory, tag: 'name' },
      // Birthday patterns
      { pattern: /(?:my birthday is|i was born on|birthday is)\s+(.+)/i, category: 'dates' as MemoryCategory, tag: 'birthday' },
      // Preference patterns
      { pattern: /(?:i like|i love|i prefer|i enjoy)\s+(.+)/i, category: 'preferences' as MemoryCategory, tag: 'preference' },
      { pattern: /(?:i don't like|i hate|i dislike)\s+(.+)/i, category: 'preferences' as MemoryCategory, tag: 'dislike' },
      // Work patterns
      { pattern: /(?:i work at|i work for|my job is|i'm a|im a)\s+(.+)/i, category: 'work' as MemoryCategory, tag: 'work' },
      // Location patterns
      { pattern: /(?:i live in|i'm from|i am from|my home is in)\s+(.+)/i, category: 'locations' as MemoryCategory, tag: 'location' },
      // Contact patterns
      { pattern: /(?:my (?:phone|number|email) is)\s+(.+)/i, category: 'contacts' as MemoryCategory, tag: 'contact' },
      // Goal patterns
      { pattern: /(?:my goal is|i want to|i plan to|i hope to)\s+(.+)/i, category: 'goals' as MemoryCategory, tag: 'goal' },
      // Important dates
      { pattern: /(?:my anniversary is|our anniversary is|we got married on)\s+(.+)/i, category: 'dates' as MemoryCategory, tag: 'anniversary' },
      // Remember patterns (explicit)
      { pattern: /(?:remember that|remember i|note that|keep in mind that)\s+(.+)/i, category: 'facts' as MemoryCategory, tag: 'fact' },
    ];

    for (const { pattern, category, tag } of memoryPatterns) {
      const match = userMessage.match(pattern);
      if (match && match[1]) {
        const content = match[1].trim();
        // Only store if it's meaningful (more than 2 characters)
        if (content.length > 2) {
          addMemory({
            content,
            category,
            source: 'conversation',
            importance: 'medium',
            tags: [tag],
          });
          break; // Only store one memory per message
        }
      }
    }
  }, [addMemory]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Try to detect and store memories from user message
    detectAndStoreMemory(input.trim());

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: userMessage.content }] }),
      });
      const data = await response.json();

      if (data.success && data.message) {
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: Date.now(),
        }]);

        if (voiceEnabled && settings.enableVoiceResponse) {
          const textContent = data.message
            .replace(/```[\s\S]*?```/g, 'code block')
            .replace(/`[^`]+`/g, 'code')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
          await speak(textContent);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, voiceEnabled, settings.enableVoiceResponse, speak]);

  const quickActions = [
    { icon: Clock, label: 'Schedule', prompt: "What's on my schedule?" },
    { icon: Star, label: 'Remind', prompt: 'Set a reminder for...' },
    { icon: Heart, label: 'Note', prompt: 'Remember this: ' },
    { icon: Zap, label: 'Quick', prompt: 'Give me a quick tip' },
  ];

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-4 border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          {onHome && (
            <Button variant="ghost" size="icon" onClick={onHome} className="text-white/60 hover:text-white hover:bg-white/10">
              <Home className="w-5 h-5" />
            </Button>
          )}
          
          <motion.div
            animate={{ scale: isListening ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
            className="relative"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: personality.color === '#ffffff' ? '#ffffff' : personality.color }}
            >
              <AIIcon className={cn("w-5 h-5", personality.color === '#ffffff' ? "text-black" : "text-white")} />
            </div>
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-white"
                animate={{ opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
          
          <div>
            <h1 className="font-semibold text-white">{personality.displayName}</h1>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </>
              )}
              {isProcessing && <span className="text-white/60">- Thinking...</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={cn("text-white/60 hover:text-white hover:bg-white/10", !voiceEnabled && "text-white/30")}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisualMode(!isVisualMode)}
            className={cn("text-white/60 hover:text-white hover:bg-white/10", isVisualMode && "bg-white/10 text-white")}
          >
            <Camera className="w-5 h-5" />
          </Button>
          {onSettings && (
            <Button variant="ghost" size="icon" onClick={onSettings} className="text-white/60 hover:text-white hover:bg-white/10">
              <Settings className="w-5 h-5" />
            </Button>
          )}
        </div>
      </motion.header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: personality.color === '#ffffff' ? '#ffffff' : personality.color }}
              >
                <AIIcon className={cn("w-8 h-8", personality.color === '#ffffff' ? "text-black" : "text-white/80")} />
              </motion.div>
              <h2 className="text-xl font-medium text-white mb-2">Hello, I&apos;m {personality.displayName}</h2>
              <p className="text-sm text-white/40 mb-8 max-w-xs">
                {personality.description}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(action.prompt)}
                    className="border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <action.icon className="w-4 h-4 mr-1.5" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn("flex", message.role === 'user' ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.role === 'user'
                        ? "bg-white text-black"
                        : "bg-white/5 border border-white/10 text-white"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-3 h-3 text-white/60" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <p className="text-[10px] mt-1.5 opacity-40">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Visual Mode Overlay */}
      <AnimatePresence>
        {isVisualMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-50 flex flex-col"
          >
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">Visual AI</p>
                <p className="text-sm text-white/40">Point your camera at something</p>
              </div>
            </div>
            <div className="p-4 flex justify-center gap-3 border-t border-white/10">
              <Button variant="outline" className="rounded-full border-white/20 text-white bg-transparent">
                <ImageIcon className="w-5 h-5 mr-2" />
                Gallery
              </Button>
              <Button className="rounded-full bg-white text-black hover:bg-white/90" onClick={() => setIsVisualMode(false)}>
                <Camera className="w-5 h-5 mr-2" />
                Capture
              </Button>
              <Button variant="ghost" className="rounded-full text-white/60" onClick={() => setIsVisualMode(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        {isListening ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-6"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4"
            >
              <Mic className="w-7 h-7 text-black" />
            </motion.div>
            <VoiceWaveform isActive={isListening} />
            <p className="text-sm text-white/40 mt-3">{transcript || 'Listening...'}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={stopListening}
              className="mt-4 rounded-full border-white/20 text-white bg-transparent"
            >
              Stop
            </Button>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={startListening}
              disabled={!isVoiceSupported || isProcessing}
              className="text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
            >
              <Mic className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={`Ask ${personality.displayName}...`}
                disabled={isProcessing}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 pr-12"
              />
              {input.trim() && (
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isProcessing}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg bg-white hover:bg-white/90"
                >
                  <Send className="w-4 h-4 text-black" />
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge className="bg-white/5 text-white/40 border-white/10 text-[10px]">
            <Cpu className="w-3 h-3 mr-1" />
            Local
          </Badge>
          <Badge className="bg-white/5 text-white/40 border-white/10 text-[10px]">
            <Cloud className="w-3 h-3 mr-1" />
            Cloud
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default ZaraInterface;

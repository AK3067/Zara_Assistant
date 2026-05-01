'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AIAvatar } from './ai-avatar';
import { useQuickTaskDetection } from '@/hooks/use-quick-task-detection';
import { useAssistantStore } from '@/store/assistant-store';
import type { QuickTask } from '@/types/assistant';

interface VoiceInterfaceProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;
  isVoiceSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSendMessage: (content: string) => void;
}

export function VoiceInterface({
  isListening,
  isSpeaking,
  isProcessing,
  transcript,
  isVoiceSupported,
  onStartListening,
  onStopListening,
  onSendMessage,
}: VoiceInterfaceProps) {
  const { quickTasks } = useAssistantStore();
  const { matchQuickTask, executeQuickTask } = useQuickTaskDetection();
  const [detectedTask, setDetectedTask] = useState<{
    task: QuickTask;
    parameters: Record<string, string>;
  } | null>(null);
  const [showQuickTaskHint, setShowQuickTaskHint] = useState(false);

  // Check for quick task matches when transcript changes
  useEffect(() => {
    if (transcript && isListening) {
      const match = matchQuickTask(transcript);
      if (match && match.confidence > 0.7) {
        setDetectedTask({ task: match.task, parameters: match.parameters });
      } else {
        setDetectedTask(null);
      }
    }
  }, [transcript, isListening, matchQuickTask]);

  // Show quick task hints periodically
  useEffect(() => {
    if (quickTasks.length > 0 && !isListening && !isProcessing && !isSpeaking) {
      const interval = setInterval(() => {
        setShowQuickTaskHint(true);
        setTimeout(() => setShowQuickTaskHint(false), 3000);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [quickTasks.length, isListening, isProcessing, isSpeaking]);

  // Auto-send transcript when speech ends
  useEffect(() => {
    if (transcript && !isListening && !isProcessing && !isSpeaking) {
      const timer = setTimeout(() => {
        // Check if it's a quick task first
        const match = matchQuickTask(transcript);
        if (match && match.confidence > 0.7) {
          const prompt = executeQuickTask(match);
          onSendMessage(prompt);
        } else {
          onSendMessage(transcript);
        }
        setDetectedTask(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [transcript, isListening, isProcessing, isSpeaking, onSendMessage, matchQuickTask, executeQuickTask]);

  if (!isVoiceSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <MicOff className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Voice Not Supported</h3>
        <p className="text-muted-foreground max-w-md">
          Your browser doesn't support voice features. Please try using a modern browser like
          Chrome, Edge, or Safari for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      {/* AI Avatar */}
      <div className="mb-8 relative">
        <AIAvatar
          isListening={isListening}
          isSpeaking={isSpeaking}
          isProcessing={isProcessing}
          size="xl"
        />
        
        {/* Quick Task Detection Indicator */}
        <AnimatePresence>
          {detectedTask && isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2"
            >
              <Badge 
                variant="default" 
                className={cn(
                  "px-3 py-1 shadow-lg",
                  detectedTask.task.color || "bg-primary"
                )}
              >
                <Zap className="w-3 h-3 mr-1" />
                {detectedTask.task.label}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-semibold mb-2">
          {isListening
            ? 'Listening...'
            : isSpeaking
            ? 'Speaking...'
            : isProcessing
            ? 'Thinking...'
            : 'Tap to speak'}
        </h3>
        <p className="text-muted-foreground">
          {isListening
            ? 'Speak naturally, I\'m ready to help'
            : isSpeaking
            ? 'Playing response...'
            : isProcessing
            ? 'Processing your request...'
            : 'Press the microphone button to start'}
        </p>
      </motion.div>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md mb-6"
          >
            <Card className="p-4 bg-muted/50 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground mb-1">You said:</p>
              <p className="text-lg font-medium">{transcript}</p>
              
              {/* Detected Parameters */}
              {detectedTask && Object.keys(detectedTask.parameters).length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Parameters:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(detectedTask.parameters).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Task Hints */}
      <AnimatePresence>
        {showQuickTaskHint && quickTasks.length > 0 && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full max-w-md mb-6"
          >
            <Card className="p-3 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Quick Tasks Available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Say a trigger word like{" "}
                    {quickTasks.slice(0, 3).map((t, i) => (
                      <span key={t.id}>
                        <Badge variant="outline" className="mx-0.5 font-mono text-xs">
                          "{t.trigger}"
                        </Badge>
                        {i < Math.min(2, quickTasks.length - 1) && " or "}
                      </span>
                    ))}
                    {quickTasks.length > 3 && ` or ${quickTasks.length - 3} more`}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound Wave Visualization */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-1 h-12">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "w-1.5 rounded-full",
                    detectedTask ? detectedTask.task.color || "bg-primary" : "bg-primary"
                  )}
                  animate={{
                    height: [20, 40, 20],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Microphone Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant={isListening ? 'destructive' : 'default'}
          size="lg"
          onClick={isListening ? onStopListening : onStartListening}
          disabled={isProcessing || isSpeaking}
          className={cn(
            'w-20 h-20 rounded-full',
            isListening && 'animate-pulse'
          )}
        >
          {isProcessing || isSpeaking ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
      </motion.div>

      {/* Quick Task Triggers */}
      {!isListening && !isProcessing && !isSpeaking && quickTasks.length > 0 && (
        <div className="mt-8 text-center max-w-md">
          <p className="text-xs text-muted-foreground mb-2">
            Quick Task Triggers:
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            {quickTasks.slice(0, 8).map((task) => (
              <Badge
                key={task.id}
                variant="outline"
                className={cn(
                  "text-xs cursor-pointer hover:bg-muted transition-colors",
                  task.isFavorite && "border-yellow-500/50"
                )}
              >
                {task.isFavorite && <Zap className="w-2 h-2 mr-1 text-yellow-500" />}
                {task.trigger}
              </Badge>
            ))}
            {quickTasks.length > 8 && (
              <Badge variant="outline" className="text-xs">
                +{quickTasks.length - 8} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 text-center text-sm text-muted-foreground max-w-md">
        <p>
          <strong>Tips:</strong> Speak clearly and naturally. You can ask questions, give
          commands, or say a quick task trigger for instant actions.
        </p>
      </div>
    </div>
  );
}

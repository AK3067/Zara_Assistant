'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Clock,
  Battery,
  Wifi,
  Settings,
  Power,
  Lock,
  Unlock,
  Sparkles,
  Activity,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { AmbientConfig, TriggerPhrase } from '@/types/zara-advanced';

// ===== AMBIENT MODE OVERLAY =====

interface AmbientOverlayProps {
  isActive: boolean;
  config: AmbientConfig;
  onDeactivate: () => void;
  onWakeWord: () => void;
}

export function AmbientOverlay({ isActive, config, onDeactivate, onWakeWord }: AmbientOverlayProps) {
  const [time, setTime] = useState(new Date());
  const [isListening, setIsListening] = useState(false);
  const animationRef = useRef<number>();

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Animate listening state
  useEffect(() => {
    if (isActive && config.backgroundListening) {
      // Simulate periodic listening activation
      const listenInterval = setInterval(() => {
        setIsListening(true);
        setTimeout(() => setIsListening(false), 2000);
      }, 10000);
      return () => clearInterval(listenInterval);
    }
  }, [isActive, config.backgroundListening]);

  if (!isActive) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: isListening ? [1, 1.2, 1] : 1,
            opacity: isListening ? 0.3 : 0.1,
          }}
          transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
          className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent"
        />
      </div>

      {/* Clock Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-6xl sm:text-8xl font-light mb-2">
            {formatTime(time)}
          </h1>
          <p className="text-lg sm:text-xl opacity-70">
            {formatDate(time)}
          </p>
        </motion.div>

        {/* Wake Word Indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-12 flex flex-col items-center"
        >
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center"
                  >
                    <Mic className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                <span className="text-lg">Listening...</span>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <p className="text-sm opacity-50 mb-2">
                  Say &quot;{config.wakeWord}&quot; to wake me up
                </p>
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-primary mx-auto"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 text-xs opacity-50"
        >
          <div className="flex items-center gap-1">
            <Battery className="w-3 h-3" />
            <span>85%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <span>Connected</span>
          </div>
          <div className="flex items-center gap-1">
            <Bell className="w-3 h-3" />
            <span>3 notifications</span>
          </div>
        </motion.div>
      </div>

      {/* Deactivate Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDeactivate}
        className="absolute top-4 right-4 text-white/50 hover:text-white"
      >
        <Lock className="w-4 h-4 mr-1" />
        Exit Ambient
      </Button>
    </motion.div>
  );
}

// ===== AMBIENT MODE SETTINGS =====

interface AmbientSettingsProps {
  config: AmbientConfig;
  onUpdateConfig: (config: Partial<AmbientConfig>) => void;
}

export function AmbientSettings({ config, onUpdateConfig }: AmbientSettingsProps) {
  const [newTrigger, setNewTrigger] = useState('');
  const [newAction, setNewAction] = useState('');

  const handleAddTrigger = useCallback(() => {
    if (!newTrigger.trim() || !newAction.trim()) return;

    const phrase: TriggerPhrase = {
      phrase: newTrigger.trim(),
      action: newAction.trim(),
      response: '',
      enabled: true,
    };

    onUpdateConfig({
      triggerPhrases: [...config.triggerPhrases, phrase],
    });

    setNewTrigger('');
    setNewAction('');
  }, [newTrigger, newAction, config.triggerPhrases, onUpdateConfig]);

  const handleRemoveTrigger = useCallback((index: number) => {
    onUpdateConfig({
      triggerPhrases: config.triggerPhrases.filter((_, i) => i !== index),
    });
  }, [config.triggerPhrases, onUpdateConfig]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Moon className="w-5 h-5 text-primary" />
          Ambient Mode
        </CardTitle>
        <CardDescription>
          Always-listening mode for hands-free activation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Enable Ambient Mode</p>
            <p className="text-xs text-muted-foreground">
              Works even when screen is off
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => onUpdateConfig({ enabled: checked })}
          />
        </div>

        {/* Wake Word */}
        <div className="space-y-2">
          <Label>Wake Word</Label>
          <Select
            value={config.wakeWord}
            onValueChange={(value) => onUpdateConfig({ wakeWord: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hey Zara">Hey Zara</SelectItem>
              <SelectItem value="OK Zara">OK Zara</SelectItem>
              <SelectItem value="Zara">Zara</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sensitivity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Listening Sensitivity</Label>
            <span className="text-xs text-muted-foreground capitalize">
              {config.sensitivity}
            </span>
          </div>
          <Slider
            value={config.sensitivity === 'low' ? [1] : config.sensitivity === 'medium' ? [2] : [3]}
            onValueChange={(value) => {
              const sensitivity = value[0] === 1 ? 'low' : value[0] === 2 ? 'medium' : 'high';
              onUpdateConfig({ sensitivity });
            }}
            max={3}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            Higher sensitivity may use more battery
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Screen-off Activation</p>
              <p className="text-xs text-muted-foreground">
                Wake up even when screen is off
              </p>
            </div>
            <Switch
              checked={config.screenOffActivation}
              onCheckedChange={(checked) => onUpdateConfig({ screenOffActivation: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Low Power Mode</p>
              <p className="text-xs text-muted-foreground">
                Reduce battery usage
              </p>
            </div>
            <Switch
              checked={config.lowPowerMode}
              onCheckedChange={(checked) => onUpdateConfig({ lowPowerMode: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Background Listening</p>
              <p className="text-xs text-muted-foreground">
                Always listen for wake word
              </p>
            </div>
            <Switch
              checked={config.backgroundListening}
              onCheckedChange={(checked) => onUpdateConfig({ backgroundListening: checked })}
            />
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-2">
          <Label>Quiet Hours</Label>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Start</p>
              <Input
                type="time"
                value={config.quietHours.start}
                onChange={(e) => onUpdateConfig({
                  quietHours: { ...config.quietHours, start: e.target.value },
                })}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">End</p>
              <Input
                type="time"
                value={config.quietHours.end}
                onChange={(e) => onUpdateConfig({
                  quietHours: { ...config.quietHours, end: e.target.value },
                })}
              />
            </div>
          </div>
        </div>

        {/* Custom Triggers */}
        <div className="space-y-3">
          <Label>Custom Voice Triggers</Label>
          
          {config.triggerPhrases.length > 0 && (
            <div className="space-y-2">
              {config.triggerPhrases.map((trigger, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded"
                >
                  <div>
                    <p className="text-sm font-medium">&quot;{trigger.phrase}&quot;</p>
                    <p className="text-xs text-muted-foreground">{trigger.action}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrigger(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              placeholder='Trigger phrase (e.g., "Good night")'
              className="flex-1"
            />
            <Input
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="Action"
              className="flex-1"
            />
            <Button onClick={handleAddTrigger}>Add</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== QUICK ACTIONS PANEL =====

interface QuickActionsPanelProps {
  onAction: (action: string) => void;
}

export function QuickActionsPanel({ onAction }: QuickActionsPanelProps) {
  const actions = [
    { icon: '🔒', label: 'Lock Device', action: 'lock_device' },
    { icon: '🔦', label: 'Flashlight', action: 'toggle_flashlight' },
    { icon: '📷', label: 'Camera', action: 'open_camera' },
    { icon: '🔇', label: 'Silent Mode', action: 'toggle_silent' },
    { icon: '✈️', label: 'Airplane Mode', action: 'toggle_airplane' },
    { icon: '🔋', label: 'Battery Saver', action: 'toggle_battery_saver' },
    { icon: '📍', label: 'Location', action: 'toggle_location' },
    { icon: '📶', label: 'Mobile Data', action: 'toggle_data' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((item) => (
        <motion.button
          key={item.action}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction(item.action)}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <span className="text-2xl mb-1">{item.icon}</span>
          <span className="text-xs text-center">{item.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

// ===== DEFAULT AMBIENT CONFIG =====

export const defaultAmbientConfig: AmbientConfig = {
  enabled: false,
  sensitivity: 'medium',
  wakeWord: 'Hey Zara',
  wakeWords: ['Hey Zara', 'OK Zara', 'Zara'],
  screenOffActivation: false,
  lowPowerMode: false,
  backgroundListening: true,
  triggerPhrases: [
    { phrase: 'Good night', action: 'sleep_mode', response: 'Good night! Setting sleep mode.', enabled: true },
    { phrase: 'Good morning', action: 'morning_routine', response: 'Good morning! Starting your day.', enabled: true },
    { phrase: 'Power off', action: 'lock_device', response: 'Locking device.', enabled: true },
  ],
  quietHours: { start: '22:00', end: '07:00' },
};

export default AmbientSettings;

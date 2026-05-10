'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Volume2,
  VolumeX,
  Globe,
  Bell,
  Shield,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Sparkles,
  Brain,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAssistantStore } from '@/store/assistant-store';

interface SettingsPanelProps {
  onBack?: () => void;
  onNavigate?: (view: 'memories') => void;
}

export function SettingsPanel({ onBack, onNavigate }: SettingsPanelProps) {
  const { settings, updateSettings, memories } = useAssistantStore();

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-semibold text-white">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Voice Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Voice
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  {settings.enableVoiceResponse ? (
                    <Volume2 className="w-5 h-5 text-white" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-white/40" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">Voice Response</p>
                    <p className="text-xs text-white/40">Read AI responses aloud</p>
                  </div>
                </div>
                <Switch
                  checked={settings.enableVoiceResponse}
                  onCheckedChange={(checked) => updateSettings({ enableVoiceResponse: checked })}
                />
              </div>
            </div>
          </motion.div>

          {/* Language */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Language
            </h3>
            <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-white" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Language</p>
                  <p className="text-xs text-white/40">{settings.language === 'en-US' ? 'English (US)' : settings.language}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Notifications
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-sm font-medium text-white">Push Notifications</p>
                    <p className="text-xs text-white/40">Get notified of updates</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Privacy
            </h3>
            <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-white" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Data Privacy</p>
                  <p className="text-xs text-white/40">Your data stays on device</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Memories */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Memory
            </h3>
            <button
              onClick={() => onNavigate?.('memories')}
              className="w-full p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Memories</p>
                  <p className="text-xs text-white/40">
                    {memories?.length || 0} {memories?.length === 1 ? 'memory' : 'memories'} stored
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </button>
          </motion.div>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <Smartphone className="w-5 h-5 text-white" />
              <p className="font-medium text-white">Zara AI</p>
            </div>
            <p className="text-xs text-white/40">Version 1.0.0</p>
            <p className="text-xs text-white/40 mt-1">Built with Next.js & AI</p>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default SettingsPanel;

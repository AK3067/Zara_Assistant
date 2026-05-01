'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Globe, Moon, Sun, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssistantStore } from '@/store/assistant-store';

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'hi-IN', name: 'Hindi' },
];

interface AssistantSettingsProps {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export function AssistantSettings({ theme, onThemeChange }: AssistantSettingsProps) {
  const { settings, updateSettings, clearMessages, deleteConversation, conversations } = useAssistantStore();

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Voice Settings
          </CardTitle>
          <CardDescription>
            Configure text-to-speech and speech recognition options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Speech Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Speech Rate</Label>
              <span className="text-sm text-muted-foreground">
                {settings.voiceSettings.rate.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[settings.voiceSettings.rate]}
              onValueChange={([value]) =>
                updateSettings({
                  voiceSettings: { ...settings.voiceSettings, rate: value },
                })
              }
              min={0.5}
              max={2}
              step={0.1}
            />
          </div>

          {/* Speech Pitch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Speech Pitch</Label>
              <span className="text-sm text-muted-foreground">
                {settings.voiceSettings.pitch.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[settings.voiceSettings.pitch]}
              onValueChange={([value]) =>
                updateSettings({
                  voiceSettings: { ...settings.voiceSettings, pitch: value },
                })
              }
              min={0.5}
              max={2}
              step={0.1}
            />
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Volume</Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(settings.voiceSettings.volume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.voiceSettings.volume]}
              onValueChange={([value]) =>
                updateSettings({
                  voiceSettings: { ...settings.voiceSettings, volume: value },
                })
              }
              min={0.1}
              max={1}
              step={0.1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language
          </CardTitle>
          <CardDescription>
            Set your preferred language for voice interactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.language}
            onValueChange={(value) => updateSettings({ language: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={onThemeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>Behavior</CardTitle>
          <CardDescription>
            Control how the assistant responds and behaves.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Voice Response</Label>
              <p className="text-sm text-muted-foreground">
                Read responses aloud in voice mode
              </p>
            </div>
            <Switch
              checked={settings.enableVoiceResponse}
              onCheckedChange={(checked) =>
                updateSettings({ enableVoiceResponse: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-listen</Label>
              <p className="text-sm text-muted-foreground">
                Automatically start listening after response
              </p>
            </div>
            <Switch
              checked={settings.enableAutoListen}
              onCheckedChange={(checked) =>
                updateSettings({ enableAutoListen: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Manage your conversation history and data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">Conversation History</p>
              <p className="text-sm text-muted-foreground">
                {conversations.length} conversations saved
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                conversations.forEach(c => deleteConversation(c.id));
                clearMessages();
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About Zara AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Zara is an advanced AI assistant powered by cloud-based language models.
            She can help you with various tasks including answering questions, coding,
            writing, and more. Voice features use your browser's built-in speech
            recognition and synthesis capabilities.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
            <span>Version 1.0.0</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

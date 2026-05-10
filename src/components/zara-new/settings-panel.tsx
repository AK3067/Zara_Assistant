'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Volume2,
  VolumeX,
  Globe,
  Bell,
  Shield,
  Smartphone,
  Brain,
  ChevronRight,
  Sparkles,
  Palette,
  Target,
  Moon,
  Check,
  Plus,
  Trash2,
  Edit3,
  X,
  Power,
  AlertTriangle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAssistantStore, getPersonality } from '@/store/assistant-store';
import { AI_PERSONALITIES, AIName, Memory, MemoryCategory } from '@/types/assistant';

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  brain: Brain,
  palette: Palette,
  target: Target,
  moon: Moon,
};

// Category configuration
const CATEGORIES: { id: MemoryCategory; label: string; color: string }[] = [
  { id: 'personal', label: 'Personal', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'work', label: 'Work', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'preferences', label: 'Preferences', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'facts', label: 'Facts', color: 'bg-green-500/20 text-green-400' },
  { id: 'contacts', label: 'Contacts', color: 'bg-cyan-500/20 text-cyan-400' },
  { id: 'dates', label: 'Dates', color: 'bg-rose-500/20 text-rose-400' },
  { id: 'locations', label: 'Locations', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'goals', label: 'Goals', color: 'bg-indigo-500/20 text-indigo-400' },
  { id: 'health', label: 'Health', color: 'bg-red-500/20 text-red-400' },
  { id: 'other', label: 'Other', color: 'bg-gray-500/20 text-gray-400' },
];

interface SettingsPanelProps {
  onBack?: () => void;
}

export function SettingsPanel({ onBack }: SettingsPanelProps) {
  const { settings, updateSettings, memories, setAIName, addMemory, updateMemory, deleteMemory, clearAllMemories } = useAssistantStore();
  const [showPersonalitySelector, setShowPersonalitySelector] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Memory form state
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('personal');
  const [newImportance, setNewImportance] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTags, setNewTags] = useState('');

  const currentPersonality = getPersonality(settings.aiName);
  const CurrentIcon = ICON_MAP[currentPersonality.icon] || Sparkles;
  const memoriesEnabled = settings.memoriesEnabled ?? true;

  const handleSelectPersonality = (name: AIName) => {
    setAIName(name);
  };

  const handleToggleMemories = useCallback((enabled: boolean) => {
    updateSettings({ memoriesEnabled: enabled });
  }, [updateSettings]);

  const handleAddMemory = useCallback(() => {
    if (!newContent.trim()) return;

    const tags = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    addMemory({
      content: newContent.trim(),
      category: newCategory,
      source: 'manual',
      importance: newImportance,
      tags,
    });

    setNewContent('');
    setNewCategory('personal');
    setNewImportance('medium');
    setNewTags('');
    setIsAddingMemory(false);
  }, [newContent, newCategory, newImportance, newTags, addMemory]);

  const handleEditMemory = useCallback((memory: Memory) => {
    setEditingId(memory.id);
    setNewContent(memory.originalText || memory.content);
    setNewCategory(memory.category);
    setNewImportance(memory.importance);
    setNewTags(memory.tags.join(', '));
  }, []);

  const handleSaveEdit = useCallback((id: string) => {
    if (!newContent.trim()) return;

    const tags = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    updateMemory(id, {
      content: newContent.trim(),
      originalText: newContent.trim(),
      category: newCategory,
      importance: newImportance,
      tags,
    });

    setEditingId(null);
    setNewContent('');
    setNewTags('');
  }, [newContent, newCategory, newImportance, newTags, updateMemory]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setNewContent('');
    setNewTags('');
  }, []);

  const handleClearAll = useCallback(() => {
    clearAllMemories();
    setShowClearConfirm(false);
  }, [clearAllMemories]);

  const getCategoryConfig = (categoryId: MemoryCategory) => {
    return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
          {/* AI Personality */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              AI Assistant
            </h3>
            <button
              onClick={() => setShowPersonalitySelector(!showPersonalitySelector)}
              className="w-full p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: currentPersonality.color === '#ffffff' ? '#ffffff' : currentPersonality.color }}
                >
                  <CurrentIcon className={cn("w-5 h-5", currentPersonality.color === '#ffffff' ? "text-black" : "text-white")} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{currentPersonality.displayName}</p>
                  <p className="text-xs text-white/40">{currentPersonality.description}</p>
                </div>
                <ChevronRight className={cn("w-5 h-5 text-white/40 transition-transform", showPersonalitySelector && "rotate-90")} />
              </div>
            </button>

            {/* Personality Selector */}
            <AnimatePresence>
              {showPersonalitySelector && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-2">
                    {AI_PERSONALITIES.map((personality) => {
                      const Icon = ICON_MAP[personality.icon] || Sparkles;
                      const isSelected = settings.aiName === personality.name;

                      return (
                        <button
                          key={personality.name}
                          onClick={() => handleSelectPersonality(personality.name)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                            isSelected
                              ? "border-white/30 bg-white/10"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                          )}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: personality.color === '#ffffff' ? '#ffffff' : personality.color }}
                          >
                            <Icon className={cn("w-4 h-4", personality.color === '#ffffff' ? "text-black" : "text-white")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{personality.displayName}</p>
                            <p className="text-xs text-white/40 truncate">{personality.description}</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                              <Check className="w-3 h-3 text-black" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Voice Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
            transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.3 }}
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
            transition={{ delay: 0.4 }}
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

          {/* Memories - Embedded */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Memory
              </h3>
              {memoriesEnabled && (
                <Button
                  onClick={() => setIsAddingMemory(true)}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-white/60 hover:text-white"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              )}
            </div>

            {/* Memory Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  memoriesEnabled ? "bg-purple-500/20" : "bg-white/5"
                )}>
                  <Power className={cn("w-4 h-4", memoriesEnabled ? "text-purple-400" : "text-white/40")} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Enable Memories</p>
                  <p className="text-xs text-white/40">
                    {memoriesEnabled ? `${memories?.length || 0} memories stored` : 'Memory storage disabled'}
                  </p>
                </div>
              </div>
              <Switch
                checked={memoriesEnabled}
                onCheckedChange={handleToggleMemories}
              />
            </div>

            {/* Add Memory Form */}
            <AnimatePresence>
              {isAddingMemory && memoriesEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                    <Input
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="What should I remember?"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                        className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2 py-1"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id} className="bg-black">
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newImportance}
                        onChange={(e) => setNewImportance(e.target.value as 'low' | 'medium' | 'high')}
                        className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2 py-1"
                      >
                        <option value="low" className="bg-black">Low</option>
                        <option value="medium" className="bg-black">Medium</option>
                        <option value="high" className="bg-black">High</option>
                      </select>
                    </div>
                    <Input
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="Tags (comma separated)"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAddingMemory(false);
                          setNewContent('');
                          setNewTags('');
                        }}
                        className="h-7 text-xs text-white/60 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddMemory}
                        className="h-7 text-xs bg-white text-black hover:bg-white/90"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Memories List */}
            {memoriesEnabled && memories && memories.length > 0 && (
              <div className="space-y-2">
                {/* Clear All Confirmation */}
                <AnimatePresence>
                  {showClearConfirm && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-xl border border-red-500/30 bg-red-500/10"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-white">Clear all memories?</p>
                          <p className="text-[10px] text-white/50 mt-1">This cannot be undone.</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowClearConfirm(false)}
                          className="h-6 text-xs text-white/60 hover:text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleClearAll}
                          className="h-6 text-xs bg-red-500 text-white hover:bg-red-600"
                        >
                          Clear All
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Memory Items */}
                {memories.slice(0, 5).map((memory) => {
                  const categoryConfig = getCategoryConfig(memory.category);

                  return (
                    <div
                      key={memory.id}
                      className="p-3 rounded-xl border border-white/10 bg-white/[0.02]"
                    >
                      {editingId === memory.id ? (
                        <div className="space-y-2">
                          <Input
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="bg-white/5 border-white/10 text-white text-sm h-8"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <select
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                              className="bg-white/5 border border-white/10 text-white text-xs rounded px-2 py-1"
                            >
                              {CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id} className="bg-black">
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                            <Input
                              value={newTags}
                              onChange={(e) => setNewTags(e.target.value)}
                              placeholder="Tags..."
                              className="flex-1 bg-white/5 border-white/10 text-white text-xs h-7"
                            />
                          </div>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-6 text-xs text-white/60 hover:text-white"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(memory.id)}
                              className="h-6 text-xs bg-white text-black hover:bg-white/90"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <div className={cn("w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5", categoryConfig.color)}>
                            <Brain className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white leading-relaxed line-clamp-2">
                              {memory.content}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-white/30">
                              <span>{formatDate(memory.createdAt)}</span>
                              <span className={cn(
                                "px-1 py-0.5 rounded",
                                memory.importance === 'high' && "bg-red-500/20 text-red-400",
                                memory.importance === 'medium' && "bg-amber-500/20 text-amber-400",
                                memory.importance === 'low' && "bg-white/10 text-white/40"
                              )}>
                                {memory.importance}
                              </span>
                              {memory.source === 'conversation' && (
                                <span className="flex items-center gap-0.5">
                                  <MessageSquare className="w-2 h-2" />
                                  Auto
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditMemory(memory)}
                              className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/10"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMemory(memory.id)}
                              className="h-6 w-6 text-white/40 hover:text-red-400 hover:bg-white/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Clear All Button */}
                {memories.length > 5 && (
                  <p className="text-xs text-white/30 text-center">
                    +{memories.length - 5} more memories
                  </p>
                )}

                {!showClearConfirm && memories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full h-7 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear All Memories
                  </Button>
                )}
              </div>
            )}

            {/* Empty State */}
            {memoriesEnabled && (!memories || memories.length === 0) && (
              <div className="text-center py-4">
                <Brain className="w-8 h-8 mx-auto text-white/20 mb-2" />
                <p className="text-xs text-white/40">No memories yet</p>
              </div>
            )}
          </motion.div>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <Smartphone className="w-5 h-5 text-white" />
              <p className="font-medium text-white">{currentPersonality.displayName} AI</p>
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

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Plus,
  Search,
  Trash2,
  Edit3,
  Check,
  X,
  Tag,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  MessageSquare,
  Filter,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAssistantStore } from '@/store/assistant-store';
import type { Memory, MemoryCategory } from '@/types/assistant';

// Category configuration
const CATEGORIES: { id: MemoryCategory; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'personal', label: 'Personal', icon: User, color: 'bg-blue-500/20 text-blue-400' },
  { id: 'work', label: 'Work', icon: Brain, color: 'bg-purple-500/20 text-purple-400' },
  { id: 'preferences', label: 'Preferences', icon: Sparkles, color: 'bg-amber-500/20 text-amber-400' },
  { id: 'facts', label: 'Facts', icon: Hash, color: 'bg-green-500/20 text-green-400' },
  { id: 'contacts', label: 'Contacts', icon: User, color: 'bg-cyan-500/20 text-cyan-400' },
  { id: 'dates', label: 'Dates', icon: Calendar, color: 'bg-rose-500/20 text-rose-400' },
  { id: 'locations', label: 'Locations', icon: Tag, color: 'bg-orange-500/20 text-orange-400' },
  { id: 'goals', label: 'Goals', icon: Sparkles, color: 'bg-indigo-500/20 text-indigo-400' },
  { id: 'health', label: 'Health', icon: Brain, color: 'bg-red-500/20 text-red-400' },
  { id: 'other', label: 'Other', icon: Tag, color: 'bg-gray-500/20 text-gray-400' },
];

// Compress text function (simple version - can be enhanced with AI)
function compressText(text: string): string {
  // Remove extra whitespace
  let compressed = text.trim().replace(/\s+/g, ' ');
  
  // Remove filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'];
  fillerWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    compressed = compressed.replace(regex, '');
  });
  
  // Clean up
  compressed = compressed.replace(/\s+/g, ' ').trim();
  
  return compressed;
}

interface MemoriesPanelProps {
  onBack?: () => void;
}

export function MemoriesPanel({ onBack }: MemoriesPanelProps) {
  const { memories, addMemory, updateMemory, deleteMemory } = useAssistantStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'all'>('all');
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Form state for new/edit memory
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('personal');
  const [newImportance, setNewImportance] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTags, setNewTags] = useState('');

  // Filter memories
  const filteredMemories = memories.filter((memory) => {
    const matchesSearch = searchQuery
      ? memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    const matchesCategory = selectedCategory === 'all' || memory.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddMemory = useCallback(() => {
    if (!newContent.trim()) return;

    const compressedContent = compressText(newContent);
    const tags = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    addMemory({
      content: compressedContent,
      originalText: newContent,
      category: newCategory,
      source: 'manual',
      importance: newImportance,
      tags,
    });

    // Reset form
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

    const compressedContent = compressText(newContent);
    const tags = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    updateMemory(id, {
      content: compressedContent,
      originalText: newContent,
      category: newCategory,
      importance: newImportance,
      tags,
    });

    // Reset form
    setEditingId(null);
    setNewContent('');
    setNewTags('');
  }, [newContent, newCategory, newImportance, newTags, updateMemory]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setNewContent('');
    setNewTags('');
  }, []);

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
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-white">Memories</h1>
          <p className="text-xs text-white/40">
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'} stored
          </p>
        </div>
        <Button
          onClick={() => setIsAddingMemory(true)}
          className="bg-white text-black hover:bg-white/90"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="p-3 border-b border-white/10 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-9"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn("text-white/60 hover:text-white hover:bg-white/10", showFilters && "bg-white/10 text-white")}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Category Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "h-7 text-xs",
                    selectedCategory === 'all'
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  All
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "h-7 text-xs gap-1",
                      selectedCategory === cat.id
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <cat.icon className="w-3 h-3" />
                    {cat.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Memory Form */}
      <AnimatePresence>
        {isAddingMemory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 overflow-hidden"
          >
            <div className="p-3 space-y-3">
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
                  className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-2 py-1"
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
                  className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-2 py-1"
                >
                  <option value="low" className="bg-black">Low Priority</option>
                  <option value="medium" className="bg-black">Medium Priority</option>
                  <option value="high" className="bg-black">High Priority</option>
                </select>
              </div>
              
              <Input
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
              />
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingMemory(false)}
                  className="text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddMemory}
                  className="bg-white text-black hover:bg-white/90"
                >
                  Save Memory
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memories List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 mx-auto text-white/20 mb-3" />
              <p className="text-white/40">
                {searchQuery ? 'No memories found' : 'No memories yet'}
              </p>
              <p className="text-xs text-white/30 mt-1">
                {!searchQuery && 'Add a memory or chat with Zara to auto-capture'}
              </p>
            </div>
          ) : (
            filteredMemories.map((memory) => {
              const categoryConfig = getCategoryConfig(memory.category);
              
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  {editingId === memory.id ? (
                    // Edit Mode
                    <div className="space-y-2">
                      <Input
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
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
                          className="h-7 text-xs text-white/60 hover:text-white"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(memory.id)}
                          className="h-7 text-xs bg-white text-black hover:bg-white/90"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex items-start gap-2">
                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", categoryConfig.color)}>
                          <categoryConfig.icon className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white leading-relaxed">
                            {memory.content}
                          </p>
                          
                          {/* Tags */}
                          {memory.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {memory.tags.map((tag, i) => (
                                <Badge
                                  key={i}
                                  className="bg-white/5 text-white/50 text-[10px] px-1.5 py-0"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Meta */}
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(memory.createdAt)}
                            </span>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded",
                              memory.importance === 'high' && "bg-red-500/20 text-red-400",
                              memory.importance === 'medium' && "bg-amber-500/20 text-amber-400",
                              memory.importance === 'low' && "bg-white/10 text-white/40"
                            )}>
                              {memory.importance}
                            </span>
                            {memory.source === 'conversation' && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Auto
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditMemory(memory)}
                            className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMemory(memory.id)}
                            className="h-7 w-7 text-white/40 hover:text-red-400 hover:bg-white/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default MemoriesPanel;

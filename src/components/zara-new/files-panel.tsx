'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit3,
  Check,
  X,
  Pin,
  PinOff,
  Archive,
  Download,
  Filter,
  File,
  List,
  Lightbulb,
  BookOpen,
  Bell,
  Clock,
  MoreVertical,
  Copy,
  Share2,
  AlertTriangle,
  FileDown,
  FileSpreadsheet,
  FileType,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAssistantStore } from '@/store/assistant-store';
import type { DocFile, DocFileType } from '@/types/assistant';
import {
  exportFile as exportFileToFormat,
  exportAllFiles,
  exportMemoriesAsDocx,
  exportMemoriesAsPdf,
  exportMemoriesAsExcel,
  type ExportFormat,
} from '@/lib/document-utils';

// File type configuration
const FILE_TYPES: { id: DocFileType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'note', label: 'Note', icon: FileText, color: 'bg-blue-500/20 text-blue-400' },
  { id: 'document', label: 'Document', icon: File, color: 'bg-green-500/20 text-green-400' },
  { id: 'list', label: 'List', icon: List, color: 'bg-amber-500/20 text-amber-400' },
  { id: 'idea', label: 'Idea', icon: Lightbulb, color: 'bg-purple-500/20 text-purple-400' },
  { id: 'journal', label: 'Journal', icon: BookOpen, color: 'bg-rose-500/20 text-rose-400' },
  { id: 'reminder', label: 'Reminder', icon: Bell, color: 'bg-cyan-500/20 text-cyan-400' },
];

// Color options for file tags
const COLOR_OPTIONS = [
  { id: 'none', label: 'None', color: 'bg-white/10' },
  { id: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { id: 'green', label: 'Green', color: 'bg-green-500' },
  { id: 'amber', label: 'Amber', color: 'bg-amber-500' },
  { id: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { id: 'rose', label: 'Rose', color: 'bg-rose-500' },
  { id: 'cyan', label: 'Cyan', color: 'bg-cyan-500' },
];

interface FilesPanelProps {
  onBack?: () => void;
}

export function FilesPanel({ onBack }: FilesPanelProps) {
  const { files, addFile, updateFile, deleteFile, clearAllFiles, toggleFilePin, archiveFile, conversations, memories } = useAssistantStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<DocFileType | 'all'>('all');
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMemoryExportMenu, setShowMemoryExportMenu] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  
  // Form state for new/edit file
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<DocFileType>('note');
  const [newTags, setNewTags] = useState('');
  const [newColor, setNewColor] = useState('none');

  // Filter files - show non-archived by default
  const filteredFiles = files.filter((file) => {
    const matchesSearch = searchQuery
      ? file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    const matchesType = selectedType === 'all' || file.type === selectedType;
    const notArchived = !file.isArchived;
    return matchesSearch && matchesType && notArchived;
  });

  // Sort files: pinned first, then by date
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt - a.createdAt;
  });

  const handleAddFile = useCallback(() => {
    if (!newTitle.trim()) return;

    const tags = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    addFile({
      title: newTitle.trim(),
      content: newContent,
      type: newType,
      tags,
      color: newColor !== 'none' ? newColor : undefined,
    });

    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewType('note');
    setNewTags('');
    setNewColor('none');
    setIsAddingFile(false);
  }, [newTitle, newContent, newType, newTags, newColor, addFile]);

  const handleEditFile = useCallback((file: DocFile) => {
    setEditingId(file.id);
    setNewTitle(file.title);
    setNewContent(file.content);
    setNewType(file.type);
    setNewTags(file.tags.join(', '));
    setNewColor(file.color || 'none');
    setActiveMenu(null);
  }, []);

  const handleSaveEdit = useCallback((id: string) => {
    if (!newTitle.trim()) return;

    const tags = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    updateFile(id, {
      title: newTitle.trim(),
      content: newContent,
      type: newType,
      tags,
      color: newColor !== 'none' ? newColor : undefined,
    });

    // Reset form
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
  }, [newTitle, newContent, newType, newTags, newColor, updateFile]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
  }, []);

  const handleClearAll = useCallback(() => {
    clearAllFiles();
    setShowClearConfirm(false);
  }, [clearAllFiles]);

  // Export functions with multiple format support
  const handleExportFile = useCallback(async (file: DocFile, format: ExportFormat) => {
    setExportingFormat(format);
    try {
      await exportFileToFormat(file, format);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExportingFormat(null);
      setActiveMenu(null);
    }
  }, []);

  const handleExportAllFiles = useCallback(async (format: ExportFormat) => {
    setExportingFormat(format);
    try {
      await exportAllFiles(files, format);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExportingFormat(null);
      setShowExportMenu(false);
    }
  }, [files]);

  const handleExportMemories = useCallback(async (format: ExportFormat) => {
    setExportingFormat(format);
    try {
      switch (format) {
        case 'docx':
          await exportMemoriesAsDocx(memories);
          break;
        case 'pdf':
          exportMemoriesAsPdf(memories);
          break;
        case 'xlsx':
          exportMemoriesAsExcel(memories);
          break;
        case 'txt':
        default:
          // Fallback to txt
          let content = 'ZARA AI - MEMORIES EXPORT\n';
          content += '='.repeat(40) + '\n\n';
          memories.forEach((memory, index) => {
            content += `\n${index + 1}. [${memory.category}] ${memory.content}\n`;
            content += `Tags: ${memory.tags.join(', ') || 'None'}\n`;
            content += `Importance: ${memory.importance} | Created: ${new Date(memory.createdAt).toLocaleString()}\n`;
          });
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'zara_memories.txt';
          a.click();
          URL.revokeObjectURL(url);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExportingFormat(null);
      setShowMemoryExportMenu(false);
    }
  }, [memories]);

  const handleExportConversations = useCallback((format: ExportFormat) => {
    // For conversations, we'll use txt format as the primary method
    // since conversations are primarily text-based
    let content = 'ZARA AI - CONVERSATIONS EXPORT\n';
    content += '='.repeat(40) + '\n\n';
    
    conversations.forEach((conv, index) => {
      content += `\n${index + 1}. ${conv.title}\n`;
      content += '-'.repeat(40) + '\n';
      conv.messages.forEach((msg) => {
        content += `[${msg.role.toUpperCase()}]: ${msg.content}\n`;
      });
      content += `Created: ${new Date(conv.createdAt).toLocaleString()}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zara_conversations.${format === 'txt' ? 'txt' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [conversations]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setActiveMenu(null);
  }, []);

  const getFileTypeConfig = (typeId: DocFileType) => {
    return FILE_TYPES.find((t) => t.id === typeId) || FILE_TYPES[0];
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
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-white">Files</h1>
          <p className="text-xs text-white/40">
            {files.filter(f => !f.isArchived).length} {files.filter(f => !f.isArchived).length === 1 ? 'file' : 'files'}
          </p>
        </div>
        <Button
          onClick={() => setIsAddingFile(true)}
          className="bg-white text-black hover:bg-white/90"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          New
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
              placeholder="Search files..."
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

        {/* Type Filters */}
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
                  onClick={() => setSelectedType('all')}
                  className={cn(
                    "h-7 text-xs",
                    selectedType === 'all'
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  All
                </Button>
                {FILE_TYPES.map((type) => (
                  <Button
                    key={type.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "h-7 text-xs gap-1",
                      selectedType === type.id
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <type.icon className="w-3 h-3" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Export Options */}
      <div className="p-3 border-b border-white/10 space-y-2">
        {/* Export Files */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={files.length === 0}
            className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white text-xs w-full"
          >
            <FileDown className="w-3 h-3 mr-1" />
            Export All Files
            <Download className="w-3 h-3 ml-auto" />
          </Button>
          <AnimatePresence>
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 top-full mt-1 bg-black border border-white/10 rounded-lg overflow-hidden z-10"
              >
                {(['txt', 'docx', 'pdf', 'xlsx'] as ExportFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => handleExportAllFiles(format)}
                    disabled={exportingFormat !== null}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    {format === 'docx' && <FileType className="w-3 h-3 text-blue-400" />}
                    {format === 'pdf' && <FileText className="w-3 h-3 text-red-400" />}
                    {format === 'xlsx' && <FileSpreadsheet className="w-3 h-3 text-green-400" />}
                    {format === 'txt' && <File className="w-3 h-3 text-white/40" />}
                    Export as {format.toUpperCase()}
                    {exportingFormat === format && <span className="ml-auto animate-pulse">...</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Export Memories & Chats */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMemoryExportMenu(!showMemoryExportMenu)}
              disabled={memories.length === 0}
              className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white text-xs w-full"
            >
              <Download className="w-3 h-3 mr-1" />
              Memories
            </Button>
            <AnimatePresence>
              {showMemoryExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-0 right-0 top-full mt-1 bg-black border border-white/10 rounded-lg overflow-hidden z-10"
                >
                  {(['txt', 'docx', 'pdf', 'xlsx'] as ExportFormat[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => handleExportMemories(format)}
                      disabled={exportingFormat !== null}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      {format === 'docx' && <FileType className="w-3 h-3 text-blue-400" />}
                      {format === 'pdf' && <FileText className="w-3 h-3 text-red-400" />}
                      {format === 'xlsx' && <FileSpreadsheet className="w-3 h-3 text-green-400" />}
                      {format === 'txt' && <File className="w-3 h-3 text-white/40" />}
                      {format.toUpperCase()}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportConversations('txt')}
            disabled={conversations.length === 0}
            className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white text-xs flex-1"
          >
            <Download className="w-3 h-3 mr-1" />
            Chats (.txt)
          </Button>
        </div>
      </div>

      {/* Add File Form */}
      <AnimatePresence>
        {isAddingFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 overflow-hidden"
          >
            <div className="p-3 space-y-3">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                autoFocus
              />
              
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your content here..."
                className="w-full h-24 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-white/20"
              />
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as DocFileType)}
                  className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-2 py-1"
                >
                  {FILE_TYPES.map((type) => (
                    <option key={type.id} value={type.id} className="bg-black">
                      {type.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-2 py-1"
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color.id} value={color.id} className="bg-black">
                      {color.label}
                    </option>
                  ))}
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
                  onClick={() => setIsAddingFile(false)}
                  className="text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddFile}
                  disabled={!newTitle.trim()}
                  className="bg-white text-black hover:bg-white/90"
                >
                  Save File
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Files List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* Clear All Confirmation */}
          <AnimatePresence>
            {showClearConfirm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 mb-2"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Delete all files?</p>
                    <p className="text-xs text-white/50 mt-1">This action cannot be undone. All {files.length} files will be permanently deleted.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearConfirm(false)}
                    className="text-white/60 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleClearAll}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete All
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear All Button */}
          {files.length > 0 && !showClearConfirm && (
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>
          )}

          {sortedFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-white/20 mb-3" />
              <p className="text-white/40">
                {searchQuery ? 'No files found' : 'No files yet'}
              </p>
              <p className="text-xs text-white/30 mt-1">
                {!searchQuery && 'Create a note or document to get started'}
              </p>
            </div>
          ) : (
            sortedFiles.map((file) => {
              const typeConfig = getFileTypeConfig(file.type);
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative"
                >
                  {editingId === file.id ? (
                    // Edit Mode
                    <div className="space-y-2">
                      <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                        autoFocus
                      />
                      <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full h-20 bg-white/5 border border-white/10 text-white rounded-lg p-2 text-sm resize-none focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <select
                          value={newType}
                          onChange={(e) => setNewType(e.target.value as DocFileType)}
                          className="bg-white/5 border border-white/10 text-white text-xs rounded px-2 py-1"
                        >
                          {FILE_TYPES.map((type) => (
                            <option key={type.id} value={type.id} className="bg-black">
                              {type.label}
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
                          onClick={() => handleSaveEdit(file.id)}
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
                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", typeConfig.color)}>
                          <typeConfig.icon className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {file.isPinned && <Pin className="w-3 h-3 text-amber-400" />}
                            {file.color && (
                              <div className={cn("w-2 h-2 rounded-full", COLOR_OPTIONS.find(c => c.id === file.color)?.color)} />
                            )}
                            <h3 className="text-sm font-medium text-white truncate">{file.title}</h3>
                          </div>
                          
                          {file.content && (
                            <p className="text-xs text-white/50 mt-1 line-clamp-2">
                              {file.content}
                            </p>
                          )}
                          
                          {/* Tags */}
                          {file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {file.tags.map((tag, i) => (
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
                              {formatDate(file.createdAt)}
                            </span>
                            <span>{file.wordCount} words</span>
                            <span className={typeConfig.color}>{typeConfig.label}</span>
                          </div>
                        </div>
                        
                        {/* Menu Button */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setActiveMenu(activeMenu === file.id ? null : file.id)}
                            className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                          
                          {/* Dropdown Menu */}
                          <AnimatePresence>
                            {activeMenu === file.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-black border border-white/10 rounded-lg shadow-lg z-10 overflow-hidden"
                              >
                                <button
                                  onClick={() => handleEditFile(file)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => toggleFilePin(file.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                  {file.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                                  {file.isPinned ? 'Unpin' : 'Pin'}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(file.content)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy Content
                                </button>
                                <div className="border-t border-white/10" />
                                <p className="px-3 py-1 text-[10px] text-white/30 uppercase">Export as</p>
                                <button
                                  onClick={() => handleExportFile(file, 'txt')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                  <File className="w-3 h-3" />
                                  .TXT
                                </button>
                                <button
                                  onClick={() => handleExportFile(file, 'docx')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                  <FileType className="w-3 h-3 text-blue-400" />
                                  .DOCX
                                </button>
                                <button
                                  onClick={() => handleExportFile(file, 'pdf')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                  <FileText className="w-3 h-3 text-red-400" />
                                  .PDF
                                </button>
                                <button
                                  onClick={() => handleExportFile(file, 'xlsx')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                  <FileSpreadsheet className="w-3 h-3 text-green-400" />
                                  .XLSX
                                </button>
                                <div className="border-t border-white/10" />
                                <button
                                  onClick={() => archiveFile(file.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                  <Archive className="w-3 h-3" />
                                  Archive
                                </button>
                                <div className="border-t border-white/10" />
                                <button
                                  onClick={() => {
                                    deleteFile(file.id);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
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

export default FilesPanel;

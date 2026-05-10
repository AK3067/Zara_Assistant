'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Cpu, 
  Settings, 
  Plus, 
  Sparkles, 
  Wifi, 
  WifiOff,
  Menu,
  Cloud,
  FileText,
  Scan,
  Clock,
  Trash2,
} from 'lucide-react';
import { ZaraInterface } from './zara-interface';
import { SettingsPanel } from './settings-panel';
import { FilesPanel } from './files-panel';
import { OCRPanel } from './ocr-panel';
import { LocalAIPanel } from '@/components/local-ai-panel';
import { NameSelectionScreen } from './name-selection-screen';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePWA } from '@/hooks/use-pwa';
import { useAssistantStore, getPersonality } from '@/store/assistant-store';
import type { AIName } from '@/types/assistant';

type View = 'chat' | 'settings' | 'local-ai' | 'files' | 'ocr';

interface ZaraAIProps {
  onWakeWord?: () => void;
}

export function ZaraAI({ onWakeWord }: ZaraAIProps) {
  const [view, setView] = useState<View>('chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isOnline } = usePWA();
  const {
    conversations,
    files,
    ocrHistory,
    createConversation,
    clearMessages,
    loadConversation,
    deleteConversation,
    deleteOCRHistory,
    settings,
    setAIName,
    completeSetup,
  } = useAssistantStore();

  // Get current AI personality
  const personality = getPersonality(settings.aiName);
  const aiName = personality.displayName;

  // Handle setup completion
  const handleSetupComplete = useCallback((name: AIName) => {
    setAIName(name);
    completeSetup();
  }, [setAIName, completeSetup]);

  const handleBack = useCallback(() => {
    setView('chat');
  }, []);

  const handleNewChat = useCallback(() => {
    createConversation();
    clearMessages();
    setView('chat');
    setIsMobileSidebarOpen(false);
  }, [createConversation, clearMessages]);

  const handleSelectView = useCallback((newView: View) => {
    setView(newView);
    setIsMobileSidebarOpen(false);
  }, []);

  const handleLoadConversation = useCallback((id: string) => {
    loadConversation(id);
    setView('chat');
    setIsMobileSidebarOpen(false);
  }, [loadConversation]);

  // Show name selection if setup not complete
  if (!settings.setupComplete) {
    return <NameSelectionScreen onComplete={handleSetupComplete} />;
  }

  // Format time for history items
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Sidebar Content
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-black">
      {/* Logo/Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: personality.color !== '#ffffff' ? personality.color : undefined }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">{aiName} AI</h1>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-amber-500">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-b border-white/10">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* History Section - Chat & OCR */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {/* Chat History */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs text-white/40 uppercase tracking-wider">Chats</span>
              {conversations && conversations.length > 0 && (
                <span className="text-xs text-white/30">{conversations.length}</span>
              )}
            </div>
            {conversations && conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.slice(0, 10).map((conv) => (
                  <div
                    key={conv.id}
                    className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleLoadConversation(conv.id)}
                  >
                    <MessageSquare className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <span className="flex-1 text-sm text-white/70 truncate">{conv.title}</span>
                    <span className="text-xs text-white/30">{formatTime(conv.updatedAt)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/30 px-2 py-2">No chat history</p>
            )}
          </div>

          {/* OCR History */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs text-white/40 uppercase tracking-wider">OCR Scans</span>
              {ocrHistory && ocrHistory.length > 0 && (
                <span className="text-xs text-white/30">{ocrHistory.length}</span>
              )}
            </div>
            {ocrHistory && ocrHistory.length > 0 ? (
              <div className="space-y-1">
                {ocrHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => {
                      setView('ocr');
                      setIsMobileSidebarOpen(false);
                    }}
                  >
                    <Scan className="w-4 h-4 text-green-400/60 flex-shrink-0" />
                    <span className="flex-1 text-sm text-white/70 truncate">{item.text.slice(0, 25)}...</span>
                    <span className="text-xs text-white/30">{formatTime(item.createdAt)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOCRHistory(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/30 px-2 py-2">No OCR history</p>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Navigation - Settings & Files */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <button
            onClick={() => handleSelectView('settings')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all",
              view === 'settings'
                ? "bg-white/10 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </button>
          <button
            onClick={() => handleSelectView('files')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all",
              view === 'files'
                ? "bg-white/10 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">Files</span>
            {files && files.length > 0 && (
              <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{files.filter(f => !f.isArchived).length}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-black overflow-hidden">
      {/* Desktop Sidebar - Always visible on md+ */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/80 z-40"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 p-3 border-b border-white/10 bg-black flex-shrink-0">
          {/* Menu Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Title */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-white">
                {view === 'chat' ? 'Chat' : view === 'local-ai' ? 'Local AI' : view === 'files' ? 'Files' : view === 'ocr' ? 'OCR Scanner' : 'Settings'}
              </h1>
              {view === 'local-ai' && (
                <Badge className="bg-green-500/20 text-green-500 text-[10px]">
                  Offline
                </Badge>
              )}
              {view === 'ocr' && (
                <Badge className="bg-green-500/20 text-green-500 text-[10px]">
                  English
                </Badge>
              )}
            </div>
          </div>

          {/* Connection Status */}
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-amber-500" />
          )}
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ZaraInterface
                  onHome={onWakeWord}
                  onSettings={() => setView('settings')}
                />
              </motion.div>
            )}

            {view === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <SettingsPanel onBack={handleBack} />
              </motion.div>
            )}

            {view === 'local-ai' && (
              <motion.div
                key="local-ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <LocalAIPanel onBack={handleBack} />
              </motion.div>
            )}

            {view === 'files' && (
              <motion.div
                key="files"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <FilesPanel onBack={handleBack} />
              </motion.div>
            )}

            {view === 'ocr' && (
              <motion.div
                key="ocr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <OCRPanel onBack={handleBack} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default ZaraAI;

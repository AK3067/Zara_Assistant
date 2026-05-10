'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Cpu, 
  Settings, 
  Plus, 
  Sparkles, 
  Home, 
  Wifi, 
  WifiOff,
  Menu,
  Cloud,
  Brain,
  FileText
} from 'lucide-react';
import { ZaraInterface } from './zara-interface';
import { SettingsPanel } from './settings-panel';
import { MemoriesPanel } from './memories-panel';
import { FilesPanel } from './files-panel';
import { LocalAIPanel } from '@/components/local-ai-panel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePWA } from '@/hooks/use-pwa';
import { useAssistantStore } from '@/store/assistant-store';

type View = 'chat' | 'settings' | 'local-ai' | 'memories' | 'files';

interface ZaraAIProps {
  onWakeWord?: () => void;
}

export function ZaraAI({ onWakeWord }: ZaraAIProps) {
  const [view, setView] = useState<View>('chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isOnline } = usePWA();
  const { conversations, memories, files, createConversation, clearMessages, loadConversation } = useAssistantStore();

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

  // Sidebar Content
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-black">
      {/* Logo/Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">Zara AI</h1>
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

      {/* Navigation Options */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>

        {/* Divider */}
        <div className="h-px bg-white/10 my-3" />

        {/* Chat Option */}
        <button
          onClick={() => handleSelectView('chat')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            view === 'chat'
              ? "bg-white text-black"
              : "bg-transparent text-white hover:bg-white/10"
          )}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Chat</span>
          <Cloud className="w-4 h-4 ml-auto opacity-60" />
        </button>

        {/* Local AI Option */}
        <button
          onClick={() => handleSelectView('local-ai')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            view === 'local-ai'
              ? "bg-white text-black"
              : "bg-transparent text-white hover:bg-white/10"
          )}
        >
          <Cpu className="w-5 h-5" />
          <span className="font-medium">Local AI</span>
          <span className={cn(
            "ml-auto text-xs px-2 py-0.5 rounded-full",
            view === 'local-ai'
              ? "bg-black/20 text-black"
              : "bg-green-500/20 text-green-500"
          )}>
            Offline
          </span>
        </button>

        {/* Memories Option */}
        <button
          onClick={() => handleSelectView('memories')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            view === 'memories'
              ? "bg-white text-black"
              : "bg-transparent text-white hover:bg-white/10"
          )}
        >
          <Brain className="w-5 h-5" />
          <span className="font-medium">Memories</span>
          {memories && memories.length > 0 && (
            <span className={cn(
              "ml-auto text-xs px-2 py-0.5 rounded-full",
              view === 'memories'
                ? "bg-black/20 text-black"
                : "bg-purple-500/20 text-purple-400"
            )}>
              {memories.length}
            </span>
          )}
        </button>

        {/* Files Option */}
        <button
          onClick={() => handleSelectView('files')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            view === 'files'
              ? "bg-white text-black"
              : "bg-transparent text-white hover:bg-white/10"
          )}
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium">Files</span>
          {files && files.length > 0 && (
            <span className={cn(
              "ml-auto text-xs px-2 py-0.5 rounded-full",
              view === 'files'
                ? "bg-black/20 text-black"
                : "bg-blue-500/20 text-blue-400"
            )}>
              {files.filter(f => !f.isArchived).length}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="h-px bg-white/10 my-3" />

        {/* Settings Option */}
        <button
          onClick={() => handleSelectView('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            view === 'settings'
              ? "bg-white text-black"
              : "bg-transparent text-white hover:bg-white/10"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>

      {/* Recent Conversations */}
      {conversations && conversations.length > 0 && (
        <div className="p-3 border-t border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-2 px-2">
            Recent Chats
          </p>
          <ScrollArea className="max-h-32">
            <div className="space-y-1">
              {conversations.slice(0, 5).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleLoadConversation(conv.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all truncate"
                >
                  {conv.title}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Back to Home */}
      {onWakeWord && (
        <div className="p-3 border-t border-white/10">
          <button
            onClick={onWakeWord}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      )}
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
                {view === 'chat' ? 'Chat' : view === 'local-ai' ? 'Local AI' : view === 'memories' ? 'Memories' : view === 'files' ? 'Files' : 'Settings'}
              </h1>
              {view === 'local-ai' && (
                <Badge className="bg-green-500/20 text-green-500 text-[10px]">
                  Offline
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
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <SettingsPanel 
                  onBack={handleBack} 
                  onNavigate={(dest) => {
                    if (dest === 'memories') setView('memories');
                  }}
                />
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

            {view === 'memories' && (
              <motion.div
                key="memories"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <MemoriesPanel onBack={handleBack} />
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default ZaraAI;

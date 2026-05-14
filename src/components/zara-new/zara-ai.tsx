'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Settings, 
  Plus, 
  Wifi, 
  WifiOff,
  Menu,
  FileText,
  Scan,
  Trash2,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  FolderOpen,
  X,
} from 'lucide-react';
import { ZaraInterface } from './zara-interface';
import { ZaraCrystal } from './zara-crystal';
import { SettingsPanel } from './settings-panel';
import { FilesPanel } from './files-panel';
import { OCRPanel } from './ocr-panel';
import { NameSelectionScreen } from './name-selection-screen';
import { CleanViewMode } from './clean-view-mode';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePWA } from '@/hooks/use-pwa';
import { useDevice, useFocusNavigation } from '@/hooks/use-device';
import { useAssistantStore, getPersonality, useHydration } from '@/store/assistant-store';
import type { AIName } from '@/types/assistant';

type View = 'chat' | 'settings' | 'files' | 'ocr';

interface ZaraAIProps {
  onWakeWord?: () => void;
}

export function ZaraAI({ onWakeWord }: ZaraAIProps) {
  const [view, setView] = useState<View>('chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(true);
  const [ocrHistoryOpen, setOCRHistoryOpen] = useState(false);
  const [cleanViewActive, setCleanViewActive] = useState(false);
  const { isOnline } = usePWA();
  const hydrated = useHydration();
  const device = useDevice();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Focus navigation for TV
  const { focusedIndex, setFocusedIndex } = useFocusNavigation(
    containerRef,
    '[data-focusable]'
  );

  const {
    conversations = [],
    files = [],
    ocrHistory = [],
    createConversation,
    clearMessages,
    loadConversation,
    deleteConversation,
    deleteOCRHistory,
    settings,
    setAIName,
    completeSetup,
  } = useAssistantStore() || {};

  // Get current AI personality
  const aiNameValue = settings?.aiName || 'Zara';
  const personality = getPersonality(aiNameValue);
  const aiName = personality.displayName;

  // All hooks must be called before any early returns
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

  // Format time for history items
  const formatTime = useCallback((timestamp: number) => {
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
  }, []);

  // Show loading state during hydration
  if (!hydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-white/40">Loading...</div>
      </div>
    );
  }

  // Show name selection if setup not complete
  if (!settings?.setupComplete) {
    return <NameSelectionScreen onComplete={handleSetupComplete} />;
  }

  // ========== TV LAYOUT ==========
  if (device.isTV) {
    return (
      <div 
        ref={containerRef}
        className="h-screen flex flex-col bg-black overflow-hidden"
      >
        {/* TV Top Navigation Bar */}
        <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-black/90">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <ZaraCrystal size="sm" state="idle" color={personality.color} showGlow={false} />
            <h1 className="text-2xl font-bold text-white">{aiName} AI</h1>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'chat', icon: MessageCircle, label: 'Chat' },
              { id: 'files', icon: FolderOpen, label: 'Files' },
              { id: 'ocr', icon: Scan, label: 'OCR' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((item, index) => (
              <button
                key={item.id}
                data-focusable
                tabIndex={0}
                onClick={() => setView(item.id as View)}
                onFocus={() => setFocusedIndex(index)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-lg transition-all",
                  "focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black",
                  "focus:outline-none",
                  view === item.id
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            {isOnline ? (
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-lg text-green-500">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <WifiOff className="w-5 h-5 text-amber-500" />
                <span className="text-lg text-amber-500">Offline</span>
              </div>
            )}
          </div>
        </nav>

        {/* TV Main Content */}
        <div className="flex-1 overflow-hidden p-8">
          <AnimatePresence mode="wait">
            {view === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <ZaraInterface onHome={onWakeWord} onSettings={() => setView('settings')} />
              </motion.div>
            )}
            {view === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <SettingsPanel onBack={handleBack} />
              </motion.div>
            )}
            {view === 'files' && (
              <motion.div key="files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <FilesPanel onBack={handleBack} />
              </motion.div>
            )}
            {view === 'ocr' && (
              <motion.div key="ocr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <OCRPanel onBack={handleBack} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ========== MOBILE/TABLET LAYOUT ==========
  if (device.isMobile || device.type === 'tablet') {
    return (
      <div className="h-screen flex flex-col bg-black overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center gap-3 p-3 border-b border-white/10 bg-black flex-shrink-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-white">
                {view === 'chat' ? 'Chat' : view === 'files' ? 'Files' : view === 'ocr' ? 'OCR Scanner' : 'Settings'}
              </h1>
              {view === 'ocr' && (
                <Badge className="bg-green-500/20 text-green-500 text-[10px]">English</Badge>
              )}
            </div>
          </div>
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-amber-500" />
          )}
        </header>

        {/* Mobile Main Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                <ZaraInterface onHome={onWakeWord} onSettings={() => setView('settings')} />
              </motion.div>
            )}
            {view === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                <SettingsPanel onBack={handleBack} />
              </motion.div>
            )}
            {view === 'files' && (
              <motion.div key="files" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                <FilesPanel onBack={handleBack} />
              </motion.div>
            )}
            {view === 'ocr' && (
              <motion.div key="ocr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                <OCRPanel onBack={handleBack} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="flex items-center justify-around p-2 border-t border-white/10 bg-black">
          {[
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'files', icon: FolderOpen, label: 'Files' },
            { id: 'ocr', icon: Scan, label: 'OCR' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px]",
                view === item.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-40"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-[280px] z-50 bg-black flex flex-col"
              >
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ZaraCrystal size="sm" state="idle" color={personality.color} showGlow={false} />
                      <h1 className="font-bold text-white text-lg">{aiName} AI</h1>
                    </div>
                    <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
                      <X className="w-5 h-5 text-white/60" />
                    </button>
                  </div>
                </div>

                {/* New Chat */}
                <div className="p-3 border-b border-white/10">
                  <button
                    onClick={handleNewChat}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-black font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Chat</span>
                  </button>
                </div>

                {/* History */}
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-4">
                    {/* Chat History */}
                    <div>
                      <button
                        onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
                        className="w-full flex items-center gap-2 px-1 py-1"
                      >
                        {chatHistoryOpen ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                        <span className="text-xs text-white/40 uppercase">Chats</span>
                        {conversations.length > 0 && <span className="text-xs text-white/30">({conversations.length})</span>}
                      </button>
                      {chatHistoryOpen && conversations.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {conversations.slice(0, 5).map((conv) => (
                            <div
                              key={conv.id}
                              onClick={() => { handleLoadConversation(conv.id); setIsMobileSidebarOpen(false); }}
                              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                              <MessageSquare className="w-4 h-4 text-white/40" />
                              <span className="text-sm text-white/70 truncate">{conv.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Clean View Mode */}
        <AnimatePresence>
          {cleanViewActive && (
            <CleanViewMode isActive={cleanViewActive} onDeactivate={() => setCleanViewActive(false)} />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  // Sidebar Content Component
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-black">
      {/* Logo/Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <ZaraCrystal size="sm" state="idle" color={personality.color} showGlow={false} />
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

      {/* History Section */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {/* Chat History */}
          <div>
            <button
              onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
              className="w-full flex items-center justify-between mb-2 px-1 py-1 hover:bg-white/5 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                {chatHistoryOpen ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                <span className="text-xs text-white/40 uppercase tracking-wider">Chats</span>
              </div>
              {conversations.length > 0 && <span className="text-xs text-white/30">{conversations.length}</span>}
            </button>
            <AnimatePresence initial={false}>
              {chatHistoryOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  {conversations.length > 0 ? (
                    <div className="space-y-1">
                      {conversations.slice(0, 10).map((conv) => (
                        <div key={conv.id} className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer" onClick={() => handleLoadConversation(conv.id)}>
                          <MessageSquare className="w-4 h-4 text-white/40 flex-shrink-0" />
                          <span className="flex-1 text-sm text-white/70 truncate">{conv.title}</span>
                          <span className="text-xs text-white/30">{formatTime(conv.updatedAt)}</span>
                          <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10">
                            <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/30 px-2 py-2">No chat history</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* OCR History */}
          <div>
            <button onClick={() => setOCRHistoryOpen(!ocrHistoryOpen)} className="w-full flex items-center justify-between mb-2 px-1 py-1 hover:bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                {ocrHistoryOpen ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                <span className="text-xs text-white/40 uppercase tracking-wider">OCR Scans</span>
              </div>
              {ocrHistory.length > 0 && <span className="text-xs text-white/30">{ocrHistory.length}</span>}
            </button>
            <AnimatePresence initial={false}>
              {ocrHistoryOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  {ocrHistory.length > 0 ? (
                    <div className="space-y-1">
                      {ocrHistory.slice(0, 5).map((item) => (
                        <div key={item.id} className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer" onClick={() => { setView('ocr'); }}>
                          <Scan className="w-4 h-4 text-green-400/60 flex-shrink-0" />
                          <span className="flex-1 text-sm text-white/70 truncate">{item.text.slice(0, 25)}...</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/30 px-2 py-2">No OCR history</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <button onClick={() => handleSelectView('settings')} className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl", view === 'settings' ? "bg-white/10 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white")}>
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </button>
          <button onClick={() => handleSelectView('files')} className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl", view === 'files' ? "bg-white/10 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white")}>
            <FileText className="w-4 h-4" />
            <span className="text-sm">Files</span>
            {files.length > 0 && <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{files.filter(f => !f.isArchived).length}</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-black overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 bg-black/80 z-40" onClick={() => setIsMobileSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 p-3 border-b border-white/10 bg-black flex-shrink-0">
          <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-white">
              {view === 'chat' ? 'Chat' : view === 'files' ? 'Files' : view === 'ocr' ? 'OCR Scanner' : 'Settings'}
            </h1>
          </div>
          {isOnline ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-amber-500" />}
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                <ZaraInterface onHome={onWakeWord} onSettings={() => setView('settings')} />
              </motion.div>
            )}
            {view === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                <SettingsPanel onBack={handleBack} />
              </motion.div>
            )}
            {view === 'files' && (
              <motion.div key="files" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                <FilesPanel onBack={handleBack} />
              </motion.div>
            )}
            {view === 'ocr' && (
              <motion.div key="ocr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                <OCRPanel onBack={handleBack} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Clean View Mode */}
      <AnimatePresence>
        {cleanViewActive && <CleanViewMode isActive={cleanViewActive} onDeactivate={() => setCleanViewActive(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default ZaraAI;

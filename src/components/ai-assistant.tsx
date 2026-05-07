'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Mic,
  Zap,
  Settings,
  History,
  Menu,
  X,
  Plus,
  Sparkles,
  ArrowLeft,
  Home,
  AlarmClock,
  Music,
  Send,
  Clock,
  Clipboard,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAssistantStore } from '@/store/assistant-store';
import { ChatInterface } from './chat-interface';
import { VoiceInterface } from './voice-interface';
import { QuickTaskPanel } from './quick-task-panel';
import { AssistantSettings } from './assistant-settings';
import { AIAvatar } from './ai-avatar';
import { AlarmManager } from './alarm-manager';
import { MediaControl } from './media-control';
import { MessagingPanel } from './messaging-panel';
import { TimeTriggersPanel } from './time-triggers-panel';
import { ClipboardManager } from './clipboard-manager';
import { LocalAIPanel } from '@/components/local-ai-panel';
import { useAssistant } from '@/hooks/use-assistant';

interface AIAssistantProps {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onBack?: () => void;
}

type View = 'main' | 'history' | 'settings';
type FeatureTab = 'chat' | 'voice' | 'quick' | 'alarms' | 'media' | 'messaging' | 'triggers' | 'clipboard' | 'local-ai';

const FEATURE_TABS: { id: FeatureTab; label: string; icon: React.ElementType }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'quick', label: 'Quick', icon: Zap },
  { id: 'alarms', label: 'Alarms', icon: AlarmClock },
  { id: 'media', label: 'Media', icon: Music },
  { id: 'messaging', label: 'Messages', icon: Send },
  { id: 'triggers', label: 'Triggers', icon: Clock },
  { id: 'clipboard', label: 'Clipboard', icon: Clipboard },
  { id: 'local-ai', label: 'Local AI', icon: Cpu },
];

export function AIAssistant({ theme, onThemeChange, onBack }: AIAssistantProps) {
  const { 
    mode, 
    setMode, 
    messages, 
    conversations, 
    createConversation, 
    loadConversation, 
    clearMessages, 
    isListening: storeIsListening, 
    isSpeaking: storeIsSpeaking, 
    isProcessing: storeIsProcessing 
  } = useAssistantStore();
  const [view, setView] = useState<View>('main');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FeatureTab>('chat');

  const {
    sendMessage,
    isTyping,
    startListening,
    stopListening,
    isListening,
    transcript,
    isSpeaking,
    isVoiceSupported,
    isProcessing,
  } = useAssistant();

  const handleNewChat = () => {
    createConversation();
    clearMessages();
    setView('main');
    setIsSidebarOpen(false);
  };

  const handleLoadConversation = (id: string) => {
    loadConversation(id);
    setView('main');
    setIsSidebarOpen(false);
  };

  const renderFeatureContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <ChatInterface
            messages={messages}
            isTyping={isTyping}
            isProcessing={isProcessing}
            isListening={isListening}
            isVoiceSupported={isVoiceSupported}
            onSendMessage={sendMessage}
            onStartListening={startListening}
            onStopListening={stopListening}
          />
        );
      case 'voice':
        return (
          <VoiceInterface
            isListening={isListening}
            isSpeaking={isSpeaking}
            isProcessing={isProcessing}
            transcript={transcript}
            isVoiceSupported={isVoiceSupported}
            onStartListening={startListening}
            onStopListening={stopListening}
            onSendMessage={sendMessage}
          />
        );
      case 'quick':
        return <QuickTaskPanel />;
      case 'alarms':
        return <AlarmManager />;
      case 'media':
        return <MediaControl />;
      case 'messaging':
        return <MessagingPanel />;
      case 'triggers':
        return <TimeTriggersPanel />;
      case 'clipboard':
        return <ClipboardManager />;
      case 'local-ai':
        return <LocalAIPanel />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (view === 'history') {
      return (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chat History</h2>
            <Button variant="ghost" size="sm" onClick={() => setView('main')}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            {conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start chatting to see history</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => handleLoadConversation(conv.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      );
    }

    if (view === 'settings') {
      return (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Settings</h2>
            <Button variant="ghost" size="sm" onClick={() => setView('main')}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <AssistantSettings theme={theme} onThemeChange={onThemeChange} />
          </ScrollArea>
        </div>
      );
    }

    // Main view with feature tabs
    return (
      <div className="flex flex-col h-full">
        {/* Feature Tabs - Desktop */}
        <div className="hidden md:block border-b">
          <div className="flex items-center justify-between p-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeatureTab)} className="flex-1">
              <TabsList className="bg-transparent gap-1 h-auto flex-wrap">
                {FEATURE_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 px-3 py-1.5"
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Right side buttons */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleNewChat}>
                <Plus className="w-4 h-4" />
              </Button>
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Zara AI
                      </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-2">
                        {onBack && (
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => {
                              setIsSidebarOpen(false);
                              onBack();
                            }}
                          >
                            <Home className="w-4 h-4" />
                            Back to Home
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={handleNewChat}
                        >
                          <Plus className="w-4 h-4" />
                          New Chat
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => {
                            setView('history');
                            setIsSidebarOpen(false);
                          }}
                        >
                          <History className="w-4 h-4" />
                          History
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => {
                            setView('settings');
                            setIsSidebarOpen(false);
                          }}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Button>
                      </div>

                      {/* Quick Conversations */}
                      {conversations.length > 0 && (
                        <div className="p-4 border-t">
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Recent
                          </p>
                          <div className="space-y-1">
                            {conversations.slice(0, 5).map((conv) => (
                              <Button
                                key={conv.id}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left"
                                onClick={() => handleLoadConversation(conv.id)}
                              >
                                <span className="truncate">{conv.title}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              {renderFeatureContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="mr-1">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <AIAvatar
              isListening={storeIsListening}
              isSpeaking={storeIsSpeaking}
              isProcessing={storeIsProcessing}
              size="sm"
            />
            <div>
              <h1 className="font-semibold text-lg">Zara AI Assistant</h1>
              <p className="text-xs text-muted-foreground">
                {storeIsListening ? 'Listening...' : storeIsSpeaking ? 'Speaking...' : storeIsProcessing ? 'Processing...' : 'Ready to help'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-auto">
        <div className="flex items-center justify-start gap-1 p-2 min-w-max">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex-col h-auto py-2 px-3"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1">Home</span>
            </Button>
          )}
          {FEATURE_TABS.slice(0, 5).map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex-col h-auto py-2 px-3"
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{tab.label}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Show more options - for now just toggle settings
              setView(view === 'settings' ? 'main' : 'settings');
            }}
            className="flex-col h-auto py-2 px-3"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}

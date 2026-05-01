'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAssistantStore } from '@/store/assistant-store';
import { 
  MessageSquare, 
  Mic, 
  ListTodo, 
  History, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import type { AssistantMode } from '@/types/assistant';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  mode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
  sidebarContent?: React.ReactNode;
}

const navItems = [
  { id: 'chat' as AssistantMode, label: 'Chat', icon: MessageSquare },
  { id: 'voice' as AssistantMode, label: 'Voice', icon: Mic },
  { id: 'tasks' as AssistantMode, label: 'Tasks', icon: ListTodo },
];

const sidebarItems = [
  { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
  { id: 'history' as const, label: 'History', icon: History },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function ResponsiveLayout({ 
  children, 
  mode, 
  onModeChange,
  sidebarContent 
}: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState<'chat' | 'history' | 'settings'>('chat');
  const [windowWidth, setWindowWidth] = useState(0);
  
  const { chatHistory } = useAssistantStore();

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isMobile = windowWidth < 640;

  // Desktop layout with sidebar
  if (isDesktop) {
    return (
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className="w-64 border-r bg-card/50 backdrop-blur-sm flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              AI Assistant
            </h1>
          </div>

          {/* Mode tabs */}
          <div className="p-2 border-b">
            <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={mode === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onModeChange(item.id)}
                  className={cn(
                    'flex-1 flex-col gap-1 h-auto py-2',
                    mode === item.id && 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Sidebar navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSidebarItem === item.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveSidebarItem(item.id)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.id === 'history' && chatHistory.length > 0 && (
                    <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {chatHistory.length}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </nav>

          {/* Sidebar content */}
          {sidebarContent && (
            <ScrollArea className="flex-1">
              <div className="p-2">
                {sidebarContent}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // Mobile/Tablet layout
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile header */}
      <div className="flex items-center justify-between p-3 border-b bg-card/50 backdrop-blur-sm lg:hidden">
        <h1 className="text-lg font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
          AI Assistant
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-card border-l shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <ScrollArea className="p-4 h-[calc(100%-60px)]">
              <div className="space-y-4">
                {/* Sidebar items for mobile */}
                {sidebarItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      setActiveSidebarItem(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.id === 'history' && chatHistory.length > 0 && (
                      <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {chatHistory.length}
                      </span>
                    )}
                  </Button>
                ))}

                <hr className="my-4" />

                {/* Settings preview */}
                {sidebarContent}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden pb-16">
        {children}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onModeChange(item.id)}
              className={cn(
                'flex-1 flex-col gap-1 h-auto py-3 rounded-none',
                mode === item.id && 'text-primary bg-primary/10'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

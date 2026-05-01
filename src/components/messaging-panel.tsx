'use client';

import React from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MessagingPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Messaging
        </h2>
        <p className="text-sm text-muted-foreground">Send messages across platforms</p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="text-center text-muted-foreground py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Multi-platform messaging</p>
          <p className="text-sm">SMS, WhatsApp, Telegram, Email, and more</p>
        </div>
      </ScrollArea>
    </div>
  );
}

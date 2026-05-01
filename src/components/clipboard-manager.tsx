'use client';

import React from 'react';
import { Clipboard, Copy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ClipboardManager() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clipboard className="w-5 h-5 text-primary" />
          Clipboard
        </h2>
        <p className="text-sm text-muted-foreground">Manage clipboard history</p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="text-center text-muted-foreground py-8">
          <Copy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Clipboard history</p>
          <p className="text-sm">Access and manage copied items</p>
        </div>
      </ScrollArea>
    </div>
  );
}

'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TimeTriggersPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Time Triggers
        </h2>
        <p className="text-sm text-muted-foreground">Schedule automated actions</p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="text-center text-muted-foreground py-8">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Time-based triggers</p>
          <p className="text-sm">Schedule actions at specific times or intervals</p>
        </div>
      </ScrollArea>
    </div>
  );
}

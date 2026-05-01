'use client';

import React from 'react';
import { AlarmClock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AlarmManager() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlarmClock className="w-5 h-5 text-primary" />
          Alarms
        </h2>
        <p className="text-sm text-muted-foreground">Manage your alarms</p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="text-center text-muted-foreground py-8">
          <AlarmClock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Alarm management coming soon</p>
          <p className="text-sm">Set and manage alarms with voice commands</p>
        </div>
      </ScrollArea>
    </div>
  );
}

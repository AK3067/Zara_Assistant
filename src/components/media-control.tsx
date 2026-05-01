'use client';

import React from 'react';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MediaControl() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          Media Control
        </h2>
        <p className="text-sm text-muted-foreground">Control your media playback</p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center py-8 gap-6">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
            <Music className="w-16 h-16 text-primary/50" />
          </div>
          <h3 className="text-xl font-semibold">No media playing</h3>
          <p className="text-sm text-muted-foreground">Play music to control it here</p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon"><SkipBack className="w-5 h-5" /></Button>
            <Button size="lg" className="w-14 h-14 rounded-full"><Play className="w-6 h-6" /></Button>
            <Button variant="outline" size="icon"><SkipForward className="w-5 h-5" /></Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

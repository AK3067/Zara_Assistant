'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAssistantStore } from '@/store/assistant-store';
import { 
  History, 
  Trash2, 
  MessageSquare,
  ChevronRight 
} from 'lucide-react';
import type { ChatHistory } from '@/types/assistant';

interface ChatHistoryProps {
  className?: string;
  onSelectChat?: () => void;
}

function HistoryItem({ 
  history, 
  onLoad, 
  onDelete 
}: { 
  history: ChatHistory;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const preview = history.messages[history.messages.length - 1]?.content.slice(0, 80) || '';
  
  return (
    <Card className="group hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0" onClick={onLoad}>
            <h4 className="font-medium text-sm truncate">{history.title}</h4>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {preview}...
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <MessageSquare className="w-3 h-3" />
              <span>{history.messages.length} messages</span>
              <span>•</span>
              <span>{new Date(history.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onLoad();
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChatHistoryPanel({ className, onSelectChat }: ChatHistoryProps) {
  const { chatHistory, loadFromHistory, deleteFromHistory, clearHistory } = useAssistantStore();

  const handleLoad = (id: string) => {
    loadFromHistory(id);
    onSelectChat?.();
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5" />
          <h2 className="font-semibold">Chat History</h2>
        </div>
        {chatHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* History list */}
      <ScrollArea className="flex-1 p-4">
        {chatHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No chat history yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your conversations will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chatHistory.map((history) => (
              <HistoryItem
                key={history.id}
                history={history}
                onLoad={() => handleLoad(history.id)}
                onDelete={() => deleteFromHistory(history.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

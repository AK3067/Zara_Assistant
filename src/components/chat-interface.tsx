'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/assistant';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  isProcessing: boolean;
  isListening: boolean;
  isVoiceSupported: boolean;
  onSendMessage: (content: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
}

export function ChatInterface({
  messages,
  isTyping,
  isProcessing,
  isListening,
  isVoiceSupported,
  onSendMessage,
  onStartListening,
  onStopListening,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Copy message content
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                )}

                <div
                  className={cn(
                    'relative group max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 backdrop-blur-sm'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !match;
                            return !isInline ? (
                              <div className="relative group/code">
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-lg !mt-0 !mb-2"
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover/code:opacity-100 transition-opacity"
                                  onClick={() =>
                                    copyToClipboard(String(children), `${message.id}-code`)
                                  }
                                >
                                  {copiedId === `${message.id}-code` ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}

                  {/* Copy button for assistant messages */}
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -right-2 top-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(message.content, message.id)}
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}

                  {/* Voice indicator */}
                  {message.isVoice && (
                    <div className="absolute -bottom-1 -right-1">
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <Mic className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary-foreground">You</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
              <div className="bg-muted/50 backdrop-blur-sm rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground/50"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground/50"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground/50"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background/80 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isProcessing}
                className="min-h-[44px] max-h-[120px] resize-none pr-12"
                rows={1}
              />
            </div>

            {/* Voice Input Button */}
            {isVoiceSupported && (
              <Button
                type="button"
                variant={isListening ? 'destructive' : 'outline'}
                size="icon"
                onClick={isListening ? onStopListening : onStartListening}
                disabled={isProcessing}
                className="shrink-0"
              >
                {isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <MicOff className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Send Button */}
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isProcessing}
              className="shrink-0"
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

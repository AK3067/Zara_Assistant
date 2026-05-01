'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Bell,
  FileText,
  Timer,
  Plus,
  Check,
  Trash2,
  Clock,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAssistantStore } from '@/store/assistant-store';
import type { Task } from '@/types/assistant';

const TASK_TYPES = [
  { id: 'message', icon: MessageSquare, label: 'Send Message', color: 'bg-blue-500' },
  { id: 'call', icon: Phone, label: 'Make Call', color: 'bg-green-500' },
  { id: 'reminder', icon: Bell, label: 'Set Reminder', color: 'bg-amber-500' },
  { id: 'note', icon: FileText, label: 'Quick Note', color: 'bg-purple-500' },
  { id: 'timer', icon: Timer, label: 'Set Timer', color: 'bg-rose-500' },
] as const;

export function TaskPanel() {
  const { tasks, addTask, updateTask, deleteTask } = useAssistantStore();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleCreateTask = () => {
    if (!selectedType) return;

    const taskData: Record<string, unknown> = {
      type: selectedType,
      title: formData.title || `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Task`,
    };

    if (selectedType === 'message' && formData.recipient && formData.content) {
      taskData.title = `Message to ${formData.recipient}`;
      taskData.description = formData.content;
    } else if (selectedType === 'call' && formData.phoneNumber) {
      taskData.title = `Call ${formData.phoneNumber}`;
      taskData.phoneNumber = formData.phoneNumber;
    } else if (selectedType === 'reminder' && formData.datetime) {
      taskData.title = formData.title || 'Reminder';
      taskData.scheduledTime = new Date(formData.datetime).getTime();
      taskData.description = formData.description;
    } else if (selectedType === 'note' && formData.content) {
      taskData.title = formData.title || 'Note';
      taskData.description = formData.content;
    } else if (selectedType === 'timer' && formData.duration) {
      taskData.title = `Timer: ${formData.duration} minutes`;
      taskData.duration = parseInt(formData.duration) * 60 * 1000;
    }

    addTask(taskData as Omit<Task, 'id' | 'createdAt' | 'completed'>);
    setSelectedType(null);
    setFormData({});
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Task Type Selection */}
      {!selectedType ? (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TASK_TYPES.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', type.color)}>
                      <type.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{type.label}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Active Tasks */}
          {tasks.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Active Tasks</h3>
              <ScrollArea className="h-[calc(100vh-450px)]">
                <div className="space-y-2">
                  <AnimatePresence>
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Card className={cn(
                          'transition-colors',
                          task.completed && 'opacity-60'
                        )}>
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                              TASK_TYPES.find(t => t.id === task.type)?.color || 'bg-gray-500'
                            )}>
                              {React.createElement(
                                TASK_TYPES.find(t => t.id === task.type)?.icon || Timer,
                                { className: 'w-4 h-4 text-white' }
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{task.title}</p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                              )}
                              {task.scheduledTime && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(task.scheduledTime)}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => updateTask(task.id, { completed: !task.completed })}
                              >
                                <Check className={cn('w-4 h-4', task.completed && 'text-green-500')} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      ) : (
        /* Task Form */
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedType(null);
              setFormData({});
            }}
            className="mb-4"
          >
            ← Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(
                  TASK_TYPES.find(t => t.id === selectedType)?.icon || Timer,
                  { className: 'w-5 h-5' }
                )}
                {TASK_TYPES.find(t => t.id === selectedType)?.label}
              </CardTitle>
              <CardDescription>
                Fill in the details below to create your task.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedType === 'message' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient</Label>
                    <Input
                      id="recipient"
                      placeholder="Enter name or phone number"
                      value={formData.recipient || ''}
                      onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      placeholder="Type your message..."
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
                </>
              )}

              {selectedType === 'call' && (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
              )}

              {selectedType === 'reminder' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Reminder title"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="datetime">Date & Time</Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={formData.datetime || ''}
                      onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add details..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </>
              )}

              {selectedType === 'note' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Note title"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your note..."
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
                </>
              )}

              {selectedType === 'timer' && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="1440"
                    placeholder="Enter minutes"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              )}

              <Button onClick={handleCreateTask} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

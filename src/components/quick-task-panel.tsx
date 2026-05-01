'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  Phone,
  Bell,
  FileText,
  Timer,
  Mail,
  Search,
  ExternalLink,
  Sparkles,
  Mic,
  MicOff,
  Star,
  StarOff,
  GripVertical,
  Wand2,
  Play,
  Volume2,
  Info,
  Hash,
  AtSign,
  Clock,
  Link,
  Type,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useAssistantStore } from '@/store/assistant-store';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import type { QuickTask, QuickTaskAction, TaskParameter, ParameterType } from '@/types/assistant';

const ACTION_CONFIG: Record<QuickTaskAction, { icon: React.ElementType; label: string; description: string; color: string }> = {
  send_message: { icon: MessageSquare, label: 'Send Message', description: 'Send a quick message', color: 'bg-blue-500' },
  make_call: { icon: Phone, label: 'Make Call', description: 'Make a phone call', color: 'bg-green-500' },
  set_reminder: { icon: Bell, label: 'Set Reminder', description: 'Set a reminder', color: 'bg-amber-500' },
  create_note: { icon: FileText, label: 'Create Note', description: 'Create a quick note', color: 'bg-purple-500' },
  start_timer: { icon: Timer, label: 'Start Timer', description: 'Start a countdown timer', color: 'bg-rose-500' },
  send_email: { icon: Mail, label: 'Send Email', description: 'Send an email', color: 'bg-cyan-500' },
  search_web: { icon: Search, label: 'Search Web', description: 'Search the internet', color: 'bg-indigo-500' },
  open_app: { icon: ExternalLink, label: 'Open App/URL', description: 'Open an app or website', color: 'bg-teal-500' },
  custom_command: { icon: Sparkles, label: 'Custom AI Command', description: 'Run a custom AI prompt', color: 'bg-violet-500' },
  voice_macro: { icon: Wand2, label: 'Voice Macro', description: 'Voice-recorded action sequence', color: 'bg-pink-500' },
};

const PARAMETER_ICONS: Record<ParameterType, React.ElementType> = {
  number: Hash,
  text: Type,
  contact: AtSign,
  time: Clock,
  date: Clock,
  url: Link,
};

const PARAMETER_PLACEHOLDERS: Record<ParameterType, string> = {
  number: 'e.g., 123',
  text: 'e.g., hello world',
  contact: 'e.g., John',
  time: 'e.g., 5 minutes',
  date: 'e.g., tomorrow',
  url: 'e.g., https://example.com',
};

interface QuickTaskPanelProps {
  onTaskTriggered?: (task: QuickTask) => void;
}

export function QuickTaskPanel({ onTaskTriggered }: QuickTaskPanelProps) {
  const { quickTasks, addQuickTask, updateQuickTask, deleteQuickTask, triggerQuickTask } = useAssistantStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordingMode, setRecordingMode] = useState<'none' | 'trigger' | 'action'>('none');
  const [formData, setFormData] = useState<Partial<QuickTask>>({
    trigger: '',
    action: 'send_message',
    label: '',
    color: 'bg-blue-500',
    description: '',
    parameters: [],
    data: {},
  });

  // Speech recognition for voice recording
  const {
    isListening: isVoiceListening,
    transcript: voiceTranscript,
    isSupported: isVoiceSupported,
    startListening: startVoiceRecording,
    stopListening: stopVoiceRecording,
    resetTranscript,
  } = useSpeechRecognition({
    onResult: (text) => {
      if (recordingMode === 'trigger') {
        setFormData(prev => ({ ...prev, trigger: text.toLowerCase().trim() }));
      } else if (recordingMode === 'action') {
        setFormData(prev => ({
          ...prev,
          data: { ...prev.data, voiceMacro: text },
          description: text,
        }));
      }
    },
    continuous: false,
    interimResults: true,
  });

  // Speech synthesis for testing
  const { speak, isSpeaking, isSupported: isSynthesisSupported } = useSpeechSynthesis();

  const resetForm = () => {
    setFormData({
      trigger: '',
      action: 'send_message',
      label: '',
      color: 'bg-blue-500',
      description: '',
      parameters: [],
      data: {},
    });
    setIsCreating(false);
    setEditingId(null);
    setRecordingMode('none');
    resetTranscript();
  };

  const handleSave = () => {
    if (!formData.trigger || !formData.action) return;

    // Generate trigger pattern if parameters exist
    let triggerPattern = formData.trigger;
    if (formData.parameters && formData.parameters.length > 0) {
      formData.parameters.forEach(param => {
        triggerPattern = triggerPattern.replace(
          `{${param.name}}`,
          `(?<${param.name}>.+)`
        );
      });
    }

    const taskData = {
      trigger: formData.trigger?.toLowerCase().trim() || '',
      triggerPattern: triggerPattern !== formData.trigger ? triggerPattern : undefined,
      action: formData.action || 'send_message',
      label: formData.label || ACTION_CONFIG[formData.action || 'send_message'].label,
      color: formData.color || ACTION_CONFIG[formData.action || 'send_message'].color,
      description: formData.description,
      parameters: formData.parameters,
      data: formData.data,
      isVoiceRecorded: recordingMode === 'action' && !!formData.data?.voiceMacro,
    };

    if (editingId) {
      updateQuickTask(editingId, taskData);
    } else {
      addQuickTask(taskData);
    }
    resetForm();
  };

  const startEdit = (task: QuickTask) => {
    setFormData({
      trigger: task.trigger,
      triggerPattern: task.triggerPattern,
      action: task.action,
      label: task.label,
      color: task.color,
      description: task.description,
      parameters: task.parameters,
      data: task.data,
    });
    setEditingId(task.id);
    setIsCreating(true);
  };

  const handleTriggerTask = (task: QuickTask) => {
    triggerQuickTask(task.id);
    onTaskTriggered?.(task);
  };

  const toggleFavorite = (taskId: string, currentValue: boolean) => {
    updateQuickTask(taskId, { isFavorite: !currentValue });
  };

  const addParameter = () => {
    const newParam: TaskParameter = {
      name: `param${(formData.parameters?.length || 0) + 1}`,
      type: 'text',
      placeholder: 'Enter value',
      required: true,
    };
    setFormData(prev => ({
      ...prev,
      parameters: [...(prev.parameters || []), newParam],
    }));
  };

  const updateParameter = (index: number, updates: Partial<TaskParameter>) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters?.map((p, i) => i === index ? { ...p, ...updates } : p),
    }));
  };

  const removeParameter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters?.filter((_, i) => i !== index),
    }));
  };

  const handleVoiceRecord = (mode: 'trigger' | 'action') => {
    if (isVoiceListening) {
      stopVoiceRecording();
      setRecordingMode('none');
    } else {
      setRecordingMode(mode);
      resetTranscript();
      startVoiceRecording();
    }
  };

  const renderParameterFields = () => (
    <div className="space-y-3 mt-4 p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Dynamic Parameters</Label>
        <Button variant="ghost" size="sm" onClick={addParameter}>
          <Plus className="w-4 h-4 mr-1" />
          Add Parameter
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Add placeholders like {`{contact}`} or {`{number}`} in your trigger word, then define them below.
      </p>

      <AnimatePresence>
        {formData.parameters?.map((param, index) => {
          const ParamIcon = PARAMETER_ICONS[param.type];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 items-start p-2 bg-background rounded border"
            >
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={param.name}
                    onChange={(e) => updateParameter(index, { name: e.target.value })}
                    placeholder="name"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={param.type}
                    onValueChange={(value: ParameterType) => updateParameter(index, { type: value })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number"><Hash className="w-3 h-3 inline mr-1" />Number</SelectItem>
                      <SelectItem value="text"><Type className="w-3 h-3 inline mr-1" />Text</SelectItem>
                      <SelectItem value="contact"><AtSign className="w-3 h-3 inline mr-1" />Contact</SelectItem>
                      <SelectItem value="time"><Clock className="w-3 h-3 inline mr-1" />Time</SelectItem>
                      <SelectItem value="date"><Clock className="w-3 h-3 inline mr-1" />Date</SelectItem>
                      <SelectItem value="url"><Link className="w-3 h-3 inline mr-1" />URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => removeParameter(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {(!formData.parameters || formData.parameters.length === 0) && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No parameters added. Use {`{paramName}`} in your trigger word.
        </p>
      )}
    </div>
  );

  const renderActionDataFields = () => {
    const action = formData.action;
    
    return (
      <div className="space-y-3 mt-4 p-3 bg-muted/50 rounded-lg">
        {action === 'voice_macro' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Voice-Recorded Action</Label>
              <Button
                variant={recordingMode === 'action' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleVoiceRecord('action')}
                disabled={!isVoiceSupported}
              >
                {isVoiceListening && recordingMode === 'action' ? (
                  <>
                    <MicOff className="w-4 h-4 mr-1" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-1" />
                    Record by Voice
                  </>
                )}
              </Button>
            </div>
            {isVoiceListening && recordingMode === 'action' && (
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Listening... Say what this shortcut should do</span>
              </div>
            )}
            {voiceTranscript && recordingMode === 'action' && (
              <p className="text-sm text-muted-foreground">Heard: "{voiceTranscript}"</p>
            )}
            <Input
              placeholder="e.g., 'Send a message to Mom saying I'll be late'"
              value={formData.data?.voiceMacro || ''}
              onChange={(e) => setFormData({
                ...formData,
                data: { ...formData.data, voiceMacro: e.target.value },
                description: e.target.value,
              })}
            />
            <p className="text-xs text-muted-foreground">
              Describe what this shortcut should do. Zara will use AI to execute it.
            </p>
          </div>
        )}
        
        {action === 'send_message' && (
          <div className="space-y-2">
            <Label>Default Recipient</Label>
            <Input
              placeholder="Contact name or phone number"
              value={formData.data?.recipient || ''}
              onChange={(e) => setFormData({
                ...formData,
                data: { ...formData.data, recipient: e.target.value }
              })}
            />
          </div>
        )}
        
        {action === 'make_call' && (
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              placeholder="+1 (555) 000-0000"
              value={formData.data?.phoneNumber || ''}
              onChange={(e) => setFormData({
                ...formData,
                data: { ...formData.data, phoneNumber: e.target.value }
              })}
            />
          </div>
        )}
        
        {action === 'send_email' && (
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={formData.data?.emailAddress || ''}
              onChange={(e) => setFormData({
                ...formData,
                data: { ...formData.data, emailAddress: e.target.value }
              })}
            />
          </div>
        )}
        
        {action === 'start_timer' && (
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              min="1"
              max="1440"
              placeholder="5"
              value={formData.data?.duration || ''}
              onChange={(e) => setFormData({
                ...formData,
                data: { ...formData.data, duration: parseInt(e.target.value) }
              })}
            />
          </div>
        )}
        
        {action === 'set_reminder' && (
          <div className="space-y-2">
            <Label>Default Reminder Text</Label>
            <Input
              placeholder="Remind me to..."
              value={formData.data?.reminderText || ''}
              onChange={(e) => setFormData({
                ...formData,
                data: { ...formData.data, reminderText: e.target.value }
              })}
            />
          </div>
        )}
        
        {action === 'create_note' && (
          <div className="space-y-2">
            <Label>Note Title</Label>
            <Input
              placeholder="Quick note..."
              value={formData.data?.noteTitle || ''}
              onChange={(e) => setFormData({
                ...formData,
                data: { ...formData.data, noteTitle: e.target.value }
              })}
            />
          </div>
        )}
        
        {action === 'open_app' && (
          <div className="space-y-2">
            <Label>URL or App</Label>
            <Input
              placeholder="https://example.com or app name"
              value={formData.data?.url || ''}
              onChange={(e) => setFormData({
                ...formData,
                data: { ...formData.data, url: e.target.value }
              })}
            />
          </div>
        )}
        
        {action === 'custom_command' && (
          <div className="space-y-2">
            <Label>Custom AI Prompt</Label>
            <Input
              placeholder="What should I do?"
              value={formData.data?.customPrompt || ''}
              onChange={(e) => setFormData({
                ...formData,
                data: { ...formData.data, customPrompt: e.target.value }
              })}
            />
          </div>
        )}

        {/* AI Prompt Template - for all action types */}
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-sm">AI Prompt Template (Optional)</Label>
          <Input
            placeholder="e.g., 'Send a message to {contact} saying {message}'"
            value={formData.data?.aiPromptTemplate || ''}
            onChange={(e) => setFormData({
              ...formData,
              data: { ...formData.data, aiPromptTemplate: e.target.value }
            })}
          />
          <p className="text-xs text-muted-foreground">
            Use parameter names in {`{brackets}`} to create dynamic prompts
          </p>
        </div>
      </div>
    );
  };

  // Group tasks by category
  const favoriteTasks = quickTasks.filter(t => t.isFavorite);
  const otherTasks = quickTasks.filter(t => !t.isFavorite);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Tasks
            </h2>
            <p className="text-sm text-muted-foreground">
              Voice shortcuts for instant actions
            </p>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Create/Edit Form */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {editingId ? 'Edit Quick Task' : 'New Quick Task'}
                    </CardTitle>
                    <CardDescription>
                      Create a voice shortcut with optional dynamic parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Trigger Word */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Trigger Word / Phrase</Label>
                        <Button
                          variant={recordingMode === 'trigger' ? 'destructive' : 'ghost'}
                          size="sm"
                          onClick={() => handleVoiceRecord('trigger')}
                          disabled={!isVoiceSupported}
                        >
                          {isVoiceListening && recordingMode === 'trigger' ? (
                            <MicOff className="w-4 h-4" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <Input
                        placeholder="e.g., '1', 'email', 'call {contact}', 'timer {number}'"
                        value={formData.trigger}
                        onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                      />
                      {isVoiceListening && recordingMode === 'trigger' && (
                        <p className="text-xs text-primary animate-pulse">Listening...</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Use {`{param}`} for dynamic values (e.g., "call {contact}" matches "call mom")
                      </p>
                    </div>

                    {/* Action */}
                    <div className="space-y-2">
                      <Label>Action Type</Label>
                      <Select
                        value={formData.action}
                        onValueChange={(value: QuickTaskAction) => 
                          setFormData({ 
                            ...formData, 
                            action: value,
                            color: ACTION_CONFIG[value].color,
                            label: ACTION_CONFIG[value].label,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <config.icon className="w-4 h-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Label */}
                    <div className="space-y-2">
                      <Label>Display Label</Label>
                      <Input
                        placeholder="e.g., 'Call Mom', 'Work Email'"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Input
                        placeholder="What does this shortcut do?"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    {/* Parameters */}
                    {renderParameterFields()}

                    {/* Action-specific data fields */}
                    {renderActionDataFields()}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSave} className="flex-1">
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={resetForm}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Favorite Tasks */}
          {favoriteTasks.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                Favorites
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {favoriteTasks.map((task) => {
                  const config = ACTION_CONFIG[task.action];
                  const Icon = config.icon;
                  
                  return (
                    <QuickTaskCard
                      key={task.id}
                      task={task}
                      config={config}
                      Icon={Icon}
                      onTrigger={handleTriggerTask}
                      onEdit={startEdit}
                      onDelete={deleteQuickTask}
                      onToggleFavorite={toggleFavorite}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Other Tasks Grid */}
          {otherTasks.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {otherTasks.map((task) => {
                const config = ACTION_CONFIG[task.action];
                const Icon = config.icon;
                
                return (
                  <QuickTaskCard
                    key={task.id}
                    task={task}
                    config={config}
                    Icon={Icon}
                    onTrigger={handleTriggerTask}
                    onEdit={startEdit}
                    onDelete={deleteQuickTask}
                    onToggleFavorite={toggleFavorite}
                  />
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {quickTasks.length === 0 && !isCreating && (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No quick tasks yet</p>
              <p className="text-sm">Create voice shortcuts for instant actions</p>
              <Button className="mt-4" onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Quick Task
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Help Section */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Quick Tips:</p>
            <ul className="space-y-0.5">
              <li>• Say the trigger word during voice mode to execute instantly</li>
              <li>• Use {`{parameter}`} for dynamic values (e.g., "timer {number}")</li>
              <li>• Star your favorite shortcuts for quick access</li>
              <li>• Voice Macro lets AI understand your custom commands</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Task Card Component
interface QuickTaskCardProps {
  task: QuickTask;
  config: { icon: React.ElementType; label: string; description: string; color: string };
  Icon: React.ElementType;
  onTrigger: (task: QuickTask) => void;
  onEdit: (task: QuickTask) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, currentValue: boolean) => void;
}

function QuickTaskCard({ task, config, Icon, onTrigger, onEdit, onDelete, onToggleFavorite }: QuickTaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <Card
        className="cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
        onClick={() => onTrigger(task)}
      >
        {/* Color accent */}
        <div className={cn('absolute top-0 left-0 right-0 h-1', task.color || config.color)} />
        
        <CardContent className="p-4 pt-5">
          <div className="flex flex-col items-center text-center gap-2">
            {/* Icon */}
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              task.color || config.color
            )}>
              <Icon className="w-5 h-5 text-white" />
            </div>

            {/* Trigger */}
            <Badge variant="outline" className="font-mono text-xs">
              "{task.trigger}"
            </Badge>

            {/* Label */}
            <p className="font-medium text-sm truncate w-full">
              {task.label}
            </p>

            {/* Description or parameters */}
            {task.description && (
              <p className="text-xs text-muted-foreground truncate w-full">
                {task.description}
              </p>
            )}

            {/* Parameters indicator */}
            {task.parameters && task.parameters.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-center">
                {task.parameters.map((p, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {`{${p.name}}`}
                  </Badge>
                ))}
              </div>
            )}

            {/* Voice recorded indicator */}
            {task.isVoiceRecorded && (
              <Badge variant="secondary" className="text-xs">
                <Mic className="w-3 h-3 mr-1" />
                Voice
              </Badge>
            )}

            {/* Usage count */}
            {task.usageCount && task.usageCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Used {task.usageCount}x
              </p>
            )}
          </div>

          {/* Action buttons on hover */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(task.id, task.isFavorite || false);
              }}
            >
              {task.isFavorite ? (
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              ) : (
                <StarOff className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

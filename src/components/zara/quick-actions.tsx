'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  Mic,
  Camera,
  Search,
  Settings,
  Home,
  Bell,
  Clock,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Music,
  Navigation,
  Zap,
  Star,
  Heart,
  Bookmark,
  Trash2,
  Edit3,
  Copy,
  Share2,
  Download,
  Plus,
  Minus,
  Move,
  GripVertical,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { QuickAction, SwipeAction, GestureConfig } from '@/types/zara-advanced';

// ===== GESTURE RECOGNITION HOOK =====

interface GestureState {
  type: 'tap' | 'double_tap' | 'long_press' | 'swipe_left' | 'swipe_right' | 'swipe_up' | 'swipe_down' | 'pinch' | 'spread' | null;
  direction: string | null;
  points: Array<{ x: number; y: number; timestamp: number }>;
}

export function useGestureRecognition(
  onGesture: (gesture: GestureState) => void,
  options: { swipeThreshold?: number; longPressDelay?: number } = {}
) {
  const { swipeThreshold = 50, longPressDelay = 500 } = options;
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTap = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const gestureState = useRef<GestureState>({
    type: null,
    direction: null,
    points: [],
  });

  const handleStart = useCallback((x: number, y: number) => {
    touchStart.current = { x, y, time: Date.now() };
    gestureState.current = { type: null, direction: null, points: [{ x, y, timestamp: Date.now() }] };

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      gestureState.current.type = 'long_press';
      onGesture(gestureState.current);
    }, longPressDelay);
  }, [longPressDelay, onGesture]);

  const handleMove = useCallback((x: number, y: number) => {
    if (gestureState.current.points.length < 50) {
      gestureState.current.points.push({ x, y, timestamp: Date.now() });
    }
  }, []);

  const handleEnd = useCallback((x: number, y: number) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (!touchStart.current) return;

    const dx = x - touchStart.current.x;
    const dy = y - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;

    // Check for swipe
    if (Math.abs(dx) > swipeThreshold || Math.abs(dy) > swipeThreshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        gestureState.current.type = dx > 0 ? 'swipe_right' : 'swipe_left';
        gestureState.current.direction = dx > 0 ? 'right' : 'left';
      } else {
        gestureState.current.type = dy > 0 ? 'swipe_down' : 'swipe_up';
        gestureState.current.direction = dy > 0 ? 'down' : 'up';
      }
    }
    // Check for tap
    else if (dt < 300) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        gestureState.current.type = 'double_tap';
        lastTap.current = 0;
      } else {
        gestureState.current.type = 'tap';
        lastTap.current = now;
      }
    }

    if (gestureState.current.type) {
      onGesture(gestureState.current);
    }

    touchStart.current = null;
  }, [swipeThreshold, onGesture]);

  return {
    handlers: {
      onTouchStart: (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      },
      onTouchMove: (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        const touch = e.changedTouches[0];
        handleEnd(touch.clientX, touch.clientY);
      },
      onMouseDown: (e: React.MouseEvent) => {
        handleStart(e.clientX, e.clientY);
      },
      onMouseMove: (e: React.MouseEvent) => {
        handleMove(e.clientX, e.clientY);
      },
      onMouseUp: (e: React.MouseEvent) => {
        handleEnd(e.clientX, e.clientY);
      },
    },
  };
}

// ===== FLOATING ACTION BUTTONS =====

interface FABGroupProps {
  actions: QuickAction[];
  onAction: (action: QuickAction) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function FABGroup({ actions, onAction, isExpanded, onToggle }: FABGroupProps) {
  const enabledActions = actions.filter(a => a.enabled).slice(0, 5);

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col-reverse items-center gap-2">
      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg",
          isExpanded ? "bg-destructive" : "bg-primary"
        )}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </motion.div>
      </motion.button>

      {/* Action FABs */}
      <AnimatePresence>
        {isExpanded && enabledActions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              onAction(action);
              onToggle();
            }}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shadow-md",
              action.color || "bg-secondary"
            )}
          >
            <span className="text-lg">{action.icon}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ===== SWIPE ACTIONS BAR =====

interface SwipeActionsProps {
  actions: SwipeAction[];
  onAction: (action: SwipeAction) => void;
}

export function SwipeActions({ actions, onAction }: SwipeActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-lg border-t p-2 safe-area-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(action)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Badge variant="outline" className="text-xs">
              {action.direction === 'up' ? '↑' : action.direction === 'down' ? '↓' : action.direction === 'left' ? '←' : '→'}
            </Badge>
            <span className="text-xs text-muted-foreground">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ===== QUICK ACTIONS SETTINGS =====

interface QuickActionsSettingsProps {
  actions: QuickAction[];
  swipeActions: SwipeAction[];
  onUpdateActions: (actions: QuickAction[]) => void;
  onUpdateSwipeActions: (actions: SwipeAction[]) => void;
}

export function QuickActionsSettings({
  actions,
  swipeActions,
  onUpdateActions,
  onUpdateSwipeActions,
}: QuickActionsSettingsProps) {
  const [newAction, setNewAction] = useState({
    label: '',
    icon: '⭐',
    action: '',
    color: 'bg-primary',
  });

  const defaultIcons = ['⭐', '❤️', '🔔', '📷', '🎤', '📝', '🎵', '📞', '✉️', '🗺️'];
  const defaultColors = [
    { name: 'Primary', value: 'bg-primary' },
    { name: 'Secondary', value: 'bg-secondary' },
    { name: 'Blue', value: 'bg-blue-500' },
    { name: 'Green', value: 'bg-green-500' },
    { name: 'Amber', value: 'bg-amber-500' },
    { name: 'Red', value: 'bg-red-500' },
  ];

  const handleAddAction = useCallback(() => {
    if (!newAction.label || !newAction.action) return;

    const action: QuickAction = {
      id: `action-${Date.now()}`,
      type: 'tap',
      label: newAction.label,
      icon: newAction.icon,
      action: newAction.action,
      params: {},
      position: 'right',
      size: 'medium',
      color: newAction.color,
      enabled: true,
      priority: actions.length,
    };

    onUpdateActions([...actions, action]);
    setNewAction({ label: '', icon: '⭐', action: '', color: 'bg-primary' });
  }, [newAction, actions, onUpdateActions]);

  const handleRemoveAction = useCallback((id: string) => {
    onUpdateActions(actions.filter(a => a.id !== id));
  }, [actions, onUpdateActions]);

  const handleToggleAction = useCallback((id: string) => {
    onUpdateActions(actions.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  }, [actions, onUpdateActions]);

  return (
    <div className="space-y-6">
      {/* Floating Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Action Buttons
          </CardTitle>
          <CardDescription>
            Floating buttons for instant access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Actions */}
          {actions.length > 0 && (
            <div className="space-y-2">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    action.color
                  )}>
                    <span className="text-lg">{action.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.action}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAction(action.id)}
                    >
                      {action.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAction(action.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Action */}
          <div className="space-y-3">
            <Label>Add New Action</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={newAction.label}
                onChange={(e) => setNewAction(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Label"
              />
              <Input
                value={newAction.action}
                onChange={(e) => setNewAction(prev => ({ ...prev, action: e.target.value }))}
                placeholder="Action command"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Icon</Label>
              <div className="flex flex-wrap gap-2">
                {defaultIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewAction(prev => ({ ...prev, icon }))}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors",
                      newAction.icon === icon ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Color</Label>
              <div className="flex flex-wrap gap-2">
                {defaultColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewAction(prev => ({ ...prev, color: color.value }))}
                    className={cn(
                      "w-8 h-8 rounded-full",
                      color.value,
                      newAction.color === color.value && "ring-2 ring-offset-2 ring-primary"
                    )}
                  />
                ))}
              </div>
            </div>

            <Button onClick={handleAddAction} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Action
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Swipe Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Move className="w-5 h-5 text-primary" />
            Swipe Gestures
          </CardTitle>
          <CardDescription>
            Actions triggered by swipe gestures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {swipeActions.map((action, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
              >
                <Badge variant="outline">
                  {action.direction === 'up' ? '↑' : action.direction === 'down' ? '↓' : action.direction === 'left' ? '←' : '→'}
                </Badge>
                <span className="text-sm">{action.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== DEFAULT QUICK ACTIONS =====

export const defaultQuickActions: QuickAction[] = [
  {
    id: 'voice',
    type: 'tap',
    label: 'Voice',
    icon: '🎤',
    action: 'start_voice',
    params: {},
    position: 'right',
    size: 'medium',
    color: 'bg-blue-500',
    enabled: true,
    priority: 1,
  },
  {
    id: 'camera',
    type: 'tap',
    label: 'Camera',
    icon: '📷',
    action: 'open_camera',
    params: {},
    position: 'right',
    size: 'medium',
    color: 'bg-green-500',
    enabled: true,
    priority: 2,
  },
  {
    id: 'search',
    type: 'tap',
    label: 'Search',
    icon: '🔍',
    action: 'open_search',
    params: {},
    position: 'right',
    size: 'medium',
    color: 'bg-amber-500',
    enabled: true,
    priority: 3,
  },
  {
    id: 'notes',
    type: 'tap',
    label: 'Note',
    icon: '📝',
    action: 'quick_note',
    params: {},
    position: 'right',
    size: 'medium',
    color: 'bg-purple-500',
    enabled: true,
    priority: 4,
  },
];

export const defaultSwipeActions: SwipeAction[] = [
  { direction: 'up', action: 'open_assistant', label: 'Assistant' },
  { direction: 'down', action: 'show_notifications', label: 'Notifications' },
  { direction: 'left', action: 'next_track', label: 'Next' },
  { direction: 'right', action: 'previous_track', label: 'Previous' },
];

export default QuickActionsSettings;

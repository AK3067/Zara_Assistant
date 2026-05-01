import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssistantState, Message, Task, Conversation, AssistantSettings, QuickTask } from '@/types/assistant';

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultSettings: AssistantSettings = {
  voiceSettings: {
    voice: 'default',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  },
  theme: 'system',
  enableVoiceResponse: true,
  enableAutoListen: false,
  language: 'en-US',
};

// Default quick tasks for new users
const defaultQuickTasks: QuickTask[] = [
  {
    id: 'default-1',
    trigger: '1',
    action: 'send_message',
    label: 'Quick Message',
    color: 'bg-blue-500',
    createdAt: Date.now(),
    usageCount: 0,
    isFavorite: true,
  },
  {
    id: 'default-2',
    trigger: '2',
    action: 'make_call',
    label: 'Quick Call',
    color: 'bg-green-500',
    createdAt: Date.now(),
    usageCount: 0,
    isFavorite: true,
  },
  {
    id: 'default-3',
    trigger: '3',
    action: 'set_reminder',
    label: 'Set Reminder',
    color: 'bg-amber-500',
    createdAt: Date.now(),
    usageCount: 0,
    isFavorite: true,
  },
  {
    id: 'default-4',
    trigger: '4',
    action: 'create_note',
    label: 'Quick Note',
    color: 'bg-purple-500',
    createdAt: Date.now(),
    usageCount: 0,
  },
  {
    id: 'default-5',
    trigger: '5',
    action: 'start_timer',
    label: 'Start Timer',
    color: 'bg-rose-500',
    createdAt: Date.now(),
    usageCount: 0,
  },
  {
    id: 'default-email',
    trigger: 'email',
    action: 'send_email',
    label: 'Quick Email',
    color: 'bg-cyan-500',
    createdAt: Date.now(),
    usageCount: 0,
  },
  {
    id: 'default-search',
    trigger: 'search',
    action: 'search_web',
    label: 'Search Web',
    color: 'bg-indigo-500',
    createdAt: Date.now(),
    usageCount: 0,
    description: 'Search the web for anything',
    parameters: [
      { name: 'query', type: 'text', placeholder: 'Search query', required: true }
    ],
    data: {
      aiPromptTemplate: 'Search the web for {query}'
    }
  },
  {
    id: 'default-call',
    trigger: 'call',
    action: 'make_call',
    label: 'Call Contact',
    color: 'bg-green-600',
    createdAt: Date.now(),
    usageCount: 0,
    description: 'Call a contact by name',
    parameters: [
      { name: 'contact', type: 'contact', placeholder: 'Contact name', required: true }
    ],
    data: {
      aiPromptTemplate: 'Call {contact}'
    }
  },
  {
    id: 'default-timer',
    trigger: 'timer',
    action: 'start_timer',
    label: 'Quick Timer',
    color: 'bg-rose-600',
    createdAt: Date.now(),
    usageCount: 0,
    description: 'Start a timer with duration',
    parameters: [
      { name: 'duration', type: 'number', placeholder: 'Minutes', required: true }
    ],
    data: {
      aiPromptTemplate: 'Start a timer for {duration} minutes'
    }
  },
  {
    id: 'default-remind',
    trigger: 'remind me',
    action: 'set_reminder',
    label: 'Remind Me',
    color: 'bg-amber-600',
    createdAt: Date.now(),
    usageCount: 0,
    description: 'Set a reminder with text',
    parameters: [
      { name: 'text', type: 'text', placeholder: 'Reminder text', required: true }
    ],
    data: {
      aiPromptTemplate: 'Set a reminder: {text}'
    }
  },
];

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      conversations: [],
      currentConversationId: null,
      mode: 'chat',
      isListening: false,
      isSpeaking: false,
      isProcessing: false,
      isTyping: false,
      settings: defaultSettings,
      quickTasks: defaultQuickTasks,
      tasks: [],

      // Message actions
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      // Mode actions
      setMode: (mode) => set({ mode }),

      // UI State actions
      setIsListening: (value) => set({ isListening: value }),
      setIsSpeaking: (value) => set({ isSpeaking: value }),
      setIsProcessing: (value) => set({ isProcessing: value }),
      setIsTyping: (value) => set({ isTyping: value }),

      // Settings actions
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // Quick Task actions
      addQuickTask: (task) => {
        const newTask: QuickTask = {
          ...task,
          id: generateId(),
          createdAt: Date.now(),
          usageCount: 0,
        };
        set((state) => ({
          quickTasks: [...state.quickTasks, newTask],
        }));
      },

      updateQuickTask: (id, updates) => {
        set((state) => ({
          quickTasks: state.quickTasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteQuickTask: (id) => {
        set((state) => ({
          quickTasks: state.quickTasks.filter((task) => task.id !== id),
        }));
      },

      triggerQuickTask: (id) => {
        set((state) => ({
          quickTasks: state.quickTasks.map((task) =>
            task.id === id
              ? { ...task, lastUsed: Date.now(), usageCount: (task.usageCount || 0) + 1 }
              : task
          ),
        }));
      },

      // Task actions
      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          createdAt: Date.now(),
          completed: false,
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      // Conversation actions
      createConversation: () => {
        const id = generateId();
        const conversation: Conversation = {
          id,
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
          messages: [],
        }));
        return id;
      },

      loadConversation: (id) => {
        const conversation = get().conversations.find((c) => c.id === id);
        if (conversation) {
          set({
            currentConversationId: id,
            messages: conversation.messages,
          });
        }
      },

      saveCurrentConversation: () => {
        const { currentConversationId, messages, conversations } = get();
        if (currentConversationId && messages.length > 0) {
          const title = messages[0]?.content.slice(0, 30) + '...' || 'Conversation';
          set({
            conversations: conversations.map((c) =>
              c.id === currentConversationId
                ? { ...c, messages, title, updatedAt: Date.now() }
                : c
            ),
          });
        }
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversationId:
            state.currentConversationId === id ? null : state.currentConversationId,
          messages: state.currentConversationId === id ? [] : state.messages,
        }));
      },
    }),
    {
      name: 'ai-assistant-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        settings: state.settings,
        quickTasks: state.quickTasks,
        tasks: state.tasks,
      }),
    }
  )
);

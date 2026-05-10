// AI Assistant Types

// AI Personality Configuration
export type AIName = 'Zara' | 'Casey' | 'Fiona' | 'Erica' | 'Vesper';

export interface AIPersonality {
  name: AIName;
  displayName: string;
  description: string;
  color: string; // Primary color for the AI
  gradient: string; // Gradient for UI elements
  voicePitch: number; // 0.5 - 2.0
  voiceRate: number; // 0.5 - 2.0
  greeting: string;
  personality: string; // Brief personality description
  icon: string; // Icon identifier
}

// Predefined AI Personalities
export const AI_PERSONALITIES: AIPersonality[] = [
  {
    name: 'Zara',
    displayName: 'Zara',
    description: 'Friendly & helpful',
    color: '#ffffff',
    gradient: 'from-white to-gray-300',
    voicePitch: 1.0,
    voiceRate: 1.0,
    greeting: "Hello! I'm Zara, your AI assistant. How can I help you today?",
    personality: 'Warm & efficient',
    icon: 'sparkles',
  },
  {
    name: 'Casey',
    displayName: 'Casey',
    description: 'Calm & analytical',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-blue-600',
    voicePitch: 1.0,
    voiceRate: 1.0,
    greeting: "Hi there! Casey here. I'm ready to help you think through anything.",
    personality: 'Thoughtful & precise',
    icon: 'brain',
  },
  {
    name: 'Fiona',
    displayName: 'Fiona',
    description: 'Creative & energetic',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-500',
    voicePitch: 1.0,
    voiceRate: 1.0,
    greeting: "Hey! Fiona here! Let's create something amazing together!",
    personality: 'Imaginative & inspiring',
    icon: 'palette',
  },
  {
    name: 'Erica',
    displayName: 'Erica',
    description: 'Professional & organized',
    color: '#10b981',
    gradient: 'from-emerald-500 to-green-500',
    voicePitch: 1.0,
    voiceRate: 1.0,
    greeting: "Hello! Erica at your service. Let's get things done efficiently.",
    personality: 'Focused & efficient',
    icon: 'target',
  },
  {
    name: 'Vesper',
    displayName: 'Vesper',
    description: 'Deep & insightful',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    voicePitch: 1.0,
    voiceRate: 1.0,
    greeting: "Greetings. I'm Vesper. I sense you have questions. Let's explore them together.",
    personality: 'Intuitive & wise',
    icon: 'moon',
  },
];

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isVoice?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type AssistantMode = 'chat' | 'voice' | 'quick';

// Quick Task / Voice Shortcut Types
export type QuickTaskAction = 
  | 'send_message'      // Send a message
  | 'make_call'         // Make a phone call
  | 'set_reminder'      // Set a reminder
  | 'create_note'       // Create a quick note
  | 'start_timer'       // Start a timer
  | 'open_app'          // Open an app/website
  | 'search_web'        // Search the web
  | 'send_email'        // Send an email
  | 'custom_command'    // Custom AI command
  | 'voice_macro';      // Voice-recorded macro

// Parameter placeholder types for dynamic shortcuts
export type ParameterType = 'number' | 'text' | 'contact' | 'time' | 'date' | 'url';

export interface TaskParameter {
  name: string;           // Parameter name (e.g., 'number', 'contact')
  type: ParameterType;    // Type of parameter
  placeholder: string;    // Display placeholder (e.g., 'Enter number')
  required: boolean;      // Whether this parameter is required
  defaultValue?: string;  // Default value if not provided
}

export interface QuickTask {
  id: string;
  trigger: string;           // The word/phrase/number to say (e.g., "1", "email", "call mom")
  triggerPattern?: string;   // Regex pattern for dynamic triggers (e.g., "call {contact}" -> "call (?<contact>.+)")
  action: QuickTaskAction;   // What action to perform
  label: string;             // Friendly label (e.g., "Call Mom", "Quick Email")
  description?: string;      // User-defined description of what the task does
  parameters?: TaskParameter[]; // Dynamic parameters for the trigger
  data?: {                   // Additional data for the action
    phoneNumber?: string;    // For calls
    emailAddress?: string;   // For emails
    recipient?: string;      // For messages
    url?: string;            // For opening apps/websites
    duration?: number;       // For timers (in minutes)
    reminderText?: string;   // Default reminder text
    noteTitle?: string;      // Default note title
    customPrompt?: string;   // For custom AI commands
    voiceMacro?: string;     // Voice-recorded instruction for macro
    aiPromptTemplate?: string; // Template with parameter placeholders
  };
  icon?: string;             // Icon identifier
  color?: string;            // Color for the shortcut card
  isVoiceRecorded?: boolean; // Whether the action was defined by voice
  createdAt: number;
  lastUsed?: number;         // Last time this shortcut was triggered
  usageCount?: number;       // How many times it's been used
  isFavorite?: boolean;      // User favorited shortcut
  category?: string;         // Category for organization (e.g., 'communication', 'productivity')
}

export interface VoiceSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface AssistantSettings {
  voiceSettings: VoiceSettings;
  theme: 'light' | 'dark' | 'system';
  enableVoiceResponse: boolean;
  enableAutoListen: boolean;
  language: string;
  memoriesEnabled: boolean; // Toggle to enable/disable memory storage
  aiName: AIName; // Selected AI personality name
  setupComplete: boolean; // Whether initial setup is done
}

export interface Task {
  id: string;
  type: 'message' | 'call' | 'reminder' | 'note' | 'timer';
  title: string;
  description?: string;
  scheduledTime?: number;
  duration?: number;
  phoneNumber?: string;
  completed: boolean;
  createdAt: number;
}

// Memory Types
export interface Memory {
  id: string;
  content: string;           // Compressed text content
  originalText?: string;     // Original full text (optional, for reference)
  category: MemoryCategory;
  source: 'manual' | 'conversation' | 'import';
  importance: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: number;
  updatedAt: number;
  lastAccessed?: number;
  accessCount: number;
}

export type MemoryCategory = 
  | 'personal'      // Personal info (name, birthday, preferences)
  | 'work'          // Work-related info
  | 'preferences'   // User preferences
  | 'facts'         // General facts to remember
  | 'contacts'      // Contact information
  | 'dates'         // Important dates
  | 'locations'     // Location info
  | 'goals'         // Goals and aspirations
  | 'health'        // Health-related info
  | 'other';        // Uncategorized

// File/Document Types
export type DocFileType = 'note' | 'document' | 'list' | 'reminder' | 'idea' | 'journal';

export interface DocFile {
  id: string;
  title: string;
  content: string;
  type: DocFileType;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  isArchived?: boolean;
  wordCount?: number;
  color?: string; // Optional color tag for organization
}

export interface AssistantState {
  // Messages
  messages: Message[];
  conversations: Conversation[];
  currentConversationId: string | null;

  // Mode
  mode: AssistantMode;

  // UI State
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isTyping: boolean;

  // Settings
  settings: AssistantSettings;

  // Quick Tasks / Voice Shortcuts
  quickTasks: QuickTask[];
  
  // Task History (completed tasks)
  tasks: Task[];

  // Memories
  memories: Memory[];

  // Files/Documents
  files: DocFile[];

  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setMode: (mode: AssistantMode) => void;
  setIsListening: (value: boolean) => void;
  setIsSpeaking: (value: boolean) => void;
  setIsProcessing: (value: boolean) => void;
  setIsTyping: (value: boolean) => void;
  updateSettings: (settings: Partial<AssistantSettings>) => void;
  
  // Quick Task Actions
  addQuickTask: (task: Omit<QuickTask, 'id' | 'createdAt' | 'usageCount'>) => void;
  updateQuickTask: (id: string, updates: Partial<QuickTask>) => void;
  deleteQuickTask: (id: string) => void;
  triggerQuickTask: (id: string) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Conversation Actions
  createConversation: () => string;
  loadConversation: (id: string) => void;
  saveCurrentConversation: () => void;
  deleteConversation: (id: string) => void;

  // Memory Actions
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'accessCount'>) => void;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;
  clearAllMemories: () => void;
  accessMemory: (id: string) => void;
  searchMemories: (query: string) => Memory[];

  // File Actions
  addFile: (file: Omit<DocFile, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => void;
  updateFile: (id: string, updates: Partial<DocFile>) => void;
  deleteFile: (id: string) => void;
  clearAllFiles: () => void;
  toggleFilePin: (id: string) => void;
  archiveFile: (id: string) => void;

  // AI Personality Actions
  setAIName: (name: AIName) => void;
  completeSetup: () => void;
}

// Voice Recognition Types
export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

// API Response Types
export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export interface ASRResponse {
  success: boolean;
  text?: string;
  error?: string;
}

// Local AI types are in ./local-ai.ts

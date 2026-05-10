// AI Assistant Types

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

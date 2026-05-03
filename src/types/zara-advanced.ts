// ===== ZARA AI ADVANCED TYPES =====
// Beyond Astra - Next Generation AI Assistant

// ===== VISUAL AI MODE =====

export interface VisualAnalysis {
  id: string;
  timestamp: number;
  image: string; // base64 or URL
  description: string;
  objects: DetectedObject[];
  text: DetectedText[];
  faces: DetectedFace[];
  scene: SceneAnalysis;
  actions: SuggestedAction[];
}

export interface DetectedObject {
  label: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  attributes: Record<string, string>;
}

export interface DetectedText {
  content: string;
  language: string;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export interface DetectedFace {
  id: string;
  emotion: string;
  age?: number;
  gender?: string;
  knownPerson?: string;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export interface SceneAnalysis {
  location: string;
  time: string;
  weather?: string;
  activity: string;
  mood: string;
}

export interface SuggestedAction {
  type: 'capture' | 'search' | 'translate' | 'shop' | 'navigate' | 'remember' | 'share';
  label: string;
  data?: Record<string, unknown>;
}

// ===== PROACTIVE AI =====

export interface ProactiveInsight {
  id: string;
  type: 'reminder' | 'suggestion' | 'warning' | 'opportunity' | 'information';
  title: string;
  description: string;
  relevance: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  context: string[];
  action?: ProactiveAction;
  expiresAt?: number;
  createdAt: number;
  shown: boolean;
  dismissed: boolean;
  actedUpon: boolean;
}

export interface ProactiveAction {
  type: string;
  label: string;
  params: Record<string, unknown>;
}

export interface UserPattern {
  id: string;
  type: 'time_based' | 'location_based' | 'activity_based' | 'context_based';
  pattern: string;
  frequency: number;
  lastOccurrence: number;
  nextPredicted: number;
  confidence: number;
  actions: PatternAction[];
  createdAt: number;
}

export interface PatternAction {
  trigger: string;
  action: string;
  success: boolean;
  timestamp: number;
}

// ===== DEEP MEMORY =====

export interface MemoryEntry {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural' | 'emotional';
  category: string;
  content: string;
  embeddings?: number[];
  importance: number;
  emotionalWeight: number;
  associations: string[];
  context: MemoryContext;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
  decayRate: number;
  consolidated: boolean;
}

export interface MemoryContext {
  location?: string;
  time?: string;
  people?: string[];
  activity?: string;
  emotions?: string[];
  devices?: string[];
  conversationId?: string;
}

export interface ConversationMemory {
  id: string;
  summary: string;
  keyPoints: string[];
  entities: EntityMemory[];
  sentiments: SentimentRecord[];
  decisions: DecisionRecord[];
  followUps: FollowUpItem[];
  startedAt: number;
  endedAt?: number;
}

export interface EntityMemory {
  name: string;
  type: 'person' | 'place' | 'thing' | 'concept' | 'event';
  mentions: number;
  sentiment: number;
  importance: number;
}

export interface SentimentRecord {
  timestamp: number;
  sentiment: number;
  emotion: string;
  trigger?: string;
}

export interface DecisionRecord {
  id: string;
  description: string;
  options: string[];
  chosen: string;
  reasoning?: string;
  timestamp: number;
}

export interface FollowUpItem {
  id: string;
  content: string;
  dueDate?: number;
  completed: boolean;
  relatedMemory?: string;
}

// ===== EMOTIONAL INTELLIGENCE =====

export interface EmotionalState {
  primary: string;
  secondary?: string;
  intensity: number;
  confidence: number;
  triggers: string[];
  timestamp: number;
}

export interface EmotionalProfile {
  baseline: Record<string, number>;
  patterns: EmotionalPattern[];
  preferences: EmotionalPreference[];
  sensitivities: string[];
  copingMechanisms: string[];
}

export interface EmotionalPattern {
  trigger: string;
  emotion: string;
  frequency: number;
  timeOfDay?: number[];
  dayOfWeek?: number[];
}

export interface EmotionalPreference {
  context: string;
  preferredTone: string;
  avoidTopics: string[];
  preferredResponses: string[];
}

// ===== AMBIENT MODE =====

export interface AmbientConfig {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  wakeWord: string;
  wakeWords: string[];
  screenOffActivation: boolean;
  lowPowerMode: boolean;
  backgroundListening: boolean;
  triggerPhrases: TriggerPhrase[];
  quietHours: { start: string; end: string };
  lastActivation?: number;
}

export interface TriggerPhrase {
  phrase: string;
  action: string;
  response: string;
  enabled: boolean;
}

export interface AmbientEvent {
  id: string;
  type: 'sound' | 'voice' | 'silence' | 'music' | 'notification';
  timestamp: number;
  data: Record<string, unknown>;
  processed: boolean;
}

// ===== QUICK ACTIONS =====

export interface QuickAction {
  id: string;
  type: 'gesture' | 'tap' | 'swipe' | 'voice' | 'shake' | 'double_tap';
  gesture?: GestureConfig;
  label: string;
  icon: string;
  action: string;
  params: Record<string, unknown>;
  position: 'left' | 'right' | 'bottom' | 'custom';
  size: 'small' | 'medium' | 'large';
  color: string;
  enabled: boolean;
  priority: number;
}

export interface GestureConfig {
  type: 'swipe_left' | 'swipe_right' | 'swipe_up' | 'swipe_down' | 'pinch' | 'spread' | 'rotate' | 'circle' | 'zigzag';
  fingers: number;
  threshold: number;
}

export interface SwipeAction {
  direction: 'up' | 'down' | 'left' | 'right';
  action: string;
  label: string;
}

// ===== CONTEXT CARDS =====

export interface ContextCard {
  id: string;
  type: 'weather' | 'calendar' | 'tasks' | 'news' | 'traffic' | 'health' | 'finance' | 'smart_home' | 'custom';
  title: string;
  subtitle?: string;
  content: CardContent;
  actions: CardAction[];
  priority: number;
  relevance: number;
  freshness: number;
  size: 'small' | 'medium' | 'large';
  position: number;
  visible: boolean;
  lastUpdated: number;
  refreshInterval: number;
}

export interface CardContent {
  primary: string;
  secondary?: string;
  tertiary?: string;
  image?: string;
  icon?: string;
  progress?: number;
  items?: CardItem[];
  graph?: GraphData;
}

export interface CardItem {
  label: string;
  value: string | number;
  icon?: string;
  action?: string;
}

export interface GraphData {
  type: 'line' | 'bar' | 'pie';
  labels: string[];
  values: number[];
}

export interface CardAction {
  type: 'tap' | 'long_press' | 'swipe';
  label: string;
  action: string;
  params: Record<string, unknown>;
}

// ===== MULTI-MODAL INPUT =====

export interface MultiModalInput {
  id: string;
  type: 'voice' | 'text' | 'image' | 'gesture' | 'gaze' | 'touch' | 'drawing';
  content: string | Blob | GestureData;
  timestamp: number;
  metadata: InputMetadata;
  processed: boolean;
}

export interface InputMetadata {
  language?: string;
  confidence?: number;
  duration?: number;
  location?: { x: number; y: number };
  pressure?: number;
  device: string;
}

export interface GestureData {
  type: string;
  points: { x: number; y: number; timestamp: number }[];
  velocity: number;
  direction: string;
}

// ===== LEARNING ENGINE =====

export interface LearningFeedback {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'correction';
  category: string;
  input: string;
  response: string;
  expectedResponse?: string;
  context: string[];
  timestamp: number;
  impact: number;
}

export interface LearningModel {
  version: string;
  accuracy: number;
  lastTrained: number;
  parameters: Record<string, number>;
  adaptations: ModelAdaptation[];
}

export interface ModelAdaptation {
  id: string;
  type: 'vocabulary' | 'preference' | 'pattern' | 'entity';
  change: Record<string, unknown>;
  reason: string;
  timestamp: number;
  performance: number;
}

// ===== ZARA AI UNIFIED STATE =====

export interface ZaraState {
  // Core
  initialized: boolean;
  mode: 'inactive' | 'ambient' | 'active' | 'visual' | 'conversation';
  
  // Visual AI
  visualMode: boolean;
  lastVisualAnalysis?: VisualAnalysis;
  visualHistory: VisualAnalysis[];
  
  // Proactive
  insights: ProactiveInsight[];
  patterns: UserPattern[];
  lastInsightTime?: number;
  
  // Memory
  memories: MemoryEntry[];
  conversations: ConversationMemory[];
  workingMemory: string[];
  
  // Emotional
  currentEmotion?: EmotionalState;
  emotionalProfile: EmotionalProfile;
  
  // Ambient
  ambientConfig: AmbientConfig;
  ambientEvents: AmbientEvent[];
  
  // Quick Actions
  quickActions: QuickAction[];
  gestureActions: SwipeAction[];
  
  // Context
  contextCards: ContextCard[];
  currentContext: AssistantContext;
  
  // Learning
  feedbackHistory: LearningFeedback[];
  modelState: LearningModel;
}

export interface AssistantContext {
  time: string;
  location?: string;
  activity?: string;
  device: 'mobile' | 'tablet' | 'desktop' | 'wearable';
  orientation: 'portrait' | 'landscape';
  connectivity: 'online' | 'offline' | 'limited';
  batteryLevel: number;
  isCharging: boolean;
  isMoving: boolean;
  nearbyDevices: string[];
  activeApps: string[];
  recentInteractions: string[];
}

// ===== API RESPONSES =====

export interface ZaraResponse {
  id: string;
  type: 'text' | 'voice' | 'visual' | 'action' | 'card';
  content: string;
  voiceUrl?: string;
  visuals?: VisualContent[];
  actions?: ResponseAction[];
  cards?: ContextCard[];
  emotion: string;
  confidence: number;
  memory: string[];
  followUp?: string;
  timestamp: number;
}

export interface VisualContent {
  type: 'image' | 'animation' | 'widget';
  url?: string;
  data?: Record<string, unknown>;
}

export interface ResponseAction {
  type: string;
  label: string;
  params: Record<string, unknown>;
}

// ===== COMPARISON: Local AI vs Cloud AI =====

export interface AIProvider {
  id: 'local' | 'cloud';
  capabilities: string[];
  latency: number;
  privacy: 'full' | 'partial' | 'none';
  offline: boolean;
  cost: 'free' | 'metered' | 'subscription';
}

export const AI_PROVIDERS: Record<string, AIProvider> = {
  local: {
    id: 'local',
    capabilities: [
      'document_generation',
      'offline_voice',
      'knowledge_base',
      'smart_search',
      'calendar_planning',
      'templates',
      'quick_actions',
      'ambient_mode',
    ],
    latency: 10, // ms
    privacy: 'full',
    offline: true,
    cost: 'free',
  },
  cloud: {
    id: 'cloud',
    capabilities: [
      'advanced_reasoning',
      'web_search',
      'image_generation',
      'translation',
      'real_time_data',
      'complex_analysis',
    ],
    latency: 500, // ms
    privacy: 'partial',
    offline: false,
    cost: 'metered',
  },
};

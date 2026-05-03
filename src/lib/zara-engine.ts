// ===== ZARA AI CORE ENGINE =====
// Next Generation AI Assistant - Beyond Astra

import type {
  VisualAnalysis,
  ProactiveInsight,
  MemoryEntry,
  EmotionalState,
  EmotionalProfile,
  UserPattern,
  ZaraResponse,
  AssistantContext,
  LearningFeedback,
  MultiModalInput,
  ContextCard,
} from '@/types/zara-advanced';

const generateId = () => Math.random().toString(36).substring(2, 15);

// ===== PATTERN RECOGNITION ENGINE =====

export class PatternEngine {
  private patterns: Map<string, UserPattern> = new Map();
  private eventHistory: Array<{ type: string; timestamp: number; data: Record<string, unknown> }> = [];

  // Record an event for pattern analysis
  recordEvent(type: string, data: Record<string, unknown> = {}): void {
    this.eventHistory.push({
      type,
      timestamp: Date.now(),
      data,
    });

    // Keep last 1000 events
    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }

    this.analyzePatterns();
  }

  // Analyze patterns from event history
  private analyzePatterns(): void {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const hourMs = 60 * 60 * 1000;

    // Time-based patterns
    const hourCounts: Record<number, number> = {};
    const dayCounts: Record<number, number> = {};

    this.eventHistory.forEach(event => {
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      const day = date.getDay();

      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    // Find peak hours
    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Store patterns
    if (peakHours.length > 0) {
      this.patterns.set('peak_usage_hours', {
        id: 'peak_usage_hours',
        type: 'time_based',
        pattern: `Active at ${peakHours.map(h => `${h}:00`).join(', ')}`,
        frequency: hourCounts[peakHours[0]] || 0,
        lastOccurrence: now,
        nextPredicted: this.getNextOccurrence(peakHours[0]),
        confidence: 0.8,
        actions: [],
        createdAt: now,
      });
    }
  }

  // Get next predicted occurrence
  private getNextOccurrence(hour: number): number {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, 0, 0, 0);
    
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }
    
    return next.getTime();
  }

  // Get active patterns
  getPatterns(): UserPattern[] {
    return Array.from(this.patterns.values());
  }

  // Predict next action
  predictNextAction(): { action: string; confidence: number } | null {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Find relevant patterns
    const relevantPatterns = this.getPatterns().filter(p => {
      if (p.type === 'time_based') {
        const predictedHour = new Date(p.nextPredicted).getHours();
        return Math.abs(predictedHour - hour) <= 1;
      }
      return false;
    });

    if (relevantPatterns.length > 0) {
      return {
        action: relevantPatterns[0].pattern,
        confidence: relevantPatterns[0].confidence,
      };
    }

    return null;
  }
}

// ===== MEMORY ENGINE =====

export class MemoryEngine {
  private memories: Map<string, MemoryEntry> = new Map();
  private workingMemory: string[] = [];
  private maxWorkingMemory = 10;

  // Store a memory
  remember(
    content: string,
    type: MemoryEntry['type'] = 'semantic',
    importance: number = 0.5,
    context: Record<string, unknown> = {}
  ): MemoryEntry {
    const id = generateId();
    const now = Date.now();

    const memory: MemoryEntry = {
      id,
      type,
      category: context.category as string || 'general',
      content,
      importance,
      emotionalWeight: context.emotionalWeight as number || 0,
      associations: context.associations as string[] || [],
      context: {
        location: context.location as string,
        time: new Date().toISOString(),
        people: context.people as string[],
        activity: context.activity as string,
        emotions: context.emotions as string[],
      },
      createdAt: now,
      lastAccessed: now,
      accessCount: 0,
      decayRate: 0.1,
      consolidated: false,
    };

    this.memories.set(id, memory);
    this.workingMemory.unshift(id);

    if (this.workingMemory.length > this.maxWorkingMemory) {
      this.workingMemory.pop();
    }

    return memory;
  }

  // Recall memories
  recall(query: string, limit: number = 5): MemoryEntry[] {
    const queryLower = query.toLowerCase();
    const scored: Array<{ memory: MemoryEntry; score: number }> = [];

    this.memories.forEach(memory => {
      let score = 0;

      // Content match
      if (memory.content.toLowerCase().includes(queryLower)) {
        score += 0.5;
      }

      // Association match
      memory.associations.forEach(assoc => {
        if (assoc.toLowerCase().includes(queryLower)) {
          score += 0.3;
        }
      });

      // Freshness boost
      const age = Date.now() - memory.lastAccessed;
      const freshness = 1 / (1 + age / (7 * 24 * 60 * 60 * 1000)); // Decay over a week
      score += freshness * 0.2;

      // Importance boost
      score += memory.importance * 0.3;

      if (score > 0) {
        scored.push({ memory, score });
      }
    });

    // Sort by score and return top results
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ memory }) => {
        memory.lastAccessed = Date.now();
        memory.accessCount++;
        return memory;
      });
  }

  // Get working memory
  getWorkingMemory(): MemoryEntry[] {
    return this.workingMemory
      .map(id => this.memories.get(id))
      .filter((m): m is MemoryEntry => m !== undefined);
  }

  // Consolidate important memories
  consolidate(): void {
    this.memories.forEach(memory => {
      if (memory.accessCount > 5 && memory.importance > 0.7) {
        memory.consolidated = true;
        memory.decayRate = 0.01; // Slower decay for consolidated memories
      }
    });
  }

  // Decay old memories
  decay(): void {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    this.memories.forEach((memory, id) => {
      const age = now - memory.lastAccessed;
      const decayFactor = Math.exp(-memory.decayRate * age / weekMs);
      memory.importance *= decayFactor;

      // Remove very weak memories
      if (memory.importance < 0.1 && !memory.consolidated) {
        this.memories.delete(id);
      }
    });
  }

  // Export for persistence
  export(): MemoryEntry[] {
    return Array.from(this.memories.values());
  }

  // Import from persistence
  import(memories: MemoryEntry[]): void {
    memories.forEach(memory => {
      this.memories.set(memory.id, memory);
    });
  }
}

// ===== EMOTIONAL INTELLIGENCE ENGINE =====

export class EmotionalEngine {
  private profile: EmotionalProfile;
  private history: EmotionalState[] = [];

  constructor() {
    this.profile = {
      baseline: {
        happy: 0.3,
        neutral: 0.5,
        focused: 0.2,
      },
      patterns: [],
      preferences: [],
      sensitivities: [],
      copingMechanisms: [],
    };
  }

  // Analyze emotion from text
  analyzeText(text: string): EmotionalState {
    const emotions: Record<string, RegExp[]> = {
      happy: [/\b(happy|joy|great|awesome|wonderful|love|excited|amazing)\b/i],
      sad: [/\b(sad|depressed|down|unhappy|miserable|cry|tears)\b/i],
      angry: [/\b(angry|mad|frustrated|annoyed|irritated|furious|hate)\b/i],
      anxious: [/\b(anxious|worried|nervous|scared|afraid|panic|stress)\b/i],
      excited: [/\b(excited|thrilled|eager|pumped|hyped|can't wait)\b/i],
      tired: [/\b(tired|exhausted|sleepy|drained|weary|fatigue)\b/i],
      confused: [/\b(confused|lost|unclear|don't understand|what\?)\b/i],
      grateful: [/\b(thank|grateful|appreciate|thanks|thankful)\b/i],
    };

    let primaryEmotion = 'neutral';
    let maxMatches = 0;
    const triggers: string[] = [];

    Object.entries(emotions).forEach(([emotion, patterns]) => {
      let matches = 0;
      patterns.forEach(pattern => {
        const match = text.match(pattern);
        if (match) {
          matches += match.length;
          triggers.push(match[0]);
        }
      });

      if (matches > maxMatches) {
        maxMatches = matches;
        primaryEmotion = emotion;
      }
    });

    const state: EmotionalState = {
      primary: primaryEmotion,
      intensity: Math.min(1, maxMatches * 0.3),
      confidence: maxMatches > 0 ? 0.7 : 0.5,
      triggers,
      timestamp: Date.now(),
    };

    this.history.push(state);
    if (this.history.length > 100) {
      this.history.shift();
    }

    return state;
  }

  // Get appropriate response tone
  getResponseTone(emotion: EmotionalState): string {
    const toneMap: Record<string, string> = {
      happy: 'enthusiastic',
      sad: 'empathetic',
      angry: 'calm',
      anxious: 'reassuring',
      excited: 'excited',
      tired: 'gentle',
      confused: 'clarifying',
      grateful: 'warm',
      neutral: 'friendly',
    };

    return toneMap[emotion.primary] || 'friendly';
  }

  // Get emotional history
  getHistory(): EmotionalState[] {
    return this.history;
  }

  // Get profile
  getProfile(): EmotionalProfile {
    return this.profile;
  }

  // Update profile from feedback
  updateProfile(feedback: { context: string; preferred: string; avoided: string[] }): void {
    this.profile.preferences.push({
      context: feedback.context,
      preferredTone: feedback.preferred,
      avoidTopics: feedback.avoided,
      preferredResponses: [],
    });
  }
}

// ===== PROACTIVE INSIGHT ENGINE =====

export class ProactiveEngine {
  private insights: Map<string, ProactiveInsight> = new Map();
  private patternEngine: PatternEngine;
  private memoryEngine: MemoryEngine;

  constructor(patternEngine: PatternEngine, memoryEngine: MemoryEngine) {
    this.patternEngine = patternEngine;
    this.memoryEngine = memoryEngine;
  }

  // Generate insights based on context
  generateInsights(context: AssistantContext): ProactiveInsight[] {
    const now = Date.now();
    const insights: ProactiveInsight[] = [];

    // Check for time-based insights
    const hour = new Date().getHours();
    
    // Morning briefing
    if (hour >= 6 && hour <= 9) {
      insights.push({
        id: generateId(),
        type: 'information',
        title: 'Good morning! Here\'s your day ahead',
        description: 'Let me summarize your schedule and priorities',
        relevance: 0.9,
        urgency: 'medium',
        context: ['morning', 'routine', 'planning'],
        action: {
          type: 'show_briefing',
          label: 'View Daily Briefing',
          params: {},
        },
        createdAt: now,
        shown: false,
        dismissed: false,
        actedUpon: false,
      });
    }

    // Evening wind-down
    if (hour >= 20 && hour <= 23) {
      insights.push({
        id: generateId(),
        type: 'suggestion',
        title: 'Time to wind down',
        description: 'Would you like me to set up your evening routine?',
        relevance: 0.7,
        urgency: 'low',
        context: ['evening', 'relaxation', 'routine'],
        action: {
          type: 'evening_mode',
          label: 'Start Evening Mode',
          params: {},
        },
        createdAt: now,
        shown: false,
        dismissed: false,
        actedUpon: false,
      });
    }

    // Low battery warning
    if (context.batteryLevel < 20 && !context.isCharging) {
      insights.push({
        id: generateId(),
        type: 'warning',
        title: 'Battery Low',
        description: `Your battery is at ${context.batteryLevel}%. Want me to enable power saving?`,
        relevance: 1.0,
        urgency: 'high',
        context: ['battery', 'power', 'device'],
        action: {
          type: 'enable_power_save',
          label: 'Enable Power Saving',
          params: {},
        },
        createdAt: now,
        shown: false,
        dismissed: false,
        actedUpon: false,
      });
    }

    // Pattern-based insights
    const prediction = this.patternEngine.predictNextAction();
    if (prediction && prediction.confidence > 0.6) {
      insights.push({
        id: generateId(),
        type: 'suggestion',
        title: 'I noticed a pattern',
        description: prediction.action,
        relevance: prediction.confidence,
        urgency: 'low',
        context: ['pattern', 'prediction'],
        createdAt: now,
        shown: false,
        dismissed: false,
        actedUpon: false,
      });
    }

    // Memory-based insights
    const recentMemories = this.memoryEngine.getWorkingMemory();
    if (recentMemories.length > 0) {
      const lastImportant = recentMemories.find(m => m.importance > 0.7);
      if (lastImportant) {
        const ageHours = (now - lastImportant.lastAccessed) / (60 * 60 * 1000);
        if (ageHours > 24 && ageHours < 48) {
          insights.push({
            id: generateId(),
            type: 'reminder',
            title: 'Following up',
            description: `Remember: ${lastImportant.content.slice(0, 50)}...`,
            relevance: 0.6,
            urgency: 'medium',
            context: ['followup', 'memory'],
            createdAt: now,
            shown: false,
            dismissed: false,
            actedUpon: false,
          });
        }
      }
    }

    // Store insights
    insights.forEach(insight => {
      this.insights.set(insight.id, insight);
    });

    return insights.filter(i => !i.shown && !i.dismissed);
  }

  // Mark insight as shown
  markShown(id: string): void {
    const insight = this.insights.get(id);
    if (insight) {
      insight.shown = true;
    }
  }

  // Dismiss insight
  dismiss(id: string): void {
    const insight = this.insights.get(id);
    if (insight) {
      insight.dismissed = true;
    }
  }

  // Get pending insights
  getPendingInsights(): ProactiveInsight[] {
    return Array.from(this.insights.values())
      .filter(i => !i.shown && !i.dismissed && !i.actedUpon)
      .sort((a, b) => b.relevance - a.relevance);
  }
}

// ===== CONTEXT CARD GENERATOR =====

export class ContextCardGenerator {
  generateCards(context: AssistantContext): ContextCard[] {
    const cards: ContextCard[] = [];
    const now = Date.now();

    // Weather card (when online)
    if (context.connectivity === 'online') {
      cards.push({
        id: 'weather',
        type: 'weather',
        title: 'Weather',
        subtitle: 'Today\'s forecast',
        content: {
          primary: '24°C',
          secondary: 'Partly Cloudy',
          tertiary: 'High 28° / Low 18°',
          icon: '⛅',
        },
        actions: [
          { type: 'tap', label: 'Details', action: 'show_weather_details', params: {} },
        ],
        priority: 8,
        relevance: 0.9,
        freshness: 1.0,
        size: 'medium',
        position: 0,
        visible: true,
        lastUpdated: now,
        refreshInterval: 30 * 60 * 1000, // 30 minutes
      });
    }

    // Tasks card
    cards.push({
      id: 'tasks',
      type: 'tasks',
      title: 'Today\'s Tasks',
      subtitle: '3 pending',
      content: {
        primary: '3 of 8 tasks remaining',
        progress: 0.625,
        items: [
          { label: 'Team meeting', value: '2:00 PM', icon: '📅' },
          { label: 'Review report', value: 'Due today', icon: '📄' },
          { label: 'Call client', value: '4:00 PM', icon: '📞' },
        ],
      },
      actions: [
        { type: 'tap', label: 'View All', action: 'show_tasks', params: {} },
      ],
      priority: 9,
      relevance: 1.0,
      freshness: 1.0,
      size: 'medium',
      position: 1,
      visible: true,
      lastUpdated: now,
      refreshInterval: 60 * 1000, // 1 minute
    });

    // Calendar card
    cards.push({
      id: 'calendar',
      type: 'calendar',
      title: 'Upcoming',
      subtitle: 'Next event',
      content: {
        primary: 'Team Standup',
        secondary: 'In 30 minutes',
        tertiary: 'Conference Room A',
        icon: '🗓️',
      },
      actions: [
        { type: 'tap', label: 'Join', action: 'join_meeting', params: {} },
      ],
      priority: 10,
      relevance: 1.0,
      freshness: 1.0,
      size: 'small',
      position: 2,
      visible: true,
      lastUpdated: now,
      refreshInterval: 60 * 1000,
    });

    // Smart home card (if applicable)
    if (context.nearbyDevices.some(d => d.includes('home'))) {
      cards.push({
        id: 'smart_home',
        type: 'smart_home',
        title: 'Home',
        subtitle: '2 devices active',
        content: {
          primary: 'Living Room Lights',
          secondary: 'On - 80%',
          items: [
            { label: 'Thermostat', value: '22°C', icon: '🌡️' },
            { label: 'Security', value: 'Armed', icon: '🔒' },
          ],
        },
        actions: [
          { type: 'tap', label: 'Control', action: 'smart_home_control', params: {} },
        ],
        priority: 7,
        relevance: 0.8,
        freshness: 1.0,
        size: 'medium',
        position: 3,
        visible: true,
        lastUpdated: now,
        refreshInterval: 5 * 60 * 1000,
      });
    }

    return cards.sort((a, b) => b.priority - a.priority);
  }
}

// ===== ZARA AI MAIN ENGINE =====

export class ZaraEngine {
  private patternEngine: PatternEngine;
  private memoryEngine: MemoryEngine;
  private emotionalEngine: EmotionalEngine;
  private proactiveEngine: ProactiveEngine;
  private contextCardGenerator: ContextCardGenerator;

  constructor() {
    this.patternEngine = new PatternEngine();
    this.memoryEngine = new MemoryEngine();
    this.emotionalEngine = new EmotionalEngine();
    this.proactiveEngine = new ProactiveEngine(this.patternEngine, this.memoryEngine);
    this.contextCardGenerator = new ContextCardGenerator();
  }

  // Process input and generate response
  async process(
    input: string | MultiModalInput,
    context: AssistantContext
  ): Promise<ZaraResponse> {
    const text = typeof input === 'string' ? input : input.content as string;
    
    // Record event
    this.patternEngine.recordEvent('user_input', { text });

    // Analyze emotion
    const emotion = this.emotionalEngine.analyzeText(text);
    const tone = this.emotionalEngine.getResponseTone(emotion);

    // Check memory
    const relevantMemories = this.memoryEngine.recall(text);

    // Generate response
    const response = await this.generateResponse(text, emotion, relevantMemories, context);

    // Store in memory
    this.memoryEngine.remember(
      `User: ${text}`,
      'episodic',
      0.5,
      { emotions: [emotion.primary] }
    );
    this.memoryEngine.remember(
      `Assistant: ${response.content}`,
      'episodic',
      0.5,
      { category: 'response' }
    );

    return response;
  }

  // Generate response
  private async generateResponse(
    input: string,
    emotion: EmotionalState,
    memories: MemoryEntry[],
    context: AssistantContext
  ): Promise<ZaraResponse> {
    const tone = this.emotionalEngine.getResponseTone(emotion);
    
    // Response templates based on tone
    const greetings: Record<string, string[]> = {
      enthusiastic: ['Hey there! 😊', 'Hi! Great to hear from you!', 'Hello! What can I help with today?'],
      empathetic: ['I understand...', 'I hear you...', 'That sounds difficult.'],
      calm: ['I see.', 'Let me help with that.', 'Take a breath.'],
      reassuring: ['Don\'t worry, I\'m here.', 'We\'ll figure this out.', 'You\'ve got this.'],
      friendly: ['Hey!', 'Hi there!', 'What\'s up?'],
    };

    const toneGreetings = greetings[tone] || greetings.friendly;
    const greeting = toneGreetings[Math.floor(Math.random() * toneGreetings.length)];

    // Simple response logic (in production, this would use the AI model)
    let content = greeting;

    // Add context-aware content
    if (input.toLowerCase().includes('weather')) {
      content = `It's looking like a nice day! The current temperature is around 24°C with partly cloudy skies. Would you like more details?`;
    } else if (input.toLowerCase().includes('meeting') || input.toLowerCase().includes('schedule')) {
      content = `You have a team standup in about 30 minutes at Conference Room A. Should I set a reminder?`;
    } else if (input.toLowerCase().includes('remember')) {
      const toRemember = input.replace(/remember\s*/i, '');
      this.memoryEngine.remember(toRemember, 'semantic', 0.8);
      content = `Got it! I'll remember: "${toRemember}". Anything else?`;
    } else if (input.toLowerCase().includes('recall') || input.toLowerCase().includes('what did i')) {
      if (memories.length > 0) {
        content = `I remember: "${memories[0].content}". Is that what you were looking for?`;
      } else {
        content = `I don't have any memories matching that. Want me to remember something new?`;
      }
    } else if (input.toLowerCase().includes('thank')) {
      content = `You're welcome! 😊 Is there anything else I can help with?`;
    } else if (input.toLowerCase().includes('how are you')) {
      content = `I'm doing great, thanks for asking! Ready to help you with whatever you need. What's on your mind?`;
    } else {
      content = `${greeting} How can I assist you today?`;
    }

    return {
      id: generateId(),
      type: 'text',
      content,
      emotion: tone,
      confidence: 0.85,
      memory: memories.slice(0, 3).map(m => m.content),
      timestamp: Date.now(),
    };
  }

  // Get proactive insights
  getInsights(context: AssistantContext): ProactiveInsight[] {
    return this.proactiveEngine.generateInsights(context);
  }

  // Get context cards
  getCards(context: AssistantContext): ContextCard[] {
    return this.contextCardGenerator.generateCards(context);
  }

  // Learn from feedback
  learn(feedback: LearningFeedback): void {
    // Adjust emotional profile
    if (feedback.type === 'positive' || feedback.type === 'negative') {
      this.emotionalEngine.updateProfile({
        context: feedback.category,
        preferred: feedback.type === 'positive' ? feedback.response : '',
        avoided: feedback.type === 'negative' ? [feedback.response] : [],
      });
    }
  }

  // Get engines
  getPatternEngine(): PatternEngine { return this.patternEngine; }
  getMemoryEngine(): MemoryEngine { return this.memoryEngine; }
  getEmotionalEngine(): EmotionalEngine { return this.emotionalEngine; }
  getProactiveEngine(): ProactiveEngine { return this.proactiveEngine; }
}

// Export singleton instance
export const zaraEngine = new ZaraEngine();

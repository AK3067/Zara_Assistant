'use client';

import { useCallback, useMemo } from 'react';
import { useAssistantStore } from '@/store/assistant-store';
import type { QuickTask } from '@/types/assistant';

interface QuickTaskMatch {
  task: QuickTask;
  parameters: Record<string, string>;
  confidence: number;
}

interface UseQuickTaskDetectionReturn {
  matchQuickTask: (transcript: string) => QuickTaskMatch | null;
  getAllTriggers: () => string[];
  getQuickTaskByTrigger: (trigger: string) => QuickTask | undefined;
  executeQuickTask: (match: QuickTaskMatch) => string;
}

export function useQuickTaskDetection(): UseQuickTaskDetectionReturn {
  const { quickTasks, triggerQuickTask } = useAssistantStore();

  // Build regex patterns from triggers with parameters
  const taskPatterns = useMemo(() => {
    return quickTasks.map(task => {
      // If there's a trigger pattern, use it
      if (task.triggerPattern) {
        try {
          return {
            task,
            regex: new RegExp(`^${task.triggerPattern}$`, 'i'),
            hasParameters: true,
          };
        } catch {
          // Invalid regex, fall back to simple match
        }
      }

      // Check if trigger contains parameter placeholders
      const hasParams = task.trigger.includes('{') && task.trigger.includes('}');
      if (hasParams && task.parameters) {
        // Build pattern from trigger with parameters
        let pattern = task.trigger;
        task.parameters.forEach(param => {
          pattern = pattern.replace(
            `{${param.name}}`,
            `(?<${param.name}>.+)`
          );
        });
        try {
          return {
            task,
            regex: new RegExp(`^${pattern}$`, 'i'),
            hasParameters: true,
          };
        } catch {
          // Fall back to simple match
        }
      }

      // Simple exact match (for numeric triggers or simple words)
      return {
        task,
        regex: new RegExp(`^${task.trigger}$`, 'i'),
        hasParameters: false,
      };
    });
  }, [quickTasks]);

  // Match transcript against all quick tasks
  const matchQuickTask = useCallback((transcript: string): QuickTaskMatch | null => {
    const normalizedTranscript = transcript.toLowerCase().trim();

    // First try exact matches (for high priority)
    for (const { task, regex, hasParameters } of taskPatterns) {
      const match = normalizedTranscript.match(regex);
      if (match) {
        // Extract parameters if any
        const parameters: Record<string, string> = {};
        if (hasParameters && match.groups) {
          Object.assign(parameters, match.groups);
        }

        return {
          task,
          parameters,
          confidence: 1.0,
        };
      }
    }

    // Try partial matches (transcript starts with trigger)
    for (const { task, hasParameters } of taskPatterns) {
      if (normalizedTranscript.startsWith(task.trigger.toLowerCase())) {
        const parameters: Record<string, string> = {};
        
        // Extract remaining text as a parameter if applicable
        if (hasParameters && task.parameters && task.parameters.length > 0) {
          const remainingText = normalizedTranscript.slice(task.trigger.length).trim();
          if (remainingText) {
            // Use first parameter for remaining text
            parameters[task.parameters[0].name] = remainingText;
          }
        }

        return {
          task,
          parameters,
          confidence: 0.8,
        };
      }
    }

    // Try word-level matching for numeric triggers
    const words = normalizedTranscript.split(/\s+/);
    for (const word of words) {
      const numericTask = quickTasks.find(t => t.trigger === word || t.trigger === word.replace(/\D/g, ''));
      if (numericTask) {
        return {
          task: numericTask,
          parameters: {},
          confidence: 0.7,
        };
      }
    }

    return null;
  }, [taskPatterns, quickTasks]);

  // Get all trigger words for display/hints
  const getAllTriggers = useCallback(() => {
    return quickTasks.map(task => task.trigger);
  }, [quickTasks]);

  // Get a specific quick task by its trigger
  const getQuickTaskByTrigger = useCallback((trigger: string) => {
    return quickTasks.find(task => task.trigger.toLowerCase() === trigger.toLowerCase());
  }, [quickTasks]);

  // Execute a quick task and return the prompt to send to AI
  const executeQuickTask = useCallback((match: QuickTaskMatch): string => {
    const { task, parameters } = match;

    // Mark task as used
    triggerQuickTask(task.id);

    // If it's a voice macro, use the recorded instruction
    if (task.action === 'voice_macro' && task.data?.voiceMacro) {
      let prompt = task.data.voiceMacro;
      
      // Replace parameters in the macro
      Object.entries(parameters).forEach(([key, value]) => {
        prompt = prompt.replace(`{${key}}`, value);
      });
      
      return prompt;
    }

    // If there's an AI prompt template, use it
    if (task.data?.aiPromptTemplate) {
      let prompt = task.data.aiPromptTemplate;
      
      // Replace parameters in the template
      Object.entries(parameters).forEach(([key, value]) => {
        prompt = prompt.replace(`{${key}}`, value);
      });
      
      return prompt;
    }

    // Otherwise, generate a prompt based on the action type
    switch (task.action) {
      case 'send_message':
        const recipient = parameters.contact || parameters.recipient || task.data?.recipient || '';
        const message = parameters.message || parameters.text || '';
        return recipient 
          ? `Send a message to ${recipient}${message ? ` saying "${message}"` : ''}`
          : 'Who would you like to send a message to?';

      case 'make_call':
        const phoneContact = parameters.contact || parameters.phoneNumber || task.data?.phoneNumber || '';
        return phoneContact 
          ? `Call ${phoneContact}`
          : 'Who would you like to call?';

      case 'send_email':
        const email = parameters.email || parameters.emailAddress || task.data?.emailAddress || '';
        const subject = parameters.subject || '';
        const body = parameters.body || parameters.text || '';
        return email 
          ? `Send an email to ${email}${subject ? ` with subject "${subject}"` : ''}${body ? ` and body "${body}"` : ''}`
          : 'Who would you like to email?';

      case 'set_reminder':
        const reminderText = parameters.text || parameters.reminderText || task.data?.reminderText || '';
        const time = parameters.time || '';
        return reminderText 
          ? `Set a reminder${time ? ` for ${time}` : ''}: ${reminderText}`
          : 'What would you like me to remind you about?';

      case 'create_note':
        const noteTitle = parameters.text || parameters.noteTitle || task.data?.noteTitle || '';
        const noteContent = parameters.content || '';
        return noteTitle 
          ? `Create a note titled "${noteTitle}"${noteContent ? ` with content: ${noteContent}` : ''}`
          : 'What should I call this note?';

      case 'start_timer':
        const duration = parameters.number || parameters.duration || task.data?.duration || '';
        return duration 
          ? `Start a timer for ${duration} ${typeof duration === 'string' && duration.match(/^\d+$/) ? 'minutes' : ''}`
          : 'How long should I set the timer for?';

      case 'open_app':
        const url = parameters.url || parameters.text || task.data?.url || '';
        return url 
          ? `Open ${url}`
          : 'What would you like me to open?';

      case 'search_web':
        const query = parameters.text || parameters.query || '';
        return query 
          ? `Search the web for "${query}"`
          : 'What would you like me to search for?';

      case 'custom_command':
        const customPrompt = parameters.text || task.data?.customPrompt || '';
        return customPrompt || 'What would you like me to do?';

      default:
        return `Execute quick task: ${task.label}`;
    }
  }, [triggerQuickTask]);

  return {
    matchQuickTask,
    getAllTriggers,
    getQuickTaskByTrigger,
    executeQuickTask,
  };
}

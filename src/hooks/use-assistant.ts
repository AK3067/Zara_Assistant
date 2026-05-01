'use client';

import { useCallback } from 'react';
import { useAssistantStore } from '@/store/assistant-store';
import { useSpeechRecognition } from './use-speech-recognition';
import { useSpeechSynthesis } from './use-speech-synthesis';
import type { Message, QuickTask, QuickTaskAction } from '@/types/assistant';

interface UseAssistantReturn {
  // Chat
  sendMessage: (content: string) => Promise<void>;
  messages: Message[];
  isTyping: boolean;

  // Voice
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  transcript: string;
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  isVoiceSupported: boolean;

  // Quick Tasks
  checkForQuickTask: (text: string) => QuickTask | null;
  executeQuickTask: (task: QuickTask, additionalText?: string) => Promise<void>;

  // Mode
  mode: 'chat' | 'voice' | 'quick';
  setMode: (mode: 'chat' | 'voice' | 'quick') => void;

  // Processing
  isProcessing: boolean;
}

export function useAssistant(): UseAssistantReturn {
  const {
    messages,
    addMessage,
    isTyping,
    setIsTyping,
    isProcessing,
    setIsProcessing,
    setIsListening,
    setIsSpeaking,
    mode,
    setMode,
    settings,
    quickTasks,
    triggerQuickTask,
    saveCurrentConversation,
  } = useAssistantStore();

  // Normalize text for matching
  const normalizeText = useCallback((text: string): string => {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  }, []);

  // Check if text contains a quick task trigger
  const checkForQuickTask = useCallback((text: string): QuickTask | null => {
    const normalized = normalizeText(text);
    
    for (const task of quickTasks) {
      const normalizedTrigger = normalizeText(task.trigger);
      if (normalized === normalizedTrigger || normalized.startsWith(normalizedTrigger + ' ')) {
        return task;
      }
    }
    return null;
  }, [quickTasks, normalizeText]);

  // Execute a quick task action
  const executeQuickTask = useCallback(async (task: QuickTask, additionalText?: string) => {
    triggerQuickTask(task.id);
    setIsProcessing(true);

    try {
      const action = task.action;
      let response = '';

      switch (action) {
        case 'send_message':
          response = `📨 Preparing to send message${task.data?.recipient ? ` to ${task.data.recipient}` : ''}. ${additionalText ? `Message: "${additionalText}"` : 'What would you like to say?'}`;
          // In a real app, this would open the messaging app or API
          if (task.data?.recipient && additionalText) {
            response = `✅ Message sent to ${task.data.recipient}: "${additionalText}"`;
          }
          break;

        case 'make_call':
          if (task.data?.phoneNumber) {
            response = `📞 Calling ${task.data.phoneNumber}...`;
            // In a real app: window.location.href = `tel:${task.data.phoneNumber}`;
          } else {
            response = '📞 Who would you like to call?';
          }
          break;

        case 'set_reminder':
          response = `⏰ Setting reminder${task.data?.reminderText ? `: "${task.data.reminderText}"` : ''}${additionalText ? ` - ${additionalText}` : ''}`;
          break;

        case 'create_note':
          response = `📝 Created note${task.data?.noteTitle ? `: "${task.data.noteTitle}"` : ''}${additionalText ? ` - ${additionalText}` : ''}`;
          break;

        case 'start_timer':
          const duration = task.data?.duration || 5;
          response = `⏱️ Timer started for ${duration} minute${duration > 1 ? 's' : ''}.`;
          break;

        case 'send_email':
          response = `📧 Preparing email${task.data?.emailAddress ? ` to ${task.data.emailAddress}` : ''}${additionalText ? ` with subject: "${additionalText}"` : ''}`;
          break;

        case 'search_web':
          response = `🔍 Searching for "${additionalText || task.label}"...`;
          // In a real app: window.open(`https://www.google.com/search?q=${encodeURIComponent(additionalText || '')}`);
          break;

        case 'open_app':
          if (task.data?.url) {
            response = `🔗 Opening ${task.data.url}...`;
            // In a real app: window.open(task.data.url, '_blank');
          } else {
            response = '🔗 What would you like to open?';
          }
          break;

        case 'custom_command':
          // Process custom AI command
          const customPrompt = task.data?.customPrompt || additionalText || task.label;
          const aiResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: customPrompt }],
            }),
          });
          const data = await aiResponse.json();
          if (data.success && data.message) {
            response = data.message;
          } else {
            response = 'Sorry, I couldn\'t process that command.';
          }
          break;

        default:
          response = `✅ Quick task "${task.label}" executed!`;
      }

      // Add as message
      addMessage({ role: 'assistant', content: response, isVoice: true });

      // Speak if in voice mode
      if (mode === 'voice' && settings.enableVoiceResponse) {
        setIsSpeaking(true);
        await speak(response);
      }

    } catch (error) {
      console.error('Error executing quick task:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I couldn\'t execute that task. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [triggerQuickTask, setIsProcessing, addMessage, mode, settings.enableVoiceResponse, setIsSpeaking]);

  // Speech synthesis hook
  const {
    speak,
    isSpeaking,
    isSupported: isSynthesisSupported,
    stop: stopSpeaking,
  } = useSpeechSynthesis({
    onEnd: () => {
      setIsSpeaking(false);
      // Auto-restart listening in voice mode
      if (mode === 'voice' && settings.enableAutoListen) {
        setTimeout(() => startListening(), 500);
      }
    },
    onError: (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    },
  });

  // Speech recognition handler
  const handleSpeechResult = useCallback(
    async (transcript: string) => {
      if (transcript.trim()) {
        // First check if it's a quick task trigger
        const quickTask = checkForQuickTask(transcript);
        if (quickTask) {
          // Extract additional text after the trigger
          const triggerLength = normalizeText(quickTask.trigger).length;
          const additionalText = normalizeText(transcript).slice(triggerLength).trim();
          await executeQuickTask(quickTask, additionalText || undefined);
        } else {
          // Regular chat message
          await sendMessage(transcript);
        }
      }
    },
    [checkForQuickTask, executeQuickTask]
  );

  const handleSpeechError = useCallback((error: string) => {
    console.error('Speech recognition error:', error);
    setIsListening(false);
  }, [setIsListening]);

  // Speech recognition hook
  const {
    isListening,
    transcript,
    isSupported: isRecognitionSupported,
    startListening: startRecognition,
    stopListening: stopRecognition,
    resetTranscript,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
    language: settings.language,
    continuous: false,
    interimResults: true,
  });

  // Send message to AI
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isProcessing) return;

      // Add user message
      addMessage({ role: 'user', content: content.trim() });
      setIsProcessing(true);
      setIsTyping(true);

      try {
        // Prepare messages for API
        const apiMessages = messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));
        apiMessages.push({ role: 'user', content: content.trim() });

        // Call chat API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages }),
        });

        const data = await response.json();

        if (data.success && data.message) {
          // Add assistant message
          addMessage({ role: 'assistant', content: data.message });

          // Speak response if in voice mode
          if (mode === 'voice' && settings.enableVoiceResponse) {
            setIsSpeaking(true);
            // Extract text content from markdown for speech
            const textContent = data.message
              .replace(/```[\s\S]*?```/g, 'code block')
              .replace(/`[^`]+`/g, 'code')
              .replace(/\*\*([^*]+)\*\*/g, '$1')
              .replace(/\*([^*]+)\*/g, '$1')
              .replace(/#{1,6}\s/g, '')
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
            await speak(textContent);
          }

          // Save conversation
          saveCurrentConversation();
        } else {
          throw new Error(data.error || 'Failed to get response');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        addMessage({
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        });
      } finally {
        setIsProcessing(false);
        setIsTyping(false);
      }
    },
    [
      messages,
      isProcessing,
      addMessage,
      setIsProcessing,
      setIsTyping,
      setIsSpeaking,
      mode,
      settings.enableVoiceResponse,
      speak,
      saveCurrentConversation,
    ]
  );

  // Update speech settings when they change
  const handleSpeak = useCallback(
    async (text: string) => {
      setIsSpeaking(true);
      await speak(text);
    },
    [speak, setIsSpeaking]
  );

  return {
    // Chat
    sendMessage,
    messages,
    isTyping,

    // Voice
    startListening: () => {
      resetTranscript();
      setIsListening(true);
      startRecognition();
    },
    stopListening: () => {
      setIsListening(false);
      stopRecognition();
    },
    isListening,
    transcript,
    speak: handleSpeak,
    isSpeaking,
    isVoiceSupported: isRecognitionSupported && isSynthesisSupported,

    // Quick Tasks
    checkForQuickTask,
    executeQuickTask,

    // Mode
    mode,
    setMode,

    // Processing
    isProcessing,
  };
}

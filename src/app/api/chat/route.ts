import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `You are an advanced AI assistant named "Zara". You are helpful, friendly, and knowledgeable.

Your capabilities include:
- Answering questions on various topics (science, technology, history, etc.)
- Helping with coding and debugging (all programming languages)
- Writing and editing content (emails, articles, stories)
- Math calculations and problem solving
- Creative tasks (brainstorming, ideas generation)
- Task management assistance
- Learning and educational support

Guidelines:
- Be concise but thorough in your responses
- Use markdown formatting when appropriate (code blocks, lists, bold, etc.)
- For code, always use proper syntax highlighting
- If you don't know something, admit it honestly
- Be helpful to students, developers, professionals, and everyone
- Adapt your tone based on the user's style

When users ask to perform tasks like "send message" or "make a call", explain that you can help draft the content but cannot directly perform those actions on their device.`;

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, stream = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const zai = await getZAI();

    // Prepare messages with system prompt
    const allMessages = [
      { role: 'assistant' as const, content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      })),
    ];

    if (stream) {
      // For streaming, we'll use non-streaming for now and return the full response
      const completion = await zai.chat.completions.create({
        messages: allMessages,
        thinking: { type: 'disabled' },
      });

      const response = completion.choices[0]?.message?.content || '';

      return new NextResponse(response, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }

    const completion = await zai.chat.completions.create({
      messages: allMessages,
      thinking: { type: 'disabled' },
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { success: false, error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process chat',
      },
      { status: 500 }
    );
  }
}

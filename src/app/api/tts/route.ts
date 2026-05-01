import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Split long text into chunks for TTS (max 1024 chars per request)
function splitTextIntoChunks(text: string, maxLength = 900): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let currentChunk = '';
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'tongtong', speed = 1.0, volume = 1.0 } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // Validate text length
    if (text.length > 1024) {
      // Split into chunks and generate audio for first chunk
      const chunks = splitTextIntoChunks(text);
      if (chunks.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Text is empty after processing' },
          { status: 400 }
        );
      }

      const zai = await getZAI();
      const response = await zai.audio.tts.create({
        input: chunks[0],
        voice: voice,
        speed: Math.max(0.5, Math.min(2.0, speed)),
        volume: Math.max(0.1, Math.min(10, volume)),
        response_format: 'wav',
        stream: false,
      });

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(new Uint8Array(arrayBuffer));

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'no-cache',
          'X-Chunks-Remaining': (chunks.length - 1).toString(),
        },
      });
    }

    const zai = await getZAI();

    const response = await zai.audio.tts.create({
      input: text.trim(),
      voice: voice,
      speed: Math.max(0.5, Math.min(2.0, speed)),
      volume: Math.max(0.1, Math.min(10, volume)),
      response_format: 'wav',
      stream: false,
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate speech',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

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
    const { audioBase64, audioUrl } = body;

    if (!audioBase64 && !audioUrl) {
      return NextResponse.json(
        { success: false, error: 'Audio data (base64 or URL) is required' },
        { status: 400 }
      );
    }

    const zai = await getZAI();

    let response;

    if (audioBase64) {
      response = await zai.audio.asr.create({
        file_base64: audioBase64,
      });
    } else {
      // If URL provided, we'd need to fetch it first
      return NextResponse.json(
        { success: false, error: 'URL-based audio not yet supported. Please use base64.' },
        { status: 400 }
      );
    }

    const transcription = response.text;

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json({
        success: true,
        text: '',
        message: 'No speech detected in audio',
      });
    }

    return NextResponse.json({
      success: true,
      text: transcription,
    });
  } catch (error) {
    console.error('ASR API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transcribe audio',
      },
      { status: 500 }
    );
  }
}

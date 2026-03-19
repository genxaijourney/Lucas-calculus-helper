import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Instantiate the Google Cloud TTS client lazily
let client: TextToSpeechClient | null = null;

function getClient() {
  if (!client) {
    // For Vercel deployment, passing credentials natively is easier than file paths.
    // We check for GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY.
    // If not present, the client automatically falls back to GOOGLE_APPLICATION_CREDENTIALS.
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      client = new TextToSpeechClient({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          // Replace escaped newlines if they are passed as a single line string
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
      });
    } else {
      client = new TextToSpeechClient();
    }
  }
  return client;
}

const ALLOWED_VOICES = [
  'en-US-Neural2-J',
  'en-US-Neural2-F',
  'en-US-Journey-D',
  'en-US-Journey-F',
  'en-GB-Neural2-B',
  'en-US-Neural2-H',
];

export async function POST(request: NextRequest) {
  try {
    const { text, rate = 1, voiceId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Validate voiceId cleanly against approved list, fallback to Teen Male
    const safeVoiceId = ALLOWED_VOICES.includes(voiceId) ? voiceId : 'en-US-Neural2-J';

    const ttsClient = getClient();

    const ttsRequest = {
      input: { text },
      // Auto-extract language code from the voice logic (e.g. en-US or en-GB)
      voice: { languageCode: safeVoiceId.substring(0, 5), name: safeVoiceId },
      audioConfig: { audioEncoding: 'MP3' as const, speakingRate: rate },
    };

    const [response] = await ttsClient.synthesizeSpeech(ttsRequest);

    if (!response.audioContent) {
      throw new Error('No audio content returned from Google Cloud TTS');
    }

    return new NextResponse(response.audioContent as any, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: error.message || 'TTS generation failed' },
      { status: 500 }
    );
  }
}

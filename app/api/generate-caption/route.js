import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client.
// Requires GEMINI_API_KEY in your .env.local file.
let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  // Gracefully handle missing API key during local tests
  ai = null;
}

export async function POST(request) {
  console.log('[api/generate-caption] -> POST Called');
  try {
    const body = await request.json();
    const prompt = body?.prompt || '';

    // Fallback if API key is not mapped in environment variables yet
    if (!ai || !process.env.GEMINI_API_KEY) {
      console.warn("MOCK AI TRIGGERED: GEMINI_API_KEY not found in .env.local");
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[api/generate-caption] -> POST Exited (Mocked)');
      return NextResponse.json({
        caption: "Waiting for your Gemini API Key in .env to spark real magic! ✨"
      });
    }

    // Hit the incredibly fast gemini-2.5-flash model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a witty, warm florist who texts like a good friend — 
  modern, genuine, occasionally playful. Never poetic or old-fashioned.
  Write one short flower delivery message (max 2 sentences) based on the user's mood below.
  
  Rules:
  - Sound like a real person, not a greeting card
  - Use casual, conversational english — contractions are fine (you're, they'll, it's)
  - Light humour is welcome, but never cheesy or cringe
  - No floral metaphors unless they're ironic
  - No "may your day bloom" or anything Shakespearean
  - Output ONLY the message. No quotes, no labels, no commentary.
  
  User mood: ${prompt}`,
    });

    // Grab the direct text node returned
    const caption = response.text.trim().replace(/^["']|["']$/g, '');

    console.log('[api/generate-caption] -> POST Exited (Success)');
    return NextResponse.json({ caption });

  } catch (error) {
    console.error("Gemini API Error:", error);
    console.log('[api/generate-caption] -> POST Exited (Error)');
    return NextResponse.json(
      { error: 'Failed to generate floral caption with Gemini' },
      { status: 500 }
    );
  }
}

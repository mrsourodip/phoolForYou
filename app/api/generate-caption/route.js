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
      contents: `You are an expert florist and romantic poet. Write a single-sentence or very short, beautiful, playful flower delivery 
      message based strictly on the user's incoming mood. 
      Output ONLY the message itself. No quotes around it, no commentary, directly output the pure generated text.
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

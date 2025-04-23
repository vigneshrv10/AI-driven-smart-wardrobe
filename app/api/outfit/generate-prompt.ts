import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType, eventLocation, eventDate, temperature, clothing } = body;

    if (!eventType || !eventLocation || !eventDate || !temperature) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Construct the prompt for Gemini AI
    let prompt = `I'm going to ${eventLocation} on ${eventDate} for a ${eventType}`;
    
    if (clothing) {
      prompt += ` and I have this ${clothing} with me`;
    }
    
    prompt += `. The temperature at ${eventLocation} will be ${temperature} degrees Celsius on that day. Think about what outfit suits for it. Give me only prompt that I would give it to stability ai such that it would give me outfit image.`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to generate outfit prompt' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the generated text from Gemini's response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ prompt: generatedText });
  } catch (error) {
    console.error('Error generating outfit prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate outfit prompt' },
      { status: 500 }
    );
  }
} 
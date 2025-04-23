import { NextResponse } from 'next/server';

// Try using environment variables first, fall back to hardcoded keys if not available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDdeJjL8-7b3GDtfjcv4uTKjZL99IgB39E';
const STABILITY_API_KEY = process.env.STABILITY_API_KEY // 'sk-pmoXUlmPHyx46BNGlqvMDXf97PNqPxGMUsOA1xCDltp9if1s';
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '0653067dea7dd29420b5a88e859a0d0a';

// Debug: Log API keys availability (not the actual keys for security)
console.log('API Keys available:', {
  openweather: !!OPENWEATHER_API_KEY,
  gemini: !!GEMINI_API_KEY,
  stability: !!STABILITY_API_KEY
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { eventType, eventLocation, eventDate, clothing } = body;

    console.log('Received event details:', { eventType, eventLocation, eventDate });

    if (!eventType || !eventLocation || !eventDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Ensure location is properly formatted
    eventLocation = eventLocation.trim();

    // Step 1: Get weather data for the event location
    console.log(`Fetching weather for location: ${eventLocation}`);
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(eventLocation)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json();
      console.error('Weather API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch weather data for the location' },
        { status: weatherResponse.status }
      );
    }

    const weatherData = await weatherResponse.json();
    const temperature = weatherData.main.temp;
    const weatherDescription = weatherData.weather[0].description;

    // Step 2: Generate outfit prompt using Gemini AI
    let prompt = `I'm going to ${eventLocation} on ${eventDate} for a ${eventType}`;
    
    if (clothing) {
      prompt += ` and I have this ${clothing} with me`;
    }
    
    prompt += `. The temperature at ${eventLocation} will be ${temperature} degrees Celsius on that day and the weather will be ${weatherDescription}. Think about what outfit suits for it. Give me only prompt that I would give it to stability ai such that it would give me outfit image.`;

    const geminiResponse = await fetch(
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

    if (!geminiResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to generate outfit prompt' },
        { status: geminiResponse.status }
      );
    }

    const geminiData = await geminiResponse.json();
    const generatedPrompt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedPrompt) {
      return NextResponse.json(
        { error: 'Failed to generate a valid outfit prompt' },
        { status: 500 }
      );
    }

    // Step 3: Generate outfit image using Stability AI
    try {
      const formData = new FormData();
      formData.append('prompt', generatedPrompt);
      formData.append('output_format', 'jpeg');

      const stabilityResponse = await fetch(
        'https://api.stability.ai/v2beta/stable-image/generate/ultra',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STABILITY_API_KEY}`,
            'Accept': 'image/*',
          },
          body: formData,
        }
      );

      if (!stabilityResponse.ok) {
        // If we get a payment required error, return the prompt without the image
        if (stabilityResponse.status === 402) {
          console.log('Stability AI payment required. Returning prompt without image.');
          return NextResponse.json({
            weather: {
              temperature,
              description: weatherDescription,
              location: weatherData.name,
              country: weatherData.sys.country,
            },
            outfit: {
              prompt: generatedPrompt,
              image: null,
              paymentRequired: true,
              message: "The Stability AI service requires payment or has exceeded the free tier limits. You can still see the outfit recommendation text, but the image generation is unavailable."
            }
          });
        }
        
        // For other errors, return the error message
        return NextResponse.json(
          { error: 'Failed to generate outfit image' },
          { status: stabilityResponse.status }
        );
      }

      // Get the image data as a blob
      const imageBlob = await stabilityResponse.blob();
      
      // Convert the blob to a base64 string
      const arrayBuffer = await imageBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString('base64');

      return NextResponse.json({
        weather: {
          temperature,
          description: weatherDescription,
          location: weatherData.name,
          country: weatherData.sys.country,
        },
        outfit: {
          prompt: generatedPrompt,
          image: `data:${imageBlob.type};base64,${base64Image}`
        }
      });
    } catch (error) {
      console.error('Error generating outfit image:', error);
      return NextResponse.json(
        { error: 'Failed to generate outfit image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating outfit recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to generate outfit recommendation' },
      { status: 500 }
    );
  }
} 
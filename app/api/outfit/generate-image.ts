import { NextResponse } from 'next/server';

const STABILITY_API_KEY = process.env.STABILITY_API_KEY // 'sk-pmoXUlmPHyx46BNGlqvMDXf97PNqPxGMUsOA1xCDltp9if1s';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create a FormData object for the Stability AI API request
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', 'jpeg');

    // Call Stability AI API
    const response = await fetch(
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

    if (!response.ok) {
      let errorMessage = 'Failed to generate image';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Get the image data as a blob
    const imageBlob = await response.blob();
    
    // Convert the blob to a base64 string
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    return NextResponse.json({
      image: `data:${imageBlob.type};base64,${base64Image}`
    });
  } catch (error) {
    console.error('Error generating outfit image:', error);
    return NextResponse.json(
      { error: 'Failed to generate outfit image' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Recommendation from '@/models/Recommendation';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    // Get session ID from cookies
    const sessionId = cookies().get('session')?.value;
    if (!sessionId) {
      console.log('No session cookie found');
      return NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    // Connect to database and find user
    await dbConnect();
    const user = await User.findById(sessionId);
    if (!user) {
      console.log('No user found for session ID:', sessionId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Get all recommendations for the user
    const recommendations = await Recommendation.find({ userId: user._id }).sort({ eventDate: 1 });
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get session ID from cookies
    const sessionId = cookies().get('session')?.value;
    if (!sessionId) {
      console.log('No session cookie found');
      return NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    // Connect to database and find user
    await dbConnect();
    console.log('Looking for user with session ID:', sessionId);
    const user = await User.findById(sessionId);
    if (!user) {
      console.log('No user found for session ID:', sessionId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('Received data:', data);
    const { eventTitle, eventType, eventDate, eventLocation, clothing, weather, outfit } = data;

    // Validate required fields
    if (!eventTitle || !eventType || !eventDate || !eventLocation) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create recommendation with user reference
    const recommendation = await Recommendation.create({
      userId: user._id,
      eventTitle,
      eventType,
      eventDate,
      eventLocation,
      clothing,
      weather,
      outfit: {
        prompt: outfit.prompt,
        imageUrl: outfit.image, // Store the image URL
        paymentRequired: outfit.paymentRequired,
        message: outfit.message,
      },
    });

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Error saving recommendation:', error);
    // Return more detailed error message
    return NextResponse.json(
      { 
        error: 'Failed to save recommendation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
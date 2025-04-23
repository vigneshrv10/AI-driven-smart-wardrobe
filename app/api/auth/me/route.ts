import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export async function GET() {
  try {
    // Get authenticated user using our utility function
    const user = await getAuthenticatedUser();
    
    if (!user) {
      // Clear invalid session cookie if it exists
      const response = NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
      
      const sessionCookie = cookies().get('session');
      if (sessionCookie) {
        response.cookies.set('session', '', {
          httpOnly: true,
          expires: new Date(0),
          path: '/',
        });
      }
      
      return response;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
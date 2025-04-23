import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(request: Request) {
  try {
    // Get user token from cookies
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { profilePicture, preferences } = data;

    // Connect to database
    await dbConnect();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        $set: {
          ...(profilePicture && { profilePicture }),
          ...(preferences && {
            'preferences.style': preferences.style,
            'preferences.colors': preferences.colors,
            'preferences.occasions': preferences.occasions,
          }),
        },
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 
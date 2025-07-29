import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
                   process.env.BACKEND_URL || 
                   (process.env.NODE_ENV === 'production' 
                     ? 'https://collabbridge.onrender.com' 
                     : 'http://localhost:5001');

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (!username || username.length < 3) {
      return NextResponse.json({ 
        available: false, 
        error: 'Username must be at least 3 characters long' 
      }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_URL}/api/users/check-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json({ 
      available: false, 
      error: 'Failed to check username availability' 
    }, { status: 500 });
  }
}

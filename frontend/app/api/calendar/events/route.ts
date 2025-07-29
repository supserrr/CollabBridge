import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
                   process.env.BACKEND_URL || 
                   (process.env.NODE_ENV === 'production' 
                     ? 'https://collabbridge.onrender.com' 
                     : 'http://localhost:5001');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    
    // Forward query parameters to backend
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const backendUrl = `${BACKEND_URL}/api/calendar/events?${params.toString()}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

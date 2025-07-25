import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    
    // Get the backend URL from environment or use production backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
                       process.env.BACKEND_URL || 
                       (process.env.NODE_ENV === 'production' 
                         ? 'https://collabbridge.onrender.com' 
                         : 'http://localhost:5001');
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/profiles/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error proxying profile request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

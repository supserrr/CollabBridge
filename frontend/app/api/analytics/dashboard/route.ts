import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
                   process.env.BACKEND_URL || 
                   (process.env.NODE_ENV === 'production' 
                     ? 'https://collabbridge.onrender.com' 
                     : 'http://localhost:5001');

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/analytics/dashboard`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard analytics' }, { status: 500 });
  }
}
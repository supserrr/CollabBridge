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

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';
    const minRating = searchParams.get('minRating') || '0';
    const maxRate = searchParams.get('maxRate') || '1000';
    const availability = searchParams.get('availability') || '';
    const skills = searchParams.get('skills') || '';

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(category && { category }),
      ...(location && { location }),
      ...(minRating && { minRating }),
      ...(maxRate && { maxRate }),
      ...(availability && { availability }),
      ...(skills && { skills }),
    });

    const response = await fetch(`${BACKEND_URL}/api/search/professionals?${queryParams}`, {
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
    console.error('Error fetching professionals:', error);
    return NextResponse.json({ error: 'Failed to fetch professionals' }, { status: 500 });
  }
}

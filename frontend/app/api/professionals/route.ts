import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
                   process.env.BACKEND_URL || 
                   (process.env.NODE_ENV === 'production' 
                     ? 'https://collabbridge.onrender.com' 
                     : 'http://localhost:5002');

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    
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

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(`${BACKEND_URL}/api/search/professionals?${queryParams}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const backendData = await response.json();
    
    // Transform the response to match frontend expectations
    const transformedData = {
      professionals: backendData.data?.professionals || [],
      total: backendData.data?.pagination?.total || 0,
      page: backendData.data?.pagination?.page || 1,
      pages: backendData.data?.pagination?.pages || 1,
      filters: backendData.data?.filters || {}
    };
    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json({ error: 'Failed to fetch professionals' }, { status: 500 });
  }
}

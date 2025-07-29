import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    
    // Forward query parameters to backend
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/events?${params.toString()}`;
    
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
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transform frontend data structure to backend expected format
    const transformedData = {
      title: body.title,
      description: body.description,
      eventType: mapEventType(body.eventType),
      startDate: combineDateAndTime(body.date, body.startTime),
      endDate: combineDateAndTime(body.date, body.endTime),
      location: body.location?.venue || '',
      address: [
        body.location?.address,
        body.location?.city,
        body.location?.state,
        body.location?.zipCode
      ].filter(Boolean).join(', '),
      budget: body.budget?.total || null,
      currency: body.budget?.currency || 'USD',
      requiredRoles: body.requirements?.map((req: any) => req.category) || [],
      tags: body.preferences?.themes || [],
      maxApplicants: null,
      isPublic: body.isPublic !== false,
      requirements: body.requirements?.map((req: any) => req.description).join('\n') || '',
      deadlineDate: body.applicationDeadline || null,
    };

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/events`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// Helper functions
function mapEventType(frontendType: string): string {
  const typeMap: Record<string, string> = {
    'Wedding': 'WEDDING',
    'Corporate Event': 'CORPORATE',
    'Birthday Party': 'BIRTHDAY',
    'Anniversary': 'BIRTHDAY',
    'Conference': 'CONFERENCE',
    'Workshop': 'CONFERENCE',
    'Charity Event': 'OTHER',
    'Product Launch': 'CORPORATE',
    'Graduation': 'OTHER',
    'Baby Shower': 'BIRTHDAY',
    'Holiday Party': 'OTHER',
    'Concert': 'CONCERT',
    'Other': 'OTHER'
  };
  
  return typeMap[frontendType] || 'OTHER';
}

function combineDateAndTime(date: string | null, time: string): string {
  if (!date || !time) {
    throw new Error('Date and time are required');
  }
  
  const dateObj = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj.toISOString();
}

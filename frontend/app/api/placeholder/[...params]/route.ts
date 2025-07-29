import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  const resolvedParams = await params;
  const [width, height] = resolvedParams.params;
  
  // Redirect to a placeholder service
  const placeholderUrl = `https://picsum.photos/${width}/${height}`;
  
  return NextResponse.redirect(placeholderUrl);
}

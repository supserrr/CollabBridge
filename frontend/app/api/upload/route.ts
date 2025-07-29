import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      message: 'Image Upload API',
      status: 'ready',
      maxSize: '10MB',
      supportedFormats: ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP']
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No file provided',
          message: 'Please select a file to upload'
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid file type',
          message: 'Only PNG, JPG, GIF, and WEBP images are allowed'
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false,
          error: 'File too large',
          message: 'File size must be less than 10MB'
        },
        { status: 400 }
      );
    }

    // Convert file to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using your ml_default preset
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/dh3ntu9nh/image/upload`,
      {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('file', new Blob([buffer], { type: file.type }));
          formData.append('upload_preset', 'ml_default');
          formData.append('folder', 'events'); // Organize uploads in an events folder
          return formData;
        })(),
      }
    );

    if (!cloudinaryResponse.ok) {
      const error = await cloudinaryResponse.text();
      console.error('Cloudinary upload failed:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Upload failed',
          message: 'Failed to upload image to cloud storage'
        },
        { status: 500 }
      );
    }

    const cloudinaryResult = await cloudinaryResponse.json();

    return NextResponse.json({ 
      success: true,
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      format: cloudinaryResult.format,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Upload failed',
        message: 'An error occurred while uploading the file'
      },
      { status: 500 }
    );
  }
}
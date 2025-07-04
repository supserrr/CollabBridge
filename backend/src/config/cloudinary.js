// backend/src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

console.log('🌤️  Initializing Cloudinary configuration...');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dh3ntu9nh',
  api_key: process.env.CLOUDINARY_API_KEY || '876738923338492',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'qzic4PwdYetSJlDGWFWoP1hGAYE',
});

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

// Storage configuration for different file types
const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `collabbridge/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [
        { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
      ],
      public_id: (req, file) => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        return `${folder}_${timestamp}_${randomStr}`;
      },
    },
  });
};

// Profile pictures storage
const profileStorage = createStorage('profiles', ['jpg', 'jpeg', 'png', 'webp']);

// Portfolio images storage
const portfolioStorage = createStorage('portfolio', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Event images storage
const eventStorage = createStorage('events', ['jpg', 'jpeg', 'png', 'webp']);

// Document storage (for contracts, etc.)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'collabbridge/documents',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw',
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      return `document_${timestamp}_${randomStr}`;
    },
  },
});

// Create multer instances
const uploadProfile = multer({
  storage: profileStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures'), false);
    }
  },
});

const uploadPortfolio = multer({
  storage: portfolioStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for portfolio'), false);
    }
  },
});

const uploadEvent = multer({
  storage: eventStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for events'), false);
    }
  },
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB for documents
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  },
});

// Utility functions
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️  Image deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to delete image from Cloudinary:', error);
    throw error;
  }
};

const getImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations
  });
};

// Generate different image sizes
const generateImageVariants = (publicId) => {
  return {
    original: getImageUrl(publicId),
    thumbnail: getImageUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
    medium: getImageUrl(publicId, { width: 400, height: 400, crop: 'limit' }),
    large: getImageUrl(publicId, { width: 800, height: 800, crop: 'limit' }),
  };
};

// Error handling middleware for file uploads
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds the maximum allowed limit'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Number of files exceeds the maximum allowed'
      });
    }
  }
  
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
  }

  console.error('Upload error:', error);
  res.status(500).json({
    error: 'Upload failed',
    message: 'An error occurred while uploading the file'
  });
};

// Test connection on startup
testCloudinaryConnection();

module.exports = {
  cloudinary,
  uploadProfile,
  uploadPortfolio,
  uploadEvent,
  uploadDocument,
  deleteImage,
  getImageUrl,
  generateImageVariants,
  handleUploadError,
  testCloudinaryConnection
};
// backend/src/controllers/uploadController.js
const { 
  uploadProfile, 
  uploadPortfolio, 
  uploadEvent, 
  uploadDocument,
  deleteImage,
  generateImageVariants,
  handleUploadError 
} = require('../config/cloudinary');
const { query } = require('../config/database');
const { validationResult } = require('express-validator');

class UploadController {
  // Upload profile picture
  static uploadProfilePicture = [
    uploadProfile.single('profilePicture'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            error: 'No file uploaded',
            message: 'Please select a profile picture to upload'
          });
        }

        const userId = req.user.userId;
        const imageData = {
          public_id: req.file.filename,
          url: req.file.path,
          variants: generateImageVariants(req.file.filename)
        };

        // Update user profile with new image
        const updateQuery = `
          UPDATE users 
          SET profile_picture = $1, updated_at = NOW()
          WHERE user_id = $2
          RETURNING user_id, name, profile_picture
        `;
        
        const result = await query(updateQuery, [JSON.stringify(imageData), userId]);

        res.status(200).json({
          message: 'Profile picture uploaded successfully',
          user: result.rows[0],
          image: imageData
        });

      } catch (error) {
        console.error('Profile picture upload error:', error);
        res.status(500).json({
          error: 'Upload failed',
          message: 'Failed to upload profile picture'
        });
      }
    }
  ];

  // Upload portfolio images
  static uploadPortfolioImages = [
    uploadPortfolio.array('portfolioImages', 10), // Max 10 images
    async (req, res) => {
      try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({
            error: 'No files uploaded',
            message: 'Please select portfolio images to upload'
          });
        }

        const userId = req.user.userId;
        const uploadedImages = req.files.map(file => ({
          public_id: file.filename,
          url: file.path,
          variants: generateImageVariants(file.filename),
          uploaded_at: new Date().toISOString()
        }));

        // Get existing portfolio
        const existingQuery = 'SELECT portfolio_images FROM users WHERE user_id = $1';
        const existingResult = await query(existingQuery, [userId]);
        
        let existingImages = [];
        if (existingResult.rows[0]?.portfolio_images) {
          existingImages = JSON.parse(existingResult.rows[0].portfolio_images);
        }

        // Combine with new images
        const allImages = [...existingImages, ...uploadedImages];

        // Update user portfolio
        const updateQuery = `
          UPDATE users 
          SET portfolio_images = $1, updated_at = NOW()
          WHERE user_id = $2
          RETURNING user_id, name, portfolio_images
        `;
        
        const result = await query(updateQuery, [JSON.stringify(allImages), userId]);

        res.status(200).json({
          message: `${uploadedImages.length} portfolio images uploaded successfully`,
          user: result.rows[0],
          uploaded_images: uploadedImages,
          total_images: allImages.length
        });

      } catch (error) {
        console.error('Portfolio upload error:', error);
        res.status(500).json({
          error: 'Upload failed',
          message: 'Failed to upload portfolio images'
        });
      }
    }
  ];

  // Upload event image
  static uploadEventImage = [
    uploadEvent.single('eventImage'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            error: 'No file uploaded',
            message: 'Please select an event image to upload'
          });
        }

        const { eventId } = req.params;
        const imageData = {
          public_id: req.file.filename,
          url: req.file.path,
          variants: generateImageVariants(req.file.filename)
        };

        // Verify event ownership
        const eventCheck = await query(
          'SELECT planner_id FROM events WHERE event_id = $1',
          [eventId]
        );

        if (!eventCheck.rows.length) {
          return res.status(404).json({
            error: 'Event not found',
            message: 'Event with the specified ID was not found'
          });
        }

        if (eventCheck.rows[0].planner_id !== req.user.userId) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You can only upload images to your own events'
          });
        }

        // Update event with image
        const updateQuery = `
          UPDATE events 
          SET event_image = $1, updated_at = NOW()
          WHERE event_id = $2
          RETURNING event_id, title, event_image
        `;
        
        const result = await query(updateQuery, [JSON.stringify(imageData), eventId]);

        res.status(200).json({
          message: 'Event image uploaded successfully',
          event: result.rows[0],
          image: imageData
        });

      } catch (error) {
        console.error('Event image upload error:', error);
        res.status(500).json({
          error: 'Upload failed',
          message: 'Failed to upload event image'
        });
      }
    }
  ];

  // Delete portfolio image
  static deletePortfolioImage = async (req, res) => {
    try {
      const { publicId } = req.params;
      const userId = req.user.userId;

      // Get current portfolio
      const portfolioQuery = 'SELECT portfolio_images FROM users WHERE user_id = $1';
      const portfolioResult = await query(portfolioQuery, [userId]);
      
      if (!portfolioResult.rows[0]?.portfolio_images) {
        return res.status(404).json({
          error: 'No portfolio found',
          message: 'No portfolio images found for this user'
        });
      }

      let images = JSON.parse(portfolioResult.rows[0].portfolio_images);
      const imageIndex = images.findIndex(img => img.public_id === publicId);

      if (imageIndex === -1) {
        return res.status(404).json({
          error: 'Image not found',
          message: 'Image not found in portfolio'
        });
      }

      // Remove from array
      images.splice(imageIndex, 1);

      // Update database
      const updateQuery = `
        UPDATE users 
        SET portfolio_images = $1, updated_at = NOW()
        WHERE user_id = $2
        RETURNING user_id, portfolio_images
      `;
      
      await query(updateQuery, [JSON.stringify(images), userId]);

      // Delete from Cloudinary
      try {
        await deleteImage(publicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue even if Cloudinary deletion fails
      }

      res.status(200).json({
        message: 'Portfolio image deleted successfully',
        remaining_images: images.length
      });

    } catch (error) {
      console.error('Delete portfolio image error:', error);
      res.status(500).json({
        error: 'Delete failed',
        message: 'Failed to delete portfolio image'
      });
    }
  };

  // Delete profile picture
  static deleteProfilePicture = async (req, res) => {
    try {
      const userId = req.user.userId;

      // Get current profile picture
      const userQuery = 'SELECT profile_picture FROM users WHERE user_id = $1';
      const userResult = await query(userQuery, [userId]);
      
      if (!userResult.rows[0]?.profile_picture) {
        return res.status(404).json({
          error: 'No profile picture found',
          message: 'No profile picture to delete'
        });
      }

      const profilePicture = JSON.parse(userResult.rows[0].profile_picture);

      // Update database
      const updateQuery = `
        UPDATE users 
        SET profile_picture = NULL, updated_at = NOW()
        WHERE user_id = $1
        RETURNING user_id, name
      `;
      
      await query(updateQuery, [userId]);

      // Delete from Cloudinary
      try {
        await deleteImage(profilePicture.public_id);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue even if Cloudinary deletion fails
      }

      res.status(200).json({
        message: 'Profile picture deleted successfully'
      });

    } catch (error) {
      console.error('Delete profile picture error:', error);
      res.status(500).json({
        error: 'Delete failed',
        message: 'Failed to delete profile picture'
      });
    }
  };

  // Get upload statistics
  static getUploadStats = async (req, res) => {
    try {
      const userId = req.user.userId;

      const statsQuery = `
        SELECT 
          user_id,
          name,
          profile_picture,
          portfolio_images,
          CASE 
            WHEN profile_picture IS NOT NULL THEN 1 
            ELSE 0 
          END as has_profile_picture,
          CASE 
            WHEN portfolio_images IS NOT NULL THEN 
              jsonb_array_length(portfolio_images::jsonb)
            ELSE 0 
          END as portfolio_count
        FROM users 
        WHERE user_id = $1
      `;

      const result = await query(statsQuery, [userId]);
      const user = result.rows[0];

      res.status(200).json({
        upload_stats: {
          has_profile_picture: Boolean(user.has_profile_picture),
          portfolio_count: parseInt(user.portfolio_count) || 0,
          max_portfolio_images: 20,
          max_file_size_mb: parseInt(process.env.MAX_FILE_SIZE) / (1024 * 1024) || 10
        }
      });

    } catch (error) {
      console.error('Get upload stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch upload statistics',
        message: 'An error occurred while fetching upload statistics'
      });
    }
  };
}

module.exports = UploadController;
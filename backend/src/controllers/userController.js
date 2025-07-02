// backend/src/controllers/userController.js
const User = require('../models/User');
const { validationResult } = require('express-validator');

class UserController {
  // Get all professionals with filtering
  static async getProfessionals(req, res) {
    try {
      const {
        location,
        availability,
        minRating,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        location,
        availability,
        minRating: minRating ? parseFloat(minRating) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const professionals = await User.findProfessionals(filters);

      res.status(200).json({
        professionals,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: professionals.length
        }
      });

    } catch (error) {
      console.error('Get professionals error:', error);
      res.status(500).json({
        error: 'Failed to fetch professionals',
        message: 'An error occurred while fetching creative professionals'
      });
    }
  }

  // Get single user profile by ID
  static async getUserById(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User with the specified ID was not found'
        });
      }

      // Remove sensitive information for public profile
      const publicProfile = {
        id: user.user_id,
        name: user.name,
        role: user.role,
        bio: user.bio,
        location: user.location,
        rating: user.rating,
        availability_status: user.availability_status,
        created_at: user.created_at
      };

      // Add contact info only if user is requesting their own profile or has permission
      if (req.user && req.user.userId === userId) {
        publicProfile.email = user.email;
        publicProfile.phone = user.phone;
      }

      res.status(200).json({
        user: publicProfile
      });

    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        error: 'Failed to fetch user',
        message: 'An error occurred while fetching user profile'
      });
    }
  }

  // Search professionals
  static async searchProfessionals(req, res) {
    try {
      const { q: searchTerm, location, minRating, limit = 20, offset = 0 } = req.query;

      if (!searchTerm || searchTerm.trim().length < 2) {
        return res.status(400).json({
          error: 'Invalid search term',
          message: 'Search term must be at least 2 characters long'
        });
      }

      const filters = {
        location,
        minRating: minRating ? parseFloat(minRating) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      // Basic search in name and bio
      let searchText = `
        SELECT user_id, name, bio, location, rating, availability_status, created_at
        FROM users 
        WHERE role = 'professional'
          AND (
            LOWER(name) LIKE LOWER($1) OR 
            LOWER(bio) LIKE LOWER($1) OR
            LOWER(location) LIKE LOWER($1)
          )
      `;
      
      const values = [`%${searchTerm.trim()}%`];
      let paramCount = 2;

      if (filters.location) {
        searchText += ` AND LOWER(location) LIKE LOWER($${paramCount})`;
        values.push(`%${filters.location}%`);
        paramCount++;
      }

      if (filters.minRating) {
        searchText += ` AND rating >= $${paramCount}`;
        values.push(filters.minRating);
        paramCount++;
      }

      searchText += ` ORDER BY rating DESC, created_at DESC`;

      if (filters.limit) {
        searchText += ` LIMIT $${paramCount}`;
        values.push(filters.limit);
        paramCount++;
      }

      if (filters.offset) {
        searchText += ` OFFSET $${paramCount}`;
        values.push(filters.offset);
      }

      const { query } = require('../config/database');
      const result = await query(searchText, values);

      res.status(200).json({
        professionals: result.rows,
        search_term: searchTerm.trim(),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: result.rows.length
        }
      });

    } catch (error) {
      console.error('Search professionals error:', error);
      res.status(500).json({
        error: 'Failed to search professionals',
        message: 'An error occurred while searching professionals'
      });
    }
  }

  // Update user profile (already handled in authController, but kept for completeness)
  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { userId } = req.params;

      // Users can only update their own profile
      if (req.user.userId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only update your own profile'
        });
      }

      const { name, bio, phone, location, availability_status } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (bio !== undefined) updateData.bio = bio.trim();
      if (phone !== undefined) updateData.phone = phone.trim();
      if (location !== undefined) updateData.location = location.trim();
      if (availability_status !== undefined) updateData.availability_status = availability_status;

      const updatedUser = await User.update(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User profile not found'
        });
      }

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.user_id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          bio: updatedUser.bio,
          phone: updatedUser.phone,
          location: updatedUser.location,
          rating: updatedUser.rating,
          availability_status: updatedUser.availability_status,
          created_at: updatedUser.created_at,
          updated_at: updatedUser.updated_at
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: 'An error occurred while updating user profile'
      });
    }
  }

  // Get user statistics
  static async getUserStats(req, res) {
    try {
      const stats = await User.getStats();

      res.status(200).json({
        statistics: {
          total_users: parseInt(stats.total_users) || 0,
          total_planners: parseInt(stats.total_planners) || 0,
          total_professionals: parseInt(stats.total_professionals) || 0,
          available_professionals: parseInt(stats.available_professionals) || 0
        }
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch user statistics',
        message: 'An error occurred while fetching user statistics'
      });
    }
  }

  // Get top-rated professionals
  static async getTopRatedProfessionals(req, res) {
    try {
      const { limit = 10 } = req.query;

      const filters = {
        minRating: 4.0,
        availability: 'available',
        limit: parseInt(limit),
        offset: 0
      };

      const topProfessionals = await User.findProfessionals(filters);

      // Sort by rating and number of reviews (if available)
      const sortedProfessionals = topProfessionals.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return new Date(a.created_at) - new Date(b.created_at);
      });

      res.status(200).json({
        top_professionals: sortedProfessionals,
        criteria: {
          minimum_rating: 4.0,
          availability: 'available'
        }
      });

    } catch (error) {
      console.error('Get top-rated professionals error:', error);
      res.status(500).json({
        error: 'Failed to fetch top-rated professionals',
        message: 'An error occurred while fetching top-rated professionals'
      });
    }
  }

  // Get professionals by location
  static async getProfessionalsByLocation(req, res) {
    try {
      const { location } = req.params;
      const { limit = 20, offset = 0, minRating, availability } = req.query;

      const filters = {
        location: location,
        minRating: minRating ? parseFloat(minRating) : undefined,
        availability,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const professionals = await User.findProfessionals(filters);

      res.status(200).json({
        professionals,
        location: location,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: professionals.length
        }
      });

    } catch (error) {
      console.error('Get professionals by location error:', error);
      res.status(500).json({
        error: 'Failed to fetch professionals by location',
        message: 'An error occurred while fetching professionals by location'
      });
    }
  }

  // Toggle availability status (professionals only)
  static async toggleAvailability(req, res) {
    try {
      // Only professionals can toggle availability
      if (req.user.role !== 'professional') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only creative professionals can toggle availability status'
        });
      }

      const { availability_status } = req.body;

      const validStatuses = ['available', 'busy', 'unavailable'];
      if (!validStatuses.includes(availability_status)) {
        return res.status(400).json({
          error: 'Invalid status',
          message: 'Availability status must be one of: available, busy, unavailable'
        });
      }

      const updatedUser = await User.update(req.user.userId, { availability_status });

      res.status(200).json({
        message: 'Availability status updated successfully',
        availability_status: updatedUser.availability_status
      });

    } catch (error) {
      console.error('Toggle availability error:', error);
      res.status(500).json({
        error: 'Failed to update availability',
        message: 'An error occurred while updating availability status'
      });
    }
  }

  // Get user's dashboard summary
  static async getDashboardSummary(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;

      let summary = {
        user: {
          id: userId,
          role: userRole
        }
      };

      if (userRole === 'planner') {
        // Get planner-specific data
        const { query } = require('../config/database');
        
        const eventsQuery = `
          SELECT 
            COUNT(*) as total_events,
            COUNT(CASE WHEN status = 'open' THEN 1 END) as open_events,
            COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming_events
          FROM events WHERE planner_id = $1
        `;
        
        const applicationsQuery = `
          SELECT 
            COUNT(a.*) as total_applications,
            COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_applications
          FROM applications a
          JOIN events e ON a.event_id = e.event_id
          WHERE e.planner_id = $1
        `;

        const [eventsResult, applicationsResult] = await Promise.all([
          query(eventsQuery, [userId]),
          query(applicationsQuery, [userId])
        ]);

        summary.events = eventsResult.rows[0];
        summary.applications = applicationsResult.rows[0];

      } else if (userRole === 'professional') {
        // Get professional-specific data
        const { query } = require('../config/database');
        
        const applicationsQuery = `
          SELECT 
            COUNT(*) as total_applications,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_applications,
            COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_applications
          FROM applications WHERE professional_id = $1
        `;
        
        const reviewsQuery = `
          SELECT 
            COUNT(*) as total_reviews,
            ROUND(AVG(rating), 2) as average_rating
          FROM reviews WHERE to_user_id = $1
        `;

        const [applicationsResult, reviewsResult] = await Promise.all([
          query(applicationsQuery, [userId]),
          query(reviewsQuery, [userId])
        ]);

        summary.applications = applicationsResult.rows[0];
        summary.reviews = reviewsResult.rows[0];
      }

      res.status(200).json({
        dashboard: summary
      });

    } catch (error) {
      console.error('Get dashboard summary error:', error);
      res.status(500).json({
        error: 'Failed to fetch dashboard summary',
        message: 'An error occurred while fetching dashboard summary'
      });
    }
  }
}

module.exports = UserController;
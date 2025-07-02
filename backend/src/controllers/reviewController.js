// backend/src/controllers/reviewController.js
const Review = require('../models/Review');
const User = require('../models/User');
const Application = require('../models/Application');
const { validationResult } = require('express-validator');

class ReviewController {
  // Create a new review
  static async createReview(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { 
        to_user_id, 
        application_id, 
        rating, 
        comment = '' 
      } = req.body;

      // Verify the application exists and user has permission to review
      const application = await Application.findById(application_id);
      if (!application) {
        return res.status(404).json({
          error: 'Application not found',
          message: 'Application with the specified ID was not found'
        });
      }

      // Verify the application is accepted (only accepted applications can be reviewed)
      if (application.status !== 'accepted') {
        return res.status(400).json({
          error: 'Cannot review',
          message: 'You can only review accepted collaborations'
        });
      }

      // Verify user is part of this application
      const canReview = 
        (req.user.userId === application.professional_id && to_user_id === application.planner_id) ||
        (req.user.userId === application.planner_id && to_user_id === application.professional_id);

      if (!canReview) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only review users you have worked with'
        });
      }

      // Check if review already exists
      const existingReview = await Review.findByApplicationAndReviewer(
        application_id, 
        req.user.userId
      );

      if (existingReview) {
        return res.status(409).json({
          error: 'Review already exists',
          message: 'You have already reviewed this collaboration'
        });
      }

      // Verify the target user exists
      const targetUser = await User.findById(to_user_id);
      if (!targetUser) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Target user not found'
        });
      }

      const reviewData = {
        from_user_id: req.user.userId,
        to_user_id,
        application_id,
        rating,
        comment: comment.trim()
      };

      const newReview = await Review.create(reviewData);

      // Update user's average rating
      await Review.updateUserRating(to_user_id);

      res.status(201).json({
        message: 'Review created successfully',
        review: newReview
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        error: 'Failed to create review',
        message: 'An error occurred while creating the review'
      });
    }
  }

  // Get reviews for a specific user
  static async getUserReviews(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 20, offset = 0, rating_filter } = req.query;

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User with the specified ID was not found'
        });
      }

      const filters = {
        rating_filter: rating_filter ? parseInt(rating_filter) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const reviews = await Review.findByUser(userId, filters);
      const stats = await Review.getUserReviewStats(userId);

      res.status(200).json({
        reviews,
        user: {
          id: user.user_id,
          name: user.name,
          role: user.role,
          current_rating: user.rating
        },
        stats: {
          total_reviews: parseInt(stats.total_reviews) || 0,
          average_rating: parseFloat(stats.average_rating) || 0,
          rating_distribution: stats.rating_distribution || {}
        },
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: reviews.length
        }
      });

    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({
        error: 'Failed to fetch reviews',
        message: 'An error occurred while fetching user reviews'
      });
    }
  }

  // Get reviews written by current user
  static async getMyReviews(req, res) {
    try {
      const { limit = 20, offset = 0 } = req.query;

      const filters = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const reviews = await Review.findByReviewer(req.user.userId, filters);

      res.status(200).json({
        reviews,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: reviews.length
        }
      });

    } catch (error) {
      console.error('Get my reviews error:', error);
      res.status(500).json({
        error: 'Failed to fetch your reviews',
        message: 'An error occurred while fetching your reviews'
      });
    }
  }

  // Get single review by ID
  static async getReviewById(req, res) {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId);
      
      if (!review) {
        return res.status(404).json({
          error: 'Review not found',
          message: 'Review with the specified ID was not found'
        });
      }

      res.status(200).json({
        review
      });

    } catch (error) {
      console.error('Get review by ID error:', error);
      res.status(500).json({
        error: 'Failed to fetch review',
        message: 'An error occurred while fetching the review'
      });
    }
  }

  // Update a review (only by the reviewer)
  static async updateReview(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      const review = await Review.findById(reviewId);
      
      if (!review) {
        return res.status(404).json({
          error: 'Review not found',
          message: 'Review with the specified ID was not found'
        });
      }

      // Only the reviewer can update their review
      if (review.from_user_id !== req.user.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only update your own reviews'
        });
      }

      const updateData = {};
      if (rating !== undefined) updateData.rating = rating;
      if (comment !== undefined) updateData.comment = comment.trim();

      const updatedReview = await Review.update(reviewId, updateData);

      // Update user's average rating if rating changed
      if (rating !== undefined && rating !== review.rating) {
        await Review.updateUserRating(review.to_user_id);
      }

      res.status(200).json({
        message: 'Review updated successfully',
        review: updatedReview
      });

    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        error: 'Failed to update review',
        message: 'An error occurred while updating the review'
      });
    }
  }

  // Delete a review (only by the reviewer)
  static async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId);
      
      if (!review) {
        return res.status(404).json({
          error: 'Review not found',
          message: 'Review with the specified ID was not found'
        });
      }

      // Only the reviewer can delete their review
      if (review.from_user_id !== req.user.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only delete your own reviews'
        });
      }

      const deletedReview = await Review.delete(reviewId);

      // Update user's average rating after deletion
      await Review.updateUserRating(review.to_user_id);

      res.status(200).json({
        message: 'Review deleted successfully',
        review_id: deletedReview.review_id
      });

    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        error: 'Failed to delete review',
        message: 'An error occurred while deleting the review'
      });
    }
  }

  // Get pending reviews for current user (collaborations they can review)
  static async getPendingReviews(req, res) {
    try {
      const pendingReviews = await Review.findPendingReviews(req.user.userId);

      res.status(200).json({
        pending_reviews: pendingReviews,
        count: pendingReviews.length
      });

    } catch (error) {
      console.error('Get pending reviews error:', error);
      res.status(500).json({
        error: 'Failed to fetch pending reviews',
        message: 'An error occurred while fetching pending reviews'
      });
    }
  }

  // Get review statistics
  static async getReviewStats(req, res) {
    try {
      const stats = await Review.getOverallStats();

      res.status(200).json({
        statistics: {
          total_reviews: parseInt(stats.total_reviews) || 0,
          average_rating: parseFloat(stats.average_rating) || 0,
          reviews_this_month: parseInt(stats.reviews_this_month) || 0,
          top_rated_professionals: stats.top_rated_professionals || [],
          recent_reviews: stats.recent_reviews || []
        }
      });

    } catch (error) {
      console.error('Get review stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch review statistics',
        message: 'An error occurred while fetching review statistics'
      });
    }
  }

  // Get reviews for a specific application/collaboration
  static async getApplicationReviews(req, res) {
    try {
      const { applicationId } = req.params;

      // Verify application exists
      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({
          error: 'Application not found',
          message: 'Application with the specified ID was not found'
        });
      }

      // Check if user has access to this application
      const hasAccess = 
        application.professional_id === req.user.userId ||
        application.planner_id === req.user.userId;

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to view reviews for this application'
        });
      }

      const reviews = await Review.findByApplication(applicationId);

      res.status(200).json({
        reviews,
        application: {
          id: application.app_id,
          event_title: application.event_title,
          status: application.status
        }
      });

    } catch (error) {
      console.error('Get application reviews error:', error);
      res.status(500).json({
        error: 'Failed to fetch application reviews',
        message: 'An error occurred while fetching application reviews'
      });
    }
  }
}

module.exports = ReviewController;
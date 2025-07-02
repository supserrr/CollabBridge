// backend/src/models/Review.js
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Review {
  static async create(reviewData) {
    const { 
      from_user_id, 
      to_user_id, 
      application_id, 
      rating, 
      comment = '' 
    } = reviewData;
    
    const reviewId = uuidv4();
    
    const text = `
      INSERT INTO reviews (
        review_id, from_user_id, to_user_id, application_id, rating, comment, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING review_id, from_user_id, to_user_id, application_id, rating, comment, created_at
    `;
    
    const values = [reviewId, from_user_id, to_user_id, application_id, rating, comment];
    
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findById(reviewId) {
    const text = `
      SELECT r.*, 
             from_user.name as reviewer_name, from_user.role as reviewer_role,
             to_user.name as reviewee_name, to_user.role as reviewee_role,
             e.title as event_title, e.date as event_date
      FROM reviews r
      JOIN users from_user ON r.from_user_id = from_user.user_id
      JOIN users to_user ON r.to_user_id = to_user.user_id
      JOIN applications a ON r.application_id = a.app_id
      JOIN events e ON a.event_id = e.event_id
      WHERE r.review_id = $1
    `;
    
    const result = await query(text, [reviewId]);
    return result.rows[0];
  }

  static async findByUser(userId, filters = {}) {
    let text = `
      SELECT r.*, 
             from_user.name as reviewer_name, from_user.role as reviewer_role,
             e.title as event_title, e.date as event_date, e.event_type
      FROM reviews r
      JOIN users from_user ON r.from_user_id = from_user.user_id
      JOIN applications a ON r.application_id = a.app_id
      JOIN events e ON a.event_id = e.event_id
      WHERE r.to_user_id = $1
    `;
    
    const values = [userId];
    let paramCount = 2;

    if (filters.rating_filter) {
      text += ` AND r.rating = ${paramCount}`;
      values.push(filters.rating_filter);
      paramCount++;
    }

    text += ` ORDER BY r.created_at DESC`;

    if (filters.limit) {
      text += ` LIMIT ${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      text += ` OFFSET ${paramCount}`;
      values.push(filters.offset);
    }

    const result = await query(text, values);
    return result.rows;
  }

  static async findByReviewer(reviewerId, filters = {}) {
    let text = `
      SELECT r.*, 
             to_user.name as reviewee_name, to_user.role as reviewee_role,
             e.title as event_title, e.date as event_date, e.event_type
      FROM reviews r
      JOIN users to_user ON r.to_user_id = to_user.user_id
      JOIN applications a ON r.application_id = a.app_id
      JOIN events e ON a.event_id = e.event_id
      WHERE r.from_user_id = $1
    `;
    
    const values = [reviewerId];
    let paramCount = 2;

    text += ` ORDER BY r.created_at DESC`;

    if (filters.limit) {
      text += ` LIMIT ${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      text += ` OFFSET ${paramCount}`;
      values.push(filters.offset);
    }

    const result = await query(text, values);
    return result.rows;
  }

  static async findByApplication(applicationId) {
    const text = `
      SELECT r.*, 
             from_user.name as reviewer_name, from_user.role as reviewer_role,
             to_user.name as reviewee_name, to_user.role as reviewee_role
      FROM reviews r
      JOIN users from_user ON r.from_user_id = from_user.user_id
      JOIN users to_user ON r.to_user_id = to_user.user_id
      WHERE r.application_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await query(text, [applicationId]);
    return result.rows;
  }

  static async findByApplicationAndReviewer(applicationId, reviewerId) {
    const text = `
      SELECT * FROM reviews 
      WHERE application_id = $1 AND from_user_id = $2
    `;
    
    const result = await query(text, [applicationId, reviewerId]);
    return result.rows[0];
  }

  static async update(reviewId, updateData) {
    const allowedFields = ['rating', 'comment'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = ${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(reviewId);

    const text = `
      UPDATE reviews 
      SET ${updates.join(', ')}
      WHERE review_id = ${paramCount}
      RETURNING review_id, from_user_id, to_user_id, application_id, 
                rating, comment, created_at, updated_at
    `;

    const result = await query(text, values);
    return result.rows[0];
  }

  static async delete(reviewId) {
    const text = 'DELETE FROM reviews WHERE review_id = $1 RETURNING review_id';
    const result = await query(text, [reviewId]);
    return result.rows[0];
  }

  static async getUserReviewStats(userId) {
    const text = `
      SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(rating), 2) as average_rating,
        JSON_OBJECT_AGG(rating, count) as rating_distribution
      FROM (
        SELECT 
          rating,
          COUNT(*) as count
        FROM reviews 
        WHERE to_user_id = $1
        GROUP BY rating
      ) rating_counts
    `;
    
    const result = await query(text, [userId]);
    return result.rows[0];
  }

  static async updateUserRating(userId) {
    const text = `
      UPDATE users 
      SET rating = (
        SELECT COALESCE(ROUND(AVG(rating), 2), 0)
        FROM reviews 
        WHERE to_user_id = $1
      )
      WHERE user_id = $1
      RETURNING rating
    `;
    
    const result = await query(text, [userId]);
    return result.rows[0];
  }

  static async findPendingReviews(userId) {
    const text = `
      SELECT DISTINCT
        a.app_id,
        a.event_id,
        e.title as event_title,
        e.date as event_date,
        CASE 
          WHEN a.professional_id = $1 THEN a.planner_id
          ELSE a.professional_id
        END as can_review_user_id,
        CASE 
          WHEN a.professional_id = $1 THEN planner.name
          ELSE professional.name
        END as can_review_user_name,
        CASE 
          WHEN a.professional_id = $1 THEN 'planner'
          ELSE 'professional'
        END as can_review_user_role
      FROM applications a
      JOIN events e ON a.event_id = e.event_id
      JOIN users planner ON e.planner_id = planner.user_id
      JOIN users professional ON a.professional_id = professional.user_id
      WHERE a.status = 'accepted'
        AND (a.professional_id = $1 OR e.planner_id = $1)
        AND e.date < CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1 FROM reviews r 
          WHERE r.application_id = a.app_id 
            AND r.from_user_id = $1
        )
      ORDER BY e.date DESC
    `;
    
    const result = await query(text, [userId]);
    return result.rows;
  }

  static async getOverallStats() {
    const statsText = `
      SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(rating), 2) as average_rating,
        COUNT(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN 1 END) as reviews_this_month
      FROM reviews
    `;
    
    const topRatedText = `
      SELECT 
        u.user_id,
        u.name,
        u.role,
        u.rating,
        COUNT(r.review_id) as review_count
      FROM users u
      LEFT JOIN reviews r ON u.user_id = r.to_user_id
      WHERE u.role = 'professional' AND u.rating >= 4.0
      GROUP BY u.user_id, u.name, u.role, u.rating
      HAVING COUNT(r.review_id) >= 3
      ORDER BY u.rating DESC, COUNT(r.review_id) DESC
      LIMIT 5
    `;
    
    const recentReviewsText = `
      SELECT 
        r.rating,
        r.comment,
        r.created_at,
        from_user.name as reviewer_name,
        to_user.name as reviewee_name,
        e.title as event_title
      FROM reviews r
      JOIN users from_user ON r.from_user_id = from_user.user_id
      JOIN users to_user ON r.to_user_id = to_user.user_id
      JOIN applications a ON r.application_id = a.app_id
      JOIN events e ON a.event_id = e.event_id
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    const [statsResult, topRatedResult, recentResult] = await Promise.all([
      query(statsText),
      query(topRatedText),
      query(recentReviewsText)
    ]);

    return {
      ...statsResult.rows[0],
      top_rated_professionals: topRatedResult.rows,
      recent_reviews: recentResult.rows
    };
  }

  static async getReviewTrends(days = 30) {
    const text = `
      SELECT 
        DATE(created_at) as review_date,
        COUNT(*) as review_count,
        ROUND(AVG(rating), 2) as average_rating
      FROM reviews
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY review_date DESC
    `;
    
    const result = await query(text);
    return result.rows;
  }

  static async getTopReviewedEvents(limit = 10) {
    const text = `
      SELECT 
        e.event_id,
        e.title,
        e.date,
        e.event_type,
        COUNT(r.review_id) as review_count,
        ROUND(AVG(r.rating), 2) as average_rating
      FROM events e
      JOIN applications a ON e.event_id = a.event_id
      JOIN reviews r ON a.app_id = r.application_id
      GROUP BY e.event_id, e.title, e.date, e.event_type
      HAVING COUNT(r.review_id) >= 2
      ORDER BY review_count DESC, average_rating DESC
      LIMIT $1
    `;
    
    const result = await query(text, [limit]);
    return result.rows;
  }
}

module.exports = Review;
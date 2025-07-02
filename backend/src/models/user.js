// backend/src/models/User.js
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(userData) {
    const { name, email, role, bio = '', phone = '', location = '' } = userData;
    const userId = uuidv4();
    
    const text = `
      INSERT INTO users (user_id, name, email, role, bio, phone, location, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING user_id, name, email, role, bio, phone, location, rating, created_at
    `;
    
    const values = [userId, name, email, role, bio, phone, location];
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findById(userId) {
    const text = `
      SELECT user_id, name, email, role, bio, phone, location, rating, 
             availability_status, created_at, updated_at
      FROM users 
      WHERE user_id = $1
    `;
    
    const result = await query(text, [userId]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const text = `
      SELECT user_id, name, email, role, bio, phone, location, rating,
             availability_status, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;
    
    const result = await query(text, [email]);
    return result.rows[0];
  }

  static async findProfessionals(filters = {}) {
    let text = `
      SELECT user_id, name, email, bio, phone, location, rating,
             availability_status, created_at
      FROM users 
      WHERE role = 'professional'
    `;
    
    const values = [];
    let paramCount = 1;

    if (filters.location) {
      text += ` AND LOWER(location) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.location}%`);
      paramCount++;
    }

    if (filters.availability) {
      text += ` AND availability_status = $${paramCount}`;
      values.push(filters.availability);
      paramCount++;
    }

    if (filters.minRating) {
      text += ` AND rating >= $${paramCount}`;
      values.push(filters.minRating);
      paramCount++;
    }

    text += ` ORDER BY rating DESC, created_at DESC`;

    if (filters.limit) {
      text += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      text += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result = await query(text, values);
    return result.rows;
  }

  static async update(userId, updateData) {
    const allowedFields = ['name', 'bio', 'phone', 'location', 'availability_status'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const text = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING user_id, name, email, role, bio, phone, location, rating,
                availability_status, created_at, updated_at
    `;

    const result = await query(text, values);
    return result.rows[0];
  }

  static async updateRating(userId, newRating) {
    const text = `
      UPDATE users 
      SET rating = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING rating
    `;
    
    const result = await query(text, [newRating, userId]);
    return result.rows[0];
  }

  static async delete(userId) {
    const text = 'DELETE FROM users WHERE user_id = $1 RETURNING user_id';
    const result = await query(text, [userId]);
    return result.rows[0];
  }

  static async getStats() {
    const text = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'planner' THEN 1 END) as total_planners,
        COUNT(CASE WHEN role = 'professional' THEN 1 END) as total_professionals,
        COUNT(CASE WHEN role = 'professional' AND availability_status = 'available' THEN 1 END) as available_professionals
      FROM users
    `;
    
    const result = await query(text);
    return result.rows[0];
  }
}

module.exports = User;
// backend/src/models/Application.js
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Application {
  static async create(applicationData) {
    const { 
      event_id, 
      professional_id, 
      message = '',
      status = 'pending'
    } = applicationData;
    
    const appId = uuidv4();
    
    const text = `
      INSERT INTO applications (
        app_id, event_id, professional_id, message, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING app_id, event_id, professional_id, message, status, 
                created_at, responded_at, response_message
    `;
    
    const values = [appId, event_id, professional_id, message, status];
    
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findById(appId) {
    const text = `
      SELECT a.*, 
             e.title as event_title, e.date as event_date, e.location as event_location,
             e.planner_id, e.event_type, e.budget_range,
             p.name as professional_name, p.email as professional_email, 
             p.phone as professional_phone, p.rating as professional_rating,
             planner.name as planner_name, planner.email as planner_email
      FROM applications a
      JOIN events e ON a.event_id = e.event_id
      JOIN users p ON a.professional_id = p.user_id
      JOIN users planner ON e.planner_id = planner.user_id
      WHERE a.app_id = $1
    `;
    
    const result = await query(text, [appId]);
    return result.rows[0];
  }

  static async findByEvent(eventId, filters = {}) {
    let text = `
      SELECT a.*, 
             p.name as professional_name, p.email as professional_email, 
             p.phone as professional_phone, p.rating as professional_rating,
             p.bio as professional_bio, p.location as professional_location
      FROM applications a
      JOIN users p ON a.professional_id = p.user_id
      WHERE a.event_id = $1
    `;
    
    const values = [eventId];
    let paramCount = 2;

    if (filters.status) {
      text += ` AND a.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    text += ` ORDER BY a.created_at DESC`;

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

  static async findByProfessional(professionalId, filters = {}) {
    let text = `
      SELECT a.*, 
             e.title as event_title, e.date as event_date, e.location as event_location,
             e.event_type, e.budget_range, e.status as event_status,
             planner.name as planner_name, planner.email as planner_email
      FROM applications a
      JOIN events e ON a.event_id = e.event_id
      JOIN users planner ON e.planner_id = planner.user_id
      WHERE a.professional_id = $1
    `;
    
    const values = [professionalId];
    let paramCount = 2;

    if (filters.status) {
      text += ` AND a.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    text += ` ORDER BY a.created_at DESC`;

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

  static async findByEventAndProfessional(eventId, professionalId) {
    const text = `
      SELECT * FROM applications 
      WHERE event_id = $1 AND professional_id = $2
    `;
    
    const result = await query(text, [eventId, professionalId]);
    return result.rows[0];
  }

  static async update(appId, updateData) {
    const allowedFields = ['status', 'response_message', 'responded_at'];
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
    values.push(appId);

    const text = `
      UPDATE applications 
      SET ${updates.join(', ')}
      WHERE app_id = $${paramCount}
      RETURNING app_id, event_id, professional_id, message, status, 
                response_message, created_at, responded_at, updated_at
    `;

    const result = await query(text, values);
    return result.rows[0];
  }

  static async delete(appId) {
    const text = 'DELETE FROM applications WHERE app_id = $1 RETURNING app_id';
    const result = await query(text, [appId]);
    return result.rows[0];
  }

  static async getPlannerStats(plannerId) {
    const text = `
      SELECT 
        COUNT(a.*) as total_applications,
        COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_applications,
        COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) as accepted_applications,
        COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_applications,
        CASE 
          WHEN COUNT(a.*) > 0 THEN 
            ROUND((COUNT(CASE WHEN a.status = 'accepted' THEN 1 END)::float / COUNT(a.*)::float) * 100, 2)
          ELSE 0 
        END as success_rate
      FROM applications a
      JOIN events e ON a.event_id = e.event_id
      WHERE e.planner_id = $1
    `;
    
    const result = await query(text, [plannerId]);
    return result.rows[0];
  }

  static async getProfessionalStats(professionalId) {
    const text = `
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_applications,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_applications,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_applications,
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(CASE WHEN status = 'accepted' THEN 1 END)::float / COUNT(*)::float) * 100, 2)
          ELSE 0 
        END as success_rate
      FROM applications
      WHERE professional_id = $1
    `;
    
    const result = await query(text, [professionalId]);
    return result.rows[0];
  }

  static async getRecentApplications(limit = 10) {
    const text = `
      SELECT a.*, 
             e.title as event_title, e.date as event_date,
             p.name as professional_name,
             planner.name as planner_name
      FROM applications a
      JOIN events e ON a.event_id = e.event_id
      JOIN users p ON a.professional_id = p.user_id
      JOIN users planner ON e.planner_id = planner.user_id
      ORDER BY a.created_at DESC
      LIMIT $1
    `;
    
    const result = await query(text, [limit]);
    return result.rows;
  }

  static async getApplicationsByStatus(status, limit = 20, offset = 0) {
    const text = `
      SELECT a.*, 
             e.title as event_title, e.date as event_date,
             p.name as professional_name,
             planner.name as planner_name
      FROM applications a
      JOIN events e ON a.event_id = e.event_id
      JOIN users p ON a.professional_id = p.user_id
      JOIN users planner ON e.planner_id = planner.user_id
      WHERE a.status = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await query(text, [status, limit, offset]);
    return result.rows;
  }

  static async countApplicationsForEvent(eventId) {
    const text = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM applications
      WHERE event_id = $1
    `;
    
    const result = await query(text, [eventId]);
    return result.rows[0];
  }
}

module.exports = Application;
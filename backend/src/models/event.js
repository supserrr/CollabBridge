// backend/src/models/Event.js
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Event {
  static async create(eventData) {
    const { 
      planner_id, 
      title, 
      description, 
      location, 
      date, 
      event_type = 'other',
      required_roles = [],
      budget_range = '',
      is_public = true 
    } = eventData;
    
    const eventId = uuidv4();
    
    const text = `
      INSERT INTO events (
        event_id, planner_id, title, description, location, date, 
        event_type, required_roles, budget_range, is_public, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING event_id, planner_id, title, description, location, date,
                event_type, required_roles, budget_range, is_public, 
                status, created_at
    `;
    
    const values = [
      eventId, planner_id, title, description, location, date,
      event_type, JSON.stringify(required_roles), budget_range, is_public
    ];
    
    const result = await query(text, values);
    const event = result.rows[0];
    
    // Parse required_roles back to array
    if (event.required_roles) {
      event.required_roles = JSON.parse(event.required_roles);
    }
    
    return event;
  }

  static async findById(eventId) {
    const text = `
      SELECT e.*, u.name as planner_name, u.email as planner_email,
             u.phone as planner_phone
      FROM events e
      JOIN users u ON e.planner_id = u.user_id
      WHERE e.event_id = $1
    `;
    
    const result = await query(text, [eventId]);
    const event = result.rows[0];
    
    if (event && event.required_roles) {
      event.required_roles = JSON.parse(event.required_roles);
    }
    
    return event;
  }

  static async findAll(filters = {}) {
    let text = `
      SELECT e.*, u.name as planner_name
      FROM events e
      JOIN users u ON e.planner_id = u.user_id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    // Apply filters
    if (filters.is_public !== undefined) {
      text += ` AND e.is_public = $${paramCount}`;
      values.push(filters.is_public);
      paramCount++;
    }

    if (filters.location) {
      text += ` AND LOWER(e.location) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.location}%`);
      paramCount++;
    }

    if (filters.event_type) {
      text += ` AND e.event_type = $${paramCount}`;
      values.push(filters.event_type);
      paramCount++;
    }

    if (filters.date_from) {
      text += ` AND e.date >= $${paramCount}`;
      values.push(filters.date_from);
      paramCount++;
    }

    if (filters.date_to) {
      text += ` AND e.date <= $${paramCount}`;
      values.push(filters.date_to);
      paramCount++;
    }

    if (filters.status) {
      text += ` AND e.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.planner_id) {
      text += ` AND e.planner_id = $${paramCount}`;
      values.push(filters.planner_id);
      paramCount++;
    }

    // Exclude past events by default unless specified
    if (!filters.include_past) {
      text += ` AND e.date >= CURRENT_DATE`;
    }

    text += ` ORDER BY e.date ASC, e.created_at DESC`;

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
    
    // Parse required_roles for each event
    return result.rows.map(event => ({
      ...event,
      required_roles: event.required_roles ? JSON.parse(event.required_roles) : []
    }));
  }

  static async findByPlanner(plannerId, filters = {}) {
    return this.findAll({ ...filters, planner_id: plannerId, include_past: true });
  }

  static async update(eventId, updateData) {
    const allowedFields = [
      'title', 'description', 'location', 'date', 'event_type',
      'required_roles', 'budget_range', 'is_public', 'status'
    ];
    
    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        if (key === 'required_roles') {
          updates.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          updates.push(`${key} = $${paramCount}`);
          values.push(updateData[key]);
        }
        paramCount++;
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(eventId);

    const text = `
      UPDATE events 
      SET ${updates.join(', ')}
      WHERE event_id = $${paramCount}
      RETURNING event_id, planner_id, title, description, location, date,
                event_type, required_roles, budget_range, is_public, 
                status, created_at, updated_at
    `;

    const result = await query(text, values);
    const event = result.rows[0];
    
    if (event && event.required_roles) {
      event.required_roles = JSON.parse(event.required_roles);
    }
    
    return event;
  }

  static async delete(eventId) {
    const text = 'DELETE FROM events WHERE event_id = $1 RETURNING event_id';
    const result = await query(text, [eventId]);
    return result.rows[0];
  }

  static async getStats() {
    const text = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_events,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_events,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_events,
        COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming_events
      FROM events
    `;
    
    const result = await query(text);
    return result.rows[0];
  }

  static async searchEvents(searchTerm, filters = {}) {
    let text = `
      SELECT e.*, u.name as planner_name
      FROM events e
      JOIN users u ON e.planner_id = u.user_id
      WHERE (
        LOWER(e.title) LIKE LOWER($1) OR 
        LOWER(e.description) LIKE LOWER($1) OR
        LOWER(e.location) LIKE LOWER($1)
      )
    `;
    
    const values = [`%${searchTerm}%`];
    let paramCount = 2;

    if (filters.is_public !== false) {
      text += ` AND e.is_public = true`;
    }

    if (filters.date_from) {
      text += ` AND e.date >= $${paramCount}`;
      values.push(filters.date_from);
      paramCount++;
    }

    text += ` ORDER BY e.date ASC`;

    const result = await query(text, values);
    
    return result.rows.map(event => ({
      ...event,
      required_roles: event.required_roles ? JSON.parse(event.required_roles) : []
    }));
  }
}

module.exports = Event;
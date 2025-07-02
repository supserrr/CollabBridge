// backend/src/controllers/eventController.js
const Event = require('../models/Event');
const { validationResult } = require('express-validator');

class EventController {
  // Create new event
  static async createEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Only planners can create events
      if (req.user.role !== 'planner') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only event planners can create events'
        });
      }

      const { 
        title, 
        description, 
        location, 
        date, 
        event_type = 'other',
        required_roles = [],
        budget_range = '',
        is_public = true 
      } = req.body;

      const eventData = {
        planner_id: req.user.userId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date,
        event_type,
        required_roles,
        budget_range: budget_range.trim(),
        is_public
      };

      const newEvent = await Event.create(eventData);

      res.status(201).json({
        message: 'Event created successfully',
        event: newEvent
      });

    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({
        error: 'Failed to create event',
        message: 'An error occurred while creating the event'
      });
    }
  }

  // Get all events with filtering
  static async getEvents(req, res) {
    try {
      const {
        location,
        event_type,
        date_from,
        date_to,
        status,
        is_public,
        include_past,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        location,
        event_type,
        date_from,
        date_to,
        status,
        is_public: is_public !== undefined ? is_public === 'true' : undefined,
        include_past: include_past === 'true',
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const events = await Event.findAll(filters);

      res.status(200).json({
        events,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: events.length
        }
      });

    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({
        error: 'Failed to fetch events',
        message: 'An error occurred while fetching events'
      });
    }
  }

  // Get single event by ID
  static async getEventById(req, res) {
    try {
      const { eventId } = req.params;

      const event = await Event.findById(eventId);
      
      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Event with the specified ID was not found'
        });
      }

      // Check if event is public or user has access
      if (!event.is_public && event.planner_id !== req.user.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to view this private event'
        });
      }

      res.status(200).json({
        event
      });

    } catch (error) {
      console.error('Get event by ID error:', error);
      res.status(500).json({
        error: 'Failed to fetch event',
        message: 'An error occurred while fetching the event'
      });
    }
  }

  // Get events created by current user (planner)
  static async getMyEvents(req, res) {
    try {
      if (req.user.role !== 'planner') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only event planners can access this endpoint'
        });
      }

      const {
        status,
        include_past,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        status,
        include_past: include_past === 'true',
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const events = await Event.findByPlanner(req.user.userId, filters);

      res.status(200).json({
        events,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: events.length
        }
      });

    } catch (error) {
      console.error('Get my events error:', error);
      res.status(500).json({
        error: 'Failed to fetch your events',
        message: 'An error occurred while fetching your events'
      });
    }
  }

  // Update event
  static async updateEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { eventId } = req.params;
      
      // Check if event exists and user owns it
      const existingEvent = await Event.findById(eventId);
      if (!existingEvent) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Event with the specified ID was not found'
        });
      }

      if (existingEvent.planner_id !== req.user.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only update your own events'
        });
      }

      const { 
        title, 
        description, 
        location, 
        date, 
        event_type,
        required_roles,
        budget_range,
        is_public,
        status 
      } = req.body;

      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (location !== undefined) updateData.location = location.trim();
      if (date !== undefined) updateData.date = date;
      if (event_type !== undefined) updateData.event_type = event_type;
      if (required_roles !== undefined) updateData.required_roles = required_roles;
      if (budget_range !== undefined) updateData.budget_range = budget_range.trim();
      if (is_public !== undefined) updateData.is_public = is_public;
      if (status !== undefined) updateData.status = status;

      const updatedEvent = await Event.update(eventId, updateData);

      res.status(200).json({
        message: 'Event updated successfully',
        event: updatedEvent
      });

    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({
        error: 'Failed to update event',
        message: 'An error occurred while updating the event'
      });
    }
  }

  // Delete event
  static async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      
      // Check if event exists and user owns it
      const existingEvent = await Event.findById(eventId);
      if (!existingEvent) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Event with the specified ID was not found'
        });
      }

      if (existingEvent.planner_id !== req.user.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only delete your own events'
        });
      }

      const deletedEvent = await Event.delete(eventId);

      res.status(200).json({
        message: 'Event deleted successfully',
        event_id: deletedEvent.event_id
      });

    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({
        error: 'Failed to delete event',
        message: 'An error occurred while deleting the event'
      });
    }
  }

  // Search events
  static async searchEvents(req, res) {
    try {
      const { q: searchTerm, date_from, limit = 20, offset = 0 } = req.query;

      if (!searchTerm || searchTerm.trim().length < 2) {
        return res.status(400).json({
          error: 'Invalid search term',
          message: 'Search term must be at least 2 characters long'
        });
      }

      const filters = {
        date_from,
        is_public: true,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const events = await Event.searchEvents(searchTerm.trim(), filters);

      res.status(200).json({
        events,
        search_term: searchTerm.trim(),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: events.length
        }
      });

    } catch (error) {
      console.error('Search events error:', error);
      res.status(500).json({
        error: 'Failed to search events',
        message: 'An error occurred while searching events'
      });
    }
  }

  // Get event statistics (for dashboard)
  static async getEventStats(req, res) {
    try {
      // Only planners can access overall stats
      if (req.user.role !== 'planner') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only event planners can access event statistics'
        });
      }

      const stats = await Event.getStats();

      res.status(200).json({
        statistics: {
          total_events: parseInt(stats.total_events) || 0,
          open_events: parseInt(stats.open_events) || 0,
          in_progress_events: parseInt(stats.in_progress_events) || 0,
          completed_events: parseInt(stats.completed_events) || 0,
          upcoming_events: parseInt(stats.upcoming_events) || 0
        }
      });

    } catch (error) {
      console.error('Get event stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch event statistics',
        message: 'An error occurred while fetching event statistics'
      });
    }
  }

  // Get events by category/type
  static async getEventsByType(req, res) {
    try {
      const { type } = req.params;
      const { limit = 20, offset = 0, date_from } = req.query;

      const filters = {
        event_type: type,
        is_public: true,
        date_from,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const events = await Event.findAll(filters);

      res.status(200).json({
        events,
        event_type: type,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: events.length
        }
      });

    } catch (error) {
      console.error('Get events by type error:', error);
      res.status(500).json({
        error: 'Failed to fetch events by type',
        message: 'An error occurred while fetching events by type'
      });
    }
  }
}

module.exports = EventController;
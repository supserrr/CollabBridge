// backend/src/controllers/applicationController.js
const Application = require('../models/Application');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');

class ApplicationController {
  // Apply to an event (professionals only)
  static async applyToEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Only professionals can apply to events
      if (req.user.role !== 'professional') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only creative professionals can apply to events'
        });
      }

      const { event_id, message = '' } = req.body;

      // Check if event exists and is public or accessible
      const event = await Event.findById(event_id);
      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Event with the specified ID was not found'
        });
      }

      if (!event.is_public) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'This is a private event'
        });
      }

      // Check if event is still open for applications
      if (event.status !== 'open') {
        return res.status(400).json({
          error: 'Event not available',
          message: 'This event is no longer accepting applications'
        });
      }

      // Check if professional already applied
      const existingApplication = await Application.findByEventAndProfessional(
        event_id, 
        req.user.userId
      );

      if (existingApplication) {
        return res.status(409).json({
          error: 'Already applied',
          message: 'You have already applied to this event'
        });
      }

      // Check if it's not past the event date
      const eventDate = new Date(event.date);
      const today = new Date();
      if (eventDate < today) {
        return res.status(400).json({
          error: 'Event expired',
          message: 'Cannot apply to past events'
        });
      }

      const applicationData = {
        event_id,
        professional_id: req.user.userId,
        message: message.trim()
      };

      const newApplication = await Application.create(applicationData);

      res.status(201).json({
        message: 'Application submitted successfully',
        application: newApplication
      });

    } catch (error) {
      console.error('Apply to event error:', error);
      res.status(500).json({
        error: 'Failed to submit application',
        message: 'An error occurred while submitting your application'
      });
    }
  }

  // Get applications for an event (planners only)
  static async getEventApplications(req, res) {
    try {
      const { eventId } = req.params;
      const { status, limit = 20, offset = 0 } = req.query;

      // Check if event exists and user owns it
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Event with the specified ID was not found'
        });
      }

      if (event.planner_id !== req.user.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only view applications for your own events'
        });
      }

      const filters = {
        status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const applications = await Application.findByEvent(eventId, filters);

      res.status(200).json({
        applications,
        event: {
          id: event.event_id,
          title: event.title,
          date: event.date,
          status: event.status
        },
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: applications.length
        }
      });

    } catch (error) {
      console.error('Get event applications error:', error);
      res.status(500).json({
        error: 'Failed to fetch applications',
        message: 'An error occurred while fetching event applications'
      });
    }
  }

  // Get applications submitted by professional
  static async getMyApplications(req, res) {
    try {
      if (req.user.role !== 'professional') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only creative professionals can access this endpoint'
        });
      }

      const { status, limit = 20, offset = 0 } = req.query;

      const filters = {
        status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const applications = await Application.findByProfessional(req.user.userId, filters);

      res.status(200).json({
        applications,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: applications.length
        }
      });

    } catch (error) {
      console.error('Get my applications error:', error);
      res.status(500).json({
        error: 'Failed to fetch your applications',
        message: 'An error occurred while fetching your applications'
      });
    }
  }

  // Get single application by ID
  static async getApplicationById(req, res) {
    try {
      const { applicationId } = req.params;

      const application = await Application.findById(applicationId);
      
      if (!application) {
        return res.status(404).json({
          error: 'Application not found',
          message: 'Application with the specified ID was not found'
        });
      }

      // Check if user has access to this application
      const hasAccess = 
        (req.user.role === 'professional' && application.professional_id === req.user.userId) ||
        (req.user.role === 'planner' && application.planner_id === req.user.userId);

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to view this application'
        });
      }

      res.status(200).json({
        application
      });

    } catch (error) {
      console.error('Get application by ID error:', error);
      res.status(500).json({
        error: 'Failed to fetch application',
        message: 'An error occurred while fetching the application'
      });
    }
  }

  // Update application status (planners only)
  static async updateApplicationStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { applicationId } = req.params;
      const { status, response_message = '' } = req.body;

      const application = await Application.findById(applicationId);
      
      if (!application) {
        return res.status(404).json({
          error: 'Application not found',
          message: 'Application with the specified ID was not found'
        });
      }

      // Only the event planner can update application status
      if (application.planner_id !== req.user.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only update applications for your own events'
        });
      }

      // Validate status transition
      const validStatuses = ['pending', 'accepted', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          message: 'Status must be one of: pending, accepted, rejected'
        });
      }

      const updateData = {
        status,
        response_message: response_message.trim(),
        responded_at: new Date()
      };

      const updatedApplication = await Application.update(applicationId, updateData);

      res.status(200).json({
        message: 'Application status updated successfully',
        application: updatedApplication
      });

    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({
        error: 'Failed to update application',
        message: 'An error occurred while updating the application status'
      });
    }
  }

  // Withdraw application (professionals only)
  static async withdrawApplication(req, res) {
    try {
      const { applicationId } = req.params;

      const application = await Application.findById(applicationId);
      
      if (!application) {
        return res.status(404).json({
          error: 'Application not found',
          message: 'Application with the specified ID was not found'
        });
      }

      // Only the professional who submitted can withdraw
      if (application.professional_id !== req.user.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only withdraw your own applications'
        });
      }

      // Can only withdraw pending applications
      if (application.status !== 'pending') {
        return res.status(400).json({
          error: 'Cannot withdraw',
          message: 'You can only withdraw pending applications'
        });
      }

      const deletedApplication = await Application.delete(applicationId);

      res.status(200).json({
        message: 'Application withdrawn successfully',
        application_id: deletedApplication.app_id
      });

    } catch (error) {
      console.error('Withdraw application error:', error);
      res.status(500).json({
        error: 'Failed to withdraw application',
        message: 'An error occurred while withdrawing the application'
      });
    }
  }

  // Get application statistics
  static async getApplicationStats(req, res) {
    try {
      let stats;

      if (req.user.role === 'planner') {
        // Get stats for planner's events
        stats = await Application.getPlannerStats(req.user.userId);
      } else if (req.user.role === 'professional') {
        // Get stats for professional's applications
        stats = await Application.getProfessionalStats(req.user.userId);
      } else {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Invalid user role'
        });
      }

      res.status(200).json({
        statistics: {
          total_applications: parseInt(stats.total_applications) || 0,
          pending_applications: parseInt(stats.pending_applications) || 0,
          accepted_applications: parseInt(stats.accepted_applications) || 0,
          rejected_applications: parseInt(stats.rejected_applications) || 0,
          success_rate: stats.success_rate || 0
        }
      });

    } catch (error) {
      console.error('Get application stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch application statistics',
        message: 'An error occurred while fetching application statistics'
      });
    }
  }

  // Bulk update applications (for planners managing multiple applications)
  static async bulkUpdateApplications(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { application_ids, status, response_message = '' } = req.body;

      if (!Array.isArray(application_ids) || application_ids.length === 0) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'application_ids must be a non-empty array'
        });
      }

      // Validate all applications belong to the planner
      const applications = await Promise.all(
        application_ids.map(id => Application.findById(id))
      );

      const invalidApplications = applications.filter(
        app => !app || app.planner_id !== req.user.userId
      );

      if (invalidApplications.length > 0) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Some applications do not belong to you or do not exist'
        });
      }

      const updateData = {
        status,
        response_message: response_message.trim(),
        responded_at: new Date()
      };

      const updatePromises = application_ids.map(id => 
        Application.update(id, updateData)
      );

      const updatedApplications = await Promise.all(updatePromises);

      res.status(200).json({
        message: `${updatedApplications.length} applications updated successfully`,
        updated_count: updatedApplications.length,
        applications: updatedApplications
      });

    } catch (error) {
      console.error('Bulk update applications error:', error);
      res.status(500).json({
        error: 'Failed to update applications',
        message: 'An error occurred while updating applications'
      });
    }
  }
}

module.exports = ApplicationController;
// backend/src/routes/applications.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const logger = require('../config/logger');

// Validation middleware for applications
const validateApplication = async (req, res, next) => {
    try {
        const { event_id } = req.body;
        const professional_id = req.user.userId;
        
        // Check if user is a professional
        const userResult = await query(
            'SELECT role FROM users WHERE user_id = $1',
            [professional_id]
        );
        
        if (!userResult.rows.length) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        
        if (userResult.rows[0].role !== 'professional') {
            return res.status(403).json({
                error: 'Only professionals can apply to events'
            });
        }
        
        // Check if event exists and is open
        const eventResult = await query(
            `SELECT event_id, planner_id, is_public, status, event_date, max_applications
             FROM events 
             WHERE event_id = $1`,
            [event_id]
        );
        
        if (!eventResult.rows.length) {
            return res.status(404).json({
                error: 'Event not found'
            });
        }
        
        const event = eventResult.rows[0];
        
        // Check if event is open for applications
        if (event.status !== 'open') {
            return res.status(400).json({
                error: 'Event is not accepting applications'
            });
        }
        
        // Check if event date hasn't passed
        const eventDate = new Date(event.event_date);
        const now = new Date();
        if (eventDate < now) {
            return res.status(400).json({
                error: 'Cannot apply to past events'
            });
        }
        
        // Check if already applied
        const existingApp = await query(
            'SELECT app_id, status FROM applications WHERE event_id = $1 AND professional_id = $2',
            [event_id, professional_id]
        );
        
        if (existingApp.rows.length) {
            const status = existingApp.rows[0].status;
            return res.status(400).json({
                error: `You have already ${status === 'withdrawn' ? 'withdrawn from' : 'applied to'} this event`
            });
        }
        
        // Check if max applications reached
        const appCount = await query(
            'SELECT COUNT(*) FROM applications WHERE event_id = $1 AND status != $2',
            [event_id, 'withdrawn']
        );
        
        if (parseInt(appCount.rows[0].count) >= event.max_applications) {
            return res.status(400).json({
                error: 'This event has reached the maximum number of applications'
            });
        }
        
        // Add validated data to request
        req.validatedApplication = {
            event_id,
            professional_id,
            event
        };
        
        next();
    } catch (error) {
        logger.error('Application validation error:', error);
        res.status(500).json({ error: 'Failed to validate application' });
    }
};

// Create application
router.post('/',
    authenticate,
    [
        body('event_id').isUUID().withMessage('Invalid event ID'),
        body('message').optional().isString().trim().isLength({ max: 1000 }),
        body('proposed_rate').optional().isFloat({ min: 0 }).withMessage('Invalid rate')
    ],
    validateApplication,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { message, proposed_rate, portfolio_items } = req.body;
            const { event_id, professional_id } = req.validatedApplication;

            const result = await query(
                `INSERT INTO applications (event_id, professional_id, message, proposed_rate, portfolio_items)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [event_id, professional_id, message, proposed_rate, portfolio_items || []]
            );

            logger.info(`Application created: ${result.rows[0].app_id}`);
            res.status(201).json({
                message: 'Application submitted successfully',
                application: result.rows[0]
            });
        } catch (error) {
            logger.error('Create application error:', error);
            res.status(500).json({ error: 'Failed to create application' });
        }
    }
);

// Get applications for an event (planner only)
router.get('/event/:eventId', authenticate, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.userId;

        // Verify the user is the event planner
        const eventCheck = await query(
            'SELECT planner_id FROM events WHERE event_id = $1',
            [eventId]
        );

        if (!eventCheck.rows.length) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].planner_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to view these applications' });
        }

        const applications = await query(
            `SELECT a.*, 
                    u.name as professional_name, 
                    u.email as professional_email,
                    u.phone as professional_phone,
                    u.bio as professional_bio,
                    u.rating as professional_rating,
                    u.total_reviews,
                    u.skills,
                    u.portfolio_url
             FROM applications a
             JOIN users u ON a.professional_id = u.user_id
             WHERE a.event_id = $1
             ORDER BY a.applied_at DESC`,
            [eventId]
        );

        res.json({ applications: applications.rows });
    } catch (error) {
        logger.error('Get event applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get applications for a professional
router.get('/my-applications', authenticate, async (req, res) => {
    try {
        const professionalId = req.user.userId;
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let queryText = `
            SELECT a.*, 
                   e.title as event_title,
                   e.event_date,
                   e.location as event_location,
                   e.planner_id,
                   u.name as planner_name
            FROM applications a
            JOIN events e ON a.event_id = e.event_id
            JOIN users u ON e.planner_id = u.user_id
            WHERE a.professional_id = $1
        `;
        
        const queryParams = [professionalId];
        
        if (status) {
            queryText += ' AND a.status = $2';
            queryParams.push(status);
        }
        
        queryText += ' ORDER BY a.applied_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
        queryParams.push(limit, offset);

        const applications = await query(queryText, queryParams);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM applications WHERE professional_id = $1';
        const countParams = [professionalId];
        
        if (status) {
            countQuery += ' AND status = $2';
            countParams.push(status);
        }
        
        const totalResult = await query(countQuery, countParams);

        res.json({
            applications: applications.rows,
            pagination: {
                total: parseInt(totalResult.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalResult.rows[0].count / limit)
            }
        });
    } catch (error) {
        logger.error('Get my applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Update application status (planner only)
router.patch('/:appId/status', 
    authenticate,
    [
        body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { appId } = req.params;
            const { status } = req.body;
            const userId = req.user.userId;

            // Verify the user is the event planner
            const appCheck = await query(
                `SELECT a.app_id, a.status as current_status, e.planner_id 
                 FROM applications a
                 JOIN events e ON a.event_id = e.event_id
                 WHERE a.app_id = $1`,
                [appId]
            );

            if (!appCheck.rows.length) {
                return res.status(404).json({ error: 'Application not found' });
            }

            if (appCheck.rows[0].planner_id !== userId) {
                return res.status(403).json({ error: 'Not authorized to update this application' });
            }

            if (appCheck.rows[0].current_status !== 'pending') {
                return res.status(400).json({ 
                    error: `Cannot update application with status: ${appCheck.rows[0].current_status}` 
                });
            }

            const result = await query(
                `UPDATE applications 
                 SET status = $1, responded_at = CURRENT_TIMESTAMP 
                 WHERE app_id = $2
                 RETURNING *`,
                [status, appId]
            );

            logger.info(`Application ${appId} updated to status: ${status}`);
            res.json({
                message: 'Application status updated successfully',
                application: result.rows[0]
            });
        } catch (error) {
            logger.error('Update application status error:', error);
            res.status(500).json({ error: 'Failed to update application' });
        }
    }
);

// Withdraw application (professional only)
router.patch('/:appId/withdraw', authenticate, async (req, res) => {
    try {
        const { appId } = req.params;
        const professionalId = req.user.userId;

        const result = await query(
            `UPDATE applications 
             SET status = 'withdrawn' 
             WHERE app_id = $1 AND professional_id = $2 AND status = 'pending'
             RETURNING *`,
            [appId, professionalId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Application not found or cannot be withdrawn' 
            });
        }

        logger.info(`Application ${appId} withdrawn by professional ${professionalId}`);
        res.json({
            message: 'Application withdrawn successfully',
            application: result.rows[0]
        });
    } catch (error) {
        logger.error('Withdraw application error:', error);
        res.status(500).json({ error: 'Failed to withdraw application' });
    }
});

module.exports = router;
// backend/src/routes/reviews.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const logger = require('../config/logger');

// Validation middleware for reviews
const validateReview = async (req, res, next) => {
    try {
        const { event_id, to_user } = req.body;
        const from_user = req.user.userId;
        
        // Check if the reviewer is trying to review themselves
        if (from_user === to_user) {
            return res.status(400).json({ 
                error: 'You cannot review yourself' 
            });
        }
        
        // Check if event exists and get its details
        const eventResult = await query(
            'SELECT event_id, planner_id, event_date, status FROM events WHERE event_id = $1',
            [event_id]
        );
        
        if (!eventResult.rows.length) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const event = eventResult.rows[0];
        
        // Check if the event has ended (using actual event_date)
        const eventDate = new Date(event.event_date);
        const now = new Date();
        if (now < eventDate) {
            return res.status(400).json({ 
                error: 'Cannot review before event has taken place' 
            });
        }
        
        // Check if event is completed
        if (event.status !== 'completed') {
            return res.status(400).json({ 
                error: 'Can only review completed events' 
            });
        }
        
        // Get user details
        const usersResult = await query(
            'SELECT user_id, role FROM users WHERE user_id = $1 OR user_id = $2',
            [from_user, to_user]
        );
        
        const users = {};
        usersResult.rows.forEach(user => {
            users[user.user_id] = user.role;
        });
        
        // Verify both users exist
        if (!users[from_user] || !users[to_user]) {
            return res.status(404).json({ 
                error: 'User not found' 
            });
        }
        
        // Check involvement in the event
        let fromUserInvolved = false;
        let toUserInvolved = false;
        
        // Check if from_user is the planner
        if (event.planner_id === from_user) {
            fromUserInvolved = true;
        } else {
            // Check if from_user is an accepted professional
            const fromApp = await query(
                'SELECT app_id FROM applications WHERE event_id = $1 AND professional_id = $2 AND status = $3',
                [event_id, from_user, 'accepted']
            );
            if (fromApp.rows.length > 0) {
                fromUserInvolved = true;
            }
        }
        
        // Check if to_user is the planner
        if (event.planner_id === to_user) {
            toUserInvolved = true;
        } else {
            // Check if to_user is an accepted professional
            const toApp = await query(
                'SELECT app_id FROM applications WHERE event_id = $1 AND professional_id = $2 AND status = $3',
                [event_id, to_user, 'accepted']
            );
            if (toApp.rows.length > 0) {
                toUserInvolved = true;
            }
        }
        
        if (!fromUserInvolved || !toUserInvolved) {
            return res.status(403).json({ 
                error: 'Both users must be involved in the event to leave reviews' 
            });
        }
        
        // Ensure review is between planner and professional
        const fromRole = (event.planner_id === from_user) ? 'planner' : 'professional';
        const toRole = (event.planner_id === to_user) ? 'planner' : 'professional';
        
        if (fromRole === toRole) {
            return res.status(400).json({ 
                error: 'Reviews must be between event planners and professionals' 
            });
        }
        
        // Check if review already exists
        const existingReview = await query(
            'SELECT review_id FROM reviews WHERE event_id = $1 AND from_user = $2 AND to_user = $3',
            [event_id, from_user, to_user]
        );
        
        if (existingReview.rows.length) {
            return res.status(400).json({ 
                error: 'You have already reviewed this user for this event' 
            });
        }
        
        // Add validated data to request for next middleware
        req.validatedReview = {
            event_id,
            from_user,
            to_user,
            fromRole,
            toRole
        };
        
        next();
    } catch (error) {
        logger.error('Review validation error:', error);
        res.status(500).json({ error: 'Failed to validate review' });
    }
};

// Create a review
router.post('/', 
    authenticate,
    [
        body('event_id').isUUID().withMessage('Invalid event ID'),
        body('to_user').isUUID().withMessage('Invalid user ID'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('comment').optional().isString().trim().isLength({ max: 1000 })
    ],
    validateReview,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { rating, comment } = req.body;
            const { event_id, from_user, to_user } = req.validatedReview;

            const result = await query(
                `INSERT INTO reviews (event_id, from_user, to_user, rating, comment)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [event_id, from_user, to_user, rating, comment]
            );

            logger.info(`Review created: ${result.rows[0].review_id}`);
            res.status(201).json({
                message: 'Review created successfully',
                review: result.rows[0]
            });
        } catch (error) {
            logger.error('Create review error:', error);
            res.status(500).json({ error: 'Failed to create review' });
        }
    }
);

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const reviews = await query(
            `SELECT r.*, 
                    u.name as reviewer_name, 
                    u.role as reviewer_role,
                    e.title as event_title
             FROM reviews r
             JOIN users u ON r.from_user = u.user_id
             JOIN events e ON r.event_id = e.event_id
             WHERE r.to_user = $1
             ORDER BY r.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const totalResult = await query(
            'SELECT COUNT(*) FROM reviews WHERE to_user = $1',
            [userId]
        );

        res.json({
            reviews: reviews.rows,
            pagination: {
                total: parseInt(totalResult.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalResult.rows[0].count / limit)
            }
        });
    } catch (error) {
        logger.error('Get user reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Get reviews for an event
router.get('/event/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;

        const reviews = await query(
            `SELECT r.*, 
                    uf.name as from_user_name, 
                    uf.role as from_user_role,
                    ut.name as to_user_name,
                    ut.role as to_user_role
             FROM reviews r
             JOIN users uf ON r.from_user = uf.user_id
             JOIN users ut ON r.to_user = ut.user_id
             WHERE r.event_id = $1
             ORDER BY r.created_at DESC`,
            [eventId]
        );

        res.json({ reviews: reviews.rows });
    } catch (error) {
        logger.error('Get event reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Mark review as helpful
router.post('/:reviewId/helpful', authenticate, async (req, res) => {
    try {
        const { reviewId } = req.params;

        const result = await query(
            `UPDATE reviews 
             SET helpful_count = helpful_count + 1
             WHERE review_id = $1
             RETURNING helpful_count`,
            [reviewId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({ 
            message: 'Review marked as helpful',
            helpful_count: result.rows[0].helpful_count 
        });
    } catch (error) {
        logger.error('Mark review helpful error:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

module.exports = router;
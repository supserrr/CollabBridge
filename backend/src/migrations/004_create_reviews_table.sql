-- 004_create_reviews_table.sql
-- Create reviews table for CollabBridge

CREATE TABLE IF NOT EXISTS reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    from_user UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    to_user UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Simple constraints that don't use subqueries
    CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT no_self_review CHECK (from_user != to_user),
    CONSTRAINT unique_review UNIQUE (event_id, from_user, to_user)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_event_id ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_from_user ON reviews(from_user);
CREATE INDEX IF NOT EXISTS idx_reviews_to_user ON reviews(to_user);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Create function to automatically update user ratings
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the average rating for the user who received the review
    UPDATE users
    SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM reviews
        WHERE to_user = NEW.to_user
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE to_user = NEW.to_user
    )
    WHERE user_id = NEW.to_user;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update user ratings when a review is added or updated
DROP TRIGGER IF EXISTS update_rating_after_review ON reviews;
CREATE TRIGGER update_rating_after_review
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Add comment to table
COMMENT ON TABLE reviews IS 'Stores reviews between event planners and creative professionals';
COMMENT ON COLUMN reviews.review_id IS 'Unique identifier for the review';
COMMENT ON COLUMN reviews.event_id IS 'The event this review is associated with';
COMMENT ON COLUMN reviews.from_user IS 'User who wrote the review';
COMMENT ON COLUMN reviews.to_user IS 'User being reviewed';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1 to 5';
COMMENT ON COLUMN reviews.comment IS 'Optional text review';
COMMENT ON COLUMN reviews.is_public IS 'Whether the review is visible to other users';
COMMENT ON COLUMN reviews.helpful_count IS 'Number of times marked as helpful';
COMMENT ON COLUMN reviews.created_at IS 'When the review was created';
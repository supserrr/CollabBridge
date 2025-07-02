-- backend/src/migrations/004_create_reviews_table.sql

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications(app_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_reviews_from_user_id ON reviews(from_user_id);
CREATE INDEX idx_reviews_to_user_id ON reviews(to_user_id);
CREATE INDEX idx_reviews_application_id ON reviews(application_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX idx_reviews_to_user_rating ON reviews(to_user_id, rating);
CREATE INDEX idx_reviews_to_user_created ON reviews(to_user_id, created_at DESC);
CREATE INDEX idx_reviews_from_user_created ON reviews(from_user_id, created_at DESC);

-- Create unique constraint to prevent duplicate reviews for same application
CREATE UNIQUE INDEX idx_reviews_unique_application_reviewer 
    ON reviews(application_id, from_user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update user rating when reviews change
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    new_rating DECIMAL(3,2);
BEGIN
    -- Determine which user's rating to update
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.to_user_id;
    ELSE
        target_user_id := NEW.to_user_id;
    END IF;
    
    -- Calculate new average rating
    SELECT COALESCE(ROUND(AVG(rating), 2), 0.00)
    INTO new_rating
    FROM reviews
    WHERE to_user_id = target_user_id;
    
    -- Update user's rating
    UPDATE users
    SET rating = new_rating,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = target_user_id;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- Create triggers to update user ratings
CREATE TRIGGER update_user_rating_on_insert 
    AFTER INSERT ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_rating();

CREATE TRIGGER update_user_rating_on_update 
    AFTER UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_rating();

CREATE TRIGGER update_user_rating_on_delete 
    AFTER DELETE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_rating();

-- Add constraints
ALTER TABLE reviews ADD CONSTRAINT reviews_comment_length_check 
    CHECK (LENGTH(comment) <= 1000);

-- Constraint to prevent self-reviews
ALTER TABLE reviews ADD CONSTRAINT reviews_no_self_review 
    CHECK (from_user_id != to_user_id);

-- Constraint to ensure review is for accepted application only
ALTER TABLE reviews ADD CONSTRAINT reviews_accepted_application_only 
    CHECK (
        (SELECT status FROM applications WHERE app_id = application_id) = 'accepted'
    );

-- Create partial indexes for better performance
CREATE INDEX idx_reviews_recent ON reviews(created_at DESC) 
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

CREATE INDEX idx_reviews_high_rating ON reviews(to_user_id, created_at DESC) 
    WHERE rating >= 4;

-- Create view for review statistics
CREATE OR REPLACE VIEW review_stats AS
SELECT 
    COUNT(*) as total_reviews,
    ROUND(AVG(rating), 2) as average_rating,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_reviews,
    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_reviews,
    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_reviews,
    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_reviews,
    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_reviews,
    COUNT(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN 1 END) as reviews_this_month
FROM reviews;

-- Create view for user review statistics
CREATE OR REPLACE VIEW user_review_stats AS
SELECT 
    to_user_id,
    COUNT(*) as total_reviews,
    ROUND(AVG(rating), 2) as average_rating,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count,
    MIN(created_at) as first_review_date,
    MAX(created_at) as latest_review_date
FROM reviews
GROUP BY to_user_id;

-- Create view for top-rated users
CREATE OR REPLACE VIEW top_rated_users AS
SELECT 
    u.user_id,
    u.name,
    u.role,
    u.location,
    u.rating,
    urs.total_reviews,
    u.created_at
FROM users u
JOIN user_review_stats urs ON u.user_id = urs.to_user_id
WHERE u.role = 'professional' 
    AND u.rating >= 4.0 
    AND urs.total_reviews >= 3
ORDER BY u.rating DESC, urs.total_reviews DESC;

-- Create view for recent reviews with user details
CREATE OR REPLACE VIEW recent_reviews AS
SELECT 
    r.review_id,
    r.rating,
    r.comment,
    r.created_at,
    r.updated_at,
    from_user.name as reviewer_name,
    from_user.role as reviewer_role,
    to_user.name as reviewee_name,
    to_user.role as reviewee_role,
    e.title as event_title,
    e.event_type,
    e.date as event_date
FROM reviews r
JOIN users from_user ON r.from_user_id = from_user.user_id
JOIN users to_user ON r.to_user_id = to_user.user_id
JOIN applications a ON r.application_id = a.app_id
JOIN events e ON a.event_id = e.event_id
ORDER BY r.created_at DESC;

-- Add comments for documentation
COMMENT ON TABLE reviews IS 'Reviews and ratings between planners and professionals';
COMMENT ON COLUMN reviews.review_id IS 'Unique identifier for review';
COMMENT ON COLUMN reviews.from_user_id IS 'ID of user writing the review';
COMMENT ON COLUMN reviews.to_user_id IS 'ID of user being reviewed';
COMMENT ON COLUMN reviews.application_id IS 'ID of the application/collaboration being reviewed';
COMMENT ON COLUMN reviews.rating IS 'Rating score from 1 to 5 stars';
COMMENT ON COLUMN reviews.comment IS 'Written review comment';
COMMENT ON COLUMN reviews.created_at IS 'Review creation timestamp';
COMMENT ON COLUMN reviews.updated_at IS 'Last review update timestamp';

COMMENT ON VIEW review_stats IS 'Overall review statistics';
COMMENT ON VIEW user_review_stats IS 'Review statistics per user';
COMMENT ON VIEW top_rated_users IS 'Highest rated professionals with minimum review threshold';
COMMENT ON VIEW recent_reviews IS 'Recent reviews with detailed user and event information';
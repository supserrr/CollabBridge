-- Create extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search 
ON users USING gin(to_tsvector('english', name || ' ' || COALESCE(bio, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_search 
ON events USING gin(to_tsvector('english', title || ' ' || description));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creative_profiles_search 
ON creative_profiles USING gin(to_tsvector('english', array_to_string(skills, ' ') || ' ' || array_to_string(categories, ' ')));

-- Create function to update average rating
CREATE OR REPLACE FUNCTION update_creative_profile_rating()
RETURNS TRIGGER AS $
BEGIN
  -- Update average rating and total reviews for the professional
  UPDATE creative_profiles 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating::DECIMAL), 0)
      FROM reviews r
      WHERE r.professional_id = NEW.professional_id
      AND r.is_public = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews r
      WHERE r.professional_id = NEW.professional_id
      AND r.is_public = true
    )
  WHERE id = NEW.professional_id;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_rating ON reviews;
CREATE TRIGGER trigger_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_creative_profile_rating();

-- Create function to update event application count
CREATE OR REPLACE FUNCTION update_event_application_count()
RETURNS TRIGGER AS $
BEGIN
  -- Update application count for the event
  UPDATE events 
  SET application_count = (
    SELECT COUNT(*)
    FROM event_applications ea
    WHERE ea.event_id = COALESCE(NEW.event_id, OLD.event_id)
  )
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

-- Create trigger for application count updates
DROP TRIGGER IF EXISTS trigger_update_application_count ON event_applications;
CREATE TRIGGER trigger_update_application_count
  AFTER INSERT OR DELETE ON event_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_event_application_count();

-- Create function to update user last active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $
BEGIN
  UPDATE users 
  SET last_active_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger for user activity tracking
DROP TRIGGER IF EXISTS trigger_update_last_active ON user_activities;
CREATE TRIGGER trigger_update_last_active
  AFTER INSERT ON user_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();

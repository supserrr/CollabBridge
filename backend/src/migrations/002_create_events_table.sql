-- backend/src/migrations/002_create_events_table.sql

-- Create ENUM types for events
CREATE TYPE event_type AS ENUM (
    'wedding', 
    'corporate', 
    'birthday', 
    'conference', 
    'workshop', 
    'concert', 
    'other'
);

CREATE TYPE event_status AS ENUM (
    'open', 
    'in_progress', 
    'completed', 
    'cancelled'
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    event_type event_type DEFAULT 'other',
    required_roles JSONB DEFAULT '[]'::jsonb,
    budget_range VARCHAR(50) DEFAULT '',
    is_public BOOLEAN DEFAULT true,
    status event_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_events_planner_id ON events(planner_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_is_public ON events(is_public);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX idx_events_public_date ON events(is_public, date) WHERE is_public = true;
CREATE INDEX idx_events_public_status ON events(is_public, status) WHERE is_public = true;
CREATE INDEX idx_events_planner_status ON events(planner_id, status);
CREATE INDEX idx_events_planner_date ON events(planner_id, date DESC);
CREATE INDEX idx_events_status_date ON events(status, date);

-- Create GIN index for JSONB required_roles for efficient searching
CREATE INDEX idx_events_required_roles ON events USING GIN (required_roles);

-- Create full-text search index
CREATE INDEX idx_events_search ON events USING GIN (
    to_tsvector('english', title || ' ' || description || ' ' || location)
);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE events ADD CONSTRAINT events_title_length_check 
    CHECK (LENGTH(TRIM(title)) >= 3);

ALTER TABLE events ADD CONSTRAINT events_description_length_check 
    CHECK (LENGTH(TRIM(description)) >= 10);

ALTER TABLE events ADD CONSTRAINT events_location_length_check 
    CHECK (LENGTH(TRIM(location)) >= 2);

ALTER TABLE events ADD CONSTRAINT events_date_future_check 
    CHECK (date >= CURRENT_DATE);

ALTER TABLE events ADD CONSTRAINT events_budget_range_length_check 
    CHECK (LENGTH(budget_range) <= 50);

-- Constraint to ensure required_roles contains valid role names
ALTER TABLE events ADD CONSTRAINT events_required_roles_valid 
    CHECK (
        jsonb_typeof(required_roles) = 'array' AND
        (
            required_roles = '[]'::jsonb OR
            (
                SELECT bool_and(value::text = ANY(ARRAY[
                    '"photographer"', 
                    '"videographer"', 
                    '"dj"', 
                    '"mc"', 
                    '"decorator"', 
                    '"caterer"', 
                    '"musician"', 
                    '"dancer"', 
                    '"artist"'
                ]))
                FROM jsonb_array_elements(required_roles)
            )
        )
    );

-- Create partial indexes for better performance on common filters
CREATE INDEX idx_events_open_public ON events(date, created_at DESC) 
    WHERE status = 'open' AND is_public = true;

CREATE INDEX idx_events_upcoming ON events(date) 
    WHERE date >= CURRENT_DATE AND status = 'open';

-- Add comments for documentation
COMMENT ON TABLE events IS 'Events created by planners for collaboration with professionals';
COMMENT ON COLUMN events.event_id IS 'Unique identifier for event';
COMMENT ON COLUMN events.planner_id IS 'ID of the user who created this event';
COMMENT ON COLUMN events.title IS 'Event title/name';
COMMENT ON COLUMN events.description IS 'Detailed description of the event';
COMMENT ON COLUMN events.location IS 'Event location/venue';
COMMENT ON COLUMN events.date IS 'Event date';
COMMENT ON COLUMN events.event_type IS 'Category/type of event';
COMMENT ON COLUMN events.required_roles IS 'JSON array of professional roles needed for this event';
COMMENT ON COLUMN events.budget_range IS 'Budget range or payment information';
COMMENT ON COLUMN events.is_public IS 'Whether event is publicly visible for applications';
COMMENT ON COLUMN events.status IS 'Current status of the event';
COMMENT ON COLUMN events.created_at IS 'Event creation timestamp';
COMMENT ON COLUMN events.updated_at IS 'Last event update timestamp';
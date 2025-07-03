CREATE TABLE IF NOT EXISTS events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_type VARCHAR(100),
    required_roles JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_events_planner_id ON events(planner_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_events_is_public ON events(is_public);
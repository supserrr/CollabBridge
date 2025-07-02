-- backend/src/migrations/003_create_applications_table.sql

-- Create ENUM type for application status
CREATE TYPE application_status AS ENUM (
    'pending', 
    'accepted', 
    'rejected'
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    app_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT DEFAULT '',
    status application_status DEFAULT 'pending',
    response_message TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_applications_event_id ON applications(event_id);
CREATE INDEX idx_applications_professional_id ON applications(professional_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_applications_responded_at ON applications(responded_at DESC);

-- Create composite indexes for common queries
CREATE INDEX idx_applications_event_status ON applications(event_id, status);
CREATE INDEX idx_applications_professional_status ON applications(professional_id, status);
CREATE INDEX idx_applications_status_created ON applications(status, created_at DESC);

-- Create unique constraint to prevent duplicate applications
CREATE UNIQUE INDEX idx_applications_unique_event_professional 
    ON applications(event_id, professional_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to set responded_at when status changes from pending
CREATE OR REPLACE FUNCTION set_responded_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set responded_at when status changes from pending to accepted/rejected
    IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected') THEN
        NEW.responded_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Clear responded_at if status changes back to pending
    IF NEW.status = 'pending' AND OLD.status IN ('accepted', 'rejected') THEN
        NEW.responded_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_applications_responded_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION set_responded_at();

-- Add constraints
ALTER TABLE applications ADD CONSTRAINT applications_message_length_check 
    CHECK (LENGTH(message) <= 1000);

ALTER TABLE applications ADD CONSTRAINT applications_response_message_length_check 
    CHECK (LENGTH(response_message) <= 1000);

-- Constraint to ensure professional can't apply to their own events
ALTER TABLE applications ADD CONSTRAINT applications_no_self_application 
    CHECK (
        professional_id != (
            SELECT planner_id 
            FROM events 
            WHERE events.event_id = applications.event_id
        )
    );

-- Create partial indexes for better performance
CREATE INDEX idx_applications_pending ON applications(created_at DESC) 
    WHERE status = 'pending';

CREATE INDEX idx_applications_recent_responses ON applications(responded_at DESC) 
    WHERE responded_at IS NOT NULL;

-- Create view for application statistics
CREATE OR REPLACE VIEW application_stats AS
SELECT 
    COUNT(*) as total_applications,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_applications,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_applications,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_applications,
    ROUND(
        (COUNT(CASE WHEN status = 'accepted' THEN 1 END)::decimal / 
         NULLIF(COUNT(CASE WHEN status IN ('accepted', 'rejected') THEN 1 END), 0)) * 100, 
        2
    ) as acceptance_rate
FROM applications;

-- Create view for professional application statistics
CREATE OR REPLACE VIEW professional_application_stats AS
SELECT 
    professional_id,
    COUNT(*) as total_applications,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_applications,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_applications,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_applications,
    ROUND(
        (COUNT(CASE WHEN status = 'accepted' THEN 1 END)::decimal / 
         NULLIF(COUNT(CASE WHEN status IN ('accepted', 'rejected') THEN 1 END), 0)) * 100, 
        2
    ) as success_rate
FROM applications
GROUP BY professional_id;

-- Create view for planner application statistics
CREATE OR REPLACE VIEW planner_application_stats AS
SELECT 
    e.planner_id,
    COUNT(a.*) as total_applications_received,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_applications,
    COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) as accepted_applications,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_applications,
    AVG(EXTRACT(EPOCH FROM (a.responded_at - a.created_at))/3600) as avg_response_time_hours
FROM applications a
JOIN events e ON a.event_id = e.event_id
WHERE a.responded_at IS NOT NULL
GROUP BY e.planner_id;

-- Add comments for documentation
COMMENT ON TABLE applications IS 'Applications submitted by professionals to events';
COMMENT ON COLUMN applications.app_id IS 'Unique identifier for application';
COMMENT ON COLUMN applications.event_id IS 'ID of the event being applied to';
COMMENT ON COLUMN applications.professional_id IS 'ID of the professional submitting application';
COMMENT ON COLUMN applications.message IS 'Application message from professional';
COMMENT ON COLUMN applications.status IS 'Current status of the application';
COMMENT ON COLUMN applications.response_message IS 'Response message from event planner';
COMMENT ON COLUMN applications.created_at IS 'Application submission timestamp';
COMMENT ON COLUMN applications.responded_at IS 'Timestamp when planner responded to application';
COMMENT ON COLUMN applications.updated_at IS 'Last application update timestamp';

COMMENT ON VIEW application_stats IS 'Overall application statistics';
COMMENT ON VIEW professional_application_stats IS 'Application statistics per professional';
COMMENT ON VIEW planner_application_stats IS 'Application statistics per planner including response times';
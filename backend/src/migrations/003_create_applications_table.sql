-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    app_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique applications
    UNIQUE(event_id, professional_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_applications_event_id ON applications(event_id);
CREATE INDEX idx_applications_professional_id ON applications(professional_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at_trigger
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_applications_updated_at();

-- Create a separate trigger to validate professional role
CREATE OR REPLACE FUNCTION validate_professional_application()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user is a professional
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE user_id = NEW.professional_id 
        AND role = 'professional'
    ) THEN
        RAISE EXCEPTION 'Only users with role "professional" can apply to events';
    END IF;
    
    -- Check if the event belongs to a planner
    IF NOT EXISTS (
        SELECT 1 FROM events e
        JOIN users u ON e.planner_id = u.user_id
        WHERE e.event_id = NEW.event_id 
        AND u.role = 'planner'
    ) THEN
        RAISE EXCEPTION 'Event must belong to a user with role "planner"';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_application_roles
BEFORE INSERT OR UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION validate_professional_application();

-- Add comment to the table
COMMENT ON TABLE applications IS 'Stores applications from professionals to events';
COMMENT ON COLUMN applications.app_id IS 'Unique identifier for the application';
COMMENT ON COLUMN applications.event_id IS 'Reference to the event being applied to';
COMMENT ON COLUMN applications.professional_id IS 'Reference to the professional applying';
COMMENT ON COLUMN applications.status IS 'Current status of the application';
COMMENT ON COLUMN applications.message IS 'Optional message from the professional';
COMMENT ON COLUMN applications.applied_at IS 'When the application was submitted';
COMMENT ON COLUMN applications.responded_at IS 'When the planner responded to the application';
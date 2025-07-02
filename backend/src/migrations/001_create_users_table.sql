-- backend/src/migrations/001_create_users_table.sql

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('planner', 'professional');
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'unavailable');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    bio TEXT DEFAULT '',
    phone VARCHAR(20) DEFAULT '',
    location VARCHAR(100) DEFAULT '',
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    availability_status availability_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_rating ON users(rating DESC);
CREATE INDEX idx_users_availability ON users(availability_status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX idx_users_role_location ON users(role, location);
CREATE INDEX idx_users_role_rating ON users(role, rating DESC);
CREATE INDEX idx_users_role_availability ON users(role, availability_status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE users ADD CONSTRAINT users_email_format_check 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users ADD CONSTRAINT users_name_length_check 
    CHECK (LENGTH(TRIM(name)) >= 2);

ALTER TABLE users ADD CONSTRAINT users_bio_length_check 
    CHECK (LENGTH(bio) <= 500);

-- Create partial index for professionals only
CREATE INDEX idx_professionals_rating ON users(rating DESC) 
    WHERE role = 'professional';

CREATE INDEX idx_available_professionals ON users(user_id) 
    WHERE role = 'professional' AND availability_status = 'available';

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts for event planners and creative professionals';
COMMENT ON COLUMN users.user_id IS 'Unique identifier for user';
COMMENT ON COLUMN users.name IS 'Full name of the user';
COMMENT ON COLUMN users.email IS 'Email address for login and communication';
COMMENT ON COLUMN users.role IS 'User type: planner (event organizer) or professional (service provider)';
COMMENT ON COLUMN users.bio IS 'User biography/description of services';
COMMENT ON COLUMN users.phone IS 'Contact phone number';
COMMENT ON COLUMN users.location IS 'User location/service area';
COMMENT ON COLUMN users.rating IS 'Average rating from reviews (0-5 scale)';
COMMENT ON COLUMN users.availability_status IS 'Current availability for new projects';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN users.updated_at IS 'Last profile update timestamp';
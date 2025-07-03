-- 001_create_users_table.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('planner', 'professional', 'admin')),
    bio TEXT,
    location VARCHAR(255),
    skills TEXT[],
    portfolio_url VARCHAR(500),
    phone VARCHAR(20),
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_rating ON users(rating);
CREATE INDEX idx_users_availability ON users(availability_status);

-- 002_create_events_table.sql
CREATE TABLE IF NOT EXISTS events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    venue VARCHAR(255),
    event_date DATE NOT NULL,
    event_time TIME,
    duration_hours INTEGER,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    required_roles JSONB DEFAULT '[]'::jsonb,
    max_applications INTEGER DEFAULT 10,
    is_public BOOLEAN DEFAULT TRUE,
    is_urgent BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_budget CHECK (budget_min <= budget_max),
    CONSTRAINT valid_event_date CHECK (event_date >= CURRENT_DATE)
);

CREATE INDEX idx_events_planner_id ON events(planner_id);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_is_public ON events(is_public);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- 003_create_applications_table.sql
CREATE TABLE IF NOT EXISTS applications (
    app_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    proposed_rate DECIMAL(10,2),
    message TEXT,
    portfolio_items JSONB DEFAULT '[]'::jsonb,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_application UNIQUE (event_id, professional_id)
);

CREATE INDEX idx_applications_event_id ON applications(event_id);
CREATE INDEX idx_applications_professional_id ON applications(professional_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);

-- 004_create_reviews_table.sql
CREATE TABLE IF NOT EXISTS reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    from_user UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    to_user UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_self_review CHECK (from_user != to_user),
    CONSTRAINT unique_review UNIQUE (event_id, from_user, to_user)
);

CREATE INDEX idx_reviews_event_id ON reviews(event_id);
CREATE INDEX idx_reviews_from_user ON reviews(from_user);
CREATE INDEX idx_reviews_to_user ON reviews(to_user);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Create trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
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

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE
    ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE
    ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rating_after_review
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_user_rating();
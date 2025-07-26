-- Migration script for Portfolio feature
-- Run this manually in your PostgreSQL database

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "displayName" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN DEFAULT true;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  "imageUrl" VARCHAR(500),
  "projectUrl" VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  "isFeatured" BOOLEAN DEFAULT false,
  "isPublic" BOOLEAN DEFAULT true,
  "viewCount" INTEGER DEFAULT 0,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create portfolio_views table
CREATE TABLE IF NOT EXISTS portfolio_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "viewerIp" VARCHAR(45),
  "userAgent" TEXT,
  referrer VARCHAR(500),
  "viewedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_userId ON projects("userId");
CREATE INDEX IF NOT EXISTS idx_projects_isPublic ON projects("isPublic");
CREATE INDEX IF NOT EXISTS idx_projects_isFeatured ON projects("isFeatured");
CREATE INDEX IF NOT EXISTS idx_projects_createdAt ON projects("createdAt");

CREATE INDEX IF NOT EXISTS idx_portfolio_views_userId ON portfolio_views("userId");
CREATE INDEX IF NOT EXISTS idx_portfolio_views_viewedAt ON portfolio_views("viewedAt");

-- Update existing users to have public portfolios by default
UPDATE users SET "isPublic" = true WHERE "isPublic" IS NULL;

-- Add location columns to analytics table (skip country as it exists)
-- Migration: 011_add_location_to_analytics.sql

ALTER TABLE analytics 
ADD COLUMN region VARCHAR(100) DEFAULT 'Unknown',
ADD COLUMN city VARCHAR(100) DEFAULT 'Unknown',
ADD COLUMN latitude DECIMAL(10, 8) NULL,
ADD COLUMN longitude DECIMAL(11, 8) NULL,
ADD COLUMN timezone VARCHAR(100) DEFAULT 'Asia/Jakarta';

-- Create indexes for better query performance (ignore errors if exists)
CREATE INDEX idx_analytics_city ON analytics(city);
CREATE INDEX idx_analytics_location ON analytics(country, city);
CREATE INDEX idx_analytics_content_location ON analytics(content_id, country, city);

-- Update existing records with default values for Indonesia
UPDATE analytics 
SET country = COALESCE(country, 'Indonesia'), 
    region = 'Unknown',
    city = 'Unknown',
    timezone = 'Asia/Jakarta'
WHERE region IS NULL;

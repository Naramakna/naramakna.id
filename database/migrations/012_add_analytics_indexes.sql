-- Add indexes to analytics table for better performance
-- Migration: 012_add_analytics_indexes.sql

-- Create indexes for better query performance
CREATE INDEX idx_analytics_city ON analytics(city);
CREATE INDEX idx_analytics_location ON analytics(country, city);
CREATE INDEX idx_analytics_content_location ON analytics(content_id, country, city);

-- Update existing records with default values for Indonesia
UPDATE analytics 
SET country = COALESCE(country, 'Indonesia')
WHERE country IS NULL;

-- Add some sample location data for testing
UPDATE analytics 
SET city = CASE 
    WHEN RAND() < 0.3 THEN 'Jakarta'
    WHEN RAND() < 0.5 THEN 'Bandung' 
    WHEN RAND() < 0.7 THEN 'Surabaya'
    WHEN RAND() < 0.8 THEN 'Medan'
    WHEN RAND() < 0.9 THEN 'Semarang'
    ELSE 'Yogyakarta'
END,
region = CASE 
    WHEN city = 'Jakarta' THEN 'DKI Jakarta'
    WHEN city = 'Bandung' THEN 'Jawa Barat'
    WHEN city = 'Surabaya' THEN 'Jawa Timur'
    WHEN city = 'Medan' THEN 'Sumatera Utara'
    WHEN city = 'Semarang' THEN 'Jawa Tengah'
    WHEN city = 'Yogyakarta' THEN 'D.I. Yogyakarta'
    ELSE 'Unknown'
END
WHERE city = 'Unknown' OR city IS NULL;

-- Update user_status column to support text values
-- Migration: 013_update_user_status.sql

-- First, let's see current values
SELECT DISTINCT user_status FROM users;

-- Update existing records to string values FIRST (while still int)
UPDATE users SET user_status = 10 WHERE user_status = 0 OR user_status IS NULL; -- temp value for 'active'
UPDATE users SET user_status = 11 WHERE user_status = 1; -- temp value for 'inactive'  
UPDATE users SET user_status = 12 WHERE user_status = 2; -- temp value for 'suspended'

-- Now change the column type to VARCHAR
ALTER TABLE users MODIFY COLUMN user_status VARCHAR(20) DEFAULT 'active';

-- Update to final string values
UPDATE users SET user_status = 'active' WHERE user_status = '10';
UPDATE users SET user_status = 'inactive' WHERE user_status = '11';
UPDATE users SET user_status = 'suspended' WHERE user_status = '12';

-- Add index for performance
CREATE INDEX idx_user_status ON users(user_status);

-- Verify the change
DESCRIBE users;
SELECT user_login, user_status FROM users LIMIT 10;

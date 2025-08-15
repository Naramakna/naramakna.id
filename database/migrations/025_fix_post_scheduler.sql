-- Fix post scheduler system
-- This allows admin/superadmin to schedule when posts should be published

-- First, drop existing scheduled_by column and recreate with correct type
ALTER TABLE posts DROP COLUMN IF EXISTS scheduled_by;
ALTER TABLE posts ADD COLUMN scheduled_by BIGINT UNSIGNED NULL AFTER post_author;

-- Add scheduling notes column if not exists
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduling_notes TEXT NULL;

-- Add foreign key for scheduled_by (using correct data type)
ALTER TABLE posts 
ADD CONSTRAINT fk_posts_scheduled_by 
FOREIGN KEY (scheduled_by) REFERENCES users(ID) 
ON DELETE SET NULL;

-- Create index for scheduled posts lookup
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON posts(scheduled_publish_date, post_status);

-- Create post_schedule_log table to track scheduling history
CREATE TABLE IF NOT EXISTS post_schedule_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT UNSIGNED NOT NULL,
    action_type ENUM('scheduled', 'rescheduled', 'published', 'cancelled') NOT NULL,
    scheduled_date DATETIME NULL,
    previous_scheduled_date DATETIME NULL,
    scheduled_by BIGINT UNSIGNED NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(ID) ON DELETE CASCADE,
    FOREIGN KEY (scheduled_by) REFERENCES users(ID) ON DELETE CASCADE,
    INDEX idx_schedule_log_post (post_id),
    INDEX idx_schedule_log_date (scheduled_date)
);

-- Show current post statuses
SELECT 'CURRENT POST STATUSES' as info;
SELECT 
    post_status,
    COUNT(*) as count
FROM posts 
WHERE post_type = 'post'
GROUP BY post_status;

-- Show posts that could be scheduled (drafts and pending)
SELECT 'POSTS READY FOR SCHEDULING' as info;
SELECT 
    ID,
    post_title,
    post_status,
    post_author,
    post_date
FROM posts 
WHERE post_type = 'post' 
AND post_status IN ('draft', 'pending')
ORDER BY post_date DESC
LIMIT 5;

SELECT 'Post scheduler system fixed successfully!' as result;

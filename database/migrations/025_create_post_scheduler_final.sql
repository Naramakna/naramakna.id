-- Create post scheduler system
-- This allows admin/superadmin to schedule when posts should be published

-- Drop existing scheduled_by if exists and recreate with correct type
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'scheduled_by') > 0,
    'ALTER TABLE posts DROP COLUMN scheduled_by',
    'SELECT "Column scheduled_by does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add scheduled_by with correct type
ALTER TABLE posts ADD COLUMN scheduled_by BIGINT UNSIGNED NULL AFTER post_author;

-- Add scheduling notes column 
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'scheduling_notes') = 0,
    'ALTER TABLE posts ADD COLUMN scheduling_notes TEXT NULL',
    'SELECT "Column scheduling_notes already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for scheduled_by
ALTER TABLE posts 
ADD CONSTRAINT fk_posts_scheduled_by 
FOREIGN KEY (scheduled_by) REFERENCES users(ID) 
ON DELETE SET NULL;

-- Create index for scheduled posts lookup
CREATE INDEX idx_posts_scheduled ON posts(scheduled_publish_date, post_status);

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

-- Show posts that could be scheduled
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

SELECT 'Post scheduler system created successfully!' as result;

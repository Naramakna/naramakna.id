-- Simple post scheduler setup

-- Create post_schedule_log table
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
    FOREIGN KEY (scheduled_by) REFERENCES users(ID) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_schedule_log_post ON post_schedule_log(post_id);
CREATE INDEX idx_schedule_log_date ON post_schedule_log(scheduled_date);

-- Show what posts are available for scheduling
SELECT 'POSTS AVAILABLE FOR SCHEDULING' as info;
SELECT 
    ID,
    LEFT(post_title, 50) as title,
    post_status,
    post_author,
    DATE(post_date) as created_date
FROM posts 
WHERE post_type = 'post' 
AND post_status IN ('draft', 'pending')
ORDER BY post_date DESC
LIMIT 10;

SELECT 'Post scheduler tables created!' as result;

-- Migration: Create Dynamic Polling System
-- Date: 2025-01-20

-- Table untuk menyimpan polling questions
CREATE TABLE IF NOT EXISTS polls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    source_article_id BIGINT UNSIGNED,
    title VARCHAR(500) NOT NULL,
    question TEXT NOT NULL,
    status ENUM('active', 'closed', 'draft') DEFAULT 'active',
    generation_method ENUM('template', 'ai', 'manual') DEFAULT 'template',
    category VARCHAR(100),
    source_channel VARCHAR(50), -- naramaknaBISNIS, naramaknaOTO, etc
    
    -- Metadata
    total_votes INT DEFAULT 0,
    trending_score DECIMAL(10,2) DEFAULT 0,
    view_count INT DEFAULT 0,
    
    -- Timing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NULL,
    
    -- Foreign keys
    FOREIGN KEY (source_article_id) REFERENCES posts(ID) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(ID) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_status_created (status, created_at),
    INDEX idx_trending_score (trending_score DESC),
    INDEX idx_source_article (source_article_id),
    INDEX idx_expires (expires_at)
);

-- Table untuk polling options
CREATE TABLE IF NOT EXISTS poll_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poll_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    option_order INT DEFAULT 0,
    vote_count INT DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    INDEX idx_poll_order (poll_id, option_order),
    INDEX idx_vote_count (vote_count DESC)
);

-- Table untuk menyimpan votes
CREATE TABLE IF NOT EXISTS poll_votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poll_id INT NOT NULL,
    option_id INT NOT NULL,
    
    -- User tracking (optional for anonymous voting)
    user_id BIGINT UNSIGNED NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    -- Metadata
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE SET NULL,
    
    -- Prevent duplicate votes
    UNIQUE KEY unique_user_poll (poll_id, user_id),
    UNIQUE KEY unique_ip_poll (poll_id, ip_address),
    
    INDEX idx_poll_votes (poll_id),
    INDEX idx_voted_at (voted_at)
);

-- Table untuk trending detection configuration
CREATE TABLE IF NOT EXISTS trending_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_name VARCHAR(100) UNIQUE NOT NULL,
    
    -- Thresholds for trending detection
    min_views_threshold INT DEFAULT 1000,
    min_comments_threshold INT DEFAULT 10,
    time_window_hours INT DEFAULT 24,
    trending_score_weight DECIMAL(3,2) DEFAULT 1.00,
    
    -- Auto-polling settings  
    auto_generate_polls BOOLEAN DEFAULT TRUE,
    max_polls_per_day INT DEFAULT 5,
    poll_duration_days INT DEFAULT 7,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default trending configuration
INSERT INTO trending_config (config_name, min_views_threshold, min_comments_threshold, time_window_hours, auto_generate_polls, max_polls_per_day) 
VALUES ('default', 500, 5, 24, TRUE, 3);

-- Table untuk polling templates
CREATE TABLE IF NOT EXISTS poll_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- news, entertainment, sports, business, etc
    
    question_template TEXT NOT NULL,
    options_template JSON NOT NULL, -- Array of option templates
    
    -- Usage tracking
    usage_count INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_engagement DECIMAL(10,2) DEFAULT 0.00,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category_active (category, is_active),
    INDEX idx_success_rate (success_rate DESC)
);

-- Insert default polling templates
INSERT INTO poll_templates (template_name, category, question_template, options_template) VALUES
('business_opinion', 'business', 'Bagaimana tanggapan Anda tentang {topic}?', '["Setuju", "Tidak setuju", "Netral"]'),
('business_impact', 'business', 'Apakah {decision} akan berdampak positif bagi {target}?', '["Ya, sangat positif", "Mungkin", "Tidak", "Tidak tahu"]'),
('entertainment_preference', 'entertainment', 'Siapa favorit Anda di {event}?', '["Option A", "Option B", "Option C", "Lainnya"]'),
('entertainment_review', 'entertainment', 'Bagaimana pendapat Anda tentang {content}?', '["Sangat bagus", "Bagus", "Biasa saja", "Kurang bagus", "Buruk"]'),
('sports_prediction', 'sports', 'Tim mana yang akan menang di {match}?', '["Tim A", "Tim B", "Seri"]'),
('sports_performance', 'sports', 'Bagaimana performa {player_team} dalam pertandingan ini?', '["Sangat baik", "Baik", "Cukup", "Kurang", "Buruk"]'),
('general_yes_no', 'general', 'Apakah Anda setuju dengan {statement}?', '["Ya", "Tidak", "Tidak yakin"]'),
('general_choice', 'general', 'Pilihan mana yang lebih baik: {option1} atau {option2}?', '["Option 1", "Option 2", "Keduanya", "Tidak keduanya"]'),
('lifestyle_experience', 'lifestyle', 'Apakah Anda sudah mencoba {activity}?', '["Sudah", "Belum, tapi tertarik", "Belum, tidak tertarik"]'),
('technology_adoption', 'technology', 'Apakah Anda akan menggunakan {technology}?', '["Pasti akan", "Mungkin", "Tidak yakin", "Tidak akan"]');

-- Create view untuk trending posts analysis
CREATE OR REPLACE VIEW trending_posts_analysis AS
SELECT 
    p.ID,
    p.post_title,
    p.post_excerpt,
    p.post_type,
    p.view_count,
    p.comment_count,
    p.post_date,
    
    -- Calculate trending score
    (
        (p.view_count * 0.6) + 
        (p.comment_count * 20 * 0.3) + 
        (CASE 
            WHEN p.post_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 100
            WHEN p.post_date >= DATE_SUB(NOW(), INTERVAL 48 HOUR) THEN 50  
            WHEN p.post_date >= DATE_SUB(NOW(), INTERVAL 72 HOUR) THEN 25
            ELSE 0 
        END * 0.1)
    ) as trending_score,
    
    -- Extract category from terms
    GROUP_CONCAT(DISTINCT t.name) as categories,
    
    -- Check if already has poll
    (SELECT COUNT(*) FROM polls WHERE source_article_id = p.ID) as has_poll
    
FROM posts p
LEFT JOIN term_relationships tr ON p.ID = tr.object_id  
LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
LEFT JOIN terms t ON tt.term_id = t.term_id AND tt.taxonomy IN ('category', 'newstopic')
WHERE 
    p.post_status = 'publish'
    AND p.post_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY p.ID, p.post_title, p.post_excerpt, p.post_type, p.view_count, p.comment_count, p.post_date
HAVING trending_score > 100
ORDER BY trending_score DESC;

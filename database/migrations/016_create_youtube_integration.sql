-- YouTube Integration Tables
-- Migration: 016_create_youtube_integration.sql

-- YouTube configuration table
CREATE TABLE IF NOT EXISTS youtube_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    client_secret VARCHAR(255) NOT NULL,
    redirect_uri VARCHAR(255) NOT NULL,
    app_name VARCHAR(255) DEFAULT 'Naramakna',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- YouTube OAuth tokens table
CREATE TABLE IF NOT EXISTS youtube_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP NULL,
    scope TEXT,
    channel_id VARCHAR(255),
    channel_title VARCHAR(255),
    channel_description TEXT,
    channel_thumbnail VARCHAR(500),
    subscriber_count INT DEFAULT 0,
    video_count INT DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE CASCADE,
    UNIQUE KEY unique_user_channel (user_id, channel_id)
);

-- YouTube videos table
CREATE TABLE IF NOT EXISTS youtube_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    youtube_video_id VARCHAR(255) UNIQUE,
    youtube_channel_id VARCHAR(255),
    youtube_channel_name VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    duration INT, -- seconds
    thumbnail_url VARCHAR(500),
    watch_url VARCHAR(500),
    embed_url VARCHAR(500),
    
    -- YouTube metrics
    youtube_view_count BIGINT DEFAULT 0,
    youtube_like_count INT DEFAULT 0,
    youtube_dislike_count INT DEFAULT 0,
    youtube_comment_count INT DEFAULT 0,
    youtube_favorite_count INT DEFAULT 0,
    
    -- Local tracking
    local_view_count BIGINT DEFAULT 0,
    
    -- Video metadata
    tags JSON,
    category_id VARCHAR(50),
    default_language VARCHAR(10),
    default_audio_language VARCHAR(10),
    
    -- Status and privacy
    source ENUM('uploaded', 'synced', 'manual') DEFAULT 'uploaded',
    upload_status ENUM('pending', 'uploading', 'processing', 'published', 'failed', 'rejected') DEFAULT 'pending',
    privacy_status ENUM('private', 'public', 'unlisted') DEFAULT 'public',
    license VARCHAR(50) DEFAULT 'youtube',
    embeddable BOOLEAN DEFAULT TRUE,
    public_stats_viewable BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    youtube_published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE CASCADE,
    INDEX idx_youtube_video_id (youtube_video_id),
    INDEX idx_channel_id (youtube_channel_id),
    INDEX idx_upload_status (upload_status),
    INDEX idx_privacy_status (privacy_status),
    INDEX idx_published_at (youtube_published_at),
    INDEX idx_local_views (local_view_count),
    INDEX idx_youtube_views (youtube_view_count)
);

-- YouTube video views tracking
CREATE TABLE IF NOT EXISTS youtube_video_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id INT NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    duration_watched INT, -- seconds watched
    watch_percentage DECIMAL(5,2), -- percentage of video watched
    view_date DATE NOT NULL,
    view_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (video_id) REFERENCES youtube_videos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE SET NULL,
    INDEX idx_video_date (video_id, view_date),
    INDEX idx_user_video (user_id, video_id),
    INDEX idx_ip_video (ip_address, video_id),
    INDEX idx_view_date (view_date)
);

-- YouTube upload queue for batch processing
CREATE TABLE IF NOT EXISTS youtube_upload_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Upload metadata
    title VARCHAR(500) NOT NULL,
    description TEXT,
    tags JSON,
    category_id VARCHAR(50),
    privacy_status ENUM('private', 'public', 'unlisted') DEFAULT 'public',
    thumbnail_path VARCHAR(500),
    
    -- Processing status
    status ENUM('queued', 'uploading', 'processing', 'completed', 'failed') DEFAULT 'queued',
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    youtube_video_id VARCHAR(255),
    error_message TEXT,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    
    -- Timestamps
    queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_user_status (user_id, status),
    INDEX idx_queued_at (queued_at)
);

-- YouTube video categories mapping
CREATE TABLE IF NOT EXISTS youtube_video_categories (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    assignable BOOLEAN DEFAULT TRUE,
    channel_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- YouTube analytics cache
CREATE TABLE IF NOT EXISTS youtube_analytics_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id INT,
    channel_id VARCHAR(255),
    metric_type ENUM('video', 'channel') NOT NULL,
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    metrics JSON NOT NULL,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    FOREIGN KEY (video_id) REFERENCES youtube_videos(id) ON DELETE CASCADE,
    INDEX idx_video_date_range (video_id, date_range_start, date_range_end),
    INDEX idx_channel_date_range (channel_id, date_range_start, date_range_end),
    INDEX idx_expires_at (expires_at)
);

-- Insert default YouTube video categories
INSERT IGNORE INTO youtube_video_categories (id, title) VALUES
('1', 'Film & Animation'),
('2', 'Autos & Vehicles'),
('10', 'Music'),
('15', 'Pets & Animals'),
('17', 'Sports'),
('18', 'Short Movies'),
('19', 'Travel & Events'),
('20', 'Gaming'),
('21', 'Videoblogging'),
('22', 'People & Blogs'),
('23', 'Comedy'),
('24', 'Entertainment'),
('25', 'News & Politics'),
('26', 'Howto & Style'),
('27', 'Education'),
('28', 'Science & Technology'),
('29', 'Nonprofits & Activism');

-- Create view for YouTube videos with engagement metrics
CREATE OR REPLACE VIEW youtube_videos_with_stats AS
SELECT 
    yv.*,
    COALESCE(view_stats.total_views, 0) as total_local_views,
    COALESCE(view_stats.unique_viewers, 0) as unique_local_viewers,
    COALESCE(view_stats.avg_watch_duration, 0) as avg_watch_duration,
    COALESCE(view_stats.avg_watch_percentage, 0) as avg_watch_percentage,
    CASE 
        WHEN yv.youtube_view_count > 0 
        THEN ((yv.youtube_like_count + yv.youtube_comment_count) / yv.youtube_view_count) * 100
        ELSE 0 
    END as youtube_engagement_rate,
    yvc.title as category_title
FROM youtube_videos yv
LEFT JOIN (
    SELECT 
        video_id,
        COUNT(*) as total_views,
        COUNT(DISTINCT COALESCE(user_id, ip_address)) as unique_viewers,
        AVG(duration_watched) as avg_watch_duration,
        AVG(watch_percentage) as avg_watch_percentage
    FROM youtube_video_views 
    GROUP BY video_id
) view_stats ON yv.id = view_stats.video_id
LEFT JOIN youtube_video_categories yvc ON yv.category_id = yvc.id;

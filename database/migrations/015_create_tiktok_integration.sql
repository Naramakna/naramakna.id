-- Migration: Create TikTok Integration System
-- Date: 2025-01-20

-- Table untuk menyimpan TikTok OAuth credentials dan settings
CREATE TABLE IF NOT EXISTS tiktok_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- TikTok App Settings
    client_key VARCHAR(255) NOT NULL,
    client_secret VARCHAR(500) NOT NULL,
    app_id VARCHAR(255) NOT NULL,
    
    -- OAuth URLs
    auth_redirect_uri VARCHAR(500) NOT NULL DEFAULT 'http://localhost:3001/api/tiktok/callback',
    webhook_url VARCHAR(500),
    
    -- Account Info
    account_name VARCHAR(255),
    account_username VARCHAR(255),
    account_avatar_url VARCHAR(500),
    
    -- API Limits and Settings
    daily_upload_limit INT DEFAULT 50,
    auto_sync_enabled BOOLEAN DEFAULT TRUE,
    sync_interval_hours INT DEFAULT 24,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active),
    INDEX idx_last_sync (last_sync_at)
);

-- Table untuk menyimpan TikTok access tokens (untuk multiple accounts jika diperlukan)
CREATE TABLE IF NOT EXISTS tiktok_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- OAuth tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    scope TEXT, -- video.publish, user.info.basic, etc
    
    -- Token metadata
    expires_at TIMESTAMP NULL,
    open_id VARCHAR(255), -- TikTok unique user identifier
    
    -- Account info from TikTok
    tiktok_username VARCHAR(255),
    tiktok_display_name VARCHAR(255),
    tiktok_avatar_url VARCHAR(500),
    
    -- Permissions
    can_upload BOOLEAN DEFAULT FALSE,
    can_read_profile BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE CASCADE,
    
    -- Unique constraints
    UNIQUE KEY unique_user_openid (user_id, open_id),
    
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_expires_at (expires_at),
    INDEX idx_open_id (open_id)
);

-- Table untuk menyimpan TikTok videos
CREATE TABLE IF NOT EXISTS tiktok_videos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- TikTok identifiers
    tiktok_video_id VARCHAR(255) UNIQUE NOT NULL,
    tiktok_username VARCHAR(255),
    tiktok_user_id VARCHAR(255),
    
    -- Video metadata
    title VARCHAR(500),
    description TEXT,
    duration INT, -- in seconds
    
    -- URLs
    video_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    web_video_url VARCHAR(500), -- TikTok web embed URL
    share_url VARCHAR(500),
    
    -- Stats from TikTok
    tiktok_view_count BIGINT DEFAULT 0,
    tiktok_like_count INT DEFAULT 0,
    tiktok_share_count INT DEFAULT 0,
    tiktok_comment_count INT DEFAULT 0,
    
    -- Our platform stats
    local_view_count BIGINT DEFAULT 0,
    local_play_count BIGINT DEFAULT 0,
    
    -- Hashtags and mentions
    hashtags JSON, -- Array of hashtags
    mentions JSON, -- Array of mentioned users
    
    -- Upload/Sync info
    source ENUM('uploaded', 'synced', 'manual') DEFAULT 'synced',
    uploaded_by BIGINT UNSIGNED NULL, -- User who uploaded (for 'uploaded' source)
    synced_from_token_id INT NULL, -- Token used for sync (for 'synced' source)
    
    -- Publishing info (for uploads)
    publish_id VARCHAR(255), -- TikTok publish_id for tracking upload status
    publish_status ENUM('pending', 'processing', 'published', 'failed') DEFAULT 'published',
    publish_error_message TEXT,
    
    -- Content settings
    privacy_level ENUM('PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY') DEFAULT 'PUBLIC_TO_EVERYONE',
    disable_comment BOOLEAN DEFAULT FALSE,
    disable_duet BOOLEAN DEFAULT FALSE,
    disable_stitch BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    tiktok_created_at TIMESTAMP NULL,
    last_synced_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (uploaded_by) REFERENCES users(ID) ON DELETE SET NULL,
    FOREIGN KEY (synced_from_token_id) REFERENCES tiktok_tokens(id) ON DELETE SET NULL,
    
    INDEX idx_tiktok_video_id (tiktok_video_id),
    INDEX idx_tiktok_username (tiktok_username),
    INDEX idx_source (source),
    INDEX idx_publish_status (publish_status),
    INDEX idx_created_at (tiktok_created_at),
    INDEX idx_view_counts (tiktok_view_count DESC, local_view_count DESC)
);

-- Table untuk tracking view events di platform kita
CREATE TABLE IF NOT EXISTS tiktok_video_views (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    video_id INT NOT NULL,
    
    -- Viewer info
    user_id BIGINT UNSIGNED NULL, -- Logged in user
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- View metadata
    view_duration INT, -- seconds watched
    view_percentage DECIMAL(5,2), -- percentage of video watched
    
    -- Device/Platform info
    device_type ENUM('desktop', 'mobile', 'tablet') DEFAULT 'desktop',
    platform VARCHAR(100), -- browser, app, etc
    referrer_url VARCHAR(500),
    
    -- Geographic info (optional)
    country_code VARCHAR(2),
    city VARCHAR(100),
    
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (video_id) REFERENCES tiktok_videos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE SET NULL,
    
    INDEX idx_video_views (video_id, viewed_at),
    INDEX idx_user_views (user_id, viewed_at),
    INDEX idx_ip_views (ip_address, viewed_at),
    INDEX idx_viewed_at (viewed_at)
);

-- Table untuk kategori TikTok videos
CREATE TABLE IF NOT EXISTS tiktok_video_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    video_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    
    -- Auto-detected or manual
    assignment_type ENUM('auto', 'manual') DEFAULT 'auto',
    confidence_score DECIMAL(5,2), -- For auto-detected categories
    
    assigned_by BIGINT UNSIGNED NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (video_id) REFERENCES tiktok_videos(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(ID) ON DELETE SET NULL,
    
    UNIQUE KEY unique_video_category (video_id, category_name),
    INDEX idx_category (category_name),
    INDEX idx_assignment_type (assignment_type)
);

-- Table untuk TikTok upload queue/batch processing
CREATE TABLE IF NOT EXISTS tiktok_upload_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Upload info
    user_id BIGINT UNSIGNED NOT NULL,
    token_id INT NOT NULL,
    
    -- File info
    local_file_path VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(100),
    
    -- Post info
    title VARCHAR(500),
    description TEXT,
    privacy_level ENUM('PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY') DEFAULT 'PUBLIC_TO_EVERYONE',
    disable_comment BOOLEAN DEFAULT FALSE,
    disable_duet BOOLEAN DEFAULT FALSE,
    disable_stitch BOOLEAN DEFAULT FALSE,
    
    -- Processing status
    status ENUM('queued', 'uploading', 'processing', 'completed', 'failed') DEFAULT 'queued',
    progress_percentage INT DEFAULT 0,
    error_message TEXT,
    
    -- TikTok response
    publish_id VARCHAR(255),
    tiktok_video_id VARCHAR(255),
    
    -- Retry logic
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    next_retry_at TIMESTAMP NULL,
    
    -- Timestamps
    queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE CASCADE,
    FOREIGN KEY (token_id) REFERENCES tiktok_tokens(id) ON DELETE CASCADE,
    
    INDEX idx_status (status, queued_at),
    INDEX idx_user_uploads (user_id, queued_at),
    INDEX idx_retry (next_retry_at)
);

-- Insert default TikTok configuration (to be updated with real values)
INSERT INTO tiktok_config (
    client_key, 
    client_secret, 
    app_id, 
    auth_redirect_uri,
    account_name,
    daily_upload_limit,
    auto_sync_enabled
) VALUES (
    'your_tiktok_client_key_here',
    'your_tiktok_client_secret_here', 
    'your_tiktok_app_id_here',
    'http://localhost:3001/api/tiktok/callback',
    'Naramakna Official',
    50,
    TRUE
);

-- Create view for active TikTok videos with stats
CREATE OR REPLACE VIEW tiktok_videos_with_stats AS
SELECT 
    tv.*,
    
    -- Calculate total engagement
    (tv.tiktok_like_count + tv.tiktok_share_count + tv.tiktok_comment_count) as total_engagement,
    
    -- Calculate engagement rate
    CASE 
        WHEN tv.tiktok_view_count > 0 THEN 
            ((tv.tiktok_like_count + tv.tiktok_share_count + tv.tiktok_comment_count) / tv.tiktok_view_count * 100)
        ELSE 0 
    END as engagement_rate,
    
    -- Recent view activity (last 24 hours)
    (SELECT COUNT(*) FROM tiktok_video_views tvv 
     WHERE tvv.video_id = tv.id AND tvv.viewed_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as views_last_24h,
    
    -- Average view duration
    (SELECT AVG(view_duration) FROM tiktok_video_views tvv 
     WHERE tvv.video_id = tv.id) as avg_view_duration,
    
    -- Categories
    (SELECT GROUP_CONCAT(category_name) FROM tiktok_video_categories tvc 
     WHERE tvc.video_id = tv.id) as categories

FROM tiktok_videos tv
WHERE tv.publish_status IN ('published')
ORDER BY tv.tiktok_created_at DESC;


-- Create Mata Elang Photo Gallery System
-- Simple structure specifically for Mata Elang category

-- Table untuk Mata Elang galleries
CREATE TABLE mata_elang_galleries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    cover_image VARCHAR(500),
    photographer VARCHAR(255),
    location VARCHAR(255),
    story_date DATE,
    created_by BIGINT UNSIGNED NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,

    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_is_featured (is_featured),
    FOREIGN KEY (created_by) REFERENCES users(ID) ON DELETE CASCADE
);

-- Table untuk photos dalam Mata Elang gallery
CREATE TABLE mata_elang_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gallery_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    alt_text VARCHAR(255),
    photographer VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_gallery_id (gallery_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_cover (is_cover),
    FOREIGN KEY (gallery_id) REFERENCES mata_elang_galleries(id) ON DELETE CASCADE
);
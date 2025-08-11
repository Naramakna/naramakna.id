-- ========================================
-- CREATE USER PROFILES TABLE
-- Tabel terpisah untuk data profile tambahan
-- Biar ga ganggu waktu import dari WordPress
-- ========================================

CREATE TABLE user_profiles (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Profile Image
    profile_image VARCHAR(255) NULL COMMENT 'Path to profile image',
    
    -- Personal Information
    birth_date DATE NULL COMMENT 'Tanggal lahir user',
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL COMMENT 'Jenis kelamin',
    phone_number VARCHAR(20) NULL COMMENT 'Nomor telepon',
    
    -- Address Information  
    address TEXT NULL COMMENT 'Alamat lengkap',
    city VARCHAR(100) NULL COMMENT 'Kota',
    province VARCHAR(100) NULL COMMENT 'Provinsi',
    postal_code VARCHAR(10) NULL COMMENT 'Kode pos',
    country VARCHAR(50) DEFAULT 'Indonesia' COMMENT 'Negara',
    
    -- Professional Information
    profession VARCHAR(100) NULL COMMENT 'Profesi/pekerjaan',
    company VARCHAR(100) NULL COMMENT 'Nama perusahaan',
    education VARCHAR(100) NULL COMMENT 'Pendidikan terakhir',
    
    -- Social Media
    facebook_url VARCHAR(255) NULL COMMENT 'Link Facebook',
    twitter_url VARCHAR(255) NULL COMMENT 'Link Twitter/X',
    instagram_url VARCHAR(255) NULL COMMENT 'Link Instagram',
    linkedin_url VARCHAR(255) NULL COMMENT 'Link LinkedIn',
    tiktok_url VARCHAR(255) NULL COMMENT 'Link TikTok',
    youtube_url VARCHAR(255) NULL COMMENT 'Link YouTube',
    
    -- Writer Specific
    writer_category VARCHAR(100) NULL COMMENT 'Kategori spesialisasi penulis',
    writing_experience TEXT NULL COMMENT 'Pengalaman menulis',
    portfolio_url VARCHAR(255) NULL COMMENT 'Link portfolio',
    
    -- Privacy Settings
    show_email BOOLEAN DEFAULT FALSE COMMENT 'Tampilkan email di profil publik',
    show_phone BOOLEAN DEFAULT FALSE COMMENT 'Tampilkan phone di profil publik', 
    show_address BOOLEAN DEFAULT FALSE COMMENT 'Tampilkan alamat di profil publik',
    show_birth_date BOOLEAN DEFAULT FALSE COMMENT 'Tampilkan tanggal lahir di profil publik',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE CASCADE,
    
    -- Indexes
    UNIQUE KEY unique_user_profile (user_id),
    INDEX idx_user_profiles_user_id (user_id),
    INDEX idx_user_profiles_city (city),
    INDEX idx_user_profiles_profession (profession),
    INDEX idx_user_profiles_writer_category (writer_category)
);

-- Trigger untuk auto-create profile ketika user baru dibuat
DELIMITER $$
CREATE TRIGGER create_user_profile_after_user_insert
    AFTER INSERT ON users
    FOR EACH ROW
BEGIN
    INSERT INTO user_profiles (user_id) VALUES (NEW.ID);
END$$
DELIMITER ;

-- Comment untuk tabel
ALTER TABLE user_profiles COMMENT = 'Extended user profile data - separate from WordPress import';

-- Verification
SELECT 'User profiles table created successfully!' as status;

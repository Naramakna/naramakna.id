-- Create Category Reference Table for New Structure
-- This table will help map old categories to new ones and provide metadata

CREATE TABLE IF NOT EXISTS category_reference (
    id INT PRIMARY KEY AUTO_INCREMENT,
    old_category_slug VARCHAR(255),
    old_category_name VARCHAR(255),
    new_category_slug VARCHAR(255) NOT NULL,
    new_category_name VARCHAR(255) NOT NULL,
    new_category_description TEXT,
    new_category_color VARCHAR(7), -- hex color for UI
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert the new category structure
INSERT INTO category_reference (
    old_category_slug, old_category_name, 
    new_category_slug, new_category_name, new_category_description, 
    new_category_color, sort_order
) VALUES
-- Mapping existing categories to new structure
('berita-untuk-international', 'Bumi Kita', 'jagat-kita', 'Jagat Kita', 'Berita International - Menyajikan perspektif global dan isu-isu dunia', '#3B82F6', 9),
('entertainment', 'Entertainment', 'pelakon', 'Pelakon', 'Hiburan dan tokoh-tokoh menarik di berbagai bidang', '#8B5CF6', 2),
('news', 'news', 'narapandang', 'Narapandang', 'Kolom Reputasi dan Komunikasi - Analisis mendalam tentang isu terkini', '#EF4444', 1),
('gawe', 'gawe', 'narapandang', 'Narapandang', 'Kolom Reputasi dan Komunikasi - Analisis mendalam tentang isu terkini', '#EF4444', 1),
('kerja', 'kerja', 'narapandang', 'Narapandang', 'Kolom Reputasi dan Komunikasi - Analisis mendalam tentang isu terkini', '#EF4444', 1),
('lokal', 'Lokal', 'narapandang', 'Narapandang', 'Kolom Reputasi dan Komunikasi - Analisis mendalam tentang isu terkini', '#EF4444', 1),

-- New categories without old mappings
(NULL, NULL, 'laga-gaya', 'Laga & Gaya', 'Kolom Lifestyle - Gaya hidup, fashion, dan tren terkini', '#F59E0B', 3),
(NULL, NULL, 'wahana', 'Wahana', 'Kolom Otomotif - Dunia kendaraan dan transportasi', '#10B981', 4),
(NULL, NULL, 'olah-bola', 'Olah Bola', 'Kolom Sport - Olahraga dan kompetisi', '#F97316', 5),
(NULL, NULL, 'cerita-rasa', 'Cerita Rasa', 'Kolom Kuliner - Wisata kuliner dan cerita makanan', '#EC4899', 6),
(NULL, NULL, 'akal-budi', 'Akal Budi', 'Kolom Pendidikan, Budaya, Iptek - Pengetahuan dan kearifan', '#6366F1', 7),
(NULL, NULL, 'horison', 'Horison', 'Kolom Opini - Pandangan dan perspektif mendalam', '#84CC16', 8);

-- First, let's see what we have
SELECT 'Current Category Distribution:' as info;
SELECT 
    cr.new_category_name,
    cr.new_category_description,
    COUNT(CASE WHEN cr.old_category_slug IS NOT NULL THEN 1 END) as posts_to_migrate,
    cr.sort_order
FROM category_reference cr
GROUP BY cr.new_category_slug, cr.new_category_name, cr.new_category_description, cr.sort_order
ORDER BY cr.sort_order;

-- Complete auto-categorization script
-- Combines mapping creation and execution in one session

-- Create a temporary table for tag-to-category mapping
CREATE TEMPORARY TABLE tag_category_mapping (
    tag_pattern VARCHAR(255),
    new_category_slug VARCHAR(100),
    pattern_type ENUM('exact', 'contains', 'starts_with', 'ends_with') DEFAULT 'contains'
);

-- Insert mapping patterns for each category
-- 1. NARAPANDANG - Kolom Reputasi dan Komunikasi (politik, sosial, komunikasi, reputasi)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('komunikasi', 'narapandang', 'contains'),
('reputasi', 'narapandang', 'contains'),
('politik', 'narapandang', 'contains'),
('sosial', 'narapandang', 'contains'),
('nasionalisme', 'narapandang', 'contains'),
('kemerdekaan', 'narapandang', 'contains'),
('analisis-politik', 'narapandang', 'exact'),
('budaya-digital', 'narapandang', 'contains'),
('generasi-muda', 'narapandang', 'contains'),
('anak-', 'narapandang', 'starts_with'),
('generasi', 'narapandang', 'contains'),
('indonesia', 'narapandang', 'contains'),
('masyarakat', 'narapandang', 'contains');

-- 2. PELAKON - Hiburan dan tokoh (entertainment, artis, tokoh, hiburan)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('hiburan', 'pelakon', 'contains'),
('entertainment', 'pelakon', 'contains'),
('budaya-pop', 'pelakon', 'exact'),
('budaya-populer', 'pelakon', 'exact'),
('anime', 'pelakon', 'contains'),
('musik', 'pelakon', 'contains'),
('artis', 'pelakon', 'contains'),
('tokoh', 'pelakon', 'contains'),
('selebriti', 'pelakon', 'contains'),
('film', 'pelakon', 'contains'),
('drama', 'pelakon', 'contains');

-- 3. LAGA & GAYA - Lifestyle (fashion, gaya hidup, trend, style)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('gaya-hidup', 'laga-gaya', 'exact'),
('lifestyle', 'laga-gaya', 'contains'),
('fashion', 'laga-gaya', 'contains'),
('style', 'laga-gaya', 'contains'),
('trend', 'laga-gaya', 'contains'),
('pakaian', 'laga-gaya', 'contains'),
('sepatu', 'laga-gaya', 'contains'),
('alas-kaki', 'laga-gaya', 'exact'),
('genderless-fashion', 'laga-gaya', 'exact'),
('converse', 'laga-gaya', 'exact'),
('kalcer', 'laga-gaya', 'contains'),
('identitas', 'laga-gaya', 'contains');

-- 4. WAHANA - Otomotif (mobil, motor, transportasi, otomotif)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('otomotif', 'wahana', 'contains'),
('mobil', 'wahana', 'contains'),
('motor', 'wahana', 'contains'),
('kendaraan', 'wahana', 'contains'),
('transportasi', 'wahana', 'contains'),
('industri-otomotif', 'wahana', 'exact'),
('modifikasi-motor', 'wahana', 'exact'),
('4wd', 'wahana', 'exact'),
('listrik', 'wahana', 'contains');

-- 5. OLAH BOLA - Sport (olahraga, sport, bola, atletik)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('olahraga', 'olah-bola', 'contains'),
('sport', 'olah-bola', 'contains'),
('bola', 'olah-bola', 'contains'),
('sepak', 'olah-bola', 'contains'),
('basket', 'olah-bola', 'contains'),
('badminton', 'olah-bola', 'contains'),
('tenis', 'olah-bola', 'contains'),
('atletik', 'olah-bola', 'contains'),
('fitness', 'olah-bola', 'contains'),
('sehat', 'olah-bola', 'contains'),
('naturalisasi', 'olah-bola', 'contains'),
('paragliding', 'olah-bola', 'contains');

-- 6. CERITA RASA - Kuliner (makanan, kuliner, masakan, rasa, food)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('kuliner', 'cerita-rasa', 'contains'),
('makanan', 'cerita-rasa', 'contains'),
('masakan', 'cerita-rasa', 'contains'),
('rasa', 'cerita-rasa', 'contains'),
('food', 'cerita-rasa', 'contains'),
('gizi', 'cerita-rasa', 'contains'),
('pangan', 'cerita-rasa', 'contains'),
('jajanan', 'cerita-rasa', 'contains'),
('khas', 'cerita-rasa', 'contains'),
('tradisional', 'cerita-rasa', 'contains'),
('adaptasi-makanan', 'cerita-rasa', 'exact'),
('evolusi-makanan', 'cerita-rasa', 'exact');

-- 7. AKAL BUDI - Pendidikan, Budaya, Iptek (pendidikan, teknologi, budaya, science)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('pendidikan', 'akal-budi', 'contains'),
('edukasi', 'akal-budi', 'contains'),
('teknologi', 'akal-budi', 'contains'),
('budaya', 'akal-budi', 'contains'),
('cultural', 'akal-budi', 'contains'),
('kearifan', 'akal-budi', 'contains'),
('akademik', 'akal-budi', 'contains'),
('penelitian', 'akal-budi', 'contains'),
('perguruan-tinggi', 'akal-budi', 'exact'),
('pembelajaran', 'akal-budi', 'contains'),
('kurikulum', 'akal-budi', 'contains'),
('ai', 'akal-budi', 'contains'),
('chatgpt', 'akal-budi', 'exact'),
('deep-learning', 'akal-budi', 'exact'),
('inovasi', 'akal-budi', 'contains'),
('science', 'akal-budi', 'contains'),
('sejarah', 'akal-budi', 'contains'),
('heritage', 'akal-budi', 'contains'),
('penemuan', 'akal-budi', 'contains');

-- 8. HORISON - Opini (opini, pandangan, perspektif, analisis, komentar)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('opini', 'horison', 'contains'),
('pandangan', 'horison', 'contains'),
('perspektif', 'horison', 'contains'),
('analisis', 'horison', 'contains'),
('komentar', 'horison', 'contains'),
('kritik', 'horison', 'contains'),
('review', 'horison', 'contains'),
('pemikiran', 'horison', 'contains'),
('refleksi', 'horison', 'contains'),
('tren-bahasa', 'horison', 'exact'),
('jargon', 'horison', 'contains'),
('istilah', 'horison', 'contains'),
('fomo', 'horison', 'exact'),
('disrupsi', 'horison', 'exact'),
('emansipasi', 'horison', 'exact');

-- 9. JAGAT KITA - International (wisata, travel, alam, adventure)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('international', 'jagat-kita', 'contains'),
('global', 'jagat-kita', 'contains'),
('dunia', 'jagat-kita', 'contains'),
('world', 'jagat-kita', 'contains'),
('london', 'jagat-kita', 'contains'),
('big-ben', 'jagat-kita', 'exact'),
('anambas', 'jagat-kita', 'contains'),
('toraja', 'jagat-kita', 'contains'),
('sulawesi', 'jagat-kita', 'contains'),
('wisata', 'jagat-kita', 'contains'),
('travel', 'jagat-kita', 'contains'),
('tourism', 'jagat-kita', 'contains'),
('destination', 'jagat-kita', 'contains'),
('explore', 'jagat-kita', 'contains'),
('adventure', 'jagat-kita', 'contains'),
('nature', 'jagat-kita', 'contains'),
('alam', 'jagat-kita', 'contains'),
('camping', 'jagat-kita', 'contains'),
('healing', 'jagat-kita', 'contains'),
('romantic', 'jagat-kita', 'contains'),
('hidden-gem', 'jagat-kita', 'contains'),
('sustainable', 'jagat-kita', 'contains'),
('eco', 'jagat-kita', 'contains'),
('diving', 'jagat-kita', 'contains'),
('snorkeling', 'jagat-kita', 'contains');

-- Show current status before migration
SELECT 'BEFORE AUTO-CATEGORIZATION' as info;
SELECT 
    COALESCE(t.name, 'Uncategorized') as current_category,
    COUNT(DISTINCT p.ID) as post_count
FROM posts p
LEFT JOIN term_relationships tr ON p.ID = tr.object_id
LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'category'
LEFT JOIN terms t ON tt.term_id = t.term_id
WHERE p.post_status = 'publish' AND p.post_type = 'post'
GROUP BY t.name
ORDER BY post_count DESC
LIMIT 10;

-- Create results table for analysis
CREATE TEMPORARY TABLE post_categorization_results (
    post_id INT,
    post_title VARCHAR(500),
    matching_tags TEXT,
    suggested_category VARCHAR(100),
    confidence_score INT DEFAULT 1,
    PRIMARY KEY (post_id, suggested_category)
);

-- Categorize based on EXACT tag matches (highest confidence)
INSERT IGNORE INTO post_categorization_results (post_id, post_title, matching_tags, suggested_category, confidence_score)
SELECT 
    p.ID,
    p.post_title,
    GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as matching_tags,
    tcm.new_category_slug,
    3 as confidence_score
FROM posts p
JOIN term_relationships tr ON p.ID = tr.object_id
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
JOIN terms t ON tt.term_id = t.term_id
JOIN tag_category_mapping tcm ON t.slug COLLATE utf8mb4_0900_ai_ci = tcm.tag_pattern
WHERE p.post_status = 'publish' 
AND p.post_type = 'post'
AND tt.taxonomy IN ('post_tag', 'newstopic')
AND tcm.pattern_type = 'exact'
GROUP BY p.ID, tcm.new_category_slug;

-- Categorize based on CONTAINS matches (medium confidence)
INSERT IGNORE INTO post_categorization_results (post_id, post_title, matching_tags, suggested_category, confidence_score)
SELECT 
    p.ID,
    p.post_title,
    GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as matching_tags,
    tcm.new_category_slug,
    2 as confidence_score
FROM posts p
JOIN term_relationships tr ON p.ID = tr.object_id
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
JOIN terms t ON tt.term_id = t.term_id
JOIN tag_category_mapping tcm ON (
    t.slug COLLATE utf8mb4_0900_ai_ci LIKE CONCAT('%', tcm.tag_pattern, '%') OR
    t.name COLLATE utf8mb4_0900_ai_ci LIKE CONCAT('%', tcm.tag_pattern, '%')
)
WHERE p.post_status = 'publish' 
AND p.post_type = 'post'
AND tt.taxonomy IN ('post_tag', 'newstopic')
AND tcm.pattern_type = 'contains'
GROUP BY p.ID, tcm.new_category_slug;

-- Show preview of categorization results
SELECT 'CATEGORIZATION PREVIEW' as info;
SELECT 
    suggested_category,
    COUNT(DISTINCT post_id) as posts_to_move,
    AVG(confidence_score) as avg_confidence
FROM post_categorization_results
GROUP BY suggested_category
ORDER BY posts_to_move DESC;

-- Show sample posts for each category
SELECT 'SAMPLE CATEGORIZATIONS' as info;
SELECT 
    suggested_category,
    post_title,
    LEFT(matching_tags, 60) as sample_tags,
    confidence_score
FROM post_categorization_results
WHERE confidence_score >= 2
ORDER BY suggested_category, confidence_score DESC
LIMIT 15;

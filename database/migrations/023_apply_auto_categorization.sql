-- Apply the auto-categorization results
-- This will actually move posts to their new categories

-- Recreate the mapping and results (same as previous script)
CREATE TEMPORARY TABLE tag_category_mapping (
    tag_pattern VARCHAR(255),
    new_category_slug VARCHAR(100),
    pattern_type ENUM('exact', 'contains', 'starts_with', 'ends_with') DEFAULT 'contains'
);

-- Insert mapping patterns (condensed version with most effective patterns)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
-- NARAPANDANG - Politics, social, national issues
('nasionalisme', 'narapandang', 'contains'),
('kemerdekaan', 'narapandang', 'contains'),
('analisis-politik', 'narapandang', 'exact'),
('budaya-digital', 'narapandang', 'contains'),
('generasi-muda', 'narapandang', 'contains'),
('anak-', 'narapandang', 'starts_with'),
('generasi', 'narapandang', 'contains'),
('indonesia', 'narapandang', 'contains'),
('17agustus', 'narapandang', 'contains'),
('hutri', 'narapandang', 'contains'),
('bandung', 'narapandang', 'contains'),
('garut', 'narapandang', 'contains'),
('purwakarta', 'narapandang', 'contains'),

-- PELAKON - Entertainment
('budaya-pop', 'pelakon', 'exact'),
('budaya-populer', 'pelakon', 'exact'),
('anime', 'pelakon', 'contains'),
('hiburan', 'pelakon', 'contains'),

-- LAGA & GAYA - Lifestyle  
('gaya-hidup', 'laga-gaya', 'exact'),
('fashion', 'laga-gaya', 'contains'),
('sepatu', 'laga-gaya', 'contains'),
('converse', 'laga-gaya', 'exact'),
('kalcer', 'laga-gaya', 'contains'),
('identitas', 'laga-gaya', 'contains'),
('genderless-fashion', 'laga-gaya', 'exact'),

-- WAHANA - Automotive
('otomotif', 'wahana', 'contains'),
('mobil', 'wahana', 'contains'),
('motor', 'wahana', 'contains'),
('industri-otomotif', 'wahana', 'exact'),
('modifikasi-motor', 'wahana', 'exact'),
('4wd', 'wahana', 'exact'),

-- OLAH BOLA - Sports
('olahraga', 'olah-bola', 'contains'),
('sport', 'olah-bola', 'contains'),
('bola', 'olah-bola', 'contains'),
('sepak', 'olah-bola', 'contains'),
('sehat', 'olah-bola', 'contains'),
('naturalisasi', 'olah-bola', 'contains'),
('paragliding', 'olah-bola', 'contains'),

-- CERITA RASA - Culinary
('kuliner', 'cerita-rasa', 'contains'),
('makanan', 'cerita-rasa', 'contains'),
('gizi', 'cerita-rasa', 'contains'),
('pangan', 'cerita-rasa', 'contains'),
('jajanan', 'cerita-rasa', 'contains'),
('khas', 'cerita-rasa', 'contains'),

-- AKAL BUDI - Education, Culture, Tech
('pendidikan', 'akal-budi', 'contains'),
('edukasi', 'akal-budi', 'contains'),
('teknologi', 'akal-budi', 'contains'),
('budaya', 'akal-budi', 'contains'),
('cultural', 'akal-budi', 'contains'),
('kearifan', 'akal-budi', 'contains'),
('perguruan-tinggi', 'akal-budi', 'exact'),
('chatgpt', 'akal-budi', 'exact'),
('deep-learning', 'akal-budi', 'exact'),
('ai', 'akal-budi', 'contains'),
('sejarah', 'akal-budi', 'contains'),

-- HORISON - Opinion
('jargon', 'horison', 'contains'),
('istilah', 'horison', 'contains'),
('fomo', 'horison', 'exact'),
('disrupsi', 'horison', 'exact'),
('emansipasi', 'horison', 'exact'),

-- JAGAT KITA - Travel, International
('wisata', 'jagat-kita', 'contains'),
('travel', 'jagat-kita', 'contains'),
('tourism', 'jagat-kita', 'contains'),
('explore', 'jagat-kita', 'contains'),
('adventure', 'jagat-kita', 'contains'),
('alam', 'jagat-kita', 'contains'),
('camping', 'jagat-kita', 'contains'),
('healing', 'jagat-kita', 'contains'),
('romantic', 'jagat-kita', 'contains'),
('hidden-gem', 'jagat-kita', 'contains'),
('diving', 'jagat-kita', 'contains'),
('snorkeling', 'jagat-kita', 'contains'),
('anambas', 'jagat-kita', 'contains'),
('toraja', 'jagat-kita', 'contains'),
('sulawesi', 'jagat-kita', 'contains'),
('big-ben', 'jagat-kita', 'exact'),
('london', 'jagat-kita', 'contains');

-- Recreate results table
CREATE TEMPORARY TABLE final_categorization (
    post_id INT PRIMARY KEY,
    post_title VARCHAR(500),
    new_category_slug VARCHAR(100),
    confidence_score INT DEFAULT 1
);

-- Fill with best matches (exact first, then contains)
INSERT INTO final_categorization (post_id, post_title, new_category_slug, confidence_score)
SELECT 
    p.ID,
    p.post_title,
    tcm.new_category_slug,
    CASE 
        WHEN tcm.pattern_type = 'exact' THEN 3
        WHEN tcm.pattern_type = 'contains' THEN 2
        ELSE 1
    END as confidence_score
FROM posts p
JOIN term_relationships tr ON p.ID = tr.object_id
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
JOIN terms t ON tt.term_id = t.term_id
JOIN tag_category_mapping tcm ON (
    (tcm.pattern_type = 'exact' AND t.slug COLLATE utf8mb4_0900_ai_ci = tcm.tag_pattern) OR
    (tcm.pattern_type = 'contains' AND (
        t.slug COLLATE utf8mb4_0900_ai_ci LIKE CONCAT('%', tcm.tag_pattern, '%') OR
        t.name COLLATE utf8mb4_0900_ai_ci LIKE CONCAT('%', tcm.tag_pattern, '%')
    )) OR
    (tcm.pattern_type = 'starts_with' AND t.slug COLLATE utf8mb4_0900_ai_ci LIKE CONCAT(tcm.tag_pattern, '%'))
)
WHERE p.post_status = 'publish' 
AND p.post_type = 'post'
AND tt.taxonomy IN ('post_tag', 'newstopic')
GROUP BY p.ID
HAVING MAX(CASE 
    WHEN tcm.pattern_type = 'exact' THEN 3
    WHEN tcm.pattern_type = 'contains' THEN 2
    ELSE 1
END) = confidence_score;

-- Show what we're about to do
SELECT 'FINAL CATEGORIZATION RESULTS' as info;
SELECT 
    new_category_slug as category,
    COUNT(*) as posts_to_categorize,
    AVG(confidence_score) as avg_confidence
FROM final_categorization
GROUP BY new_category_slug
ORDER BY posts_to_categorize DESC;

-- Apply the categorization
-- 1. Remove existing category relationships for posts we're going to categorize
DELETE tr FROM term_relationships tr
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
WHERE tt.taxonomy = 'category'
AND tr.object_id IN (SELECT post_id FROM final_categorization);

-- 2. Add new category relationships
INSERT INTO term_relationships (object_id, term_taxonomy_id, term_order)
SELECT 
    fc.post_id,
    tt.term_taxonomy_id,
    0
FROM final_categorization fc
JOIN terms t ON fc.new_category_slug = t.slug
JOIN term_taxonomy tt ON t.term_id = tt.term_id AND tt.taxonomy = 'category';

-- 3. Update category counts
UPDATE term_taxonomy tt
SET count = (
    SELECT COUNT(*)
    FROM term_relationships tr
    WHERE tr.term_taxonomy_id = tt.term_taxonomy_id
)
WHERE tt.taxonomy = 'category';

-- Show final results
SELECT 'FINAL CATEGORY DISTRIBUTION' as info;
SELECT 
    t.name as category_name,
    t.slug as category_slug,
    tt.count as post_count
FROM terms t
JOIN term_taxonomy tt ON t.term_id = tt.term_id
WHERE tt.taxonomy = 'category'
ORDER BY tt.count DESC;

-- Show uncategorized count
SELECT 'REMAINING UNCATEGORIZED POSTS' as info;
SELECT COUNT(*) as uncategorized_posts
FROM posts p
LEFT JOIN term_relationships tr ON p.ID = tr.object_id
LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'category'
WHERE p.post_status = 'publish' 
AND p.post_type = 'post'
AND tt.term_taxonomy_id IS NULL;

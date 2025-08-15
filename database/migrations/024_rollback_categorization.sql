-- Rollback all categorization changes
-- This will restore the database to its original state

-- Show current state before rollback
SELECT 'BEFORE ROLLBACK - Current Categories' as info;
SELECT 
    t.name as category_name,
    t.slug as category_slug,
    tt.count as post_count
FROM terms t
JOIN term_taxonomy tt ON t.term_id = tt.term_id
WHERE tt.taxonomy = 'category'
ORDER BY tt.count DESC;

-- Remove all category relationships for posts (except keeping some originals)
DELETE tr FROM term_relationships tr
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
WHERE tt.taxonomy = 'category';

-- Remove the new categories we created (keep only Uncategorized)
DELETE tt FROM term_taxonomy tt
JOIN terms t ON tt.term_id = t.term_id
WHERE tt.taxonomy = 'category'
AND t.slug IN ('narapandang', 'pelakon', 'laga-gaya', 'wahana', 'olah-bola', 'cerita-rasa', 'akal-budi', 'horison', 'jagat-kita');

DELETE FROM terms 
WHERE slug IN ('narapandang', 'pelakon', 'laga-gaya', 'wahana', 'olah-bola', 'cerita-rasa', 'akal-budi', 'horison', 'jagat-kita');

-- Drop the category reference table
DROP TABLE IF EXISTS category_reference;

-- Reset category counts
UPDATE term_taxonomy tt
SET count = (
    SELECT COUNT(*)
    FROM term_relationships tr
    WHERE tr.term_taxonomy_id = tt.term_taxonomy_id
)
WHERE tt.taxonomy = 'category';

-- Show final state
SELECT 'AFTER ROLLBACK - Remaining Categories' as info;
SELECT 
    t.name as category_name,
    t.slug as category_slug,
    tt.count as post_count
FROM terms t
JOIN term_taxonomy tt ON t.term_id = tt.term_id
WHERE tt.taxonomy = 'category'
ORDER BY tt.count DESC;

-- Show uncategorized posts count
SELECT 'UNCATEGORIZED POSTS COUNT' as info;
SELECT COUNT(*) as uncategorized_posts
FROM posts p
LEFT JOIN term_relationships tr ON p.ID = tr.object_id
LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'category'
WHERE p.post_status = 'publish' 
AND p.post_type = 'post'
AND tt.term_taxonomy_id IS NULL;

-- Migrate to New Category Structure
-- This script will:
-- 1. Create new category terms
-- 2. Update existing posts to use new categories
-- 3. Clean up old unused categories

-- Step 1: Insert new categories into terms table
INSERT IGNORE INTO terms (name, slug, term_group) 
SELECT DISTINCT new_category_name, new_category_slug COLLATE utf8mb4_unicode_ci, 0
FROM category_reference 
WHERE new_category_slug COLLATE utf8mb4_unicode_ci NOT IN (SELECT slug FROM terms);

-- Step 2: Insert corresponding taxonomy entries
INSERT IGNORE INTO term_taxonomy (term_id, taxonomy, description, parent, count)
SELECT t.term_id, 'category', cr.new_category_description, 0, 0
FROM terms t
JOIN category_reference cr ON t.slug = cr.new_category_slug COLLATE utf8mb4_unicode_ci
WHERE t.term_id NOT IN (
    SELECT tt.term_id 
    FROM term_taxonomy tt 
    WHERE tt.taxonomy = 'category' AND tt.term_id = t.term_id
);

-- Step 3: Update existing post categories
-- For posts currently in old categories, move them to new categories
UPDATE term_relationships tr
JOIN term_taxonomy tt_old ON tr.term_taxonomy_id = tt_old.term_taxonomy_id
JOIN terms t_old ON tt_old.term_id = t_old.term_id
JOIN category_reference cr ON t_old.slug = cr.old_category_slug COLLATE utf8mb4_0900_ai_ci
JOIN terms t_new ON cr.new_category_slug COLLATE utf8mb4_unicode_ci = t_new.slug
JOIN term_taxonomy tt_new ON t_new.term_id = tt_new.term_id AND tt_new.taxonomy = 'category'
SET tr.term_taxonomy_id = tt_new.term_taxonomy_id
WHERE tt_old.taxonomy = 'category' 
AND cr.old_category_slug IS NOT NULL;

-- Step 4: Update category counts
UPDATE term_taxonomy tt
SET count = (
    SELECT COUNT(*)
    FROM term_relationships tr
    WHERE tr.term_taxonomy_id = tt.term_taxonomy_id
)
WHERE tt.taxonomy = 'category';

-- Step 5: Show migration results
SELECT 'Migration Results:' as info;
SELECT 
    t.name as category_name,
    t.slug as category_slug,
    tt.count as post_count,
    tt.description
FROM terms t
JOIN term_taxonomy tt ON t.term_id = tt.term_id
WHERE tt.taxonomy = 'category'
AND t.slug IN (SELECT DISTINCT new_category_slug COLLATE utf8mb4_unicode_ci FROM category_reference)
ORDER BY tt.count DESC;

-- Step 6: Show posts per new category
SELECT 'Posts per New Category:' as info;
SELECT 
    t.name as category,
    GROUP_CONCAT(p.post_title SEPARATOR ' | ') as posts
FROM posts p
JOIN term_relationships tr ON p.ID = tr.object_id
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
JOIN terms t ON tt.term_id = t.term_id
WHERE tt.taxonomy = 'category'
AND p.post_status = 'publish'
AND t.slug IN (SELECT DISTINCT new_category_slug COLLATE utf8mb4_unicode_ci FROM category_reference)
GROUP BY t.term_id, t.name
ORDER BY COUNT(p.ID) DESC;

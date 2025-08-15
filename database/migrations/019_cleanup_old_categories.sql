-- Cleanup Old Unused Categories
-- This script removes old categories that are no longer used after migration

-- First, let's see what old categories exist with no posts
SELECT 'Old Categories to Remove:' as info;
SELECT 
    t.name as old_category,
    t.slug as old_slug,
    tt.count as post_count
FROM terms t
JOIN term_taxonomy tt ON t.term_id = tt.term_id
WHERE tt.taxonomy = 'category'
AND tt.count = 0
AND t.slug IN ('entertainment', 'news', 'gawe', 'kerja', 'lokal', 'berita-untuk-international');

-- Remove old category relationships first (if any exist)
DELETE tr FROM term_relationships tr
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
JOIN terms t ON tt.term_id = t.term_id
WHERE tt.taxonomy = 'category'
AND t.slug IN ('entertainment', 'news', 'gawe', 'kerja', 'lokal', 'berita-untuk-international');

-- Remove from term_taxonomy
DELETE tt FROM term_taxonomy tt
JOIN terms t ON tt.term_id = t.term_id
WHERE tt.taxonomy = 'category'
AND t.slug IN ('entertainment', 'news', 'gawe', 'kerja', 'lokal', 'berita-untuk-international');

-- Remove from terms
DELETE FROM terms 
WHERE slug IN ('entertainment', 'news', 'gawe', 'kerja', 'lokal', 'berita-untuk-international');

-- Show final category structure
SELECT 'Final Category Structure:' as info;
SELECT 
    cr.sort_order,
    t.name as category_name,
    t.slug as category_slug,
    tt.count as post_count,
    cr.new_category_description as description,
    cr.new_category_color as color
FROM category_reference cr
JOIN terms t ON cr.new_category_slug COLLATE utf8mb4_unicode_ci = t.slug
JOIN term_taxonomy tt ON t.term_id = tt.term_id
WHERE tt.taxonomy = 'category'
ORDER BY cr.sort_order;

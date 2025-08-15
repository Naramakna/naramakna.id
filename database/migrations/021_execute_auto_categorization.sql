-- Execute automatic categorization of posts based on tag patterns
-- This will move posts from their current tags to appropriate new categories

-- First, let's see what we're working with
SELECT 'BEFORE CATEGORIZATION - Current post distribution' as info;
SELECT 
    COALESCE(t.name, 'Uncategorized') as current_category,
    COUNT(DISTINCT p.ID) as post_count
FROM posts p
LEFT JOIN term_relationships tr ON p.ID = tr.object_id
LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'category'
LEFT JOIN terms t ON tt.term_id = t.term_id
WHERE p.post_status = 'publish' AND p.post_type = 'post'
GROUP BY t.name
ORDER BY post_count DESC;

-- Create a temporary table to store our migration results
CREATE TEMPORARY TABLE post_categorization_results (
    post_id INT,
    post_title VARCHAR(500),
    matching_tags TEXT,
    suggested_category VARCHAR(100),
    confidence_score INT DEFAULT 1
);

-- Function to categorize posts based on their tags
-- We'll check each post's tags against our patterns

-- For EXACT matches
INSERT INTO post_categorization_results (post_id, post_title, matching_tags, suggested_category, confidence_score)
SELECT DISTINCT 
    p.ID,
    p.post_title,
    GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as matching_tags,
    tcm.new_category_slug,
    3 as confidence_score
FROM posts p
JOIN term_relationships tr ON p.ID = tr.object_id
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
JOIN terms t ON tt.term_id = t.term_id
JOIN tag_category_mapping tcm ON t.slug = tcm.tag_pattern
WHERE p.post_status = 'publish' 
AND p.post_type = 'post'
AND tt.taxonomy IN ('post_tag', 'newstopic')
AND tcm.pattern_type = 'exact'
GROUP BY p.ID, tcm.new_category_slug;

-- For CONTAINS matches (only if not already categorized with exact match)
INSERT INTO post_categorization_results (post_id, post_title, matching_tags, suggested_category, confidence_score)
SELECT DISTINCT 
    p.ID,
    p.post_title,
    GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as matching_tags,
    tcm.new_category_slug,
    2 as confidence_score
FROM posts p
JOIN term_relationships tr ON p.ID = tr.object_id
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
JOIN terms t ON tt.term_id = t.term_id
JOIN tag_category_mapping tcm ON t.slug LIKE CONCAT('%', tcm.tag_pattern, '%')
WHERE p.post_status = 'publish' 
AND p.post_type = 'post'
AND tt.taxonomy IN ('post_tag', 'newstopic')
AND tcm.pattern_type = 'contains'
AND p.ID NOT IN (SELECT post_id FROM post_categorization_results WHERE confidence_score = 3)
GROUP BY p.ID, tcm.new_category_slug;

-- For STARTS_WITH matches (only if not already categorized)
INSERT INTO post_categorization_results (post_id, post_title, matching_tags, suggested_category, confidence_score)
SELECT DISTINCT 
    p.ID,
    p.post_title,
    GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as matching_tags,
    tcm.new_category_slug,
    2 as confidence_score
FROM posts p
JOIN term_relationships tr ON p.ID = tr.object_id
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
JOIN terms t ON tt.term_id = t.term_id
JOIN tag_category_mapping tcm ON t.slug LIKE CONCAT(tcm.tag_pattern, '%')
WHERE p.post_status = 'publish' 
AND p.post_type = 'post'
AND tt.taxonomy IN ('post_tag', 'newstopic')
AND tcm.pattern_type = 'starts_with'
AND p.ID NOT IN (SELECT post_id FROM post_categorization_results)
GROUP BY p.ID, tcm.new_category_slug;

-- Show categorization results before applying
SELECT 'CATEGORIZATION PREVIEW' as info;
SELECT 
    suggested_category,
    COUNT(*) as posts_to_move,
    AVG(confidence_score) as avg_confidence,
    MIN(confidence_score) as min_confidence,
    MAX(confidence_score) as max_confidence
FROM post_categorization_results
GROUP BY suggested_category
ORDER BY posts_to_move DESC;

-- Show some examples
SELECT 'SAMPLE CATEGORIZATIONS' as info;
SELECT 
    suggested_category,
    post_title,
    LEFT(matching_tags, 100) as sample_tags,
    confidence_score
FROM post_categorization_results
ORDER BY suggested_category, confidence_score DESC
LIMIT 20;

-- Apply categorization for high-confidence matches (score >= 2)
-- First, remove existing category relationships for these posts
DELETE tr FROM term_relationships tr
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
WHERE tt.taxonomy = 'category'
AND tr.object_id IN (
    SELECT post_id FROM post_categorization_results WHERE confidence_score >= 2
);

-- Add new category relationships
INSERT INTO term_relationships (object_id, term_taxonomy_id, term_order)
SELECT DISTINCT 
    pcr.post_id,
    tt_new.term_taxonomy_id,
    0
FROM post_categorization_results pcr
JOIN terms t_new ON pcr.suggested_category = t_new.slug
JOIN term_taxonomy tt_new ON t_new.term_id = tt_new.term_id AND tt_new.taxonomy = 'category'
WHERE pcr.confidence_score >= 2;

-- Update category counts
UPDATE term_taxonomy tt
SET count = (
    SELECT COUNT(*)
    FROM term_relationships tr
    WHERE tr.term_taxonomy_id = tt.term_taxonomy_id
)
WHERE tt.taxonomy = 'category';

-- Show final results
SELECT 'AFTER CATEGORIZATION - New post distribution' as info;
SELECT 
    t.name as category_name,
    t.slug as category_slug,
    tt.count as post_count,
    SUBSTRING(tt.description, 1, 50) as description_preview
FROM terms t
JOIN term_taxonomy tt ON t.term_id = tt.term_id
WHERE tt.taxonomy = 'category'
AND tt.count > 0
ORDER BY tt.count DESC;

-- Show uncategorized posts that need manual review
SELECT 'POSTS NEEDING MANUAL CATEGORIZATION' as info;
SELECT COUNT(*) as uncategorized_posts
FROM posts p
LEFT JOIN term_relationships tr ON p.ID = tr.object_id
LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'category'
WHERE p.post_status = 'publish' 
AND p.post_type = 'post'
AND tt.term_taxonomy_id IS NULL;

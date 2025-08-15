#!/bin/bash

# Auto-categorization script for Naramakna.id
# This script will create 9 new categories and automatically categorize existing posts
# Usage: ./scripts/auto-categorize.sh [preview|apply]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_USER="root"
DB_PASS="password"
DB_NAME="naramakna_clean"

echo -e "${BLUE}=== Naramakna Auto-Categorization Script ===${NC}"
echo "This script will organize your content into 9 main categories:"
echo "1. Narapandang - Kolom Reputasi dan Komunikasi"
echo "2. Pelakon - Hiburan dan tokoh"
echo "3. Laga & Gaya - Lifestyle"
echo "4. Wahana - Otomotif"
echo "5. Olah Bola - Sport"
echo "6. Cerita Rasa - Kuliner"
echo "7. Akal Budi - Pendidikan, Budaya, Iptek"
echo "8. Horison - Opini"
echo "9. Jagat Kita - International"
echo ""

# Check if MySQL is accessible
if ! mysql -u $DB_USER -p$DB_PASS -e "USE $DB_NAME; SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to MySQL database${NC}"
    echo "Please check your database credentials and ensure MySQL is running"
    exit 1
fi

# Function to show current status
show_current_status() {
    echo -e "${YELLOW}Current database status:${NC}"
    mysql -u $DB_USER -p$DB_PASS -e "
    USE $DB_NAME;
    SELECT 
        COALESCE(t.name, 'Uncategorized') as category,
        COUNT(DISTINCT p.ID) as post_count
    FROM posts p
    LEFT JOIN term_relationships tr ON p.ID = tr.object_id
    LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'category'
    LEFT JOIN terms t ON tt.term_id = t.term_id
    WHERE p.post_status = 'publish' AND p.post_type = 'post'
    GROUP BY t.name
    ORDER BY post_count DESC
    LIMIT 10;
    " 2>/dev/null
}

# Function to create categories and mapping
create_categorization_system() {
    echo -e "${GREEN}Creating categorization system...${NC}"
    
    # Create the complete SQL for categorization
    cat > /tmp/auto_categorization.sql << 'EOF'
-- Create 9 main categories
INSERT IGNORE INTO terms (name, slug, term_group) VALUES
('Narapandang', 'narapandang', 0),
('Pelakon', 'pelakon', 0),
('Laga & Gaya', 'laga-gaya', 0),
('Wahana', 'wahana', 0),
('Olah Bola', 'olah-bola', 0),
('Cerita Rasa', 'cerita-rasa', 0),
('Akal Budi', 'akal-budi', 0),
('Horison', 'horison', 0),
('Jagat Kita', 'jagat-kita', 0);

-- Create taxonomy entries
INSERT IGNORE INTO term_taxonomy (term_id, taxonomy, description, parent, count)
SELECT t.term_id, 'category', 
    CASE t.slug
        WHEN 'narapandang' THEN 'Kolom Reputasi dan Komunikasi - Analisis mendalam tentang isu terkini'
        WHEN 'pelakon' THEN 'Hiburan dan tokoh-tokoh menarik di berbagai bidang'
        WHEN 'laga-gaya' THEN 'Kolom Lifestyle - Gaya hidup, fashion, dan tren terkini'
        WHEN 'wahana' THEN 'Kolom Otomotif - Dunia kendaraan dan transportasi'
        WHEN 'olah-bola' THEN 'Kolom Sport - Olahraga dan kompetisi'
        WHEN 'cerita-rasa' THEN 'Kolom Kuliner - Wisata kuliner dan cerita makanan'
        WHEN 'akal-budi' THEN 'Kolom Pendidikan, Budaya, Iptek - Pengetahuan dan kearifan'
        WHEN 'horison' THEN 'Kolom Opini - Pandangan dan perspektif mendalam'
        WHEN 'jagat-kita' THEN 'Berita International - Menyajikan perspektif global dan isu-isu dunia'
    END, 0, 0
FROM terms t
WHERE t.slug IN ('narapandang', 'pelakon', 'laga-gaya', 'wahana', 'olah-bola', 'cerita-rasa', 'akal-budi', 'horison', 'jagat-kita')
AND t.term_id NOT IN (
    SELECT tt.term_id FROM term_taxonomy tt WHERE tt.taxonomy = 'category'
);

-- Create temporary mapping table
CREATE TEMPORARY TABLE tag_category_mapping (
    tag_pattern VARCHAR(255),
    new_category_slug VARCHAR(100),
    pattern_type ENUM('exact', 'contains', 'starts_with') DEFAULT 'contains'
);

-- Insert smart mapping patterns
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
-- NARAPANDANG - Politics, social, national issues  
('nasionalisme', 'narapandang', 'contains'),
('kemerdekaan', 'narapandang', 'contains'),
('politik', 'narapandang', 'contains'),
('budaya-digital', 'narapandang', 'contains'),
('generasi-muda', 'narapandang', 'contains'),
('anak-', 'narapandang', 'starts_with'),
('indonesia', 'narapandang', 'contains'),
('17agustus', 'narapandang', 'contains'),
('hutri', 'narapandang', 'contains'),
('bandung', 'narapandang', 'contains'),
('garut', 'narapandang', 'contains'),

-- PELAKON - Entertainment
('budaya-pop', 'pelakon', 'exact'),
('budaya-populer', 'pelakon', 'exact'),
('anime', 'pelakon', 'contains'),
('hiburan', 'pelakon', 'contains'),

-- LAGA & GAYA - Lifestyle
('gaya-hidup', 'laga-gaya', 'exact'),
('fashion', 'laga-gaya', 'contains'),
('sepatu', 'laga-gaya', 'contains'),
('kalcer', 'laga-gaya', 'contains'),
('identitas', 'laga-gaya', 'contains'),

-- WAHANA - Automotive
('otomotif', 'wahana', 'contains'),
('mobil', 'wahana', 'contains'),
('motor', 'wahana', 'contains'),

-- OLAH BOLA - Sports
('olahraga', 'olah-bola', 'contains'),
('sport', 'olah-bola', 'contains'),
('bola', 'olah-bola', 'contains'),
('sehat', 'olah-bola', 'contains'),

-- CERITA RASA - Culinary
('kuliner', 'cerita-rasa', 'contains'),
('makanan', 'cerita-rasa', 'contains'),
('gizi', 'cerita-rasa', 'contains'),
('jajanan', 'cerita-rasa', 'contains'),

-- AKAL BUDI - Education, Culture, Tech
('pendidikan', 'akal-budi', 'contains'),
('teknologi', 'akal-budi', 'contains'),
('budaya', 'akal-budi', 'contains'),
('perguruan-tinggi', 'akal-budi', 'exact'),
('chatgpt', 'akal-budi', 'exact'),
('ai', 'akal-budi', 'contains'),
('sejarah', 'akal-budi', 'contains'),

-- HORISON - Opinion
('jargon', 'horison', 'contains'),
('istilah', 'horison', 'contains'),
('fomo', 'horison', 'exact'),
('disrupsi', 'horison', 'exact'),

-- JAGAT KITA - Travel, International
('wisata', 'jagat-kita', 'contains'),
('travel', 'jagat-kita', 'contains'),
('explore', 'jagat-kita', 'contains'),
('alam', 'jagat-kita', 'contains'),
('anambas', 'jagat-kita', 'contains'),
('toraja', 'jagat-kita', 'contains');

-- Create categorization results
CREATE TEMPORARY TABLE final_categorization (
    post_id INT PRIMARY KEY,
    post_title VARCHAR(500),
    new_category_slug VARCHAR(100),
    confidence_score INT DEFAULT 1
);

-- Fill with matches
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

-- Show preview
SELECT 'CATEGORIZATION PREVIEW' as info;
SELECT 
    new_category_slug as category,
    COUNT(*) as posts_to_categorize
FROM final_categorization
GROUP BY new_category_slug
ORDER BY posts_to_categorize DESC;
EOF

    # Execute the categorization
    mysql -u $DB_USER -p$DB_PASS $DB_NAME < /tmp/auto_categorization.sql 2>/dev/null
}

# Function to apply categorization
apply_categorization() {
    echo -e "${GREEN}Applying auto-categorization...${NC}"
    
    cat > /tmp/apply_categorization.sql << 'EOF'
-- Apply the categorization
-- Remove existing category relationships for posts we're going to categorize
DELETE tr FROM term_relationships tr
JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
WHERE tt.taxonomy = 'category'
AND tr.object_id IN (SELECT post_id FROM final_categorization);

-- Add new category relationships  
INSERT INTO term_relationships (object_id, term_taxonomy_id, term_order)
SELECT 
    fc.post_id,
    tt.term_taxonomy_id,
    0
FROM final_categorization fc
JOIN terms t ON fc.new_category_slug = t.slug
JOIN term_taxonomy tt ON t.term_id = tt.term_id AND tt.taxonomy = 'category';

-- Update category counts
UPDATE term_taxonomy tt
SET count = (
    SELECT COUNT(*)
    FROM term_relationships tr
    WHERE tr.term_taxonomy_id = tt.term_taxonomy_id
)
WHERE tt.taxonomy = 'category';

-- Show final results
SELECT 'FINAL CATEGORIZATION RESULTS' as info;
SELECT 
    t.name as category_name,
    tt.count as post_count
FROM terms t
JOIN term_taxonomy tt ON t.term_id = t.term_id
WHERE tt.taxonomy = 'category'
AND tt.count > 0
ORDER BY tt.count DESC;
EOF

    mysql -u $DB_USER -p$DB_PASS $DB_NAME < /tmp/apply_categorization.sql 2>/dev/null
    
    # Clean up temp files
    rm -f /tmp/auto_categorization.sql /tmp/apply_categorization.sql
    
    echo -e "${GREEN}Auto-categorization completed successfully!${NC}"
}

# Main script logic
case "${1:-preview}" in
    "preview")
        echo -e "${YELLOW}=== PREVIEW MODE ===${NC}"
        show_current_status
        echo ""
        echo -e "${YELLOW}Creating categorization preview...${NC}"
        if create_categorization_system; then
            echo ""
            echo -e "${BLUE}Preview completed. To apply changes, run: ./scripts/auto-categorize.sh apply${NC}"
        else
            echo -e "${RED}Error during preview creation${NC}"
            exit 1
        fi
        ;;
    "apply")
        echo -e "${RED}=== APPLY MODE ===${NC}"
        echo -e "${YELLOW}WARNING: This will modify your database!${NC}"
        read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            show_current_status
            echo ""
            create_categorization_system
            apply_categorization
            echo ""
            echo -e "${GREEN}=== Auto-categorization completed! ===${NC}"
            show_current_status
        else
            echo -e "${YELLOW}Operation cancelled.${NC}"
        fi
        ;;
    *)
        echo "Usage: $0 [preview|apply]"
        echo "  preview - Show what would be categorized (default)"
        echo "  apply   - Actually apply the categorization"
        exit 1
        ;;
esac

echo -e "${BLUE}Script completed.${NC}"

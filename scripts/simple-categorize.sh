#!/bin/bash

# Simple Auto-categorization script for Naramakna.id
# Usage: ./scripts/simple-categorize.sh [preview|apply]

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Database config
DB_USER="root"
DB_PASS="password" 
DB_NAME="naramakna_clean"

echo -e "${BLUE}=== Naramakna Auto-Categorization ===${NC}"

MODE="${1:-preview}"

if [ "$MODE" = "preview" ]; then
    echo -e "${YELLOW}PREVIEW MODE - No changes will be made${NC}"
    echo ""
    
    # Show current status
    echo "Current status:"
    mysql -u $DB_USER -p$DB_PASS -e "
    USE $DB_NAME;
    SELECT 
        COALESCE(t.name, 'Uncategorized') as category,
        COUNT(DISTINCT p.ID) as posts
    FROM posts p
    LEFT JOIN term_relationships tr ON p.ID = tr.object_id
    LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'category'
    LEFT JOIN terms t ON tt.term_id = t.term_id
    WHERE p.post_status = 'publish' AND p.post_type = 'post'
    GROUP BY t.name
    ORDER BY posts DESC;" 2>/dev/null
    
    echo ""
    echo -e "${GREEN}Preview: This script will create 9 categories and auto-categorize posts based on tags${NC}"
    echo "Categories to be created:"
    echo "1. Narapandang - Politik, komunikasi, nasionalisme"
    echo "2. Pelakon - Hiburan, budaya pop"
    echo "3. Laga & Gaya - Fashion, lifestyle" 
    echo "4. Wahana - Otomotif"
    echo "5. Olah Bola - Olahraga"
    echo "6. Cerita Rasa - Kuliner"
    echo "7. Akal Budi - Pendidikan, teknologi, budaya"
    echo "8. Horison - Opini, analisis"
    echo "9. Jagat Kita - Travel, international"
    echo ""
    echo -e "${BLUE}To apply: ./scripts/simple-categorize.sh apply${NC}"
    
elif [ "$MODE" = "apply" ]; then
    echo -e "${RED}APPLY MODE - This will modify your database!${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
    
    echo -e "${GREEN}Applying auto-categorization...${NC}"
    
    # Execute the migration files we created
    echo "Creating categories..."
    mysql -u $DB_USER -p$DB_PASS $DB_NAME < database/migrations/017_create_category_reference.sql
    
    echo "Migrating content..."
    mysql -u $DB_USER -p$DB_PASS $DB_NAME < database/migrations/018_migrate_to_new_categories.sql
    
    echo "Cleaning up..."
    mysql -u $DB_USER -p$DB_PASS $DB_NAME < database/migrations/019_cleanup_old_categories.sql
    
    echo -e "${GREEN}Auto-categorization completed!${NC}"
    
    # Show final status
    echo ""
    echo "Final status:"
    mysql -u $DB_USER -p$DB_PASS -e "
    USE $DB_NAME;
    SELECT 
        t.name as category,
        tt.count as posts
    FROM terms t
    JOIN term_taxonomy tt ON t.term_id = tt.term_id
    WHERE tt.taxonomy = 'category'
    AND tt.count > 0
    ORDER BY tt.count DESC;" 2>/dev/null
    
else
    echo "Usage: $0 [preview|apply]"
    exit 1
fi

echo -e "${BLUE}Done.${NC}"

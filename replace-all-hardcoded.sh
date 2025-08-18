#!/bin/bash

echo "🔧 Replacing all hardcoded localhost:3001 URLs with environment variables..."
echo "=========================================================================="

# Function to add import if not exists
add_import_if_needed() {
    local file="$1"
    local import_line="$2"
    
    # Check if import already exists
    if ! grep -q "buildApiUrl" "$file"; then
        # Find the right place to add import (after other imports)
        if grep -q "^import.*from.*react" "$file"; then
            # Add after React import
            sed -i "/^import.*from.*react/a\\
$import_line" "$file"
        elif grep -q "^import" "$file"; then
            # Add after first import
            sed -i "/^import/a\\
$import_line" "$file"
        else
            # Add at beginning
            sed -i "1i\\
$import_line\\
" "$file"
        fi
        echo "  ✓ Added import to $file"
    fi
}

# Patterns to replace in .tsx and .ts files
echo "📝 Processing frontend files..."

# Find all .tsx and .ts files (excluding node_modules, dist, etc.)
find frontend/src -name "*.tsx" -o -name "*.ts" | while read file; do
    echo "Processing: $file"
    
    # Skip config file itself
    if [[ "$file" == *"config/api.ts"* ]]; then
        continue
    fi
    
    # Check if file has hardcoded URLs
    if grep -q "localhost:3001" "$file"; then
        echo "  🔄 Found hardcoded URLs in $file"
        
        # Determine correct import path based on file location
        if [[ "$file" == *"src/components/molecules/"* ]]; then
            import_path="../../../config/api"
        elif [[ "$file" == *"src/components/organisms/"* ]]; then
            import_path="../../../config/api"
        elif [[ "$file" == *"src/components/atoms/"* ]]; then
            import_path="../../../config/api"
        elif [[ "$file" == *"src/pages/"* ]]; then
            import_path="../../config/api"
        elif [[ "$file" == *"src/hooks/"* ]]; then
            import_path="../config/api"
        elif [[ "$file" == *"src/services/"* ]]; then
            import_path="../config/api"
        else
            import_path="../../config/api"
        fi
        
        # Add import
        add_import_if_needed "$file" "import { buildApiUrl, buildBackendUrl, buildUploadsUrl } from '$import_path';"
        
        # Replace patterns
        
        # Pattern 1: fetch('http://localhost:3001/api/...') -> buildApiUrl('...')
        sed -i "s|fetch('http://localhost:3001/api/\([^']*\)'|fetch(buildApiUrl('\1')|g" "$file"
        
        # Pattern 2: fetch("http://localhost:3001/api/...") -> buildApiUrl("...")
        sed -i 's|fetch("http://localhost:3001/api/\([^"]*\)")|fetch(buildApiUrl("\1"))|g' "$file"
        
        # Pattern 3: fetch(`http://localhost:3001/api/...`) -> buildApiUrl(`...`)
        sed -i 's|fetch(`http://localhost:3001/api/\([^`]*\)`)|fetch(buildApiUrl(`\1`))|g' "$file"
        
        # Pattern 4: Template literals with variables
        sed -i 's|`http://localhost:3001/api/\([^`]*\)`|buildApiUrl(`\1`)|g' "$file"
        
        # Pattern 5: Simple string URLs for API
        sed -i "s|'http://localhost:3001/api/\([^']*\)'|buildApiUrl('\1')|g" "$file"
        sed -i 's|"http://localhost:3001/api/\([^"]*\)"|buildApiUrl("\1")|g' "$file"
        
        # Pattern 6: Backend URLs (non-API)
        sed -i "s|'http://localhost:3001/\([^']*\)'|buildBackendUrl('\1')|g" "$file"
        sed -i 's|"http://localhost:3001/\([^"]*\)"|buildBackendUrl("\1")|g' "$file"
        sed -i 's|`http://localhost:3001/\([^`]*\)`|buildBackendUrl(`\1`)|g' "$file"
        
        # Pattern 7: String concatenation with localhost
        sed -i "s|'http://localhost:3001' + |buildBackendUrl(|g" "$file"
        sed -i 's|"http://localhost:3001" + |buildBackendUrl(|g' "$file"
        sed -i 's|`http://localhost:3001${|buildBackendUrl(`${|g' "$file"
        
        # Pattern 8: Template literals for image URLs
        sed -i 's|`http://localhost:3001${imagePath}`|buildBackendUrl(imagePath)|g' "$file"
        sed -i 's|`http://localhost:3001/uploads/${imagePath}`|buildUploadsUrl(imagePath)|g' "$file"
        
        echo "  ✅ Replaced hardcoded URLs in $file"
    fi
done

echo ""
echo "🔍 Verification: Checking for remaining hardcoded URLs..."

# Count remaining localhost URLs in code files
REMAINING=$(grep -r "localhost:3001" frontend/src \
    --include="*.ts" \
    --include="*.tsx" \
    --include="*.js" \
    --include="*.jsx" \
    | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "✅ SUCCESS! All hardcoded localhost:3001 URLs have been replaced!"
else
    echo "⚠️  Found $REMAINING remaining hardcoded URLs:"
    grep -r "localhost:3001" frontend/src \
        --include="*.ts" \
        --include="*.tsx" \
        --include="*.js" \
        --include="*.jsx" \
        -n --color=always
fi

echo ""
echo "🚀 Testing build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build still works!"
else
    echo "❌ Build failed - check for syntax errors"
fi

echo "✨ Replacement complete!"
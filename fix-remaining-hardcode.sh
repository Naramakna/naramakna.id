#!/bin/bash

echo "🔧 Fixing remaining hardcoded URLs with more specific patterns..."
echo "================================================================"

# Fix specific files that still have hardcoded URLs
fix_file() {
    local file="$1"
    echo "Fixing: $file"
    
    # More aggressive patterns for stubborn URLs
    
    # Pattern for single quotes around full URL
    sed -i "s|'http://localhost:3001/api/\([^']*\)'|buildApiUrl('\1')|g" "$file"
    
    # Pattern for double quotes around full URL
    sed -i 's|"http://localhost:3001/api/\([^"]*\)"|buildApiUrl("\1")|g' "$file"
    
    # Pattern for fetch with single quotes
    sed -i "s|fetch('http://localhost:3001/api/\([^']*\)')|fetch(buildApiUrl('\1'))|g" "$file"
    
    # Pattern for fetch with double quotes
    sed -i 's|fetch("http://localhost:3001/api/\([^"]*\)")|fetch(buildApiUrl("\1"))|g' "$file"
    
    # Pattern for template literals without variables
    sed -i 's|`http://localhost:3001/api/\([^`]*\)`|buildApiUrl(`\1`)|g' "$file"
    
    # Pattern for conditional URL assignments
    sed -i "s|? \`http://localhost:3001/api/\([^`]*\)\`|? buildApiUrl(\`\1\`)|g" "$file"
    sed -i "s|: 'http://localhost:3001/api/\([^']*\)'|: buildApiUrl('\1')|g" "$file"
    
    # Pattern for non-API backend URLs
    sed -i "s|'http://localhost:3001/\([^']*\)'|buildBackendUrl('\1')|g" "$file"
    sed -i 's|"http://localhost:3001/\([^"]*\)"|buildBackendUrl("\1")|g' "$file"
    
    echo "  ✅ Fixed $file"
}

# List of files that still have hardcoded URLs
FILES_TO_FIX=(
    "frontend/src/pages/User/UserDashboard.tsx"
    "frontend/src/pages/Writer/ArticleWriterPage.tsx"
    "frontend/src/pages/Profile/ProfilePage.tsx"
    "frontend/src/pages/Profile/ProfileViewPage.tsx"
    "frontend/src/pages/IndexBerita/IndexBerita.tsx"
    "frontend/src/pages/Category/CategoryPage.tsx"
    "frontend/src/pages/ArticleDetail/ArticleDetailPage.tsx"
    "frontend/src/pages/Admin/AdminPolling.tsx"
    "frontend/src/pages/Admin/AdminYouTube.tsx"
    "frontend/src/pages/Admin/PostAnalytics.tsx"
    "frontend/src/pages/Admin/AdminSettings.tsx"
    "frontend/src/pages/Admin/SuperAdminDashboard.tsx"
    "frontend/src/pages/Admin/AdminDashboard.tsx"
    "frontend/src/components/molecules/CategoryNavigation/CategoryNavigation.tsx"
    "frontend/src/components/molecules/SearchSuggestions/SearchSuggestions.tsx"
    "frontend/src/components/organisms/CommentsSection/CommentsSection.tsx"
    "frontend/src/components/organisms/PopupAd/PopupAd.tsx"
    "frontend/src/components/organisms/SingleCategorySection/SingleCategorySection.tsx"
)

# Process each file
for file in "${FILES_TO_FIX[@]}"; do
    if [ -f "$file" ]; then
        fix_file "$file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo ""
echo "🔍 Final verification..."

# Count remaining localhost URLs
REMAINING=$(grep -r "localhost:3001" frontend/src \
    --include="*.ts" \
    --include="*.tsx" \
    --include="*.js" \
    --include="*.jsx" \
    | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "🎉 SUCCESS! All hardcoded localhost:3001 URLs have been eliminated!"
else
    echo "⚠️  Still found $REMAINING hardcoded URLs:"
    grep -r "localhost:3001" frontend/src \
        --include="*.ts" \
        --include="*.tsx" \
        --include="*.js" \
        --include="*.jsx" \
        -n --color=always | head -20
fi

echo ""
echo "🚀 Testing build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed - checking for syntax errors"
    npm run build 2>&1 | tail -10
fi

echo "✨ Final cleanup complete!"
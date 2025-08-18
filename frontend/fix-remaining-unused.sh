#!/bin/bash

echo "Fixing remaining unused variables..."

# Fix NavDropdown _handleItemClick - remove the function
sed -i '/const _handleItemClick = (item: DropdownItem) => {/,/};/d' src/components/molecules/NavDropdown/NavDropdown.tsx

# Fix AdSection forceRefreshAds
sed -i 's/forceRefreshAds/forceRefreshAds: _forceRefreshAds/g' src/components/organisms/AdSection/AdSection.tsx

# Fix ArticleContent title  
sed -i 's/title,/title: _title,/g' src/components/organisms/ArticleContent/ArticleContent.tsx

# Fix CommentsSection authLoading
sed -i 's/isLoading: authLoading/isLoading: _authLoading/g' src/components/organisms/CommentsSection/CommentsSection.tsx

# Fix DynamicCategorySections maxSections
sed -i 's/maxSections = Number.MAX_SAFE_INTEGER/_maxSections = Number.MAX_SAFE_INTEGER/g' src/components/organisms/DynamicCategorySections/DynamicCategorySections.tsx

# Fix ServiceNavigation NavigationItem import - remove unused import
sed -i '/import { NavigationItem } from/d' src/components/organisms/ServiceNavigation/ServiceNavigation.tsx

# Fix SingleCategorySection index
sed -i 's/\.map((post, index) =>/.map((post, _index) =>/g' src/components/organisms/SingleCategorySection/SingleCategorySection.tsx

# Fix TikTokEmbed autoplay
sed -i 's/autoplay = false,/autoplay: _autoplay = false,/g' src/components/organisms/TikTokEmbed/TikTokEmbed.tsx

# Fix tiktokAPI height
sed -i 's/const height = options/const _height = options/g' src/services/external/tiktokAPI.ts

echo "✅ Remaining unused variables fixed!"
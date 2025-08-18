#!/bin/bash

echo "Final quick fixes for unused variables..."

# Remove unused _handleItemClick function completely
cd frontend/src/components/molecules/NavDropdown
sed -i '/const _handleItemClick = (item: DropdownItem) => {/,/};/d' NavDropdown.tsx

cd ../../organisms

# Fix CommentsSection authLoading
sed -i 's/isLoading: authLoading/isLoading: _authLoading/g' CommentsSection/CommentsSection.tsx

# Fix DynamicCategorySections maxSections  
sed -i 's/maxSections = Number.MAX_SAFE_INTEGER/_maxSections = Number.MAX_SAFE_INTEGER/g' DynamicCategorySections/DynamicCategorySections.tsx

# Remove unused NavigationItem import
sed -i '/import { NavigationItem } from/d' ServiceNavigation/ServiceNavigation.tsx

# Fix SingleCategorySection index
sed -i 's/\.map((post, index) =>/.map((post, _index) =>/g' SingleCategorySection/SingleCategorySection.tsx

# Fix TikTokEmbed autoplay
sed -i 's/autoplay = false,/autoplay: _autoplay = false,/g' TikTokEmbed/TikTokEmbed.tsx

cd ../../../pages/Writer

# Fix ArticleWriterPage _result - remove the assignment
sed -i 's/const _result = await response.json();//g' ArticleWriterPage.tsx

cd ../../services/external

# Fix tiktokAPI height
sed -i 's/const height = options/const _height = options/g' tiktokAPI.ts

echo "✅ Final unused variables fixed!"
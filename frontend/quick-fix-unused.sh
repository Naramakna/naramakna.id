#!/bin/bash

echo "Quick fixing remaining unused variables..."

# Fix PollingCard timeAgo
sed -i 's/timeAgo,/timeAgo: _timeAgo,/g' src/components/molecules/PollingCard/PollingCard.tsx

# Fix SocialMediaLink color  
sed -i 's/color,/color: _color,/g' src/components/molecules/SocialMediaLink/SocialMediaLink.tsx

# Fix TikTokVideoCard currentTime
sed -i 's/const \[currentTime, setCurrentTime\]/const [_currentTime, _setCurrentTime]/g' src/components/molecules/TikTokVideoCard/TikTokVideoCard.tsx

# Fix AdSection forceRefreshAds
sed -i 's/forceRefreshAds/forceRefreshAds: _forceRefreshAds/g' src/components/organisms/AdSection/AdSection.tsx

# Fix ArticleContent title
sed -i 's/title,/title: _title,/g' src/components/organisms/ArticleContent/ArticleContent.tsx

# Fix CommentsSection authLoading
sed -i 's/isLoading: authLoading/isLoading: _authLoading/g' src/components/organisms/CommentsSection/CommentsSection.tsx

# Fix DynamicCategorySections maxSections
sed -i 's/maxSections = Number.MAX_SAFE_INTEGER/_maxSections = Number.MAX_SAFE_INTEGER/g' src/components/organisms/DynamicCategorySections/DynamicCategorySections.tsx

# Fix ServiceNavigation NavigationItem import
sed -i 's/import { NavigationItem }/import { NavigationItem as _NavigationItem }/g' src/components/organisms/ServiceNavigation/ServiceNavigation.tsx

# Fix SingleCategorySection index
sed -i 's/\.map((post, index) =>/.map((post, _index) =>/g' src/components/organisms/SingleCategorySection/SingleCategorySection.tsx

# Fix TikTokEmbed autoplay
sed -i 's/autoplay = false,/autoplay: _autoplay = false,/g' src/components/organisms/TikTokEmbed/TikTokEmbed.tsx

# Fix ArticleWriterPage result
sed -i 's/const result = await/const _result = await/g' src/pages/Writer/ArticleWriterPage.tsx

# Fix WriterDashboard posts and setPosts
sed -i 's/const \[posts, setPosts\]/const [_posts, _setPosts]/g' src/pages/Writer/WriterDashboard.tsx

# Fix tiktokAPI height
sed -i 's/const height = options/const _height = options/g' src/services/external/tiktokAPI.ts

echo "✅ Quick fixes applied!"
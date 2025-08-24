#!/bin/bash

# Script untuk convert semua gambar PNG/JPG ke WebP
echo "🚀 Starting batch WebP conversion..."

# Counter
total_files=0
converted_files=0
skipped_files=0
failed_files=0

# Find all image files and convert
find /var/www/naramakna.id/public/uploads/2025 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r file; do
    total_files=$((total_files + 1))
    
    # Get file info
    dir=$(dirname "$file")
    filename=$(basename "$file")
    name="${filename%.*}"
    ext="${filename##*.}"
    webp_file="$dir/$name.webp"
    
    # Skip if WebP already exists
    if [ -f "$webp_file" ]; then
        echo "⏭️  Skipping $filename (WebP exists)"
        skipped_files=$((skipped_files + 1))
        continue
    fi
    
    # Convert to WebP
    echo "🔄 Converting: $filename"
    if cwebp -q 85 "$file" -o "$webp_file" >/dev/null 2>&1; then
        converted_files=$((converted_files + 1))
        echo "✅ Converted: $filename"
        
        # Show size comparison
        original_size=$(du -h "$file" | cut -f1)
        webp_size=$(du -h "$webp_file" | cut -f1)
        echo "   📊 Size: $original_size → $webp_size"
    else
        failed_files=$((failed_files + 1))
        echo "❌ Failed: $filename"
    fi
    
    # Progress every 50 files
    if [ $((total_files % 50)) -eq 0 ]; then
        echo "📈 Progress: $total_files files processed..."
    fi
done

echo ""
echo "🎉 Batch conversion completed!"
echo "📊 Summary:"
echo "   Total processed: $total_files"
echo "   Successfully converted: $converted_files"
echo "   Skipped (exists): $skipped_files"
echo "   Failed: $failed_files"
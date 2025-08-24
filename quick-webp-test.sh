#!/bin/bash

echo "Converting first 10 JPG files to WebP..."

find /var/www/naramakna.id/public/uploads/2025/07 -name "*.jpg" | head -10 | while IFS= read -r file; do
    webp_file="${file%.*}.webp"
    if [ ! -f "$webp_file" ]; then
        filename=$(basename "$file")
        echo "Converting: $filename"
        cwebp -q 85 "$file" -o "$webp_file" >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Success"
            # Show size comparison
            original=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
            webp=$(stat -f%z "$webp_file" 2>/dev/null || stat -c%s "$webp_file")
            echo "   Size: $original → $webp bytes"
        else
            echo "❌ Failed"
        fi
    else
        echo "Skipped: $(basename "$file") (WebP exists)"
    fi
done

echo "Test conversion complete!"
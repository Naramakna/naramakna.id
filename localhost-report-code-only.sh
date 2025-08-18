#!/bin/bash

echo "Generating localhost hardcode report (code files only)..."

# Create CSV file
CSV_FILE="localhost-hardcode-code-only.csv"
echo "File Path,Line Number,Content" > $CSV_FILE

# Search for http://localhost:3001
grep -r "http://localhost:3001" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.next \
  --exclude="*.log" \
  --exclude="*.sql" \
  --exclude="*.md" \
  --exclude="*.sh" \
  --exclude="*.csv" \
  -n | while IFS=: read -r file line content; do
    # Clean up the content (remove ANSI color codes and escape quotes)
    clean_content=$(echo "$content" | sed 's/\x1b\[[0-9;]*m//g' | sed 's/"/\\"/g')
    echo "\"$file\",$line,\"$clean_content\"" >> $CSV_FILE
done

# Also search for localhost:3001 variants
grep -r "localhost:3001" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.next \
  --exclude="*.log" \
  --exclude="*.sql" \
  --exclude="*.md" \
  --exclude="*.sh" \
  --exclude="*.csv" \
  -n | while IFS=: read -r file line content; do
    # Skip if already contains http:// (to avoid duplicates)
    if [[ "$content" != *"http://localhost:3001"* ]]; then
        clean_content=$(echo "$content" | sed 's/\x1b\[[0-9;]*m//g' | sed 's/"/\\"/g')
        echo "\"$file\",$line,\"$clean_content\"" >> $CSV_FILE
    fi
done

echo "✅ Report generated: $CSV_FILE"
echo "📊 Total entries found: $(( $(wc -l < $CSV_FILE) - 1 ))"
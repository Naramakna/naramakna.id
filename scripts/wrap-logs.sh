#!/bin/bash

# Script untuk membungkus console logs dengan NODE_ENV check
# Usage: ./wrap-logs.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FRONTEND_PATH="/var/www/naramakna.id/frontend/src"

echo -e "${GREEN}🔧 Wrapping Console Logs with NODE_ENV Check${NC}"
echo -e "${BLUE}===============================================${NC}"

# Find files with unwrapped console logs
unwrapped_files=$(find "$FRONTEND_PATH" -name "*.ts" -o -name "*.tsx" | \
  xargs grep -l "^\s*console\.\(log\|info\|warn\|debug\)" 2>/dev/null | \
  xargs grep -L "process\.env\.NODE_ENV" 2>/dev/null || true)

if [[ -z "$unwrapped_files" ]]; then
    echo -e "${GREEN}✅ All console logs are already wrapped!${NC}"
    exit 0
fi

echo -e "${YELLOW}Found files with unwrapped console logs:${NC}"
for file in $unwrapped_files; do
    count=$(grep -c "^\s*console\.\(log\|info\|warn\|debug\)" "$file" 2>/dev/null || echo "0")
    echo -e "${RED}📄 $file ($count logs)${NC}"
done

echo ""
read -p "Proceed with wrapping? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo -e "${YELLOW}👋 Cancelled${NC}"
    exit 0
fi

# Process each file
for file in $unwrapped_files; do
    echo -e "${YELLOW}🔧 Processing: $file${NC}"

    # Create backup
    cp "$file" "$file.backup.$(date +%s)"

    # Wrap console logs with NODE_ENV check
    # This handles the most common patterns
    sed -i.tmp '
    /^\s*console\.\(log\|info\|warn\|debug\)/s/^\(\s*\)\(console\.\)/\1if (process.env.NODE_ENV === '\''development'\'') {\
\1  \2/
    ' "$file"

    # Clean up temp file
    rm -f "$file.tmp"

    # Count remaining unwrapped logs
    remaining=$(grep -c "^\s*console\.\(log\|info\|warn\|debug\)" "$file" 2>/dev/null || echo "0")
    if [[ $remaining -eq 0 ]]; then
        echo -e "${GREEN}  ✅ All logs wrapped${NC}"
    else
        echo -e "${YELLOW}  ⚠️ $remaining logs still need manual wrapping${NC}"
    fi
done

echo -e "\n${GREEN}✅ Wrapping complete!${NC}"
echo -e "${BLUE}💡 Note: Some complex console logs may need manual wrapping${NC}"
echo -e "${BLUE}💡 Check your code and add closing braces where needed${NC}"
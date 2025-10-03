#!/bin/bash

# Script untuk mencari dan membersihkan console logs di frontend
# Usage: ./find-logs.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default paths
FRONTEND_PATH="/var/www/naramakna.id/frontend/src"
BACKEND_PATH="/var/www/naramakna.id/backend/src"

# Function to print usage
print_usage() {
    echo -e "${BLUE}Usage: $0 [options]${NC}"
    echo ""
    echo "Options:"
    echo "  -f, --frontend     Scan frontend only (default: both)"
    echo "  -b, --backend      Scan backend only (default: both)"
    echo "  -c, --count        Show count only"
    echo "  -d, --detailed     Show detailed output with line numbers"
    echo "  -r, --remove       Remove console logs (interactive)"
    echo "  -h, --help         Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                 # Scan both frontend and backend"
    echo "  $0 -f -d          # Detailed frontend scan"
    echo "  $0 -c             # Just show counts"
    echo "  $0 -r             # Interactive removal"
}

# Function to scan for console logs
scan_logs() {
    local path=$1
    local detailed=${2:-false}
    local count_only=${3:-false}

    echo -e "${YELLOW}🔍 Scanning: $path${NC}"

    # Find console logs
    local console_files=$(find "$path" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
        xargs grep -l "console\.\(log\|info\|warn\|debug\)" 2>/dev/null || true)

    if [[ -z "$console_files" ]]; then
        echo -e "${GREEN}✅ No console logs found in $path${NC}"
        return 0
    fi

    local total_count=0

    for file in $console_files; do
        local file_count=$(grep -c "console\.\(log\|info\|warn\|debug\)" "$file" 2>/dev/null || echo "0")
        total_count=$((total_count + file_count))

        if [[ "$count_only" == "true" ]]; then
            echo -e "${RED}📄 $file: $file_count logs${NC}"
        elif [[ "$detailed" == "true" ]]; then
            echo -e "\n${RED}📄 File: $file ($file_count logs)${NC}"
            grep -n "console\.\(log\|info\|warn\|debug\)" "$file" | head -5
            if [[ $file_count -gt 5 ]]; then
                echo -e "${YELLOW}   ... and $((file_count - 5)) more${NC}"
            fi
        else
            echo -e "${RED}📄 $file ($file_count logs)${NC}"
        fi
    done

    echo -e "\n${YELLOW}📊 Total: $total_count console logs in $(echo "$console_files" | wc -l) files${NC}"
    return $total_count
}

# Function to remove console logs interactively
remove_logs() {
    local path=$1

    echo -e "${YELLOW}🔍 Finding console logs in: $path${NC}"

    local console_files=$(find "$path" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
        xargs grep -l "console\.\(log\|info\|warn\|debug\)" 2>/dev/null || true)

    if [[ -z "$console_files" ]]; then
        echo -e "${GREEN}✅ No console logs found!${NC}"
        return 0
    fi

    for file in $console_files; do
        local file_count=$(grep -c "console\.\(log\|info\|warn\|debug\)" "$file")
        echo -e "\n${RED}📄 File: $file ($file_count logs)${NC}"

        # Show first few lines
        echo -e "${BLUE}Preview:${NC}"
        grep -n "console\.\(log\|info\|warn\|debug\)" "$file" | head -3

        echo -e "\n${YELLOW}What do you want to do?${NC}"
        echo "1) Skip this file"
        echo "2) Wrap with NODE_ENV check"
        echo "3) Remove all console logs"
        echo "4) Show full file content"
        echo "5) Quit"

        read -p "Choose option (1-5): " choice

        case $choice in
            1)
                echo -e "${BLUE}⏭️ Skipping $file${NC}"
                ;;
            2)
                echo -e "${YELLOW}🔧 Wrapping console logs with NODE_ENV check...${NC}"
                # Create backup
                cp "$file" "$file.backup"
                # Wrap console logs with NODE_ENV check
                sed -i.tmp 's/^\(\s*\)console\.\(log\|info\|warn\|debug\)/\1if (process.env.NODE_ENV === '\''development'\'') {\n\1  console.\2/g' "$file"
                # Add closing braces (this is basic, might need manual adjustment)
                echo -e "${GREEN}✅ Modified $file (backup saved as $file.backup)${NC}"
                ;;
            3)
                echo -e "${RED}🗑️ Removing all console logs...${NC}"
                # Create backup
                cp "$file" "$file.backup"
                # Remove console logs
                sed -i.tmp '/^\s*console\.\(log\|info\|warn\|debug\)/d' "$file"
                echo -e "${GREEN}✅ Removed logs from $file (backup saved as $file.backup)${NC}"
                ;;
            4)
                echo -e "${BLUE}📄 Full content of $file:${NC}"
                cat -n "$file" | grep -A2 -B2 "console\.\(log\|info\|warn\|debug\)"
                ;;
            5)
                echo -e "${YELLOW}👋 Exiting...${NC}"
                return 0
                ;;
            *)
                echo -e "${RED}❌ Invalid option${NC}"
                ;;
        esac
    done
}

# Parse command line arguments
SCAN_FRONTEND=true
SCAN_BACKEND=true
COUNT_ONLY=false
DETAILED=false
REMOVE_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--frontend)
            SCAN_FRONTEND=true
            SCAN_BACKEND=false
            shift
            ;;
        -b|--backend)
            SCAN_BACKEND=true
            SCAN_FRONTEND=false
            shift
            ;;
        -c|--count)
            COUNT_ONLY=true
            shift
            ;;
        -d|--detailed)
            DETAILED=true
            shift
            ;;
        -r|--remove)
            REMOVE_MODE=true
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            print_usage
            exit 1
            ;;
    esac
done

# Main execution
echo -e "${GREEN}🔍 Console Log Scanner for Naramakna${NC}"
echo -e "${BLUE}==================================${NC}"

if [[ "$REMOVE_MODE" == "true" ]]; then
    echo -e "${YELLOW}⚠️ REMOVE MODE - This will modify files!${NC}"
    read -p "Are you sure? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo -e "${YELLOW}👋 Cancelled${NC}"
        exit 0
    fi

    if [[ "$SCAN_FRONTEND" == "true" ]]; then
        remove_logs "$FRONTEND_PATH"
    fi

    if [[ "$SCAN_BACKEND" == "true" ]]; then
        remove_logs "$BACKEND_PATH"
    fi
else
    # Normal scanning mode
    total_frontend=0
    total_backend=0

    if [[ "$SCAN_FRONTEND" == "true" ]]; then
        scan_logs "$FRONTEND_PATH" "$DETAILED" "$COUNT_ONLY"
        total_frontend=$?
    fi

    if [[ "$SCAN_BACKEND" == "true" ]]; then
        echo ""
        scan_logs "$BACKEND_PATH" "$DETAILED" "$COUNT_ONLY"
        total_backend=$?
    fi

    # Summary
    echo -e "\n${BLUE}📊 SUMMARY${NC}"
    echo -e "${BLUE}=========${NC}"

    if [[ "$SCAN_FRONTEND" == "true" ]]; then
        echo -e "Frontend: ${RED}$total_frontend${NC} console logs"
    fi

    if [[ "$SCAN_BACKEND" == "true" ]]; then
        echo -e "Backend:  ${RED}$total_backend${NC} console logs"
    fi

    local grand_total=$((total_frontend + total_backend))
    echo -e "Total:    ${RED}$grand_total${NC} console logs"

    if [[ $grand_total -gt 0 ]]; then
        echo -e "\n${YELLOW}💡 To remove logs interactively, run: $0 -r${NC}"
        echo -e "${YELLOW}💡 For detailed view, run: $0 -d${NC}"
    else
        echo -e "\n${GREEN}🎉 No console logs found! Your code is clean!${NC}"
    fi
fi

echo -e "\n${GREEN}✅ Done!${NC}"
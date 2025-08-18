#!/bin/bash

echo "Generating unused variables summary..."

# Create CSV file for unused variables only
CSV_FILE="unused-variables-summary.csv"
echo "File Path,Line Number,Unused Item,Type,Action Needed" > $CSV_FILE

# Filter only unused variables/imports from the full report
if [ -f "typescript-errors-report.csv" ]; then
    tail -n +2 typescript-errors-report.csv | grep "Unused Variable/Import" | while IFS=',' read -r filepath linenumber errortype description; do
        # Clean quotes from fields
        clean_filepath=$(echo "$filepath" | sed 's/"//g')
        clean_description=$(echo "$description" | sed 's/"//g')
        
        # Determine what's unused
        if [[ "$clean_description" == *"'React' is declared but its value is never read"* ]]; then
            unused_item="React import"
            type="Import"
            action="Remove unused React import"
        elif [[ "$clean_description" == *"is declared but its value is never read"* ]]; then
            # Extract variable name from description
            unused_item=$(echo "$clean_description" | sed -E "s/.*'([^']+)' is declared but its value is never read.*/\1/")
            if [[ "$unused_item" == *"props"* ]] || [[ "$clean_filepath" == *"tsx"* ]]; then
                type="Props/Variable"
                action="Remove unused parameter or add underscore prefix"
            else
                type="Variable"
                action="Remove unused variable or use it"
            fi
        else
            unused_item="Unknown"
            type="Unknown"
            action="Review manually"
        fi
        
        echo "\"$clean_filepath\",$linenumber,\"$unused_item\",\"$type\",\"$action\"" >> $CSV_FILE
    done
else
    echo "Error: typescript-errors-report.csv not found. Run typescript-errors-report.sh first."
    exit 1
fi

echo "✅ Unused variables summary generated: $CSV_FILE"
echo "📊 Total unused items found: $(( $(wc -l < $CSV_FILE) - 1 ))"

# Show summary by type
echo ""
echo "📋 Unused Items Summary:"
echo "========================"
tail -n +2 $CSV_FILE | cut -d',' -f4 | sort | uniq -c | sort -nr | while read count type; do
    clean_type=$(echo "$type" | sed 's/"//g')
    echo "$count unused $clean_type"
done

echo ""
echo "🔧 Quick Fixes Available:"
echo "========================="
react_imports=$(tail -n +2 $CSV_FILE | grep "React import" | wc -l)
echo "$react_imports files: Remove 'import React from 'react';' (React 17+ JSX Transform)"

unused_props=$(tail -n +2 $CSV_FILE | grep "Props/Variable" | wc -l)
echo "$unused_props files: Add underscore prefix to unused props (e.g., _unused)"
#!/bin/bash

echo "Generating TypeScript errors report..."

# Create CSV file
CSV_FILE="typescript-errors-report.csv"
echo "File Path,Line Number,Error Type,Error Description" > $CSV_FILE

# Run TypeScript build and capture errors
cd frontend
npm run build 2>&1 | grep -E "^src/.*\.tsx?.*error TS" | while IFS= read -r line; do
    # Parse the error line
    # Format: src/path/file.tsx:line:col - error TScode: description
    
    # Extract file path
    file_path=$(echo "$line" | sed -E 's/^([^:]+):.*/\1/')
    
    # Extract line number
    line_number=$(echo "$line" | sed -E 's/^[^:]+:([0-9]+):.*/\1/')
    
    # Extract error code
    error_code=$(echo "$line" | sed -E 's/.*error (TS[0-9]+):.*/\1/')
    
    # Extract error description (clean quotes)
    error_desc=$(echo "$line" | sed -E 's/.*error TS[0-9]+: (.*)/\1/' | sed 's/"/\\"/g')
    
    # Categorize error type
    case $error_code in
        "TS6133")
            error_type="Unused Variable/Import"
            ;;
        "TS18047"|"TS18048")
            error_type="Possible Null/Undefined"
            ;;
        "TS2307"|"TS2305")
            error_type="Missing Module/Export"
            ;;
        "TS2322")
            error_type="Type Mismatch"
            ;;
        "TS2339")
            error_type="Property Does Not Exist"
            ;;
        "TS1484")
            error_type="Import Type Issue"
            ;;
        "TS2459")
            error_type="Export Issue"
            ;;
        "TS2345")
            error_type="Argument Type Error"
            ;;
        *)
            error_type="Other"
            ;;
    esac
    
    echo "\"$file_path\",$line_number,\"$error_type\",\"$error_desc\"" >> ../$CSV_FILE
done

cd ..

echo "✅ TypeScript errors report generated: $CSV_FILE"
echo "📊 Total errors found: $(( $(wc -l < $CSV_FILE) - 1 ))"

# Show summary by error type
echo ""
echo "📋 Error Summary by Type:"
echo "========================"
tail -n +2 $CSV_FILE | cut -d',' -f3 | sort | uniq -c | sort -nr | while read count type; do
    echo "$count errors: $type"
done
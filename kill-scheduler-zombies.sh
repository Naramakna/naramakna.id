#!/bin/bash

echo "🔍 Checking scheduler zombie processes..."

# Count current scheduler processes
BEFORE_COUNT=$(ps aux | grep "scheduler.js" | grep -v grep | wc -l)
echo "📊 Found $BEFORE_COUNT scheduler processes"

if [ $BEFORE_COUNT -eq 0 ]; then
    echo "✅ No scheduler processes found"
    exit 0
fi

# Show some examples of what we're killing
echo "📝 Example processes to kill:"
ps aux | grep "scheduler.js" | grep -v grep | head -5

echo ""
echo "⚠️  This will kill ALL scheduler.js processes"
echo "🔥 Killing scheduler zombie processes..."

# Kill all scheduler.js processes
pkill -f "scheduler.js"

# Wait a bit for processes to die
sleep 3

# Count remaining processes
AFTER_COUNT=$(ps aux | grep "scheduler.js" | grep -v grep | wc -l)
KILLED=$((BEFORE_COUNT - AFTER_COUNT))

echo "✅ Killed $KILLED processes"
echo "📊 Remaining scheduler processes: $AFTER_COUNT"

if [ $AFTER_COUNT -gt 0 ]; then
    echo "⚠️  Some processes may still be shutting down..."
    echo "🔍 Remaining processes:"
    ps aux | grep "scheduler.js" | grep -v grep
fi

echo ""
echo "🔥 Memory usage before/after:"
free -h
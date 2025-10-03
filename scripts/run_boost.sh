#!/bin/bash

# Naramakna Analytics Booster Runner
cd /var/www/naramakna.id/scripts

echo "🚀 Naramakna Analytics Booster"
echo "=============================="
echo "1. Basic Boost (Quick & Simple)"
echo "2. Stealth Boost (Advanced & Realistic)"
echo "3. Quick Test (50 visits)"
echo ""

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo "🔥 Starting Basic Analytics Boost..."
        source analytics_env/bin/activate && python analytics_booster.py
        ;;
    2)
        echo "🥷 Starting Stealth Analytics Boost..."
        source analytics_env/bin/activate && python stealth_boost.py
        ;;
    3)
        echo "⚡ Quick Test - 50 visits..."
        source analytics_env/bin/activate && python analytics_booster.py << EOF
1
EOF
        ;;
    *)
        echo "Invalid option!"
        exit 1
        ;;
esac
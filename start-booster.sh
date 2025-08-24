#!/bin/bash

# TikTok View Booster Startup Script

echo "🚀 Starting TikTok View Booster..."
echo "📍 Working directory: $(pwd)"
echo "🐍 Python version: $(./tiktok-booster-venv/bin/python --version)"
echo "📅 Started at: $(date)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create it with database credentials."
    exit 1
fi

# Source environment variables
source .env

# Activate virtual environment and run the booster
exec ./tiktok-booster-venv/bin/python tiktok-booster.py
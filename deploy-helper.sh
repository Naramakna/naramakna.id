#!/bin/bash

echo "🚀 Naramakna Deployment Helper"
echo "=============================="

# Function to display usage
show_usage() {
    echo "Usage: ./deploy-helper.sh [environment]"
    echo ""
    echo "Environments:"
    echo "  dev        - Development (localhost)"
    echo "  staging    - Staging server" 
    echo "  production - Production server"
    echo ""
    echo "Examples:"
    echo "  ./deploy-helper.sh dev        # Setup for local development"
    echo "  ./deploy-helper.sh staging    # Setup for staging"
    echo "  ./deploy-helper.sh production # Setup for production"
}

# Check if environment is provided
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

ENVIRONMENT=$1

case $ENVIRONMENT in
    "dev"|"development")
        echo "🛠️  Setting up for DEVELOPMENT environment..."
        
        # Copy development env files
        cp frontend/.env frontend/.env.active || echo "Frontend .env already exists"
        cp backend/.env backend/.env.active || echo "Backend .env already exists"
        
        echo "✅ Development environment ready!"
        echo "   Frontend: http://localhost:5173"
        echo "   Backend:  http://localhost:3001"
        ;;
        
    "staging")
        echo "🧪 Setting up for STAGING environment..."
        
        # Copy staging env files
        cp frontend/.env.staging frontend/.env.active
        cp backend/.env backend/.env.staging.active || echo "Create backend/.env.staging first"
        
        echo "✅ Staging environment configured!"
        echo "   Update URLs in env files to match your staging server"
        ;;
        
    "production"|"prod")
        echo "🌟 Setting up for PRODUCTION environment..."
        
        # Copy production env files
        cp frontend/.env.production frontend/.env.active
        cp backend/.env.production backend/.env.active
        
        echo "✅ Production environment configured!"
        echo "   ⚠️  IMPORTANT: Update sensitive values in env files:"
        echo "   - Database credentials"
        echo "   - JWT secrets"
        echo "   - API keys (YouTube, TikTok)"
        echo "   - SMTP credentials"
        ;;
        
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        show_usage
        exit 1
        ;;
esac

echo ""
echo "📋 Next steps:"
echo "1. Review and update .env.active files with correct values"
echo "2. For frontend: npm run build"
echo "3. For backend: npm start"

echo ""
echo "🔍 Verify no hardcoded URLs:"
echo "   ./verify-no-hardcode.sh"

echo ""
echo "✨ Environment setup complete!"
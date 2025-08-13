#!/bin/bash

echo "🚀 SETUP GIT REPOSITORY FROM VPS"
echo "================================="

echo ""
echo "📋 Instructions to run on VPS:"
echo "------------------------------"
echo ""
echo "1. SSH to VPS:"
echo "   ssh root@148.230.96.60"
echo ""
echo "2. Navigate to project directory:"
echo "   cd /var/www/naramakna"
echo ""
echo "3. Initialize git repository:"
echo "   git init"
echo ""
echo "4. Add all files to git:"
echo "   git add ."
echo ""
echo "5. Create initial commit:"
echo "   git commit -m 'Initial commit from VPS - working version'"
echo ""
echo "6. Create GitHub repository (if not exists):"
echo "   # Go to GitHub and create new repo: naramakna-vps"
echo ""
echo "7. Add remote origin:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/naramakna-vps.git"
echo ""
echo "8. Push to GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "9. Create .gitignore file:"
cat << 'EOF' > /tmp/gitignore-vps
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite

# Uploads (optional - you may want to include these)
# backend/public/uploads/
# public/uploads/

# Logs
*.log
logs/

# Cache
.cache/
.vscode/
.DS_Store

# PM2
.pm2/

# Cookies and sensitive files
*cookies*.txt
test-*.js
debug*.log

# Backup directories
backup_*/

# Temporary files
*.tmp
*.temp
EOF
echo "   Copy the .gitignore content above to /var/www/naramakna/.gitignore"
echo ""
echo "🔄 To sync with local development:"
echo "---------------------------------"
echo ""
echo "1. Clone the VPS repository locally:"
echo "   git clone https://github.com/YOUR_USERNAME/naramakna-vps.git naramakna-from-vps"
echo ""
echo "2. Compare with current local version:"
echo "   diff -r naramakna-from-vps/ naramakna.id/"
echo ""
echo "3. Merge changes as needed"
echo ""
echo "✅ Benefits of this approach:"
echo "- Keep working VPS code as source of truth"
echo "- Easy to track what's different between VPS and local"
echo "- Can test locally before pushing to VPS"
echo "- Backup of working configuration"

# Environment Variables Setup Guide

## 🔧 Required Environment Variables

All environment variables are now **REQUIRED** and have **NO fallback values** for security and deployment consistency.

### 📋 Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Database Configuration
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# JWT Configuration (REQUIRED for authentication)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# TikTok API Configuration (if using TikTok features)
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=http://localhost:3001/api/tiktok/callback

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:5173
```

### 🚨 **CRITICAL CHANGES - NO MORE FALLBACKS!**

Previously, environment variables had hardcoded fallback values like:
```javascript
// OLD (with fallbacks)
DB_HOST: process.env.DB_HOST || 'localhost'
JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret'
```

Now they are pure environment-based:
```javascript  
// NEW (no fallbacks)
DB_HOST: process.env.DB_HOST
JWT_SECRET: process.env.JWT_SECRET
```

### 📝 **Setup Instructions:**

#### 1. Copy Example File
```bash
cd backend/
cp env.example .env
```

#### 2. Edit .env File
Fill in your actual values:
```bash
nano .env
# or
code .env
```

#### 3. Local Development Example
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=naramakna_clean
JWT_SECRET=super_secret_key_for_development_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

#### 4. Production Example
```bash
DB_HOST=production-db-host.com
DB_USER=naramakna_prod
DB_PASSWORD=super_secure_production_password
DB_NAME=naramakna_production
JWT_SECRET=very_long_random_string_for_production_minimum_32_characters
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://naramakna.id
TIKTOK_REDIRECT_URI=https://naramakna.id/api/tiktok/callback
```

### ⚠️ **Important Notes:**

1. **JWT_SECRET** must be at least 32 characters for security
2. **Never commit .env file** to git (it's in .gitignore)
3. **All variables are required** - server will fail to start if any are missing
4. **No more hardcoded fallbacks** - prevents deployment confusion
5. **Copy .env for each environment** (dev, staging, production)

### 🐛 **Troubleshooting:**

#### Server Won't Start?
- Check if `.env` file exists in `backend/` directory
- Verify all required variables are set
- Check for typos in variable names

#### Database Connection Failed?
- Verify `DB_*` variables are correct
- Test database connection manually
- Check database server is running

#### Authentication Errors?
- Ensure `JWT_SECRET` is set and at least 32 characters
- Verify `JWT_EXPIRES_IN` format (e.g., '7d', '24h', '3600')

#### API Calls Failing?
- Check `FRONTEND_URL` matches your frontend server
- Verify CORS configuration

### 🔄 **Migration from Old Code:**

If upgrading from previous version with hardcoded fallbacks:
1. Create `.env` file with all required variables
2. Restart the backend server
3. Test all functionality (login, database, APIs)
4. Deploy with proper environment variables

### 📁 **Files Modified:**
- `backend/src/config/database.js` 
- `backend/src/routes/polling.js`
- `backend/src/routes/tiktok.js`
- `backend/src/controllers/tiktokController.js`
- `backend/src/controllers/youtubeController.js` 
- `backend/src/controllers/authController.js`
- `backend/src/middleware/auth.js`
- `backend/src/models/User.js`
- `backend/src/controllers/seoController.js`

All hardcoded fallbacks have been removed for better security and deployment consistency! 🎯

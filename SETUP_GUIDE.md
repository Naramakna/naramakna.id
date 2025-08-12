# 🚀 Naramakna Portal Setup Guide

## 📋 Prerequisites

- **Node.js** 18+ installed
- **Docker Desktop** installed and running
- **Git** for version control

## 🔧 Quick Setup (Windows)

### Option 1: Automated Setup
1. Double-click `setup-windows.bat` to run the automated setup
2. Follow the prompts and wait for completion

### Option 2: Manual Setup

#### Step 1: Install Dependencies
```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies  
cd ../backend
npm install
```

#### Step 2: Database Setup
```bash
# Start MySQL and Redis with Docker
docker-compose up -d

# Wait for services to be ready (about 10 seconds)
```

#### Step 3: Environment Configuration
Create a `.env` file in the `backend` folder with:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=naramakna_user
DB_PASSWORD=naramakna_pass
DB_NAME=naramakna_portal

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# External APIs (YouTube, TikTok)
YOUTUBE_API_KEY=your-youtube-api-key
TIKTOK_ACCESS_TOKEN=your-tiktok-access-token

# File Upload Configuration
UPLOAD_PATH=./public/uploads
MAX_FILE_SIZE=52428800
```

#### Step 4: Start Services
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **phpMyAdmin**: http://localhost:8080
- **MySQL**: localhost:3306

## 🗄️ Database Credentials

- **Host**: localhost
- **Port**: 3306
- **Database**: naramakna_portal
- **Username**: naramakna_user
- **Password**: naramakna_pass

## 🔍 Troubleshooting

### Chart.js Error (Already Fixed)
The `chart.js` dependency issue has been resolved by running `npm install` in the frontend directory.

### Database Connection Issues
1. Ensure Docker is running
2. Check if containers are up: `docker ps`
3. Verify MySQL is accessible: `docker logs naramakna_mysql`

### Port Conflicts
- Frontend port 5173 already in use? Change in `vite.config.ts`
- Backend port 3001 already in use? Change in `.env` file

### Permission Issues
- Run PowerShell as Administrator if needed
- Ensure Docker has proper permissions

## 📱 Features Available

- ✅ **User Authentication** (Login/Register)
- ✅ **Content Management** (Articles, Videos)
- ✅ **Analytics Dashboard** with Charts
- ✅ **Admin Panel** for content approval
- ✅ **YouTube & TikTok Integration**
- ✅ **Real-time Analytics**
- ✅ **Advertisement Management**
- ✅ **Comment System**
- ✅ **User Profiles**

## 🚀 Next Steps

1. **Customize Content**: Update articles, categories, and branding
2. **Configure APIs**: Add your YouTube and TikTok API keys
3. **Set Up Analytics**: Configure tracking for your domain
4. **Deploy**: Use the deployment scripts for production

## 📞 Support

If you encounter issues:
1. Check Docker container logs
2. Verify all dependencies are installed
3. Ensure ports are not blocked by firewall
4. Check the console for specific error messages

---

**Happy Coding! 🎉** 
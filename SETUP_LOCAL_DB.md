# 🚀 Naramakna Portal - Local Database Setup

## 📋 Alternative Setup (No Docker Required)

Since Docker Desktop isn't running, here are alternative setup methods:

## 🔧 Option 1: Local MySQL Installation

### Install MySQL on Windows
1. **Download MySQL Installer**: https://dev.mysql.com/downloads/installer/
2. **Run the installer** and choose "Developer Default"
3. **Set root password** (remember this!)
4. **Create database user**:
   ```sql
   CREATE USER 'naramakna_user'@'localhost' IDENTIFIED BY 'naramakna_pass';
   GRANT ALL PRIVILEGES ON naramakna_portal.* TO 'naramakna_user'@'localhost';
   FLUSH PRIVILEGES;
   CREATE DATABASE naramakna_portal;
   ```

### Update Environment Variables
In your `.env` file, use:
```env
DB_HOST=localhost
DB_USER=naramakna_user
DB_PASSWORD=naramakna_pass
DB_NAME=naramakna_portal
```

## 🔧 Option 2: XAMPP/Laragon (Recommended)

Since you're using Laragon, you already have MySQL available!

### Laragon Setup
1. **Start Laragon** and ensure MySQL is running
2. **Create database**:
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create new database: `naramakna_portal`
   - Create user: `naramakna_user` with password `naramakna_pass`
   - Grant privileges to this user on the database

### Environment Configuration
Use these settings in your `.env` file:
```env
DB_HOST=localhost
DB_USER=naramakna_user
DB_PASSWORD=naramakna_pass
DB_NAME=naramakna_portal
DB_PORT=3306
```

## 🔧 Option 3: Use Existing Laragon MySQL

If you want to use the default Laragon MySQL:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=  # Leave empty if no password set
DB_NAME=naramakna_portal
```

## 🚀 Quick Start (Local Database)

### Step 1: Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### Step 2: Create .env File
Create `backend/.env` with your database credentials (see options above)

### Step 3: Start Services
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **phpMyAdmin**: http://localhost/phpmyadmin (Laragon) or http://localhost:8080 (XAMPP)

## 🔍 Troubleshooting

### MySQL Connection Issues
1. **Check if MySQL is running**:
   - Laragon: Look for green MySQL indicator
   - XAMPP: Check if MySQL service is started
   - Local: Check Windows Services

2. **Verify credentials**:
   - Test connection with MySQL Workbench or phpMyAdmin
   - Ensure user has proper privileges

3. **Port conflicts**:
   - Default MySQL port: 3306
   - Check if another MySQL instance is running

### Frontend Issues
- **Chart.js error**: Already fixed with `npm install`
- **Port 5173 busy**: Change in `vite.config.ts`

### Backend Issues
- **Port 3001 busy**: Change in `.env` file
- **Database connection**: Check MySQL status and credentials

## 📱 Features Ready

- ✅ **User Authentication System**
- ✅ **Content Management** (Articles, Videos)
- ✅ **Analytics Dashboard** with Charts
- ✅ **Admin Panel**
- ✅ **YouTube & TikTok Integration**
- ✅ **Real-time Analytics**
- ✅ **Advertisement Management**
- ✅ **Comment System**
- ✅ **User Profiles**

## 🚀 Next Steps

1. **Choose your database setup method** (Laragon recommended)
2. **Create the .env file** with proper credentials
3. **Start the services** and test the application
4. **Customize content** and configure external APIs

---

**Need help? Check the main SETUP_GUIDE.md for more details! 🎉** 
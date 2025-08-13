@echo off
echo ========================================
echo    Naramakna Portal Setup Script
echo ========================================
echo.

echo [1/5] Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)
cd ..

echo [2/5] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)
cd ..

echo [3/5] Starting Database Services...
echo Starting MySQL and Redis with Docker...
docker-compose up -d

echo [4/5] Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo [5/5] Setup Complete!
echo.
echo Next steps:
echo 1. Create a .env file in the backend folder with your database credentials
echo 2. Run: cd backend && npm start
echo 3. Run: cd frontend && npm run dev
echo.
echo Database will be available at:
echo - MySQL: localhost:3306
echo - phpMyAdmin: http://localhost:8080
echo.
pause 
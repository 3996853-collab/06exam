@echo off
echo ==========================================
echo       Vue Project Auto-Runner
echo ==========================================

echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found!
    echo Please download and install Node.js LTS version from:
    echo https://nodejs.org/
    echo.
    echo After installation, please run this script again.
    pause
    exit /b
)
node --version

echo.
echo [2/3] Installing dependencies (this may take a while)...
if not exist node_modules (
    call npm install
) else (
    echo node_modules already exists, skipping install...
)

echo.
echo [3/3] Starting development server...
echo The browser should open automatically. If not, check the URL below.
call npm run dev

pause

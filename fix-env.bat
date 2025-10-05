@echo off
echo 🚨 Removing .env from Git tracking...
echo.

rem Try to find git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git not found! Please install Git first.
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git found!
echo.

echo Removing .env from Git tracking...
git rm --cached .env
if %errorlevel% neq 0 (
    echo ❌ Failed to remove .env from tracking
    echo The file might not be tracked, or you're not in a Git repo
    pause
    exit /b 1
)

echo ✅ .env removed from Git tracking!
echo.

echo Adding security files...
git add .gitignore .env.example SECURITY.md

echo Committing changes...
git commit -m "🔒 Remove .env from Git tracking and add security measures"

echo.
echo ✅ SUCCESS! .env is no longer tracked by Git.
echo.
echo IMPORTANT NEXT STEPS:
echo 1. Edit .env and add your REAL environment variables
echo 2. Run: git push origin main
echo 3. If secrets were already pushed to GitHub, you may need to:
echo    - Force push to overwrite history
echo    - Or contact GitHub support to purge the sensitive data
echo.
pause
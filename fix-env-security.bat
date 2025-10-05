@echo off
echo.
echo ================================================================
echo 🚨 CRITICAL: Removing .env from Git tracking
echo ================================================================
echo.
echo This script will:
echo 1. Remove .env from Git tracking (keeps local file)
echo 2. Commit the removal
echo 3. Show you how to clean Git history if needed
echo.
pause

echo.
echo Step 1: Removing .env from Git tracking...
git rm --cached .env
if %errorlevel% neq 0 (
    echo ❌ Error: Could not remove .env from tracking
    echo Make sure Git is installed and you're in a Git repository
    pause
    exit /b 1
)

echo.
echo Step 2: Committing the removal...
git add .gitignore
git commit -m "🔒 Remove .env from Git tracking and update .gitignore"
if %errorlevel% neq 0 (
    echo ❌ Error: Could not commit changes
    pause
    exit /b 1
)

echo.
echo ✅ .env has been removed from Git tracking!
echo.
echo ⚠️  IMPORTANT: Your .env file still exists locally - that's good!
echo ⚠️  But you need to add your real environment variables back to it.
echo.
echo Next steps:
echo 1. Edit .env and add your real database URL and API keys
echo 2. Push these changes: git push origin main
echo 3. If .env was already pushed with secrets, you may need to clean history
echo.
echo To clean Git history (if secrets were already pushed):
echo   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all
echo   git push origin --force --all
echo.
pause
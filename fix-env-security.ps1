# PowerShell script to remove .env from Git tracking
Write-Host ""
Write-Host "================================================================" -ForegroundColor Red
Write-Host "🚨 CRITICAL: Removing .env from Git tracking" -ForegroundColor Red
Write-Host "================================================================" -ForegroundColor Red
Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Remove .env from Git tracking (keeps local file)" -ForegroundColor Yellow
Write-Host "2. Commit the removal" -ForegroundColor Yellow
Write-Host "3. Show you how to clean Git history if needed" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue or Ctrl+C to cancel"

Write-Host ""
Write-Host "Step 1: Removing .env from Git tracking..." -ForegroundColor Cyan

# Try to find Git
$gitPaths = @(
    "git",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\git.exe"
)

$gitCommand = $null
foreach ($path in $gitPaths) {
    try {
        if (Get-Command $path -ErrorAction SilentlyContinue) {
            $gitCommand = $path
            break
        }
    } catch {
        continue
    }
}

if (-not $gitCommand) {
    Write-Host "❌ Error: Git not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "2. Install and restart PowerShell" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Found Git at: $gitCommand" -ForegroundColor Green

try {
    # Remove .env from tracking
    & $gitCommand rm --cached .env
    if ($LASTEXITCODE -ne 0) {
        throw "git rm failed"
    }
    
    Write-Host "✅ .env removed from Git tracking" -ForegroundColor Green
    
    # Add .gitignore and commit
    & $gitCommand add .gitignore .env.example SECURITY.md fix-env-security.ps1
    & $gitCommand commit -m "🔒 Remove .env from Git tracking and add security measures"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Changes committed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Commit may have failed, but .env is removed from tracking" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual commands to run:" -ForegroundColor Yellow
    Write-Host "git rm --cached .env" -ForegroundColor Cyan
    Write-Host "git add .gitignore .env.example SECURITY.md" -ForegroundColor Cyan
    Write-Host "git commit -m `"🔒 Remove .env from Git tracking`"" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "⚠️  IMPORTANT NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Edit .env and add your REAL environment variables" -ForegroundColor Yellow
Write-Host "2. Push changes: git push origin main" -ForegroundColor Yellow
Write-Host "3. If secrets were already pushed, clean history with:" -ForegroundColor Yellow
Write-Host "   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all" -ForegroundColor Cyan
Write-Host "   git push origin --force --all" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
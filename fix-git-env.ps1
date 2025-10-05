# Simple PowerShell script to remove .env from Git tracking
Write-Host "🚨 Removing .env from Git tracking..." -ForegroundColor Red

# Try different Git paths
$gitPaths = @("git", "C:\Program Files\Git\bin\git.exe")
$git = $null

foreach ($path in $gitPaths) {
    try {
        $result = & $path --version 2>$null
        if ($result) {
            $git = $path
            break
        }
    } catch { }
}

if (-not $git) {
    Write-Host "❌ Git not found. Please install Git first!" -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Found Git: $git" -ForegroundColor Green

# Remove .env from tracking
Write-Host "Removing .env from Git tracking..." -ForegroundColor Cyan
try {
    & $git rm --cached .env
    Write-Host "✅ .env removed from tracking" -ForegroundColor Green
    
    # Add other files and commit
    & $git add .gitignore .env.example SECURITY.md
    & $git commit -m "🔒 Remove .env from Git tracking and add security measures"
    Write-Host "✅ Changes committed" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Add your real secrets back to .env file" -ForegroundColor White
    Write-Host "2. Run: git push origin main" -ForegroundColor White
    Write-Host "3. If secrets were already pushed, clean history with force push" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running these commands manually:" -ForegroundColor Yellow
    Write-Host "git rm --cached .env" -ForegroundColor Cyan
    Write-Host "git commit -m 'Remove .env from tracking'" -ForegroundColor Cyan
}

pause
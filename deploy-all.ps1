# Combined Production Deployment Script for Praxio + INR Manager
# Usage: .\deploy-all.ps1 [-Praxio] [-InrManager] [-SkipVerification]

param(
    [switch]$Praxio,
    [switch]$InrManager,
    [switch]$SkipVerification
)

$ErrorActionPreference = "Stop"

# Default to both if neither specified
if (-not $Praxio -and -not $InrManager) {
    $Praxio = $true
    $InrManager = $true
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMBINED DEPLOYMENT: PRAXIO + RETROACT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($Praxio) {
    Write-Host "✓ Praxio deployment: ENABLED" -ForegroundColor Green
} else {
    Write-Host "○ Praxio deployment: SKIPPED" -ForegroundColor Gray
}

if ($InrManager) {
    Write-Host "✓ INR Manager deployment: ENABLED" -ForegroundColor Green
} else {
    Write-Host "○ INR Manager deployment: SKIPPED" -ForegroundColor Gray
}

Write-Host ""

# ========================================
# GIT COMMIT & PUSH
# ========================================

if ($Praxio) {
    Write-Host ""
    Write-Host "📝 Committing and pushing Praxio changes..." -ForegroundColor Yellow
    Set-Location C:\praxio\praxio-website
    
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        git add -A
        git commit -m "Auto-commit before deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git push
        Write-Host "✅ Praxio changes committed and pushed" -ForegroundColor Green
    } else {
        Write-Host "○ No changes to commit in Praxio" -ForegroundColor Gray
    }
}

if ($InrManager) {
    Write-Host ""
    Write-Host "📝 Committing and pushing Retroact changes..." -ForegroundColor Yellow
    Set-Location C:\inrManager
    
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        git add -A
        git commit -m "Auto-commit before deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git push
        Write-Host "✅ Retroact changes committed and pushed" -ForegroundColor Green
    } else {
        Write-Host "○ No changes to commit in Retroact" -ForegroundColor Gray
    }
}

# ========================================
# PRAXIO DEPLOYMENT
# ========================================

if ($Praxio) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  DEPLOYING PRAXIO TO CLOUD RUN" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Open new terminal for Praxio deployment
    Write-Host "Opening new terminal for Praxio deployment..." -ForegroundColor Yellow
    
    $praxioScript = @"
Set-Location C:\praxio\praxio-website
Write-Host "Starting Praxio deployment..." -ForegroundColor Cyan
.\go.ps1
if (`$LASTEXITCODE -eq 0) {
    Write-Host "`n✅ PRAXIO DEPLOYMENT SUCCESSFUL" -ForegroundColor Green
} else {
    Write-Host "`n❌ PRAXIO DEPLOYMENT FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "`nPress any key to close this window..."
`$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
"@
    
    $praxioScriptPath = "$env:TEMP\deploy-praxio.ps1"
    $praxioScript | Out-File -FilePath $praxioScriptPath -Encoding UTF8
    
    $process = Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $praxioScriptPath -Wait -PassThru
    
    if ($process.ExitCode -ne 0) {
        Write-Host ""
        Write-Host "❌ Praxio deployment failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Praxio deployment completed" -ForegroundColor Green
    Write-Host "   URL: https://praxio.net" -ForegroundColor Gray
    Write-Host ""
}

# ========================================
# INR MANAGER DEPLOYMENT
# ========================================

if ($InrManager) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  DEPLOYING INR MANAGER (RETROACT)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Open new terminal for INR Manager deployment
    Write-Host "Opening new terminal for INR Manager deployment..." -ForegroundColor Yellow
    
    $inrScript = @"
Set-Location C:\inrManager
Write-Host "Starting INR Manager deployment..." -ForegroundColor Cyan
if ($SkipVerification) {
    .\prod.ps1 -Backend -Frontend -SkipVerification
} else {
    .\prod.ps1 -Backend -Frontend
}
if (`$LASTEXITCODE -eq 0) {
    Write-Host "`n✅ INR MANAGER DEPLOYMENT SUCCESSFUL" -ForegroundColor Green
} else {
    Write-Host "`n❌ INR MANAGER DEPLOYMENT FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "`nPress any key to close this window..."
`$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
"@
    
    $inrScriptPath = "$env:TEMP\deploy-inrmanager.ps1"
    $inrScript | Out-File -FilePath $inrScriptPath -Encoding UTF8
    
    $process = Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $inrScriptPath -Wait -PassThru
    
    if ($process.ExitCode -ne 0) {
        Write-Host ""
        Write-Host "❌ INR Manager deployment failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ INR Manager deployment completed" -ForegroundColor Green
    Write-Host "   Frontend: https://retroact-fb.web.app" -ForegroundColor Gray
    Write-Host "   Backend: https://inr-backend-pq7nv4e3fq-uk.a.run.app" -ForegroundColor Gray
    Write-Host ""
}

# ========================================
# DEPLOYMENT SUMMARY
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ALL DEPLOYMENTS COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

if ($Praxio) {
    Write-Host "✅ Praxio:" -ForegroundColor Green
    Write-Host "   https://praxio.net" -ForegroundColor Gray
    Write-Host ""
}

if ($InrManager) {
    Write-Host "✅ INR Manager (Retroact):" -ForegroundColor Green
    Write-Host "   https://retroact-fb.web.app" -ForegroundColor Gray
    Write-Host "   Backend: https://inr-backend-pq7nv4e3fq-uk.a.run.app" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "🎉 Production deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test SSO flow: Login to Praxio → Launch Retroact" -ForegroundColor Gray
Write-Host "  2. Verify logout: Logout from Praxio (should logout from both)" -ForegroundColor Gray
Write-Host "  3. Check database connections on both services" -ForegroundColor Gray
Write-Host ""

exit 0

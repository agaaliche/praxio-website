# Set environment variables for praxio-website deployment
# Source this file before running prod.ps1: . .\set-env.ps1

Write-Host "Setting environment variables for deployment..." -ForegroundColor Cyan

# Database
$env:DB_PASSWORD = Read-Host "Enter DB_PASSWORD" -MaskInput

# Stripe
$env:STRIPE_SECRET_KEY = Read-Host "Enter STRIPE_SECRET_KEY"
$env:STRIPE_WEBHOOK_SECRET = Read-Host "Enter STRIPE_WEBHOOK_SECRET"

# Firebase
$env:FIREBASE_PROJECT_ID = Read-Host "Enter FIREBASE_PROJECT_ID"
$env:FIREBASE_CLIENT_EMAIL = Read-Host "Enter FIREBASE_CLIENT_EMAIL"
Write-Host "Enter FIREBASE_PRIVATE_KEY (paste and press Enter):"
$env:FIREBASE_PRIVATE_KEY = Read-Host

# JWT/SSO
$env:JWT_SECRET = Read-Host "Enter JWT_SECRET"
$env:SSO_SECRET = Read-Host "Enter SSO_SECRET"

# Resend
$env:RESEND_API_KEY = Read-Host "Enter RESEND_API_KEY"

Write-Host "`nEnvironment variables set!" -ForegroundColor Green
Write-Host "You can now run: .\prod.ps1" -ForegroundColor Cyan

#!/usr/bin/env pwsh
# Production deployment script - run with: pwsh -NoProfile .\go.ps1

$ErrorActionPreference = "Stop"

Write-Host "Deploying to Production..." -ForegroundColor Cyan

# Build
Write-Host "`nBuilding..." -ForegroundColor Yellow
Set-Location C:\praxio
gcloud builds submit --config praxio-website/cloudbuild.yaml --project retroact

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy (all env vars including Firebase - embedded JSON)
Write-Host "`nDeploying..." -ForegroundColor Yellow

# Get Firebase JSON from .env.local
$firebaseJson = (Get-Content "C:\praxio\praxio-website\.env.local" | Select-String "FIREBASE_SERVICE_ACCOUNT=" | ForEach-Object { $_.ToString().Replace("FIREBASE_SERVICE_ACCOUNT=", "") }).Trim()

# Create a temporary YAML file with all environment variables
$envYaml = @"
DB_SOCKET_PATH: /cloudsql/retroact:us-east4:retroact
DB_USER: root
DB_NAME: master
DB_PASSWORD: SecurePass2025!
NODE_ENV: production
NUXT_PUBLIC_SITE_URL: https://praxio-website-604839735443.us-central1.run.app
NUXT_PUBLIC_RETROACT_URL: https://retroact.app
STRIPE_SECRET_KEY: $env:STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET: $env:STRIPE_WEBHOOK_SECRET
JWT_SECRET: $env:JWT_SECRET
SSO_SECRET: $env:SSO_SECRET
RESEND_API_KEY: $env:RESEND_API_KEY
FIREBASE_SERVICE_ACCOUNT: '$firebaseJson'
"@

$envYamlPath = "$env:TEMP\praxio-all-env.yaml"
$envYaml | Out-File -FilePath $envYamlPath -Encoding UTF8

gcloud run deploy praxio-website `
    --image gcr.io/retroact/praxio-website `
    --platform managed `
    --region us-central1 `
    --project retroact `
    --allow-unauthenticated `
    --add-cloudsql-instances retroact:us-east4:retroact `
    --env-vars-file $envYamlPath

Remove-Item $envYamlPath -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeployment successful!" -ForegroundColor Green
} else {
    Write-Host "`nDeployment failed!" -ForegroundColor Red
    exit 1
}

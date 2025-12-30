# Quick deploy script for praxio-website to Cloud Run
# Usage: ./prod.ps1

Write-Host "🚀 Deploying to Production..." -ForegroundColor Cyan

# Build
Write-Host "`n📦 Building..." -ForegroundColor Yellow
gcloud builds submit --tag gcr.io/retroact/praxio-website --project retroact

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host "`n🌐 Deploying..." -ForegroundColor Yellow
gcloud run deploy praxio-website `
    --image gcr.io/retroact/praxio-website `
    --platform managed `
    --region us-central1 `
    --project retroact `
    --allow-unauthenticated `
    --add-cloudsql-instances retroact:us-east4:retroact `
    --set-env-vars "DB_SOCKET_PATH=/cloudsql/retroact:us-east4:retroact" `
    --set-env-vars "DB_USER=root" `
    --set-env-vars "DB_NAME=master" `
    --set-env-vars "NODE_ENV=production" `
    --min-instances 0 `
    --max-instances 10 `
    --memory 512Mi `
    --cpu 1 `
    --timeout 60

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deploy failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green

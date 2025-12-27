# Cloud Run deployment script for praxio-website
# Usage: ./deploy-cloudrun.ps1

$PROJECT_ID = "inrmanager-97748"
$REGION = "us-central1"
$SERVICE_NAME = "praxio-website"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Cloud SQL instance connection name (same as inrManager backend)
$CLOUD_SQL_CONNECTION = "inrmanager-97748:us-central1:inr-database"

Write-Host "🚀 Deploying praxio-website to Cloud Run..." -ForegroundColor Cyan

# Step 1: Build the Docker image
Write-Host "`n📦 Building Docker image..." -ForegroundColor Yellow
docker build -t $IMAGE_NAME .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Push to Google Container Registry
Write-Host "`n📤 Pushing to Container Registry..." -ForegroundColor Yellow
docker push $IMAGE_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Deploy to Cloud Run
Write-Host "`n🌐 Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --add-cloudsql-instances $CLOUD_SQL_CONNECTION `
    --set-env-vars "DB_SOCKET_PATH=/cloudsql/$CLOUD_SQL_CONNECTION" `
    --set-env-vars "DB_USER=root" `
    --set-env-vars "DB_NAME=master" `
    --set-env-vars "NODE_ENV=production" `
    --min-instances 0 `
    --max-instances 10 `
    --memory 512Mi `
    --cpu 1 `
    --timeout 60

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cloud Run deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "🔗 Your service URL will be displayed above." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Don't forget to set sensitive environment variables in Cloud Console:" -ForegroundColor Yellow
Write-Host "   - DB_PASSWORD" -ForegroundColor White
Write-Host "   - STRIPE_SECRET_KEY" -ForegroundColor White
Write-Host "   - STRIPE_WEBHOOK_SECRET" -ForegroundColor White
Write-Host "   - FIREBASE_SERVICE_ACCOUNT (if needed)" -ForegroundColor White

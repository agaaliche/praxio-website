# Cloud Run deployment using Cloud Build (no local Docker required)
# Usage: ./deploy-cloudrun.ps1

$PROJECT_ID = "retroact"
$REGION = "us-central1"
$SERVICE_NAME = "praxio-website"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Cloud SQL instance connection name (same as inrManager backend)
$CLOUD_SQL_CONNECTION = "retroact:us-east4:retroact"

Write-Host "🚀 Deploying praxio-website to Cloud Run..." -ForegroundColor Cyan

# Step 1: Build using Cloud Build (no local Docker needed)
Write-Host "`n📦 Building with Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --tag $IMAGE_NAME --project $PROJECT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cloud Build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Deploy to Cloud Run
Write-Host "`n🌐 Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --project $PROJECT_ID `
    --allow-unauthenticated `
    --add-cloudsql-instances $CLOUD_SQL_CONNECTION `
    --set-env-vars "DB_SOCKET_PATH=/cloudsql/$CLOUD_SQL_CONNECTION" `
    --set-env-vars "DB_USER=root" `
    --set-env-vars "DB_NAME=master" `
    --set-env-vars "NODE_ENV=production" `
    --set-env-vars "RETROACT_URL=https://retroact.app" `
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
Write-Host ""
Write-Host "⚠️  IMPORTANT: Set secrets in Google Cloud Console -> Cloud Run -> praxio-website -> Edit:" -ForegroundColor Yellow
Write-Host "   1. DB_PASSWORD - your database password" -ForegroundColor White
Write-Host "   2. STRIPE_SECRET_KEY - sk_live_xxx or sk_test_xxx" -ForegroundColor White
Write-Host "   3. STRIPE_PUBLISHABLE_KEY - pk_live_xxx or pk_test_xxx" -ForegroundColor White
Write-Host "   4. STRIPE_WEBHOOK_SECRET - whsec_xxx" -ForegroundColor White
Write-Host "   5. FIREBASE_SERVICE_ACCOUNT - JSON service account key" -ForegroundColor White
Write-Host "   6. SITE_URL - https://praxio.ca or your domain" -ForegroundColor White
Write-Host ""
Write-Host "📌 To revert to Vercel: git checkout vercel-backup" -ForegroundColor Cyan

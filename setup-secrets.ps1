# Setup Google Cloud Secrets for praxio-website
# Usage: ./setup-secrets.ps1

$PROJECT = "retroact"

Write-Host "Setting up secrets for project: $PROJECT" -ForegroundColor Cyan
Write-Host "Note: Press Enter to skip existing secrets" -ForegroundColor Yellow
Write-Host ""

# Function to create or update a secret
function Set-GCloudSecret {
    param (
        [string]$SecretName,
        [string]$Description,
        [bool]$IsMultiline = $false
    )
    
    Write-Host "Setting: $Description" -ForegroundColor Green
    
    if ($IsMultiline) {
        Write-Host "Enter value (press Ctrl+Z then Enter when done):" -ForegroundColor Yellow
        $value = $input | Out-String
    } else {
        $value = Read-Host "Enter value"
    }
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "Skipped $SecretName" -ForegroundColor Gray
        return
    }
    
    # Check if secret exists
    $exists = gcloud secrets describe $SecretName --project=$PROJECT 2>$null
    
    if ($exists) {
        Write-Host "Updating existing secret: $SecretName" -ForegroundColor Yellow
        $value | gcloud secrets versions add $SecretName --data-file=- --project=$PROJECT
    } else {
        Write-Host "Creating new secret: $SecretName" -ForegroundColor Cyan
        $value | gcloud secrets create $SecretName --data-file=- --project=$PROJECT
    }
    
    Write-Host ""
}

# Create each secret
Set-GCloudSecret -SecretName "praxio-db-password" -Description "Database Password"
Set-GCloudSecret -SecretName "firebase-project-id" -Description "Firebase Project ID"
Set-GCloudSecret -SecretName "firebase-client-email" -Description "Firebase Client Email"
Set-GCloudSecret -SecretName "firebase-private-key" -Description "Firebase Private Key (multiline)" -IsMultiline $true
Set-GCloudSecret -SecretName "stripe-secret-key" -Description "Stripe Secret Key (sk_...)"
Set-GCloudSecret -SecretName "stripe-webhook-secret" -Description "Stripe Webhook Secret (whsec_...)"
Set-GCloudSecret -SecretName "jwt-secret" -Description "JWT Secret (random string)"
Set-GCloudSecret -SecretName "sso-secret" -Description "SSO Secret (random string, should match retroact backend)"
Set-GCloudSecret -SecretName "resend-api-key" -Description "Resend API Key (re_...)"

Write-Host "Granting Cloud Run service account access to secrets..." -ForegroundColor Cyan

# Get the Cloud Run service account
$serviceAccount = gcloud run services describe praxio-website --region=us-central1 --project=$PROJECT --format="value(spec.template.spec.serviceAccountName)" 2>$null

if ([string]::IsNullOrWhiteSpace($serviceAccount)) {
    # Use default compute service account
    $projectNumber = gcloud projects describe $PROJECT --format="value(projectNumber)"
    $serviceAccount = "$projectNumber-compute@developer.gserviceaccount.com"
    Write-Host "Using default compute service account: $serviceAccount" -ForegroundColor Yellow
}

$secrets = @(
    "praxio-db-password",
    "firebase-project-id",
    "firebase-client-email",
    "firebase-private-key",
    "stripe-secret-key",
    "stripe-webhook-secret",
    "jwt-secret",
    "sso-secret",
    "resend-api-key"
)

foreach ($secret in $secrets) {
    Write-Host "Granting access to $secret..." -ForegroundColor Gray
    gcloud secrets add-iam-policy-binding $secret `
        --member="serviceAccount:$serviceAccount" `
        --role="roles/secretmanager.secretAccessor" `
        --project=$PROJECT 2>$null
}

Write-Host ""
Write-Host "Secrets setup complete!" -ForegroundColor Green
Write-Host "You can now run ./prod.ps1 to deploy" -ForegroundColor Cyan

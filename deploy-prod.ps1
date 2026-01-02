# Complete deployment script with all credentials hardcoded
# Usage: .\deploy-prod.ps1

Write-Host "Deploying to Production..." -ForegroundColor Cyan

# Build from parent directory (monorepo context)
Write-Host "`nBuilding..." -ForegroundColor Yellow
$originalLocation = Get-Location
Set-Location C:\praxio
gcloud builds submit --config praxio-website/cloudbuild.yaml --project retroact
Set-Location $originalLocation

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy with hardcoded credentials
Write-Host "`nDeploying..." -ForegroundColor Yellow
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
    --set-env-vars "DB_PASSWORD=SecurePass2025!" `
    --set-env-vars "NODE_ENV=production" `
    --set-env-vars "SITE_URL=https://praxio.net" `
    --set-env-vars "STRIPE_SECRET_KEY=$env:STRIPE_SECRET_KEY" `
    --set-env-vars "STRIPE_WEBHOOK_SECRET=$env:STRIPE_WEBHOOK_SECRET" `
    --set-env-vars "FIREBASE_PROJECT_ID=retroact-fb" `
    --set-env-vars "FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@retroact-fb.iam.gserviceaccount.com" `
    --set-env-vars "FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDeE3uTTX3YTe/M\nS6PwNohimDkrI/gKSyeL/hEJBhPqqRrK6RwPalfo2+KaJOyt2NjXfC4e1M4Vk+t6\n4FiLwjdAmZ0fmZuQ8scotmbTnwDczULQXfhQbGLHXJhwDPV+rx0Wr8NoMRgKn64O\n5pj17T8VT9Jl1Eo5FVXm7mEVbZ12bRIbaNDMlwWACfAAlHv5ywZpR9ZDnSrfOecX\nb4QsxU9UeqTfb4rOBWW9jMKzsVCxSBa7r1QSrm0RJtO7OyffQgT48SHYiZh4eUfj\np7z6rLk9PPaKybKC5DC/k/6PJSg3hePc4uLAbHAhbt17m+bFdG/skihNjrnVs4gx\nhy4ZUiBHAgMBAAECggEADq3jAT2iD+Y2754gXAR+x2WggcWC48tL9ej5X0tTjbNX\n3gnCnRI+dVnzhJTkQCmRS80dj1Qpuytn6Vti/vn7hP2icTBKJC6oE3zbFynveKjo\nvbU4cLh5Xwwz11RD9ffFSHadyAlWuX0MmFeNzNO9077O/YQm09chMn6XVD9GpUk4\n2pu1d2Tnv5MKn25azGWTh0/+f4vlX38sf0jJ8I6IfVn/tRatB5Kwkd29NqMajGLp\n01XhR3QAyTBYCUW8wkTwAP9wbkfq6ifjWoOOBGnpcOfVSKKn5PXhOrizir+F5L+U\nTrxCewr5sB6QD1KF6wCk5+rwjeQKno/WrxJShJt64QKBgQD2/8BVnEUZSIcSLeG+\nlsJyeSUn/3jxNjFr1Zq0dYN/H+ezxA3Bri7GcbMp3C2DnHOhMobh3syg9aA73Sn5\nxmHBim1q/K1wOg2LnDJYOXAem4tKTJdfOKpxQQCCUgq3KY+DiCyN2LQ+7iLaX9cv\n4hyMIRhcsah8MTV0DMfRW+CmOwKBgQDmKznZyz7TmtzML00zahpPklIWEHgWALKs\n/Pf1sY5Wtm+ol5PF6yRiCnj4ykJA8BrFECYLxWqlvlM57cy+/3uq2hm7P5eJRg5G\np/dfFWRxVb2ZTgmi+QrQtvT6Bo3+ZN0FbI2aNLGHxOR3iFnMEnfOfMUsPU/faMeE\n9h8AnWnxZQKBgBiN1h3smgXoat0IyJ88t3nPxzzRrcE05PbWVjnIUNkrX8pEHCX7\n3dSGawwnQjMKM4h70GLV1jvODy7ETq7w5LjrvPLcyZUVgFE3pt2UYCv6xH8PXCDw\nLilyD83kwAHzVLv7poo3V7vFypsw2eB9tt7LT3OviZNHBQxTVO3gF1YPAoGBAI1Z\naGqXBZs/1G7Uca2scEIDksOYE5c3kILpy4EoLEiWOxYnGAoIsMxAsC/hTjTA/z+b\n/jFmaGsm6cd+gSmejhzLWdgDYpVb33KGvkS3R3rOc+RM52AdXwX0BZfyJItg99bX\n5lIYIBpH0SKTKspHYSn+t7vGX2HM4BKIb1uaUDB9AoGBAOep4Msh/r1b/ymPnrgH\nnUo4AWaidC5eQFxsUTd9Jofzo9sgHBNykOk5+3556dWOrqiIQuOYDbuVYN/TeZzC\nS9nh4/ZTHkgDhP78yRqCoO8Q8fqbxMgD3+5XrCbf7UYrpbXjtrqaNwesryT9TdoH\nJNJY/kJS+s0e9O+dPBYmVWUd\n-----END PRIVATE KEY-----\n" `
    --set-env-vars "JWT_SECRET=R3tr0@ct-JWT-S3cr3t-2025!Pr0duct10n" `
    --set-env-vars "SSO_SECRET=R3tr0@ct-SSO-S3cr3t-2025!Pr0duct10n" `
    --set-env-vars "RESEND_API_KEY=re_123456789"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeployment successful!" -ForegroundColor Green
    Write-Host "URL: https://praxio.net" -ForegroundColor Cyan
} else {
    Write-Host "`nDeployment failed!" -ForegroundColor Red
    exit 1
}

# Script to add Supabase environment variables to Vercel
# Usage: .\add-vercel-env.ps1

Write-Host "🔧 Adding Supabase environment variables to Vercel..." -ForegroundColor Cyan

# Read credentials from .env file
$envContent = Get-Content .env -Raw
$supabaseUrl = ($envContent | Select-String -Pattern 'VITE_SUPABASE_URL\s*=\s*"([^"]+)"').Matches.Groups[1].Value
$supabaseKey = ($envContent | Select-String -Pattern 'VITE_SUPABASE_ANON_KEY\s*=\s*"([^"]+)"').Matches.Groups[1].Value

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Error: Could not find Supabase credentials in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found Supabase credentials" -ForegroundColor Green
Write-Host "   URL: $supabaseUrl" -ForegroundColor Gray
Write-Host "   Key: $($supabaseKey.Substring(0, 20))..." -ForegroundColor Gray

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "✅ Vercel CLI is installed: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI is not installed. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check if logged in
try {
    $whoami = vercel whoami 2>&1
    Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not logged in to Vercel. Please run: vercel login" -ForegroundColor Yellow
    Write-Host "   Or set VERCEL_TOKEN environment variable" -ForegroundColor Yellow
    exit 1
}

# Add environment variables
Write-Host "`n📝 Adding environment variables to Vercel..." -ForegroundColor Cyan

# Add VITE_SUPABASE_URL
Write-Host "   Adding VITE_SUPABASE_URL..." -ForegroundColor Gray
$urlResult = echo "production`npreview`ndevelopment" | vercel env add VITE_SUPABASE_URL production 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ VITE_SUPABASE_URL added" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  VITE_SUPABASE_URL might already exist or there was an error" -ForegroundColor Yellow
}

# Add VITE_SUPABASE_ANON_KEY
Write-Host "   Adding VITE_SUPABASE_ANON_KEY..." -ForegroundColor Gray
$keyResult = echo "production`npreview`ndevelopment" | vercel env add VITE_SUPABASE_ANON_KEY production 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ VITE_SUPABASE_ANON_KEY added" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  VITE_SUPABASE_ANON_KEY might already exist or there was an error" -ForegroundColor Yellow
}

Write-Host "`n✅ Done! Please redeploy your Vercel project for changes to take effect." -ForegroundColor Green
Write-Host "   You can redeploy from: https://vercel.com/dashboard" -ForegroundColor Gray


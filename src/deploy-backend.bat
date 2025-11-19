@echo off
REM Yacht Exam Trainer - Backend Deployment Script (Windows)
REM This script deploys your Supabase Edge Functions

echo.
echo 🚀 Deploying Yacht Exam Trainer Backend...
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found. Please install it first:
    echo.
    echo    npm install -g supabase
    echo.
    echo Or with scoop:
    echo    scoop install supabase
    echo.
    exit /b 1
)

echo ✅ Supabase CLI found
echo.

REM Check if logged in
echo 📝 Checking Supabase login status...
supabase projects list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Not logged in to Supabase
    echo Running: supabase login
    echo.
    supabase login
)

echo ✅ Logged in to Supabase
echo.

REM Link to project
echo 🔗 Linking to your Supabase project...
set PROJECT_ID=abtrsjhvjfgcxxpkszwi

supabase link --project-ref %PROJECT_ID%

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to link project
    exit /b 1
)

echo ✅ Project linked
echo.

REM Set secrets
echo 🔐 Configuring secrets...
echo.
echo The following secrets should already be configured:
echo   ✅ SUPABASE_URL
echo   ✅ SUPABASE_ANON_KEY
echo   ✅ SUPABASE_SERVICE_ROLE_KEY
echo   ✅ SUPABASE_DB_URL
echo   ✅ STRIPE_SECRET_KEY
echo.

REM Set ADMIN_IMPORT_KEY
echo Setting ADMIN_IMPORT_KEY for question imports...
set /p ADMIN_KEY="Enter your admin import key (choose a secure password): "

if "%ADMIN_KEY%"=="" (
    echo ⚠️  Using default key
    set ADMIN_KEY=change-this-key-12345
)

supabase secrets set ADMIN_IMPORT_KEY=%ADMIN_KEY%

echo.
echo ✅ Secrets configured
echo.

REM Deploy functions
echo 🚀 Deploying Edge Functions...
echo.

supabase functions deploy server

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Deployment failed
    exit /b 1
)

echo.
echo ✅ Backend deployed successfully!
echo.
echo 📍 Your API endpoint:
echo    https://%PROJECT_ID%.supabase.co/functions/v1/make-server-d36f8f91/
echo.
echo 🔑 Your Admin Import Key: %ADMIN_KEY%
echo    (Save this - you'll need it to import questions)
echo.
echo Next steps:
echo   1. Deploy frontend (see DEPLOYMENT_GUIDE.md)
echo   2. Configure Stripe webhook
echo   3. Import your questions via Admin Panel
echo.

pause

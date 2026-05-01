@echo off
REM Backend Deployment Script for Windows
REM Run this to deploy your backend to Supabase

echo ====================================
echo   Backend Deployment to Supabase
echo ====================================
echo.

echo Step 1: Logging in to Supabase...
echo.
call npx supabase login

if errorlevel 1 (
    echo.
    echo ERROR: Login failed! Please try again.
    pause
    exit /b 1
)

echo.
echo Step 2: Linking to project...
echo.
call npx supabase link --project-ref abtrsjhvjfgcxxpkszwi

echo.
echo Step 3: Deploying server function...
echo.
call npx supabase functions deploy server --no-verify-jwt

if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed!
    echo.
    echo Troubleshooting:
    echo   1. Check your internet connection
    echo   2. Make sure you're logged in
    echo   3. Try running: npx supabase functions deploy server --no-verify-jwt --debug
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================
echo   Deployment Successful!
echo ====================================
echo.
echo Testing backend health...
timeout /t 2 /nobreak >nul

curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHJzamh2amZnY3h4cGtzendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTgwODcsImV4cCI6MjA3NzY3NDA4N30.V6JxIrjjr3b1rxcdpNrrCEgh-cOuEl9HIAMDMHSOZWw" https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/health

echo.
echo.
echo ====================================
echo   Next Steps:
echo ====================================
echo   1. Open diagnose-backend.html in your browser
echo   2. Try logging in to your app
echo   3. Set up Stripe keys (see FINISH_PAYMENT_TODAY.md)
echo.
pause

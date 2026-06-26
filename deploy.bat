@echo off
echo ========================================
echo Layer 1 Identity Registry - Production Deploy
echo ========================================
echo.

echo [1/3] Building React app...
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo Build complete!
echo.

echo [2/3] Deploying to Firebase Hosting...
call firebase deploy --only hosting --project layer-1-masterservice
if errorlevel 1 (
    echo Deployment failed!
    pause
    exit /b 1
)
echo.

echo [3/3] Deploying Firestore rules...
call firebase deploy --only firestore:rules --project layer-1-masterservice
if errorlevel 1 (
    echo Firestore rules deployment failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your app is live at:
echo https://layer-1-masterservice-admin-panel.web.app
echo.
pause

@echo off
echo ========================================
echo Fixing Firebase Project Configuration
echo ========================================
echo.

echo [Step 1] Setting correct Firebase project...
call firebase use layer-1-masterservice
if errorlevel 1 (
    echo Failed to set project! Let's list available projects:
    call firebase projects:list
    echo.
    echo Please run: firebase use layer-1-masterservice
    pause
    exit /b 1
)
echo Project set to: layer-1-masterservice
echo.

echo [Step 2] Building React app...
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo Build complete!
echo.

echo [Step 3] Deploying to Firebase Hosting...
call firebase deploy --only hosting --project layer-1-masterservice
if errorlevel 1 (
    echo Deployment failed!
    pause
    exit /b 1
)
echo.

echo [Step 4] Deploying Firestore rules...
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

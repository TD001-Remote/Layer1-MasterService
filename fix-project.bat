@echo off
echo ========================================
echo Fixing Firebase Project Configuration
echo ========================================
echo.

echo Current Firebase projects available:
call firebase projects:list
echo.

echo Setting project to layer-1-masterservice...
call firebase use layer-1-masterservice
echo.

echo Verifying configuration...
type .firebaserc
echo.

echo ========================================
echo Project configuration fixed!
echo ========================================
echo.
echo Now you can run: deploy.bat
pause

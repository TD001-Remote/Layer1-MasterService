@echo off
echo Quick Deploy (Hosting only)...
call npm run build && firebase deploy --only hosting --project layer-1-masterservice
echo.
echo Done! Check: https://layer-1-masterservice-admin-panel.web.app
pause

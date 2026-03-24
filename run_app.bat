@echo off
echo ==========================================
echo      STARTING PAJE CLUB MOBILE V2
echo ==========================================
echo.
echo 1. Checking dependencies...
call npm install
echo.
echo 2. Starting Expo Server (Tunnel Mode)...
echo    (This works best for local testing)
echo.
call npx expo start --tunnel --clear
pause

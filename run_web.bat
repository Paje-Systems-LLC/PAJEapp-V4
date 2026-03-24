@echo off
cd /d "%~dp0"
echo ==========================================
echo      OPENING PAJE CLUB IN BROWSER
echo ==========================================
echo.
call npx expo start --web
pause

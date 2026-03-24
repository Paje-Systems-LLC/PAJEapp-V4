@echo off
echo ==========================================
echo      PAJE APP - PRODUCTION BUILD
echo ==========================================
echo.
echo This script will generate the Android App Bundle (AAB)
echo for Google Play Store.
echo.
echo 1. You may be asked to log in to your Expo account.
echo 2. You may be asked to generate a new Keystore (Say YES/Y).
echo.
pause
call npx eas build --platform android --profile production
echo.
echo ==========================================
echo Build submitted! Check the link above to monitor progress.
echo ==========================================
pause

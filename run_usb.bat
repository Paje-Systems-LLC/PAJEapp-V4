@echo off
echo ==========================================
echo    PAJE APP - RUN ON USB DEVICE (ANDROID)
echo ==========================================
echo.
echo Make sure your Android device is connected via USB
echo and USB Debugging is ENABLED.
echo.
echo Step 1: Generating Native Code (Prebuild) if needed
echo ------------------------------------------
call npx expo prebuild --platform android --clean

echo.
echo Step 2: Compiling and Installing on Device
echo ------------------------------------------
call npx expo run:android

echo.
echo ==========================================
echo SUCCESS! Application should be launching.
echo ==========================================
pause

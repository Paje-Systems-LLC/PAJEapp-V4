@echo off
echo ==========================================
echo    PAJE APP - LOCAL RELEASE BUILD (AAB)
echo ==========================================
echo.
echo This script will build the Android App Bundle on your computer.
echo This avoids Expo's cloud build limits.
echo.
echo Step 1: Generating Native Code (Prebuild)
echo ------------------------------------------
call npx expo prebuild --platform android --clean
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Step 2: Building Release Bundle (Gradle)
echo ------------------------------------------
cd android
call .\gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo.
    echo BUILD FAILED! Check the errors above.
    cd ..
    pause
    exit /b %errorlevel%
)

cd ..
echo.
echo ==========================================
echo SUCCESS! Build Complete.
echo.
echo Your AAB file is located at:
echo mobile\android\app\build\outputs\bundle\release\app-release.aab
echo ==========================================
pause

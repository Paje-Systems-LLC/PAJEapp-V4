@echo off
echo ==========================================
echo    RETRYING BUILD & CAPTURING LOGS
echo ==========================================
echo.
echo Running Gradle build again to capture the error...
echo This should be faster than the first time.
echo.
echo Please wait... output is being saved to build_log.txt
echo.

cd android
call .\gradlew.bat bundleRelease --stacktrace > ..\build_log.txt 2>&1
cd ..

echo.
echo ==========================================
echo Build attempt finished.
echo I will now read the build_log.txt file.
echo ==========================================
pause

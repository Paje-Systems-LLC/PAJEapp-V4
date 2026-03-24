@echo off
echo ==========================================
echo    SETTING UP PAJE APP
echo ==========================================
echo.
echo 1. Creating folder C:\Projects...
if not exist "C:\Projects" mkdir "C:\Projects"

echo 2. Navigating to C:\Projects...
cd /d C:\Projects

echo 3. Creating Expo App (PAJEapp)...
echo This might take a minute or two.
call npx create-expo-app@latest PAJEapp --template blank --yes

echo.
echo ==========================================
echo    SUCCESS! Project Created.
echo ==========================================
echo.
echo Please open this folder in your editor:
echo C:\Projects\PAJEapp
echo.
pause

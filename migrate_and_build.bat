@echo off
echo ==========================================
echo    MIGRATING TO SHORT PATH (C:\paje)
echo ==========================================
echo.
echo The build failed because your project path is too deep
echo (OneDrive + GitHub + Long Names = Crash).
echo.
echo We will move the project to C:\paje to fix this.
echo.

:: 1. Create directory
if not exist "C:\paje" mkdir "C:\paje"

:: 2. Copy files (excluding heavy folders)
echo Copying source files...
copy package.json C:\paje\
copy app.json C:\paje\
copy App.js C:\paje\
copy index.js C:\paje\
copy eas.json C:\paje\
copy babel.config.js C:\paje\
copy *.bat C:\paje\

echo Copying folders...
xcopy src C:\paje\src /E /I /Y
xcopy assets C:\paje\assets /E /I /Y

:: 3. Setup in new location
echo.
echo ==========================================
echo    SETTING UP IN C:\paje
echo ==========================================
cd /d C:\paje

echo Installing dependencies (this might take a moment)...
call npm install

echo.
echo ==========================================
echo    STARTING BUILD IN NEW LOCATION
echo ==========================================
call build_local_release.bat

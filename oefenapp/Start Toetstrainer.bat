@echo off
chcp 65001 >nul
cd /d "%~dp0"
title SDK ^& SAAI Toetstrainer

echo.
echo  SDK ^& SAAI Toetstrainer wordt gestart...
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo  Python niet gevonden - open index.html direct.
    start "" "%~dp0index.html"
    timeout /t 5 >nul
    exit /b
)

start "SAAI Server" /min cmd /c "cd /d "%~dp0" && python -m http.server 8765"
ping -n 2 127.0.0.1 >nul
start "" http://localhost:8765

echo  Browser geopend: http://localhost:8765
echo  Server draait op de achtergrond.
timeout /t 3 >nul

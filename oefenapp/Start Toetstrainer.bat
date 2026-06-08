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

REM Oude server op poort 8765 stoppen
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8765" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

REM Server via apart bat-bestand (werkt met & in pad)
start "SAAI Server" /min "%~dp0server.bat"
ping -n 3 127.0.0.1 >nul
start "" http://localhost:8765

echo  Browser geopend: http://localhost:8765
echo  Server draait op de achtergrond.
timeout /t 3 >nul

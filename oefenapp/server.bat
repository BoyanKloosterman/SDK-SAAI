@echo off
REM Hoofdmap serveren zodat samenvatting_sdk_saai_v5.html bereikbaar is
cd /d "%~dp0.."
python -m http.server 8765

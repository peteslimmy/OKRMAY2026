@echo off
title 4CORE OKR - Dev Server
cd /d "%~dp0"
echo Starting 4CORE OKR Dev Server...
echo.
npm run dev
echo.
echo Server closed. Press any key to exit...
pause >nul
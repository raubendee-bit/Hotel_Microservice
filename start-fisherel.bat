@echo off
title Fisher El Hotel - Self Host Launcher
color 0B

echo.
echo  ================================================
echo   Fisher El Hotel - Self Host Server Launcher
echo  ================================================
echo.

:: Change to project directory
cd /d d:\Rovin\Projects\2025-2026\ITSAR2\FisherEl_Hotel

:: Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%

echo [1/3] Starting Docker containers...
docker-compose up -d
echo  Docker containers are running.
echo.

echo [2/3] Waiting for services to be healthy (10s)...
timeout /t 10 /nobreak >nul
echo  Services ready.
echo.

echo [3/3] Starting frontend file server on port 3000...
echo.
echo  ================================================
echo   System is LIVE at:
echo.
echo   Frontend : http://%LOCAL_IP%:3000
echo   API GW   : http://%LOCAL_IP%:8080
echo.
echo   Share the Frontend URL with users on your
echo   network to access the hotel system.
echo  ================================================
echo.

start "" http://localhost:3000

:: Start the static file server (requires 'serve' npm package)
npx serve . -p 3000

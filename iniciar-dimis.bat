@echo off
title dimis - Multi WhatsApp
cd /d "%~dp0"

set "ELECTRON_RUN_AS_NODE="

if exist "node_modules\electron\dist\electron.exe" (
    start "" "node_modules\electron\dist\electron.exe" .
    exit
)

where node >nul 2>&1
if %ERRORLEVEL% equ 0 goto :start_node

if exist "C:\nvm4w\nodejs" path C:\nvm4w\nodejs;%PATH%
if exist "%LOCALAPPDATA%\nvm\v24.11.1" path %LOCALAPPDATA%\nvm\v24.11.1;%PATH%
if exist "%LOCALAPPDATA%\nvm\v20.20.1" path %LOCALAPPDATA%\nvm\v20.20.1;%PATH%

:start_node
node run.js
exit

@echo off
setlocal
REM Wrapper to run the PowerShell build script
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-android.ps1"
endlocal

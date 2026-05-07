@echo off
title Calificador BC — Servidor Local

:: Find local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "169.254"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

set PORT=8080
set DIR=%~dp0

echo.
echo  ============================================
echo   Calificador de Prospectos - Bombas de Calor
echo   Servidor local activo
echo  ============================================
echo.
echo   URL local:    http://localhost:%PORT%
echo   URL en red:   http://%IP%:%PORT%
echo.
echo   Comparte la URL de red con tus colegas.
echo   Presiona Ctrl+C para detener el servidor.
echo  --------------------------------------------
echo.

:: Open browser automatically
start "" "http://localhost:%PORT%"

:: Start Python HTTP server
cd /d "%DIR%"
python -m http.server %PORT% --bind 0.0.0.0

pause

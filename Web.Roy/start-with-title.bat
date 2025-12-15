@echo off
title Frontend - Toma Pedido
cd /d "%~dp0"
set NG_CLI_ANALYTICS=false

REM Ejecutar ng serve en un proceso separado y mantener el título
start "ng-serve-process" /b cmd /c "call npm start"

REM Mantener el título de esta ventana actualizado cada segundo
:keepTitle
title Frontend - Toma Pedido
timeout /t 1 /nobreak >nul
goto keepTitle


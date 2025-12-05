@echo off
setlocal enabledelayedexpansion

REM ============================================
REM Script para iniciar Toma de Pedidos Backend y Frontend
REM Ejecutar desde el directorio sql/
REM ============================================

echo.
echo ============================================
echo   TOMA DE PEDIDOS - Iniciar Servicios
echo   Backend (Api.Roy) y Frontend (Web.Roy)
echo ============================================
echo.

REM Obtener ruta del directorio actual (sql/)
set "SCRIPT_DIR=%~dp0"

REM Ir al directorio raiz del proyecto (un nivel arriba)
cd /d "%SCRIPT_DIR%.."
set "ROOT_DIR=%CD%"

echo Directorio raiz: %ROOT_DIR%
echo.

REM ============================================
REM PASO 0: MATAR TODOS LOS PROCESOS EN PUERTOS
REM ============================================
echo [PASO 0] Deteniendo procesos existentes...
echo.

echo Matando TODOS los procesos en puerto 5070 (Backend)...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5070"') do (
    echo   Matando PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Matando TODOS los procesos en puerto 4200 (Frontend)...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":4200"') do (
    echo   Matando PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Matando procesos ApiRoy.exe...
taskkill /F /IM ApiRoy.exe >nul 2>&1
if not errorlevel 1 echo   ApiRoy.exe cerrado

echo.
echo Esperando 3 segundos para liberar puertos...
timeout /t 3 /nobreak >nul

REM Verificacion final
netstat -ano 2>nul | findstr ":5070" 2>nul | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo Puerto 5070 - LIBRE
) else (
    echo ADVERTENCIA: Puerto 5070 aun ocupado - Puede fallar el inicio
)

netstat -ano 2>nul | findstr ":4200" 2>nul | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo Puerto 4200 - LIBRE
) else (
    echo ADVERTENCIA: Puerto 4200 aun ocupado - Puede fallar el inicio
)

echo.
echo ============================================
echo [PASO 1] Verificando directorios...
echo ============================================
timeout /t 1 >nul

if not exist "%ROOT_DIR%\Api.Roy" (
    echo ERROR: No se encuentra Api.Roy
    pause >nul
    exit /b 1
)

if not exist "%ROOT_DIR%\Web.Roy" (
    echo ERROR: No se encuentra Web.Roy
    pause >nul
    exit /b 1
)

echo Directorios OK
echo.

echo ============================================
echo [PASO 2] Verificando herramientas...
echo ============================================
timeout /t 1 >nul

where dotnet >nul 2>&1
if errorlevel 1 (
    echo ERROR: .NET SDK no instalado
    pause >nul
    exit /b 1
)
for /f "tokens=*" %%i in ('dotnet --version 2^>nul') do echo .NET SDK: %%i

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no instalado
    pause >nul
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version 2^>nul') do echo Node.js: %%i

echo.

echo ============================================
echo [PASO 3] Preparando Backend...
echo ============================================

cd /d "%ROOT_DIR%\Api.Roy"
echo Restaurando NuGet...
call dotnet restore >nul
if errorlevel 1 (
    echo ERROR: Fallo restore
    pause >nul
    exit /b 1
)

echo Compilando...
call dotnet build >nul
if errorlevel 1 (
    echo ERROR: Fallo compilacion
    pause >nul
    exit /b 1
)
echo Backend OK
echo.

echo ============================================
echo [PASO 4] Preparando Frontend...
echo ============================================

cd /d "%ROOT_DIR%\Web.Roy"

if not exist "node_modules" (
    echo Instalando npm...
    call npm install
    if errorlevel 1 (
        echo ERROR: Fallo npm install
        pause >nul
        exit /b 1
    )
)
echo Frontend OK
echo.

echo ============================================
echo [PASO 5] Creando scripts de inicio...
echo ============================================

set "BACKEND_SCRIPT=%TEMP%\toma-pedido-backend-start.bat"
set "FRONTEND_SCRIPT=%TEMP%\toma-pedido-frontend-start.bat"

REM Script Backend
(
    echo @echo off
    echo title Toma de Pedidos - Backend
    echo cd /d "%ROOT_DIR%\Api.Roy"
    echo echo.
    echo echo ============================================
    echo echo   BACKEND - Puerto 5070
    echo echo ============================================
    echo echo.
    echo echo HTTP:  http://localhost:5070
    echo echo HTTPS: https://localhost:7281
    echo echo Swagger: http://localhost:5070/swagger
    echo echo.
    echo dotnet run
) > "%BACKEND_SCRIPT%"

REM Script Frontend
(
    echo @echo off
    echo title Toma de Pedidos - Frontend
    echo cd /d "%ROOT_DIR%\Web.Roy"
    echo set NG_CLI_ANALYTICS=false
    echo echo.
    echo echo ============================================
    echo echo   FRONTEND - Puerto 4200
    echo echo ============================================
    echo echo.
    echo echo URL: http://localhost:4200
    echo echo.
    echo npm start
) > "%FRONTEND_SCRIPT%"

echo Scripts creados
echo.

echo ============================================
echo [PASO 6] Iniciando servicios...
echo ============================================
echo.

echo Iniciando Backend...
start "Toma de Pedidos - Backend" cmd /k "%BACKEND_SCRIPT%"

echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo Iniciando Frontend...
start "Toma de Pedidos - Frontend" cmd /k "%FRONTEND_SCRIPT%"

echo.
echo ============================================
echo   SERVICIOS INICIADOS
echo ============================================
echo.
echo Backend:  http://localhost:5070
echo Frontend: http://localhost:4200
echo Swagger:  http://localhost:5070/swagger
echo.
echo Se abrieron 2 ventanas (Backend y Frontend)
echo Para detener: Ctrl+C en cada ventana
echo.
echo ============================================
echo.
timeout /t 3 >nul

endlocal

@echo off
echo ========================================
echo   INICIANDO BACKEND Y FRONTEND
echo   Toma_Pedido - Nexwork ERP
echo ========================================
echo.

REM Cambiar al directorio raíz del proyecto
cd /d "%~dp0..\.."
echo 📂 Directorio de trabajo: %CD%
echo.

REM Matar procesos anteriores
echo [1/5] Cerrando procesos anteriores...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM dotnet.exe >nul 2>&1
echo    ^> Procesos anteriores cerrados

REM Esperar a que se liberen los puertos
echo [2/5] Esperando a que se liberen los puertos...
timeout /t 2 /nobreak > nul

REM Verificar que los puertos estén libres
echo [3/5] Verificando puertos...
netstat -ano | findstr :5070 | findstr LISTENING >nul
if %errorlevel%==0 (
    echo    ^> ADVERTENCIA: Puerto 5070 aun en uso. Intentando cerrar...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5070 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 1 /nobreak > nul
)

netstat -ano | findstr :4200 | findstr LISTENING >nul
if %errorlevel%==0 (
    echo    ^> ADVERTENCIA: Puerto 4200 aun en uso. Intentando cerrar...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4200 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 1 /nobreak > nul
)

echo    ^> Puertos listos

echo.
echo [4/5] Iniciando Backend API .NET (Puerto 5070)...
start "BACKEND API - Puerto 5070" cmd /k "cd /d "%CD%\Api.Roy" && dotnet run"

echo [5/5] Esperando 5 segundos antes de iniciar Frontend...
timeout /t 5 /nobreak > nul

echo [5/5] Iniciando Frontend Angular (Puerto 4200)...
set "NODE_PATH=C:\Program Files\nodejs"
set "PATH=%NODE_PATH%;%PATH%"
start "FRONTEND ANGULAR - Puerto 4200" cmd /k "set PATH=%NODE_PATH%;%PATH% && cd /d "%CD%\Web.Roy" && npm start"

echo.
echo ========================================
echo   ✅ SERVIDORES INICIADOS
echo ========================================
echo.
echo 🔧 Backend API:  http://localhost:5070
echo 🌐 Frontend:     http://localhost:4200
echo 📚 Swagger:      http://localhost:5070/swagger
echo.
echo 📝 Se abrieron 2 ventanas.
echo    Cierra las ventanas para detener los servicios.
echo.
timeout /t 3 /nobreak > nul


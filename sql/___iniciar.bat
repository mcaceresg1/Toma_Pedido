@echo off
setlocal enabledelayedexpansion
REM Evitar que el script se cierre por errores
set "ERROR_OCCURRED=0"

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

REM Obtener la ruta del directorio actual (sql/)
set "SCRIPT_DIR=%~dp0"

REM Ir al directorio raiz del proyecto (un nivel arriba)
cd /d "%SCRIPT_DIR%.."

REM Guardar ruta absoluta
set "ROOT_DIR=%CD%"

echo Directorio raiz: %ROOT_DIR%
echo.

REM ============================================
REM Funcion para cerrar procesos en un puerto
REM ============================================
echo Verificando y cerrando procesos en puertos...
timeout /t 1 >nul

echo Verificando procesos en puertos 5070 (Backend) y 4200 (Frontend)...
echo.

REM Cerrar procesos en puerto 5070 (Backend)
echo Verificando puerto 5070 (Backend)...
set PROCESOS_5070=0
set TEMP_FILE=%ROOT_DIR%\toma_pedido_pids_5070.txt

REM Ejecutar netstat y guardar en archivo temporal
netstat -ano > "%TEMP_FILE%" 2>nul

REM Verificar si el archivo se creo y tiene contenido
if exist %TEMP_FILE% (
    REM Filtrar solo las lineas del puerto 5070 en estado LISTENING
    findstr ":5070" "%TEMP_FILE%" | findstr "LISTENING" > "%TEMP_FILE%" 2>nul
    
    REM Si hay resultados, procesarlos
    if exist %TEMP_FILE% (
        REM Verificar si el archivo tiene contenido
        for %%F in ("%TEMP_FILE%") do set FILE_SIZE=%%~zF
        if "!FILE_SIZE!" GTR "0" (
            for /f "usebackq tokens=5" %%a in ("%TEMP_FILE%") do (
                set PID=%%a
                if not "!PID!"=="" (
                    set /a PROCESOS_5070+=1
                    echo Proceso encontrado en puerto 5070 - PID: !PID!
                    echo Cerrando proceso...
                    taskkill /F /PID !PID! >nul 2>&1
                    if errorlevel 1 (
                        echo Advertencia: No se pudo cerrar el proceso PID !PID!
                    ) else (
                        echo Proceso PID !PID! cerrado correctamente
                    )
                )
            )
        )
    )
    REM Limpiar archivo temporal
    if exist %TEMP_FILE% del "%TEMP_FILE%" >nul 2>&1
)

REM Verificar si hay procesos
set /a PROCESOS_5070_TEST=!PROCESOS_5070!
if !PROCESOS_5070_TEST! EQU 0 goto :sin_procesos_5070
goto :continuar_5070
:sin_procesos_5070
echo Puerto 5070 (Backend) - Sin procesos activos
:continuar_5070

REM Cerrar procesos en puerto 4200 (Frontend)
echo.
echo Verificando puerto 4200 (Frontend)...
set PROCESOS_4200=0
set TEMP_FILE2=%ROOT_DIR%\toma_pedido_pids_4200.txt

REM Ejecutar netstat y guardar en archivo temporal
netstat -ano > "%TEMP_FILE2%" 2>nul

REM Verificar si el archivo se creo y tiene contenido
if exist %TEMP_FILE2% (
    REM Filtrar solo las lineas del puerto 4200 en estado LISTENING
    findstr ":4200" "%TEMP_FILE2%" | findstr "LISTENING" > "%TEMP_FILE2%" 2>nul
    
    REM Si hay resultados, procesarlos
    if exist %TEMP_FILE2% (
        REM Verificar si el archivo tiene contenido
        for %%F in ("%TEMP_FILE2%") do set FILE_SIZE2=%%~zF
        if "!FILE_SIZE2!" GTR "0" (
            for /f "usebackq tokens=5" %%a in ("%TEMP_FILE2%") do (
                set PID=%%a
                if not "!PID!"=="" (
                    set /a PROCESOS_4200+=1
                    echo Proceso encontrado en puerto 4200 - PID: !PID!
                    echo Cerrando proceso...
                    taskkill /F /PID !PID! >nul 2>&1
                    if errorlevel 1 (
                        echo Advertencia: No se pudo cerrar el proceso PID !PID!
                    ) else (
                        echo Proceso PID !PID! cerrado correctamente
                    )
                )
            )
        )
    )
    REM Limpiar archivo temporal
    if exist %TEMP_FILE2% del "%TEMP_FILE2%" >nul 2>&1
)

REM Verificar si hay procesos
set /a PROCESOS_4200_TEST=!PROCESOS_4200!
if !PROCESOS_4200_TEST! EQU 0 goto :sin_procesos_4200
goto :continuar_4200
:sin_procesos_4200
echo Puerto 4200 (Frontend) - Sin procesos activos
:continuar_4200

REM Cerrar procesos relacionados que puedan estar bloqueando los puertos
echo.
echo Verificando procesos relacionados (ApiRoy.exe)...
REM Cerrar procesos ApiRoy.exe si existen (proceso compilado del backend)
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq ApiRoy.exe" 2^>nul ^| findstr /I "ApiRoy.exe" 2^>nul') do (
    set API_PID=%%~a
    if not "!API_PID!"=="" (
        echo Cerrando proceso ApiRoy.exe - PID: !API_PID!
        taskkill /F /PID !API_PID! >nul 2>&1
        if errorlevel 1 (
            echo Advertencia: No se pudo cerrar ApiRoy.exe PID !API_PID!
        ) else (
            echo ApiRoy.exe PID !API_PID! cerrado correctamente
        )
    )
)

REM Solo cerrar procesos node.exe que estén usando los puertos específicos
REM (no cerramos todos los node.exe para evitar afectar otros proyectos)
REM Los procesos node.exe que usan los puertos ya fueron cerrados arriba

REM Solo cerrar procesos dotnet.exe que estén usando los puertos específicos
REM (no cerramos todos los dotnet.exe para evitar afectar otros proyectos)
REM Los procesos dotnet.exe que usan los puertos ya fueron cerrados arriba

echo.
echo Esperando 3 segundos para que los puertos se liberen completamente...
timeout /t 3 /nobreak >nul

REM Verificar que los puertos estén realmente libres
set PUERTO_5070_LIBRE=1
set PUERTO_4200_LIBRE=1
netstat -ano 2>nul | findstr :5070 2>nul | findstr LISTENING >nul 2>&1
if not errorlevel 1 set PUERTO_5070_LIBRE=0
netstat -ano 2>nul | findstr :4200 2>nul | findstr LISTENING >nul 2>&1
if not errorlevel 1 set PUERTO_4200_LIBRE=0

set /a PUERTO_5070_TEST=!PUERTO_5070_LIBRE!
if !PUERTO_5070_TEST! EQU 1 goto :puerto_5070_libre
goto :puerto_5070_ocupado
:puerto_5070_libre
echo Puerto 5070 (Backend) - Libre
goto :continuar_puerto_5070
:puerto_5070_ocupado
echo Advertencia: Puerto 5070 (Backend) aun en uso
:continuar_puerto_5070

set /a PUERTO_4200_TEST=!PUERTO_4200_LIBRE!
if !PUERTO_4200_TEST! EQU 1 goto :puerto_4200_libre
goto :puerto_4200_ocupado
:puerto_4200_libre
echo Puerto 4200 (Frontend) - Libre
goto :continuar_puerto_4200
:puerto_4200_ocupado
echo Advertencia: Puerto 4200 (Frontend) aun en uso
:continuar_puerto_4200

echo Puertos verificados
echo.

REM Mensaje de continuacion
echo Continuando con la verificacion de directorios...
echo.

echo [PASO 1] Verificando directorios...
timeout /t 1 >nul

REM Verificar que existen los directorios
if not exist "%ROOT_DIR%\Api.Roy" (
    echo ERROR: No se encuentra el directorio Api.Roy
    echo Ruta esperada: %ROOT_DIR%\Api.Roy
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

if not exist "%ROOT_DIR%\Web.Roy" (
    echo ERROR: No se encuentra el directorio Web.Roy
    echo Ruta esperada: %ROOT_DIR%\Web.Roy
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo Directorios encontrados correctamente
echo.
echo [PASO 2] Verificando herramientas...
timeout /t 1 >nul

echo Verificando que dotnet este instalado...
where dotnet >nul 2>&1
if errorlevel 1 (
    echo ERROR: .NET SDK no esta instalado o no esta en el PATH
    echo Por favor instala .NET 6.0 o 8.0 SDK
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%i in ('dotnet --version 2^>nul') do set DOTNET_VERSION=%%i
echo .NET SDK encontrado: !DOTNET_VERSION!

echo.
echo Verificando que Node.js este instalado...
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado o no esta en el PATH
    echo Por favor instala Node.js
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo Node.js encontrado: !NODE_VERSION!

echo.
echo [PASO 3] Preparando Backend (Api.Roy)...
timeout /t 1 >nul

echo ============================================
echo   Preparando Backend (Api.Roy)...
echo ============================================
echo.

cd /d "%ROOT_DIR%\Api.Roy"
if errorlevel 1 (
    echo ERROR: No se pudo cambiar al directorio Api.Roy
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo Restaurando paquetes NuGet...
call dotnet restore
if errorlevel 1 (
    echo ERROR: Fallo al restaurar paquetes NuGet
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)
echo Paquetes NuGet restaurados correctamente

echo.
echo Compilando proyecto backend...
call dotnet build
if errorlevel 1 (
    echo ERROR: Fallo al compilar el proyecto backend
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)
echo Backend compilado correctamente

echo.
echo [PASO 4] Backend preparado. Preparando Frontend (Web.Roy)...
timeout /t 1 >nul

echo ============================================
echo   Preparando Frontend (Web.Roy)...
echo ============================================
echo.

echo Cambiando al directorio Frontend: %ROOT_DIR%\Web.Roy
cd /d "%ROOT_DIR%\Web.Roy"
if errorlevel 1 (
    echo ERROR: No se pudo cambiar al directorio Web.Roy
    echo Ruta intentada: %ROOT_DIR%\Web.Roy
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo Directorio actual: %CD%
echo.

REM Verificar que existe package.json
if not exist "package.json" (
    echo ERROR: No se encuentra package.json en Web.Roy
    echo Ruta esperada: %CD%\package.json
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)
echo package.json encontrado

echo.
REM Verificar si node_modules existe
if not exist "node_modules" (
    echo node_modules no existe. Instalando dependencias npm...
    echo Esto puede tardar varios minutos...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Fallo al instalar dependencias npm
        echo Revisa los mensajes de error arriba
        echo.
        echo Presiona cualquier tecla para salir...
        pause >nul
        exit /b 1
    )
    echo.
    echo Dependencias instaladas correctamente
) else (
    echo node_modules existe. Dependencias npm ya instaladas
    echo Verificando que npm este funcionando...
    call npm --version >nul 2>&1
    if errorlevel 1 (
        echo ERROR: npm no esta funcionando correctamente
        echo.
        echo Presiona cualquier tecla para salir...
        pause >nul
        exit /b 1
    )
    for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
    echo npm version: !NPM_VERSION!
)

echo.
echo [PASO 5] Frontend preparado. Creando scripts de inicio...
timeout /t 1 >nul

echo ============================================
echo   Iniciando Servicios...
echo ============================================
echo.

REM Crear scripts temporales para iniciar los servicios
set "BACKEND_SCRIPT=%TEMP%\toma-pedido-backend-start.bat"
set "FRONTEND_SCRIPT=%TEMP%\toma-pedido-frontend-start.bat"

echo Creando script para Backend...
REM Crear script para backend
(
    echo @echo off
    echo title Toma de Pedidos - Backend
    echo cd /d "%ROOT_DIR%\Api.Roy"
    echo echo.
    echo echo ============================================
    echo echo   TOMA DE PEDIDOS - BACKEND
    echo echo ============================================
    echo echo.
    echo echo Servidor disponible en:
    echo echo   - HTTP:  http://localhost:5070
    echo echo   - HTTPS: https://localhost:7281
    echo echo.
    echo echo Swagger: http://localhost:5070/swagger
    echo echo API Health: http://localhost:5070/health
    echo echo.
    echo echo Presiona Ctrl+C para detener el servidor
    echo echo.
    echo echo ============================================
    echo echo.
    echo dotnet run
    echo echo.
    echo Servidor detenido. Presiona cualquier tecla para cerrar...
    echo pause ^>nul
) > "%BACKEND_SCRIPT%"

if not exist "%BACKEND_SCRIPT%" (
    echo ERROR: No se pudo crear el script de Backend
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)
echo Script de Backend creado: %BACKEND_SCRIPT%

echo.
echo Creando script para Frontend...
REM Crear script para frontend
(
    echo @echo off
    echo title Toma de Pedidos - Frontend
    echo cd /d "%ROOT_DIR%\Web.Roy"
    echo set NG_CLI_ANALYTICS=false
    echo echo.
    echo echo ============================================
    echo echo   TOMA DE PEDIDOS - FRONTEND
    echo echo ============================================
    echo echo.
    echo echo Servidor de desarrollo disponible en:
    echo echo   - URL: http://localhost:4200
    echo echo.
    echo echo Presiona Ctrl+C para detener el servidor
    echo echo.
    echo echo ============================================
    echo echo.
    echo echo Iniciando servidor Angular...
    echo echo.
    echo call npm start
    echo echo.
    echo Servidor detenido. Presiona cualquier tecla para cerrar...
    echo pause ^>nul
) > "%FRONTEND_SCRIPT%"

if not exist "%FRONTEND_SCRIPT%" (
    echo ERROR: No se pudo crear el script de Frontend
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)
echo Script de Frontend creado: %FRONTEND_SCRIPT%

echo.
echo [PASO 6] Scripts creados. Iniciando servicios...
timeout /t 1 >nul

REM Iniciar Backend en una nueva ventana
echo Iniciando Backend en nueva ventana...
start "Toma de Pedidos - Backend" cmd /k ""%BACKEND_SCRIPT%""
if errorlevel 1 (
    echo ERROR: No se pudo iniciar el Backend
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)
echo Backend iniciado

REM Esperar un poco para que el backend inicie
echo Esperando 5 segundos antes de iniciar Frontend...
timeout /t 5 /nobreak >nul

REM Iniciar Frontend en una nueva ventana
echo Iniciando Frontend en nueva ventana...
start "Toma de Pedidos - Frontend" cmd /k ""%FRONTEND_SCRIPT%""
if errorlevel 1 (
    echo ERROR: No se pudo iniciar el Frontend
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)
echo Frontend iniciado

echo.
echo [PASO 7] Servicios iniciados. Resumen final...
timeout /t 1 >nul

echo ============================================
echo   Servicios Iniciados
echo ============================================
echo.
echo Backend:  http://localhost:5070
echo Frontend: http://localhost:4200
echo Swagger:  http://localhost:5070/swagger
echo Health:   http://localhost:5070/health
echo.
echo Se han abierto dos ventanas de consola:
echo   - Una para el Backend (.NET - Api.Roy)
echo   - Una para el Frontend (Angular - Web.Roy)
echo.
echo Para detener los servicios, cierra las ventanas
echo o presiona Ctrl+C en cada una de ellas.
echo.
echo Este script puede cerrarse ahora.
echo Las ventanas de los servicios continuaran ejecutandose.
echo.
echo ============================================
echo.
echo Presiona cualquier tecla para cerrar este script...
timeout /t 3 >nul

endlocal


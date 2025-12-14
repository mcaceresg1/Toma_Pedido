@echo off
REM =============================================
REM SCRIPT: EJECUTAR TODOS LOS STORED PROCEDURES
REM PROYECTO: Toma Pedido
REM FECHA: 14/12/2025
REM =============================================
REM 
REM Este script ejecuta todos los SPs corregidos en las bases de datos correctas:
REM - BD LOGIN (ROE000): SPs de configuración (usuarios, empresas)
REM - BD DATOS (ROE001): SPs de operaciones (pedidos, clientes, productos, etc.)
REM
REM INSTRUCCIONES:
REM 1. Ejecutar este script desde la carpeta sql
REM 2. Asegurarse de tener permisos en SQL Server
REM 3. Verificar que todos los SPs se crean exitosamente
REM =============================================

setlocal enabledelayedexpansion

REM Configuración de conexión
set SERVER=161.132.56.68
set USER=sa
set PASSWORD=12335599
set DB_LOGIN=BK00
set DB_DATA=BK01

echo =========================================
echo EJECUTANDO SPs EN BD LOGIN (%DB_LOGIN%)
echo =========================================
echo.

REM =============================================
REM SPs en BD LOGIN (ROE000)
REM =============================================

echo Ejecutando: 0USP_EMPRESA.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_LOGIN% -i "0USP_EMPRESA.sql" -b
if errorlevel 1 (
    echo   [ERROR] 0USP_EMPRESA.sql
) else (
    echo   [OK] 0USP_EMPRESA.sql
)

echo Ejecutando: 0USP_USUARIO.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_LOGIN% -i "0USP_USUARIO.sql" -b
if errorlevel 1 (
    echo   [ERROR] 0USP_USUARIO.sql
) else (
    echo   [OK] 0USP_USUARIO.sql
)

echo Ejecutando: 0USP_SESION_USUARIO.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_LOGIN% -i "0USP_SESION_USUARIO.sql" -b
if errorlevel 1 (
    echo   [ERROR] 0USP_SESION_USUARIO.sql
) else (
    echo   [OK] 0USP_SESION_USUARIO.sql
)

echo.
echo =========================================
echo EJECUTANDO SPs EN BD DATOS (%DB_DATA%)
echo =========================================
echo.

REM =============================================
REM SPs en BD DATOS (ROE001)
REM =============================================

echo Ejecutando: 1USP_CREAR_CLIENTE.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_CREAR_CLIENTE.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_CREAR_CLIENTE.sql
) else (
    echo   [OK] 1USP_CREAR_CLIENTE.sql
)

echo Ejecutando: 1USP_SESION_CLIENTES.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_SESION_CLIENTES.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_SESION_CLIENTES.sql
) else (
    echo   [OK] 1USP_SESION_CLIENTES.sql
)

echo Ejecutando: 1USP_CONSULTA_PEDIDOS.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_CONSULTA_PEDIDOS.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_CONSULTA_PEDIDOS.sql
) else (
    echo   [OK] 1USP_CONSULTA_PEDIDOS.sql
)

echo Ejecutando: 1USP_CONSULTA_PEDIDO.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_CONSULTA_PEDIDO.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_CONSULTA_PEDIDO.sql
) else (
    echo   [OK] 1USP_CONSULTA_PEDIDO.sql
)

echo Ejecutando: 1USP_CONSULTA_PRODUCTOS_PEDIDO.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_CONSULTA_PRODUCTOS_PEDIDO.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_CONSULTA_PRODUCTOS_PEDIDO.sql
) else (
    echo   [OK] 1USP_CONSULTA_PRODUCTOS_PEDIDO.sql
)

echo Ejecutando: 1USP_CONDICION.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_CONDICION.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_CONDICION.sql
) else (
    echo   [OK] 1USP_CONDICION.sql
)

echo Ejecutando: 1USP_STOCK_PRODUCTOS.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_STOCK_PRODUCTOS.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_STOCK_PRODUCTOS.sql
) else (
    echo   [OK] 1USP_STOCK_PRODUCTOS.sql
)

echo Ejecutando: 1USP_SESION_DOCUMENTOS.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_SESION_DOCUMENTOS.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_SESION_DOCUMENTOS.sql
) else (
    echo   [OK] 1USP_SESION_DOCUMENTOS.sql
)

echo Ejecutando: 1USP_CONSULTA_UBIGEO.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_CONSULTA_UBIGEO.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_CONSULTA_UBIGEO.sql
) else (
    echo   [OK] 1USP_CONSULTA_UBIGEO.sql
)

echo Ejecutando: 1USP_GET_REPORTE_CLIENTE.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_GET_REPORTE_CLIENTE.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_GET_REPORTE_CLIENTE.sql
) else (
    echo   [OK] 1USP_GET_REPORTE_CLIENTE.sql
)

echo Ejecutando: 1USP_GET_REPORTE_PROVEEDOR.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_GET_REPORTE_PROVEEDOR.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_GET_REPORTE_PROVEEDOR.sql
) else (
    echo   [OK] 1USP_GET_REPORTE_PROVEEDOR.sql
)

echo Ejecutando: 1USP_GET_REPORTE_PRODUCTO.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "1USP_GET_REPORTE_PRODUCTO.sql" -b
if errorlevel 1 (
    echo   [ERROR] 1USP_GET_REPORTE_PRODUCTO.sql
) else (
    echo   [OK] 1USP_GET_REPORTE_PRODUCTO.sql
)

echo Ejecutando: SP_PRODUCTOS.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "SP_PRODUCTOS.sql" -b
if errorlevel 1 (
    echo   [ERROR] SP_PRODUCTOS.sql
) else (
    echo   [OK] SP_PRODUCTOS.sql
)

echo Ejecutando: 0USP_SESION_MONEDAS.sql...
sqlcmd -S %SERVER% -U %USER% -P %PASSWORD% -d %DB_DATA% -i "0USP_SESION_MONEDAS.sql" -b
if errorlevel 1 (
    echo   [ERROR] 0USP_SESION_MONEDAS.sql
) else (
    echo   [OK] 0USP_SESION_MONEDAS.sql
)

echo.
echo =========================================
echo PROCESO COMPLETADO
echo =========================================
echo.

pause


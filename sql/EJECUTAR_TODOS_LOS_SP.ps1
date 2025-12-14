# =============================================
# SCRIPT: EJECUTAR TODOS LOS STORED PROCEDURES
# PROYECTO: Toma Pedido
# FECHA: 14/12/2025
# =============================================
# 
# Este script ejecuta todos los SPs corregidos en las bases de datos correctas:
# - BD LOGIN (ROE000): SPs de configuración (usuarios, empresas)
# - BD DATOS (ROE001): SPs de operaciones (pedidos, clientes, productos, etc.)
#
# INSTRUCCIONES:
# 1. Ejecutar este script en PowerShell como Administrador
# 2. Asegurarse de tener permisos en SQL Server
# 3. Verificar que todos los SPs se crean exitosamente
# =============================================

$ErrorActionPreference = "Stop"

# Configuración de conexión
$Server = "161.132.56.68"
$User = "sa"
$Password = "12335599"
$DbLogin = "ROE00"
$DbData = "ROE01"

# Obtener la ruta del script actual
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScriptDir = $ScriptDir -replace '\\', '\'

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "EJECUTANDO SPs EN BD LOGIN ($DbLogin)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# =============================================
# SPs en BD LOGIN (ROE000)
# =============================================

$spLogin = @(
    "0USP_EMPRESA.sql",
    "0USP_USUARIO.sql",
    "0USP_SESION_USUARIO.sql"
)

foreach ($sp in $spLogin) {
    $spPath = Join-Path $ScriptDir $sp
    if (Test-Path $spPath) {
        Write-Host "Ejecutando: $sp..." -ForegroundColor Yellow
        try {
            $sqlcmd = "sqlcmd -S $Server -U $User -P $Password -d $DbLogin -i `"$spPath`" -b"
            Invoke-Expression $sqlcmd
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ $sp ejecutado correctamente" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Error al ejecutar $sp (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
            }
        } catch {
            Write-Host "  ✗ Error al ejecutar $sp : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ Archivo no encontrado: $sp" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "EJECUTANDO SPs EN BD DATOS ($DbData)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# =============================================
# SPs en BD DATOS (ROE001)
# =============================================

$spData = @(
    "1USP_CREAR_CLIENTE.sql",
    "1USP_SESION_CLIENTES.sql",
    "1USP_CONSULTA_PEDIDOS.sql",
    "1USP_CONSULTA_PEDIDO.sql",
    "1USP_CONSULTA_PRODUCTOS_PEDIDO.sql",
    "1USP_CONDICION.sql",
    "1USP_STOCK_PRODUCTOS.sql",
    "1USP_SESION_DOCUMENTOS.sql",
    "1USP_CONSULTA_UBIGEO.sql",
    "1USP_GET_REPORTE_CLIENTE.sql",
    "1USP_GET_REPORTE_PROVEEDOR.sql",
    "1USP_GET_REPORTE_PRODUCTO.sql",
    "SP_PRODUCTOS.sql",
    "0USP_SESION_MONEDAS.sql"
)

foreach ($sp in $spData) {
    $spPath = Join-Path $ScriptDir $sp
    if (Test-Path $spPath) {
        Write-Host "Ejecutando: $sp..." -ForegroundColor Yellow
        try {
            $sqlcmd = "sqlcmd -S $Server -U $User -P $Password -d $DbData -i `"$spPath`" -b"
            Invoke-Expression $sqlcmd
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ $sp ejecutado correctamente" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Error al ejecutar $sp (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
            }
        } catch {
            Write-Host "  ✗ Error al ejecutar $sp : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ Archivo no encontrado: $sp" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PROCESO COMPLETADO" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""


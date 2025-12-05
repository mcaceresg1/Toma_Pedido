-- =============================================
-- SCRIPT DE ACTUALIZACIÓN DE STORED PROCEDURES
-- BASE DE DATOS: ROE001 (3 ceros)
-- PROYECTO: Toma de Pedidos
-- =============================================
--
-- DESCRIPCIÓN: Este script ELIMINA los SPs antiguos con nombres incorrectos
--              y los reemplaza con las versiones correctas
--
-- EJECUTAR EN: Base de datos ROE001
-- =============================================

USE ROE01;
GO

PRINT '=============================================';
PRINT 'ACTUALIZANDO STORED PROCEDURES';
PRINT 'Eliminando versiones antiguas...';
PRINT '=============================================';
PRINT '';

-- =============================================
-- PASO 1: ELIMINAR SPs ANTIGUOS/INCORRECTOS
-- =============================================

PRINT 'PASO 1: Eliminando SPs antiguos...';
PRINT '';

-- SPs de Zonas (versiones antiguas que pueden usar tabla incorrecta)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_GetAll]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[NX_Zona_GetAll];
    PRINT '  ✓ NX_Zona_GetAll eliminado';
END

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_GetById]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[NX_Zona_GetById];
    PRINT '  ✓ NX_Zona_GetById eliminado';
END

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_InsertUpdate]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[NX_Zona_InsertUpdate];
    PRINT '  ✓ NX_Zona_InsertUpdate eliminado';
END

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_Delete]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[NX_Zona_Delete];
    PRINT '  ✓ NX_Zona_Delete eliminado';
END

-- SPs de Ubigeos
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Ubigeo_GetAll]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[NX_Ubigeo_GetAll];
    PRINT '  ✓ NX_Ubigeo_GetAll eliminado';
END

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Ubigeo_GetByZona]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[NX_Ubigeo_GetByZona];
    PRINT '  ✓ NX_Ubigeo_GetByZona eliminado';
END

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Ubigeo_SetByZona]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[NX_Ubigeo_SetByZona];
    PRINT '  ✓ NX_Ubigeo_SetByZona eliminado';
END

-- SPs de Pedidos por Zona
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA];
    PRINT '  ✓ SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA eliminado';
END

PRINT '';
PRINT 'SPs antiguos eliminados exitosamente';
PRINT '';
PRINT '=============================================';
PRINT 'PASO 2: EJECUTAR SCRIPT MAESTRO';
PRINT '=============================================';
PRINT '';
PRINT 'AHORA debes ejecutar los siguientes scripts EN ORDEN:';
PRINT '';
PRINT '1. NX_00_SCRIPT_MAESTRO_ZONAS_UBIGEOS.sql';
PRINT '   (Crea tabla CUE010, columna ZONA, y 7 SPs de Zonas/Ubigeos)';
PRINT '';
PRINT '2. SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA.sql';
PRINT '   (Crea SP para pedidos por zona)';
PRINT '';
PRINT '=============================================';
PRINT 'Limpieza completada. Continúa con los scripts.';
PRINT '=============================================';
GO

-- =============================================
-- ACTUALIZAR SPs - AMBIENTE PRODUCCIÓN
-- BASE DE DATOS: ROE01 (2 ceros - producción)
-- =============================================

USE ROE01;
GO

PRINT '=============================================';
PRINT 'PRODUCCIÓN - Actualizando SPs en ROE01';
PRINT '=============================================';
PRINT '';

-- Eliminar SPs antiguos
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_GetAll]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Zona_GetAll];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_GetById]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Zona_GetById];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_InsertUpdate]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Zona_InsertUpdate];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_Delete]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Zona_Delete];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Ubigeo_GetAll]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Ubigeo_GetAll];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Ubigeo_GetByZona]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Ubigeo_GetByZona];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Ubigeo_SetByZona]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Ubigeo_SetByZona];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA];

PRINT 'SPs antiguos eliminados';
PRINT '';
PRINT 'AHORA ejecuta:';
PRINT '1. NX_00_SCRIPT_MAESTRO_ZONAS_UBIGEOS.sql (ya está en ROE01)';
PRINT '2. SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA.sql (ya está en ROE01)';
GO

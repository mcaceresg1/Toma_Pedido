-- =============================================
-- ACTUALIZAR SPs - AMBIENTE DESARROLLO
-- BASE DE DATOS: ROE001 (3 ceros - desarrollo)
-- =============================================

USE ROE001;
GO

PRINT '=============================================';
PRINT 'DESARROLLO - Actualizando SPs en ROE001';
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
PRINT '1. NX_00_SCRIPT_MAESTRO_ZONAS_UBIGEOS.sql (cambiar USE a ROE001)';
PRINT '2. SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA.sql (cambiar USE a ROE001)';
GO

-- =============================================
-- STORED PROCEDURE: USP_SESION_DOCUMENTOS (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLA: CUE008 (BD de datos)
-- FECHA MODIFICACIÓN: 13/12/2025 21:00:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene lista de documentos/tipos de documento
--              ELIMINADOS los IF hardcodeados que usaban ROE00, ROE01, ROE02
--              ELIMINADA la consulta a SUP001 (ya no es necesaria)
--              Ahora usa la BD actual para CUE008 directamente
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita los documentos (mantenido por compatibilidad, no se usa)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para CUE008 (tipos de documento)
--       Ya no consulta SUP001 ni necesita @BD_LOGIN porque solo consulta CUE008 de la BD actual
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_SESION_DOCUMENTOS]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_SESION_DOCUMENTOS];
GO

CREATE PROCEDURE [dbo].[USP_SESION_DOCUMENTOS]     
    @USUARIO VARCHAR(20)
-- =============================================
-- STORED PROCEDURE: USP_SESION_DOCUMENTOS (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLA: CUE008 (BD de datos)
-- FECHA MODIFICACIÓN: 13/12/2025 21:00:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene lista de documentos/tipos de documento
--              ELIMINADOS los IF hardcodeados que usaban ROE00, ROE01, ROE02
--              ELIMINADA la consulta a SUP001 (ya no es necesaria)
--              Ahora usa la BD actual para CUE008 directamente
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita los documentos (mantenido por compatibilidad, no se usa)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para CUE008 (tipos de documento)
--       Ya no consulta SUP001 ni necesita @BD_LOGIN porque solo consulta CUE008 de la BD actual
-- =============================================
AS      
BEGIN
    SET NOCOUNT ON;
    
    -- Ya no hay IF por empresa, usa directamente la BD actual donde está el SP
    -- CUE008 está en la BD de datos (donde se ejecuta el SP)
    SELECT 
        ROW_NUMBER() OVER (ORDER BY TIPO ASC) AS ID, 
        TIPO, 
        DESCRIPCION 
    FROM dbo.CUE008;
END;
GO

PRINT 'Stored procedure USP_SESION_DOCUMENTOS creado exitosamente.';
GO


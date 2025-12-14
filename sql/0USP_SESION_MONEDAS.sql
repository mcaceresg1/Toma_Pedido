USE BK00
-- =============================================
-- STORED PROCEDURE: USP_SESION_MONEDAS (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: LOGIN (debe crearse en BK01, ROE01, etc.)
-- TABLA: GLO002 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 21:05:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene lista de monedas
--              ELIMINADO el hardcode ROE00.DBO.GLO002
--              Ahora usa @BD_LOGIN como parámetro para consultar GLO002 dinámicamente
--
-- Parámetros:
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       GLO002 (tabla de monedas) está en la BD de login
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_SESION_MONEDAS]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_SESION_MONEDAS];
GO

CREATE PROCEDURE [dbo].[USP_SESION_MONEDAS]
    @BD_LOGIN VARCHAR(50)
-- =============================================
-- STORED PROCEDURE: USP_SESION_MONEDAS (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLA: GLO002 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 21:05:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene lista de monedas
--              ELIMINADO el hardcode ROE00.DBO.GLO002
--              Ahora usa @BD_LOGIN como parámetro para consultar GLO002 dinámicamente
--
-- Parámetros:
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       GLO002 (tabla de monedas) está en la BD de login
-- =============================================
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Sql NVARCHAR(MAX);
    
    -- Construir el query dinámico para usar @BD_LOGIN en lugar de ROE00 hardcodeado
    SET @Sql = N'
        SELECT 
            CODIGO AS NUM_ITEM, 
            DESCRIPCION AS DES_ITEM, 
            SIMBOLO AS ABR_ITEM 
        FROM [' + @BD_LOGIN + '].dbo.GLO002';
    
    EXEC sp_executesql @Sql;
END;
GO

PRINT 'Stored procedure USP_SESION_MONEDAS creado exitosamente.';
GO


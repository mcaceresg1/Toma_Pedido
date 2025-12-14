USE BK00
-- =============================================
-- STORED PROCEDURE: USP_USUARIO (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: LOGIN (debe crearse en BK00, ROE00, etc.)
-- TABLA: SUP001 (BD de login)
-- FECHA MODIFICACIÓN: 14/12/2025 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene información del usuario
--              ELIMINADO el hardcode ROE00.DBO.SUP001
--              Ahora usa @BD_LOGIN como parámetro para consultar SUP001 dinámicamente
--
-- Parámetros:
--   @USER VARCHAR(20) - Alias del usuario
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en la base de datos de LOGIN (BK00, ROE00, etc.)
--       Consulta SUP001 que está en la BD de login
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_USUARIO]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_USUARIO];
GO

CREATE PROCEDURE [dbo].[USP_USUARIO] 
    @USER VARCHAR(20),
    @BD_LOGIN VARCHAR(50)
-- =============================================
-- STORED PROCEDURE: USP_USUARIO (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: LOGIN (debe crearse en BK00, ROE00, etc.)
-- TABLA: SUP001 (BD de login)
-- FECHA MODIFICACIÓN: 14/12/2025 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene información del usuario
--              ELIMINADO el hardcode ROE00.DBO.SUP001
--              Ahora usa @BD_LOGIN como parámetro para consultar SUP001 dinámicamente
--
-- Parámetros:
--   @USER VARCHAR(20) - Alias del usuario
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en la base de datos de LOGIN (BK00, ROE00, etc.)
--       Consulta SUP001 que está en la BD de login
-- =============================================
AS      
BEGIN      
    SET NOCOUNT ON;
    
    DECLARE @Sql NVARCHAR(MAX);
    
    -- Construir el query dinámico para usar @BD_LOGIN en lugar de ROE00 hardcodeado
    SET @Sql = N'
        SELECT 
            IDREGISTRO, 
            VENDEDOR, 
            NOMBRE, 
            EMPRESAS, 
            EMPRESA_DEFECTO, 
            PUEDE_CAMBIAR_PRECIO_FACTURACION, 
            OPERACIONES_ESPECIALES, 
            PRECIO_PERMITIDOS, 
            ALIAS 
        FROM [' + @BD_LOGIN + '].dbo.SUP001 
        WHERE ALIAS = @USER_IN';
    
    DECLARE @Params NVARCHAR(MAX) = N'@USER_IN VARCHAR(20)';
    EXEC sp_executesql @Sql, @Params, @USER_IN = @USER;
END;
GO

PRINT 'Stored procedure USP_USUARIO creado exitosamente.';
GO


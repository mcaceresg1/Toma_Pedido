-- =============================================
-- STORED PROCEDURE: USP_SESION_CLIENTES (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLA: CUE001
-- FECHA MODIFICACIÓN: 13/12/2025 20:30:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene lista de clientes para un usuario
--              ELIMINADOS los IF hardcodeados que usaban ROE00, ROE01, ROE02
--              Ahora usa la BD actual y recibe la BD de login como parámetro
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita los clientes
--   @CRITERIO VARCHAR(100) - Criterio de búsqueda (opcional)
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Obtiene el vendedor del usuario desde @BD_LOGIN.SUP001
--       Filtra los clientes por el vendedor del usuario en la BD actual
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_SESION_CLIENTES]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_SESION_CLIENTES];
GO

CREATE PROCEDURE [dbo].[USP_SESION_CLIENTES]     
    @USUARIO VARCHAR(20),
    @CRITERIO VARCHAR(100) = '',
    @BD_LOGIN VARCHAR(50)
-- =============================================
-- STORED PROCEDURE: USP_SESION_CLIENTES (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLA: CUE001
-- FECHA MODIFICACIÓN: 13/12/2025 20:30:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene lista de clientes para un usuario
--              ELIMINADOS los IF hardcodeados que usaban ROE00, ROE01, ROE02
--              Ahora usa la BD actual y recibe la BD de login como parámetro
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita los clientes
--   @CRITERIO VARCHAR(100) - Criterio de búsqueda (opcional)
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Obtiene el vendedor del usuario desde @BD_LOGIN.SUP001
--       Filtra los clientes por el vendedor del usuario en la BD actual
-- =============================================
AS      
BEGIN  
    SET NOCOUNT ON;
    
    DECLARE @IDVENDEDOR NUMERIC(5,0);
    
    -- Obtener el vendedor desde la BD de login (recibida como parámetro)
    DECLARE @Sql NVARCHAR(MAX);
    SET @Sql = N'
        SELECT @IDVENDEDOR_OUT = VENDEDOR 
        FROM [' + @BD_LOGIN + '].dbo.SUP001 
        WHERE ALIAS = @USUARIO_IN';
    
    DECLARE @Params NVARCHAR(MAX) = N'@USUARIO_IN VARCHAR(20), @IDVENDEDOR_OUT NUMERIC(5,0) OUTPUT';
    EXEC sp_executesql @Sql, @Params, @USUARIO_IN = @USUARIO, @IDVENDEDOR_OUT = @IDVENDEDOR OUTPUT;
    
    -- Si no se encontró el vendedor, usar 0 como default
    IF @IDVENDEDOR IS NULL
        SET @IDVENDEDOR = 0;
    
    -- Filtrar clientes en la BD actual por vendedor
    SELECT 
        RUC, 
        CONCAT(RUC, ' | ', RAZON) AS DESCRIPCION, 
        IDVENDEDOR, 
        PRECIO 
    FROM dbo.CUE001 
    WHERE IDVENDEDOR = @IDVENDEDOR 
        AND ACTIVO = 1 
        AND CLASE LIKE 'C' 
        AND (RAZON LIKE '%' + @CRITERIO + '%' OR RUC LIKE '%' + @CRITERIO + '%');
END;
GO

PRINT 'Stored procedure USP_SESION_CLIENTES creado exitosamente.';
GO
USE BK01
-- =============================================
-- STORED PROCEDURE: USP_CONSULTA_PRODUCTOS_PEDIDO (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: PED008, PED009, INV005, INV001 (BD de datos), SUP001 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 20:35:00 - Sistema
-- =============================================
-- 
-- Descripción: Consulta los productos de un pedido específico
--              ELIMINADOS los IF hardcodeados que usaban ROE01, ROE02
--              Ahora usa la BD actual y recibe la BD de login como parámetro
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita los productos
--   @OPERACION CHAR(7) - Número de operación del pedido
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para PED008, PED009, INV005, INV001
--       Usa @BD_LOGIN para SUP001 (validación de usuario)
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_CONSULTA_PRODUCTOS_PEDIDO]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_CONSULTA_PRODUCTOS_PEDIDO];
GO

CREATE PROCEDURE [dbo].[USP_CONSULTA_PRODUCTOS_PEDIDO]    
    @USUARIO VARCHAR(20)='',    
    @OPERACION CHAR(7),
    @BD_LOGIN VARCHAR(50)
-- =============================================
-- STORED PROCEDURE: USP_CONSULTA_PRODUCTOS_PEDIDO (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: PED008, PED009, INV005, INV001 (BD de datos), SUP001 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 20:35:00 - Sistema
-- =============================================
-- 
-- Descripción: Consulta los productos de un pedido específico
--              ELIMINADOS los IF hardcodeados que usaban ROE01, ROE02
--              Ahora usa la BD actual y recibe la BD de login como parámetro
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita los productos
--   @OPERACION CHAR(7) - Número de operación del pedido
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para PED008, PED009, INV005, INV001
--       Usa @BD_LOGIN para SUP001 (validación de usuario)
-- =============================================
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @IDVENDEDOR NUMERIC(5,0);
    DECLARE @VALIDO BIT;
    
    -- Obtener información del usuario desde la BD de login
    DECLARE @Sql NVARCHAR(MAX);
    SET @Sql = N'
        SELECT @IDVENDEDOR_OUT = VENDEDOR 
        FROM [' + @BD_LOGIN + '].dbo.SUP001 
        WHERE ALIAS LIKE @USUARIO_IN';
    
    DECLARE @Params NVARCHAR(MAX) = N'@USUARIO_IN VARCHAR(20), @IDVENDEDOR_OUT NUMERIC(5,0) OUTPUT';
    EXEC sp_executesql @Sql, @Params, @USUARIO_IN = @USUARIO, @IDVENDEDOR_OUT = @IDVENDEDOR OUTPUT;
    
    -- Validar que el usuario tenga acceso al pedido (en la BD actual)
    SET @VALIDO = CASE 
        WHEN EXISTS (SELECT 1 FROM dbo.PED009 WHERE USUARIO = @USUARIO AND OPERACION = @OPERACION) 
        THEN 1 
        ELSE 0 
    END;
    
    -- Ya no hay IF por empresa, usa directamente la BD actual (donde está el SP)
    IF @VALIDO = 1
    BEGIN
        SELECT 
            P.IDPRODUCTO, 
            PD.CODIGO_BARRA, 
            CANTIDAD, 
            P.PRECIO, 
            P.IMPUESTO, 
            P.MONTO, 
            P.BASE, 
            'UND' AS TIPO, 
            A.DESCRIPCION AS ALMACEN, 
            A.IDALMACEN AS COD_ALMACEN, 
            P.DESCRIPCION 
        FROM dbo.PED008 P
            JOIN dbo.INV005 A ON A.IDALMACEN = P.IDALMACEN 
            JOIN dbo.INV001 PD ON PD.IDPRODUCTO = P.IDPRODUCTO
        WHERE P.OPERACION = @OPERACION;
    END;
END;
GO

PRINT 'Stored procedure USP_CONSULTA_PRODUCTOS_PEDIDO creado exitosamente.';
GO


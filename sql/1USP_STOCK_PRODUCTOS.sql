-- =============================================
-- STORED PROCEDURE: USP_STOCK_PRODUCTOS (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: INV001, INV006, INV005 (BD de datos), SUP001, SUP003 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 21:15:00 - Sistema
-- =============================================
-- 
-- Descripción: Consulta stock de productos con paginación
--              ELIMINADOS los IF hardcodeados que usaban ROE00, ROE01, ROE02
--              Ahora usa la BD actual para tablas de inventario y recibe @BD_LOGIN para SUP001/SUP003
--
-- Parámetros:
--   @PRODUCTO VARCHAR(100) - Criterio de búsqueda de producto (código o descripción)
--   @ID_ALMACEN NUMERIC(5,0) - ID del almacén (0 para todos)
--   @CLASES VARCHAR(20) - Clases de productos a filtrar
--   @RUC_CLIENTE VARCHAR(15) - RUC del cliente (usado para lógica de negocio)
--   @USUARIO VARCHAR(20) - Usuario que solicita el stock
--   @NUM_PAGINA INT - Número de página (default 1)
--   @ALL_REG INT - Si es 0 paginación, si es 1 todos los registros
--   @CANT_FILAS INT - Cantidad de filas por página (default 10)
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para INV001, INV006, INV005, VERIFICAR_CLASE
--       Usa @BD_LOGIN para SUP001 (obtener empresa) y SUP003 (obtener IGV)
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_STOCK_PRODUCTOS]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_STOCK_PRODUCTOS];
GO

CREATE PROCEDURE [dbo].[USP_STOCK_PRODUCTOS]        
    @PRODUCTO VARCHAR(100) = '',      
    @ID_ALMACEN NUMERIC(5,0),
    @CLASES VARCHAR(20),
    @RUC_CLIENTE VARCHAR(15),
    @USUARIO VARCHAR(20),
    @NUM_PAGINA INT = 1,      
    @ALL_REG INT = 0,      
    @CANT_FILAS INT = 10,
    @BD_LOGIN VARCHAR(50)
-- =============================================
-- STORED PROCEDURE: USP_STOCK_PRODUCTOS (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: INV001, INV006, INV005 (BD de datos), SUP001, SUP003 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 21:15:00 - Sistema
-- =============================================
-- 
-- Descripción: Consulta stock de productos con paginación
--              ELIMINADOS los IF hardcodeados que usaban ROE00, ROE01, ROE02
--              Ahora usa la BD actual para tablas de inventario y recibe @BD_LOGIN para SUP001/SUP003
--
-- Parámetros:
--   @PRODUCTO VARCHAR(100) - Criterio de búsqueda de producto (código o descripción)
--   @ID_ALMACEN NUMERIC(5,0) - ID del almacén (0 para todos)
--   @CLASES VARCHAR(20) - Clases de productos a filtrar
--   @RUC_CLIENTE VARCHAR(15) - RUC del cliente (usado para lógica de negocio)
--   @USUARIO VARCHAR(20) - Usuario que solicita el stock
--   @NUM_PAGINA INT - Número de página (default 1)
--   @ALL_REG INT - Si es 0 paginación, si es 1 todos los registros
--   @CANT_FILAS INT - Cantidad de filas por página (default 10)
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para INV001, INV006, INV005, VERIFICAR_CLASE
--       Usa @BD_LOGIN para SUP001 (obtener empresa) y SUP003 (obtener IGV)
-- =============================================
AS        
BEGIN
    SET NOCOUNT ON;
    
    /*== INICIO PAGINACIÓN ===*/      
    DECLARE @INICIO VARCHAR(10),      
            @FIN VARCHAR(10),      
            @IPAGINAS NUMERIC(10, 2),      
            @IMENOS1 INT,
            @IGV NUMERIC(6,2),
            @EMPRESA VARCHAR(2);
            
    SET @IPAGINAS = CONVERT(NUMERIC(10, 2), @CANT_FILAS);
    SET @IMENOS1 = @CANT_FILAS - 1;
    
    IF @ALL_REG = 0      
    BEGIN      
        SET @INICIO = ((@NUM_PAGINA * @CANT_FILAS) - @IMENOS1);
        SET @FIN = (@NUM_PAGINA * @CANT_FILAS);
    END      
    ELSE      
    BEGIN      
        SET @INICIO = 1;
        SET @FIN = 1000000;
    END;
    /*== FIN PAGINACIÓN ===*/
    
    -- Obtener empresa del usuario desde BD de login
    DECLARE @SqlEmpresa NVARCHAR(MAX);
    SET @SqlEmpresa = N'
        SELECT @EMPRESA_OUT = EMPRESA_DEFECTO 
        FROM [' + @BD_LOGIN + '].dbo.SUP001 
        WHERE ALIAS = @USUARIO_IN';
    
    DECLARE @ParamsEmpresa NVARCHAR(MAX) = N'@USUARIO_IN VARCHAR(20), @EMPRESA_OUT VARCHAR(2) OUTPUT';
    EXEC sp_executesql @SqlEmpresa, @ParamsEmpresa, @USUARIO_IN = @USUARIO, @EMPRESA_OUT = @EMPRESA OUTPUT;
    
    -- Obtener IGV desde BD de login
    DECLARE @SqlIGV NVARCHAR(MAX);
    SET @SqlIGV = N'
        SELECT @IGV_OUT = IMPUESTO 
        FROM [' + @BD_LOGIN + '].dbo.SUP003 
        WHERE EMPRESA = @EMPRESA_IN';
    
    DECLARE @ParamsIGV NVARCHAR(MAX) = N'@EMPRESA_IN VARCHAR(2), @IGV_OUT NUMERIC(6,2) OUTPUT';
    EXEC sp_executesql @SqlIGV, @ParamsIGV, @EMPRESA_IN = @EMPRESA, @IGV_OUT = @IGV OUTPUT;
    
    -- Obtener PUEDE_CAMBIAR_PRECIO_FACTURACION desde BD de login
    DECLARE @PUEDE_CAMBIAR_PRECIO BIT;
    DECLARE @SqlPermiso NVARCHAR(MAX);
    SET @SqlPermiso = N'
        SELECT @PERMISO_OUT = PUEDE_CAMBIAR_PRECIO_FACTURACION 
        FROM [' + @BD_LOGIN + '].dbo.SUP001 
        WHERE ALIAS = @USUARIO_IN';
    
    DECLARE @ParamsPermiso NVARCHAR(MAX) = N'@USUARIO_IN VARCHAR(20), @PERMISO_OUT BIT OUTPUT';
    EXEC sp_executesql @SqlPermiso, @ParamsPermiso, @USUARIO_IN = @USUARIO, @PERMISO_OUT = @PUEDE_CAMBIAR_PRECIO OUTPUT;
    
    -- Ya no hay IF por empresa, usa directamente la BD actual donde está el SP
    WITH TBL_STOCK AS (
        SELECT    
            CONVERT(integer, COUNT(*) OVER (PARTITION BY 0)) TOTAL,      
            ROW_NUMBER() OVER (ORDER BY P.IDPRODUCTO ASC) AS ITEM,     
            P.IDPRODUCTO AS CDG_PROD,    
            RTRIM(P.DESCRIPCION) AS DES_PROD,    
            SUM(S.EXISTENCIA) AS STK_ACT,
            SUM(S.RESERVADO) AS STK_RES,
            RTRIM(A.IDALMACEN) AS ALMACEN,
            P.USA_IMPUESTO AS USA_IMPUESTO,
            @IGV AS IMPUESTO,
            P.PRECIO1,
            P.PRECIO2,
            P.PRECIO3,
            P.PRECIO4,
            P.PRECIO5,
            P.CORRELACION1,
            P.CORRELACION2,
            P.CORRELACION3,
            P.CORRELACION4,
            P.CORRELACION5,
            @PUEDE_CAMBIAR_PRECIO AS PRECIO_EDITABLE
        FROM dbo.INV001 P    
        JOIN dbo.INV006 S ON P.IDPRODUCTO = S.IDPRODUCTO    
        JOIN dbo.INV005 A ON S.IDALMACEN = A.IDALMACEN
        WHERE P.ACTIVO = 1     
            AND (ISNULL(@ID_ALMACEN, 0) = 0 OR A.IDALMACEN = @ID_ALMACEN)
            AND (
                CONVERT(VARCHAR(100), P.IDPRODUCTO) LIKE '%' + @PRODUCTO + '%' -- COD PRODUCTO
                OR RTRIM(P.DESCRIPCION) LIKE '%' + @PRODUCTO + '%' -- DESC PRODUCTO
            )
            AND dbo.VERIFICAR_CLASE(P.CLASE, @CLASES) = 1
        GROUP BY     
            P.IDPRODUCTO,    
            P.DESCRIPCION,
            P.USA_IMPUESTO,
            A.IDALMACEN,
            P.PRECIO1,
            P.PRECIO2,
            P.PRECIO3,
            P.PRECIO4,
            P.PRECIO5,
            P.CORRELACION1,
            P.CORRELACION2,
            P.CORRELACION3,
            P.CORRELACION4,
            P.CORRELACION5
    )
    SELECT 
        *,
        (SELECT CEILING(COUNT(*) / @IPAGINAS) FROM TBL_STOCK) AS TOTALPAGINAS 
    FROM TBL_STOCK 
    WHERE ITEM >= @INICIO AND ITEM <= @FIN;
END;
GO

PRINT 'Stored procedure USP_STOCK_PRODUCTOS creado exitosamente.';
GO


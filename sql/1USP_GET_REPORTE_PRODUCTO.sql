-- =============================================
-- STORED PROCEDURE: USP_GET_REPORTE_PRODUCTO
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: INV001, INV002, INV003, INV004, INV006, INV014, INV015, INV016 (BD de datos)
-- FECHA MODIFICACIÓN: 13/12/2025 20:50:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene un reporte completo de productos
--              Este SP ya está correcto: NO tiene hardcodeos de BD
--              Todas las tablas usan dbo. (BD actual de la conexión)
--              No consulta tablas de la BD de login, por lo que NO requiere @BD_LOGIN
--
-- Parámetros: Ninguno
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para todas las tablas INV* (productos, inventario, etc.)
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_GET_REPORTE_PRODUCTO]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_GET_REPORTE_PRODUCTO];
GO

CREATE PROCEDURE [dbo].[USP_GET_REPORTE_PRODUCTO]
-- =============================================
-- STORED PROCEDURE: USP_GET_REPORTE_PRODUCTO
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: INV001, INV002, INV003, INV004, INV006, INV014, INV015, INV016 (BD de datos)
-- FECHA MODIFICACIÓN: 13/12/2025 20:50:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene un reporte completo de productos
--              Este SP ya está correcto: NO tiene hardcodeos de BD
--              Todas las tablas usan dbo. (BD actual de la conexión)
--              No consulta tablas de la BD de login, por lo que NO requiere @BD_LOGIN
--
-- Parámetros: Ninguno
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para todas las tablas INV* (productos, inventario, etc.)
-- =============================================
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        INV001.IDPRODUCTO AS CODIGO,
        INV001.DESCRIPCION,  
        INV002.DESCRIPCION AS CLASE,
        INV003.DESCRIPCION AS MARCA, 
        INV004.DESCRIPCION AS UDM,
        INV014.DESCRIPCION AS DEPARTAMENTO,
        INV015.DESCRIPCION AS VERSION,
        INV016.DESCRIPCION AS TIPO_MERCADERIA,
        INV001.CODIGO_BARRA AS CODIGO_DE_BARRA_SKU,
        INV001.EMPAQUE,
        INV001.PESO AS PESO_UNITARIO,
        INV001.COMISION_VENTA AS PORC_COMISION,
        INV001.UBICACION,
        INV001.SUNAT AS CODIGO_SUNAT,
        INV001.COSTO_COMPRA AS COSTO_DE_COMPRA,
        (SELECT SUM(INV006.COSTO) FROM dbo.INV006 WHERE INV006.IDPRODUCTO = INV001.IDPRODUCTO) AS SOLES,
        (SELECT SUM(INV006.EXISTENCIA) FROM dbo.INV006 WHERE INV006.IDPRODUCTO = INV001.IDPRODUCTO) AS EXISTENCIA,
        CASE 
            WHEN (SELECT SUM(INV006.EXISTENCIA) FROM dbo.INV006 WHERE INV006.IDPRODUCTO = INV001.IDPRODUCTO) <> 0 
            THEN 
                (SELECT SUM(INV006.COSTO) FROM dbo.INV006 WHERE INV006.IDPRODUCTO = INV001.IDPRODUCTO) 
                / 
                (SELECT SUM(INV006.EXISTENCIA) FROM dbo.INV006 WHERE INV006.IDPRODUCTO = INV001.IDPRODUCTO)
            ELSE 0
        END AS COSTO_PROMEDIO,
        INV001.ULTIMA_COMPRA,
        INV001.COSTO_DOLAR,
        INV001.TIPO_IGV,
        INV001.STOCK_MAXIMO,
        INV001.STOCK_MINIMO,
        INV001.ULTIMO_INVENTARIO,
        INV001.TIPO_EXISTENCIA,
        INV001.PRECIO1 AS UNITARIO,
        INV001.PRECIO2 AS CAT_B,
        INV001.PRECIO2 AS CAT_A,
        'PERSONALIZADO' AS PERSONALIZADO,
        'DISPONIBLE' AS DISPONIBLE,
        CASE WHEN INV001.ACTIVO = 1 THEN 'ACTIVO'
        ELSE 'INACTIVO' END AS ESTADO
    FROM dbo.INV001 
        INNER JOIN dbo.INV003 ON INV001.MARCA = INV003.IDMARCA 
        INNER JOIN dbo.INV002 ON INV001.CLASE = INV002.IDCLASE 
        INNER JOIN dbo.INV004 ON INV001.IDMEDIDA = INV004.IDMEDIDA
        INNER JOIN dbo.INV014 ON INV001.ADICIONAL1 = INV014.ADICIONAL1
        INNER JOIN dbo.INV015 ON INV001.ADICIONAL2 = INV015.ADICIONAL2
        INNER JOIN dbo.INV016 ON INV001.ADICIONAL3 = INV016.ADICIONAL3;
        --WHERE INV001.ACTIVO = 1; (comentado en el código original)
END;
GO

PRINT 'Stored procedure USP_GET_REPORTE_PRODUCTO verificado. No requiere correcciones.';
GO


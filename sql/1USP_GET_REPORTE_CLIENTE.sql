-- =============================================
-- STORED PROCEDURE: USP_GET_REPORTE_CLIENTE (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: CUE001, CON012, CUE004, CUE002, CUE005, CUE009, CON009, CUE017 (BD de datos)
--         GLO007 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 20:45:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene un reporte completo de clientes
--              ELIMINADO el hardcode [ROE00].[dbo].[GLO007]
--              Ahora usa @BD_LOGIN como parámetro para consultar GLO007 dinámicamente
--
-- Parámetros:
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para CUE001, CON012, CUE004, CUE002, CUE005, CUE009, CON009, CUE017
--       Usa @BD_LOGIN para GLO007 (tabla de tipos de documento en BD de login)
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_GET_REPORTE_CLIENTE]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_GET_REPORTE_CLIENTE];
GO

CREATE PROCEDURE [dbo].[USP_GET_REPORTE_CLIENTE]
    @BD_LOGIN VARCHAR(50)
-- =============================================
-- STORED PROCEDURE: USP_GET_REPORTE_CLIENTE (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: CUE001, CON012, CUE004, CUE002, CUE005, CUE009, CON009, CUE017 (BD de datos)
--         GLO007 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 20:45:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene un reporte completo de clientes
--              ELIMINADO el hardcode [ROE00].[dbo].[GLO007]
--              Ahora usa @BD_LOGIN como parámetro para consultar GLO007 dinámicamente
--
-- Parámetros:
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para CUE001, CON012, CUE004, CUE002, CUE005, CUE009, CON009, CUE017
--       Usa @BD_LOGIN para GLO007 (tabla de tipos de documento en BD de login)
-- =============================================
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Sql NVARCHAR(MAX);
    
    -- Construir el query dinámico para usar @BD_LOGIN en lugar de ROE00 hardcodeado
    SET @Sql = N'
    SELECT 
        GLO007.DESCRIPCION AS TIPO_DOC,
        RUC,
        CUE001.RAZON AS RAZON_SOCIAL,
        CUE001.DIRECCION AS DIRECCION_FISCAL,
        CUE001.TELEFONO,
        CUE001.GREMIO2 AS RAMA_GREMIO,
        CON012.DESCRIPCION AS TIPO_GASTO,
        CUE005.DISTRITO + '' / '' + CUE005.PROVINCIA + '' / '' + CUE005.DEPARTAMENTO AS UBIGEO,
        CUE001.CORREO,
        CUE001.CONTACTO AS PERSONA_DE_CONTACTO,
        CUE004.NOMBRE AS VENDEDOR,
        CUE001.DIAS_CREDITO,
        CUE001.LIMITE_CREDITO,
        CUE001.NOTAS AS NOTAS_ADICIONALES,
        CUE002.DESCRIPCION AS CLASE_AUXILIAR,
        CUE009.DESCRIPCION AS GRUPO_AUXILIAR,
        CON009.DESCRIPCION AS CENTRO_COSTO,
        '''' AS PAGINA_WEB,
        '''' AS PRECIO_VENTA,
        CUE001.INGRESO AS FECHA_INGRESO,
        CUE017.DESCRIPCION AS CONDICION,
        CUE001.BANCO,
        CUE001.CUENTA_BANCARIA AS CUENTA,
        CUE001.TITULAR AS TITULAR_DE_LA_CUENTA,
        IIF(CUE001.ACTIVO=1,''ACTIVO'',''INACTIVO'') AS ESTADO
    FROM dbo.CUE001
        LEFT JOIN dbo.CON012 ON CUE001.TIPO_REGISTRO = CON012.CODIGO 
        INNER JOIN dbo.CUE004 ON CUE001.IDVENDEDOR = CUE004.IDVENDEDOR
        INNER JOIN dbo.CUE002 ON CUE001.CLASE = CUE002.CLASE
        LEFT JOIN dbo.CUE005 ON CUE001.UBIGEO = CUE005.UBIGEO
        LEFT JOIN dbo.CUE009 ON CUE001.GRUPO = CUE009.CODIGO
        LEFT JOIN dbo.CON009 ON CUE001.CENTRO = CON009.CODIGO
        LEFT JOIN dbo.CUE017 ON CUE001.CONDICIONES = CUE017.CONDICION
        LEFT JOIN [' + @BD_LOGIN + '].dbo.GLO007 ON CUE001.TIPO_DOCUMENTO = GLO007.CODIGO
    WHERE CUE001.CLASE = ''C''';
    
    EXEC sp_executesql @Sql;
END;
GO

PRINT 'Stored procedure USP_GET_REPORTE_CLIENTE creado exitosamente.';
GO


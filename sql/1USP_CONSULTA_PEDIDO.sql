USE BK01
-- =============================================
-- STORED PROCEDURE: USP_CONSULTA_PEDIDO (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: PED009, CUE001, CUE017, CUE005 (BD de datos), SUP001, GLO002 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 20:30:00 - Sistema
-- =============================================
-- 
-- Descripción: Consulta un pedido específico por operación
--              ELIMINADOS los IF hardcodeados que usaban ROE01, ROE02
--              Ahora usa la BD actual y recibe la BD de login como parámetro
--
-- Parámetros:
--   @ID_USUARIO VARCHAR(20) - Usuario que solicita el pedido
--   @OPERACION CHAR(7) - Número de operación del pedido
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para PED009, CUE001, CUE017, CUE005
--       Usa @BD_LOGIN para SUP001 y GLO002
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_CONSULTA_PEDIDO]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_CONSULTA_PEDIDO];
GO

CREATE PROCEDURE [dbo].[USP_CONSULTA_PEDIDO](    
    @ID_USUARIO VARCHAR(20)='',    
    @OPERACION CHAR(7),
    @BD_LOGIN VARCHAR(50)
)
-- =============================================
-- STORED PROCEDURE: USP_CONSULTA_PEDIDO (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: PED009, CUE001, CUE017, CUE005 (BD de datos), SUP001, GLO002 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 20:30:00 - Sistema
-- =============================================
-- 
-- Descripción: Consulta un pedido específico por operación
--              ELIMINADOS los IF hardcodeados que usaban ROE01, ROE02
--              Ahora usa la BD actual y recibe la BD de login como parámetro
--
-- Parámetros:
--   @ID_USUARIO VARCHAR(20) - Usuario que solicita el pedido
--   @OPERACION CHAR(7) - Número de operación del pedido
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para PED009, CUE001, CUE017, CUE005
--       Usa @BD_LOGIN para SUP001 y GLO002
-- =============================================
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentDbName VARCHAR(50) = DB_NAME();
    
    -- Ya no hay IF por empresa, usa directamente la BD actual (donde está el SP)
    -- Usar SQL dinámico para las referencias a la BD de login
    DECLARE @SqlQuery NVARCHAR(MAX);
    SET @SqlQuery = N'
    WITH TBL_PEDIDOS    
    AS (
        SELECT
            CONVERT(integer, COUNT(*) OVER (PARTITION BY 0)) TOTAL,    
            ROW_NUMBER() OVER (ORDER BY P.OPERACION DESC) AS ITEM,    
            RTRIM(P.OPERACION) AS NUM_PED,    
            FORMAT(CONVERT(datetime, P.FECHA, 121), ''yyyy-MM-dd'') AS FEC_PED,
            P.HORA AS HORA_PED,
            P.CONDICION AS CONDICION_PED,
            CON.DESCRIPCION AS CONDICION_CLI,
            P.MONTO_LETRAS AS MONTO_LETRAS_PED,
            V.NOMBRE AS NOMBRE_VEND,
            RTRIM(P.RUC) AS RUC_CLI,    
            RTRIM(C.RAZON) AS DES_CLI,
            RTRIM(C.DIRECCION) AS DIR_CLI,
            RTRIM(P.DIRECCION) AS DIR_PED,
            RTRIM(C.TELEFONO_CONTACTO) AS TEL_CLI,
            RTRIM(C.TELEFONO) AS TEL_CLI_AUX,
            CONCAT(U.DEPARTAMENTO, '', '', U.PROVINCIA, '', '', U.DISTRITO) AS UBIGEO_CLI,
            RTRIM(T.DESCRIPCION) AS MONEDA,
            RTRIM(T.SIMBOLO) AS ABR_MONEDA,    
            RTRIM(P.IDVENDEDOR) AS CDG_VEND,    
            P.BASE AS IMP_STOT,    
            P.IMPUESTO AS IMP_IGV,    
            P.TOTAL AS IMP_TTOT,    
            dbo.ESTADO_PEDIDO(''' + @CurrentDbName + ''', P.OPERACION) AS SWT_PED,
            P.ORDEN_COMPRA,
            P.FACTURA,
            P.OBSERVACIONES
        FROM dbo.PED009 P    
            LEFT JOIN dbo.CUE001 C ON P.RUC = C.RUC
            LEFT JOIN [' + @BD_LOGIN + '].dbo.SUP001 V ON @ID_USUARIO_IN LIKE V.ALIAS
            LEFT JOIN dbo.CUE017 CON ON CON.CONDICION LIKE C.CONDICIONES
            LEFT JOIN dbo.CUE005 U ON C.UBIGEO = U.UBIGEO
            LEFT JOIN [' + @BD_LOGIN + '].dbo.GLO002 T ON P.MONEDA = T.CODIGO    
        WHERE RTRIM(P.USUARIO) LIKE @ID_USUARIO_IN 
            AND P.OPERACION = @OPERACION_IN
    ) 
    SELECT TOP(1) * FROM TBL_PEDIDOS;';
    
    DECLARE @SqlParams NVARCHAR(MAX) = N'
        @ID_USUARIO_IN VARCHAR(20),
        @OPERACION_IN CHAR(7)';
    
    EXEC sp_executesql @SqlQuery, @SqlParams,
        @ID_USUARIO_IN = @ID_USUARIO,
        @OPERACION_IN = @OPERACION;
END;
GO

PRINT 'Stored procedure USP_CONSULTA_PEDIDO creado exitosamente.';
GO

-- =============================================
-- STORED PROCEDURE: SP_PRODUCTOS (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: INV001, INV002, INV003, INV004 (todas en BD de datos)
-- FECHA MODIFICACIÓN: 13/12/2025 20:45:00 - Sistema
-- =============================================
-- 
-- Descripción: Consulta el maestro de productos con filtros opcionales
--              Ya usa la BD actual correctamente (sin hardcodeados)
--              CORREGIDO: Error en LIKE que usaba literal '@Descripcion' en lugar del parámetro
--
-- Parámetros:
--   @DESCRIPCION VARCHAR(20) - Criterio de búsqueda por descripción o código de barras
--   @ACTIVO NUMERIC(1) - Filtrar por productos activos (1) o todos (0)
--   @EXISTENCIA NUMERIC(1) - Filtrar por existencia > 0 (1) o todos (0)
--
-- NOTA: Este stored procedure ya usa la BD actual correctamente (dbo.INV001, etc.)
--       No requiere parámetro @BD_LOGIN ya que todas las tablas están en la BD de datos
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SP_PRODUCTOS]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[SP_PRODUCTOS];
GO

CREATE PROCEDURE [dbo].[SP_PRODUCTOS] 
    @DESCRIPCION VARCHAR(20),
    @ACTIVO NUMERIC(1),
    @EXISTENCIA NUMERIC(1)
-- =============================================
-- STORED PROCEDURE: SP_PRODUCTOS (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: INV001, INV002, INV003, INV004 (todas en BD de datos)
-- FECHA MODIFICACIÓN: 13/12/2025 20:45:00 - Sistema
-- =============================================
-- 
-- Descripción: Consulta el maestro de productos con filtros opcionales
--              Ya usa la BD actual correctamente (sin hardcodeados)
--              CORREGIDO: Error en LIKE que usaba literal '@Descripcion' en lugar del parámetro
--
-- Parámetros:
--   @DESCRIPCION VARCHAR(20) - Criterio de búsqueda por descripción o código de barras
--   @ACTIVO NUMERIC(1) - Filtrar por productos activos (1) o todos (0)
--   @EXISTENCIA NUMERIC(1) - Filtrar por existencia > 0 (1) o todos (0)
--
-- NOTA: Este stored procedure ya usa la BD actual correctamente (dbo.INV001, etc.)
--       No requiere parámetro @BD_LOGIN ya que todas las tablas están en la BD de datos
-- =============================================
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Corregido: Usar el parámetro correctamente en LIKE (no literal '@Descripcion')
    IF @ACTIVO = 1 
    BEGIN
        IF @DESCRIPCION <> '' 
        BEGIN
            IF @EXISTENCIA = 1
            BEGIN
                SELECT 
                    INV001.IDPRODUCTO, 
                    INV001.DESCRIPCION, 
                    INV001.PRECIO1, 
                    INV001.PRECIO2, 
                    INV001.PRECIO3, 
                    INV001.PRECIO4, 
                    INV001.PRECIO5,
                    dbo.fSaldoExistencia(INV001.IDPRODUCTO, -1) AS EXISTENCIA,
                    dbo.INV002.DESCRIPCION AS NOMBRE_CLASE, 
                    dbo.INV003.DESCRIPCION AS NOMBRE_MARCA, 
                    dbo.INV004.DESCRIPCION AS MEDIDA,
                    INV001.CODIGO_BARRA 
                FROM dbo.INV001 
                    INNER JOIN dbo.INV004 ON dbo.INV001.IDMEDIDA = dbo.INV004.IDMEDIDA 
                    INNER JOIN dbo.INV003 ON dbo.INV001.MARCA = dbo.INV003.IDMARCA 
                    INNER JOIN dbo.INV002 ON dbo.INV001.CLASE = dbo.INV002.IDCLASE
                WHERE INV001.ACTIVO = 1 
                    AND (INV001.DESCRIPCION LIKE '%' + @DESCRIPCION + '%' OR INV001.CODIGO_BARRA LIKE '%' + @DESCRIPCION + '%')
                    AND dbo.fSaldoExistencia(INV001.IDPRODUCTO, -1) <> 0;
            END
            ELSE
            BEGIN
                SELECT 
                    INV001.IDPRODUCTO, 
                    INV001.DESCRIPCION, 
                    INV001.PRECIO1, 
                    INV001.PRECIO2, 
                    INV001.PRECIO3, 
                    INV001.PRECIO4, 
                    INV001.PRECIO5,
                    dbo.fSaldoExistencia(INV001.IDPRODUCTO, -1) AS EXISTENCIA,
                    dbo.INV002.DESCRIPCION AS NOMBRE_CLASE, 
                    dbo.INV003.DESCRIPCION AS NOMBRE_MARCA, 
                    dbo.INV004.DESCRIPCION AS MEDIDA,
                    INV001.CODIGO_BARRA
                FROM dbo.INV001 
                    INNER JOIN dbo.INV004 ON dbo.INV001.IDMEDIDA = dbo.INV004.IDMEDIDA 
                    INNER JOIN dbo.INV003 ON dbo.INV001.MARCA = dbo.INV003.IDMARCA 
                    INNER JOIN dbo.INV002 ON dbo.INV001.CLASE = dbo.INV002.IDCLASE
                WHERE INV001.ACTIVO = 1 
                    AND (INV001.DESCRIPCION LIKE '%' + @DESCRIPCION + '%' OR INV001.CODIGO_BARRA LIKE '%' + @DESCRIPCION + '%');
            END
        END
        ELSE
        BEGIN
            IF @EXISTENCIA = 1
            BEGIN
                SELECT 
                    INV001.IDPRODUCTO, 
                    INV001.DESCRIPCION, 
                    INV001.PRECIO1, 
                    INV001.PRECIO2, 
                    INV001.PRECIO3, 
                    INV001.PRECIO4, 
                    INV001.PRECIO5,
                    dbo.fSaldoExistencia(INV001.IDPRODUCTO, -1) AS EXISTENCIA,
                    dbo.INV002.DESCRIPCION AS NOMBRE_CLASE, 
                    dbo.INV003.DESCRIPCION AS NOMBRE_MARCA, 
                    dbo.INV004.DESCRIPCION AS MEDIDA,
                    INV001.CODIGO_BARRA
                FROM dbo.INV001 
                    INNER JOIN dbo.INV004 ON dbo.INV001.IDMEDIDA = dbo.INV004.IDMEDIDA 
                    INNER JOIN dbo.INV003 ON dbo.INV001.MARCA = dbo.INV003.IDMARCA 
                    INNER JOIN dbo.INV002 ON dbo.INV001.CLASE = dbo.INV002.IDCLASE
                WHERE INV001.ACTIVO = 1 
                    AND dbo.fSaldoExistencia(INV001.IDPRODUCTO, -1) <> 0;
            END
            ELSE
            BEGIN
                SELECT 
                    INV001.IDPRODUCTO, 
                    INV001.DESCRIPCION, 
                    INV001.PRECIO1, 
                    INV001.PRECIO2, 
                    INV001.PRECIO3, 
                    INV001.PRECIO4, 
                    INV001.PRECIO5,
                    dbo.fSaldoExistencia(INV001.IDPRODUCTO, -1) AS EXISTENCIA,
                    dbo.INV002.DESCRIPCION AS NOMBRE_CLASE, 
                    dbo.INV003.DESCRIPCION AS NOMBRE_MARCA, 
                    dbo.INV004.DESCRIPCION AS MEDIDA,
                    INV001.CODIGO_BARRA
                FROM dbo.INV001 
                    INNER JOIN dbo.INV004 ON dbo.INV001.IDMEDIDA = dbo.INV004.IDMEDIDA 
                    INNER JOIN dbo.INV003 ON dbo.INV001.MARCA = dbo.INV003.IDMARCA 
                    INNER JOIN dbo.INV002 ON dbo.INV001.CLASE = dbo.INV002.IDCLASE
                WHERE INV001.ACTIVO = 1;
            END
        END
    END
    ELSE
    BEGIN
        IF @DESCRIPCION <> '' 
        BEGIN
            SELECT 
                INV001.IDPRODUCTO, 
                INV001.DESCRIPCION, 
                INV001.PRECIO1, 
                INV001.PRECIO2, 
                INV001.PRECIO3, 
                INV001.PRECIO4, 
                INV001.PRECIO5,
                dbo.fSaldoExistencia(INV001.IDPRODUCTO, -1) AS EXISTENCIA,
                dbo.INV002.DESCRIPCION AS NOMBRE_CLASE, 
                dbo.INV003.DESCRIPCION AS NOMBRE_MARCA, 
                dbo.INV004.DESCRIPCION AS MEDIDA,
                INV001.CODIGO_BARRA
            FROM dbo.INV001 
                INNER JOIN dbo.INV004 ON dbo.INV001.IDMEDIDA = dbo.INV004.IDMEDIDA 
                INNER JOIN dbo.INV003 ON dbo.INV001.MARCA = dbo.INV003.IDMARCA 
                INNER JOIN dbo.INV002 ON dbo.INV001.CLASE = dbo.INV002.IDCLASE
            WHERE INV001.DESCRIPCION LIKE '%' + @DESCRIPCION + '%' 
                OR INV001.CODIGO_BARRA LIKE '%' + @DESCRIPCION + '%';
        END
        ELSE
        BEGIN
            SELECT 
                INV001.IDPRODUCTO, 
                INV001.DESCRIPCION, 
                INV001.PRECIO1, 
                INV001.PRECIO2, 
                INV001.PRECIO3, 
                INV001.PRECIO4, 
                INV001.PRECIO5,
                dbo.fSaldoExistencia(INV001.IDPRODUCTO, -1) AS EXISTENCIA,
                dbo.INV002.DESCRIPCION AS NOMBRE_CLASE, 
                dbo.INV003.DESCRIPCION AS NOMBRE_MARCA, 
                dbo.INV004.DESCRIPCION AS MEDIDA,
                INV001.CODIGO_BARRA
            FROM dbo.INV001 
                INNER JOIN dbo.INV004 ON dbo.INV001.IDMEDIDA = dbo.INV004.IDMEDIDA 
                INNER JOIN dbo.INV003 ON dbo.INV001.MARCA = dbo.INV003.IDMARCA 
                INNER JOIN dbo.INV002 ON dbo.INV001.CLASE = dbo.INV002.IDCLASE;
        END
    END
END;
GO

PRINT 'Stored procedure SP_PRODUCTOS creado exitosamente.';
GO


USE BK01
-- =============================================
-- STORED PROCEDURE: USP_CONSULTA_PEDIDOS (OPTIMIZADO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: PED009, CUE001, GLO002 (en BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 20:30:00 - Sistema
-- OPTIMIZACIÓN: 14/12/2025 - Mejoras de rendimiento en búsqueda y paginación
-- =============================================
-- 
-- Descripción: Consulta pedidos para un usuario (OPTIMIZADO)
--              ELIMINADOS los IF hardcodeados que usaban ROE01, ROE02
--              Ahora usa la BD actual y recibe la BD de login como parámetro
--              OPTIMIZACIONES APLICADAS:
--              - Búsqueda optimizada: usa igualdad cuando es numérico
--              - COUNT calculado solo sobre filas filtradas
--              - Filtro de estado aplicado antes del COUNT
--              - Eliminadas conversiones costosas STR(TRY_CONVERT())
--
-- Parámetros:
--   @ID_USUARIO VARCHAR(20) - Usuario que solicita los pedidos
--   @BUSQUEDA VARCHAR(100) - Criterio de búsqueda (N° pedido, RUC, cliente)
--   @NUM_PAGINA INT - Número de página
--   @ALL_REG INT - Todos los registros (1) o paginado (0)
--   @CANT_FILAS INT - Cantidad de filas por página
--   @DATE_START DATE - Fecha inicio
--   @DATE_END DATE - Fecha fin
--   @ESTADO CHAR(1) - Estado del pedido
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para PED009 y CUE001
--       Usa @BD_LOGIN para GLO002 (tabla de monedas)
--       Se recomienda crear los índices del script CREAR_INDICES_PEDIDOS.sql
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_CONSULTA_PEDIDOS]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_CONSULTA_PEDIDOS];
GO

CREATE PROCEDURE [dbo].[USP_CONSULTA_PEDIDOS]
    @ID_USUARIO VARCHAR(20)='',    
    @BUSQUEDA VARCHAR(100)='',    
    @NUM_PAGINA INT = 1,    
    @ALL_REG INT = 0,    
    @CANT_FILAS INT = 10,
    @DATE_START DATE = '2000-01-01',
    @DATE_END DATE = '9999-01-01',
    @ESTADO CHAR(1) = '%',
    @BD_LOGIN VARCHAR(50)
-- =============================================
-- STORED PROCEDURE: USP_CONSULTA_PEDIDOS (OPTIMIZADO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: PED009, CUE001, GLO002 (en BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 20:30:00 - Sistema
-- OPTIMIZACIÓN: 14/12/2025 - Mejoras de rendimiento en búsqueda y paginación
-- =============================================
-- 
-- Descripción: Consulta pedidos para un usuario (OPTIMIZADO)
--              ELIMINADOS los IF hardcodeados que usaban ROE01, ROE02
--              Ahora usa la BD actual y recibe la BD de login como parámetro
--              OPTIMIZACIONES APLICADAS:
--              - Búsqueda optimizada: usa igualdad cuando es numérico
--              - COUNT calculado solo sobre filas filtradas
--              - Filtro de estado aplicado antes del COUNT
--              - Eliminadas conversiones costosas STR(TRY_CONVERT())
--
-- Parámetros:
--   @ID_USUARIO VARCHAR(20) - Usuario que solicita los pedidos
--   @BUSQUEDA VARCHAR(100) - Criterio de búsqueda (N° pedido, RUC, cliente)
--   @NUM_PAGINA INT - Número de página
--   @ALL_REG INT - Todos los registros (1) o paginado (0)
--   @CANT_FILAS INT - Cantidad de filas por página
--   @DATE_START DATE - Fecha inicio
--   @DATE_END DATE - Fecha fin
--   @ESTADO CHAR(1) - Estado del pedido
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Usa la BD actual para PED009 y CUE001
--       Usa @BD_LOGIN para GLO002 (tabla de monedas)
--       Se recomienda crear los índices del script CREAR_INDICES_PEDIDOS.sql
-- =============================================
AS      
BEGIN
    SET NOCOUNT ON;
    
    /*== INICIO PAGINACIÓN ===*/    
    DECLARE     
        @INICIO INT,    
        @FIN INT,    
        @IPAGINAS NUMERIC(10, 2),    
        @IMENOS1 INT,
        @CurrentDbName VARCHAR(50) = DB_NAME();
    
    SET @IPAGINAS = CONVERT(NUMERIC(10, 2), @CANT_FILAS)    
    SET @IMENOS1 = @CANT_FILAS - 1    
    
    IF @ALL_REG = 0    
    BEGIN    
        SET @INICIO = ((@NUM_PAGINA * @CANT_FILAS) - @IMENOS1)    
        SET @FIN = (@NUM_PAGINA * @CANT_FILAS)    
    END    
    ELSE    
    BEGIN    
        SET @INICIO = 1    
        SET @FIN = 1000000    
    END    
    /*== FIN PAGINACIÓN ===*/   
    
    -- Variables para optimizar búsqueda
    DECLARE @BUSQUEDA_TRIM VARCHAR(100) = LTRIM(RTRIM(ISNULL(@BUSQUEDA, '')));
    DECLARE @ES_NUMERICO BIT = 0;
    DECLARE @BUSQUEDA_NUMERICA BIGINT = NULL;
    
    -- Determinar si la búsqueda es numérica (optimización)
    IF LEN(@BUSQUEDA_TRIM) > 0 AND ISNUMERIC(@BUSQUEDA_TRIM) = 1
    BEGIN
        SET @ES_NUMERICO = 1;
        SET @BUSQUEDA_NUMERICA = TRY_CAST(@BUSQUEDA_TRIM AS BIGINT);
    END
    
    -- Normalizar estado
    DECLARE @ESTADO_FILTRO CHAR(1) = CASE 
        WHEN @ESTADO IS NULL OR RTRIM(@ESTADO) = '' OR RTRIM(@ESTADO) = '%' THEN NULL
        ELSE @ESTADO
    END;
    
    -- Ya no hay IF por empresa, usa directamente la BD actual (donde está el SP)
    -- Usar SQL dinámico para la BD de login en GLO002
    DECLARE @SqlQuery NVARCHAR(MAX);
    SET @SqlQuery = N'
    -- CTE base con filtros aplicados (sin COUNT para mejor rendimiento)
    WITH TBL_PEDIDOS_FILTRADOS AS (
        SELECT     
            P.OPERACION,
            P.FECHA,
            P.RUC,
            P.IDVENDEDOR,
            P.BASE,
            P.IMPUESTO,
            P.TOTAL,
            P.ORDEN_COMPRA,
            P.FACTURA,
            P.OBSERVACIONES,
            C.RAZON,
            C.DIRECCION,
            T.DESCRIPCION AS MONEDA,
            T.SIMBOLO AS ABR_MONEDA,
            -- Calcular estado solo si es necesario (evitar llamadas innecesarias)
            CASE 
                WHEN @ESTADO_FILTRO_IN IS NOT NULL 
                THEN dbo.ESTADO_PEDIDO(@CURRENT_DB_IN, P.OPERACION)
                ELSE NULL
            END AS SWT_PED_CALC
        FROM dbo.PED009 P 
        INNER JOIN dbo.CUE001 C ON P.RUC = C.RUC AND C.IDVENDEDOR = P.IDVENDEDOR
        INNER JOIN [' + @BD_LOGIN + '].DBO.GLO002 T ON P.MONEDA = T.CODIGO 
        WHERE RTRIM(P.USUARIO) = @ID_USUARIO_IN
            AND P.FECHA BETWEEN @DATE_START_IN AND @DATE_END_IN
            -- Búsqueda optimizada: usar igualdad cuando sea posible
            AND (
                @BUSQUEDA_TRIM_IN = '''' OR
                -- Si es numérico, buscar primero por igualdad (más rápido)
                (@ES_NUMERICO_IN = 1 AND @BUSQUEDA_NUMERICA_IN IS NOT NULL AND 
                    (P.OPERACION = @BUSQUEDA_TRIM_IN OR 
                     P.OPERACION LIKE @BUSQUEDA_TRIM_IN + ''%'' OR
                     P.RUC = @BUSQUEDA_TRIM_IN OR 
                     P.RUC LIKE @BUSQUEDA_TRIM_IN + ''%'' OR
                     C.RAZON LIKE @BUSQUEDA_TRIM_IN + ''%'')) OR
                -- Si no es numérico, buscar en texto (usar LIKE con comodín final para mejor uso de índices)
                (@ES_NUMERICO_IN = 0 AND 
                    (P.OPERACION LIKE @BUSQUEDA_TRIM_IN + ''%'' OR
                     P.RUC LIKE @BUSQUEDA_TRIM_IN + ''%'' OR
                     C.RAZON LIKE @BUSQUEDA_TRIM_IN + ''%''))
            )
            -- Aplicar filtro de estado ANTES del COUNT si está especificado
            AND (@ESTADO_FILTRO_IN IS NULL OR 
                 dbo.ESTADO_PEDIDO(@CURRENT_DB_IN, P.OPERACION) = @ESTADO_FILTRO_IN)
    ),
    -- Calcular totales solo sobre las filas filtradas
    TBL_CON_TOTAL AS (
        SELECT 
            *,
            COUNT(*) OVER() AS TOTAL
        FROM TBL_PEDIDOS_FILTRADOS
    ),
    -- Aplicar numeración de filas
    TBL_PEDIDOS AS (
        SELECT 
            TOTAL,
            ROW_NUMBER() OVER (ORDER BY FECHA DESC, OPERACION DESC) AS ITEM,
            RTRIM(OPERACION) AS NUM_PED,
            FORMAT(CONVERT(datetime, FECHA, 121), ''yyyy-MM-dd'') AS FEC_PED,
            RTRIM(RUC) AS RUC_CLI,
            RTRIM(RAZON) AS DES_CLI,
            RTRIM(DIRECCION) AS DIR_CLI,
            RTRIM(MONEDA) AS MONEDA,
            RTRIM(ABR_MONEDA) AS ABR_MONEDA,
            RTRIM(IDVENDEDOR) AS CDG_VEND,
            BASE AS IMP_STOT,
            IMPUESTO AS IMP_IGV,
            TOTAL AS IMP_TTOT,
            CASE 
                WHEN SWT_PED_CALC IS NOT NULL THEN SWT_PED_CALC
                ELSE dbo.ESTADO_PEDIDO(@CURRENT_DB_IN, OPERACION)
            END AS SWT_PED,
            ORDEN_COMPRA,
            FACTURA,
            OBSERVACIONES
        FROM TBL_CON_TOTAL
    )
    SELECT 
        *,
        CEILING(CAST(TOTAL AS FLOAT) / @IPAGINAS_IN) AS TOTALPAGINAS
    FROM TBL_PEDIDOS
    WHERE ITEM >= @INICIO_IN AND ITEM <= @FIN_IN
    ORDER BY FEC_PED DESC, NUM_PED DESC;';
    
    DECLARE @SqlParams NVARCHAR(MAX) = N'
        @ID_USUARIO_IN VARCHAR(20),
        @BUSQUEDA_TRIM_IN VARCHAR(100),
        @ES_NUMERICO_IN BIT,
        @BUSQUEDA_NUMERICA_IN BIGINT,
        @DATE_START_IN DATE,
        @DATE_END_IN DATE,
        @ESTADO_FILTRO_IN CHAR(1),
        @IPAGINAS_IN NUMERIC(10, 2),
        @INICIO_IN INT,
        @FIN_IN INT,
        @CURRENT_DB_IN VARCHAR(50)';
    
    EXEC sp_executesql @SqlQuery, @SqlParams,
        @ID_USUARIO_IN = @ID_USUARIO,
        @BUSQUEDA_TRIM_IN = @BUSQUEDA_TRIM,
        @ES_NUMERICO_IN = @ES_NUMERICO,
        @BUSQUEDA_NUMERICA_IN = @BUSQUEDA_NUMERICA,
        @DATE_START_IN = @DATE_START,
        @DATE_END_IN = @DATE_END,
        @ESTADO_FILTRO_IN = @ESTADO_FILTRO,
        @IPAGINAS_IN = @IPAGINAS,
        @INICIO_IN = @INICIO,
        @FIN_IN = @FIN,
        @CURRENT_DB_IN = @CurrentDbName;
END;
GO

PRINT 'Stored procedure USP_CONSULTA_PEDIDOS creado exitosamente.';
GO

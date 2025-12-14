USE [BK01]
GO

-- =============================================
-- STORED PROCEDURE: NX_Ubigeo_GetAll
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLA: CUE005 (Ubigeos)
-- FECHA MODIFICACIÓN: 14/12/2025 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene la lista completa de todos los ubigeos con su zona asignada.
--              Si se proporciona @ZonaFiltro, ordena según prioridad:
--              1) Ubigeos de la zona filtrada
--              2) Ubigeos sin zona
--              3) Ubigeos de otras zonas
--              Dentro de cada grupo se ordena por DEPARTAMENTO, PROVINCIA, DISTRITO
--
-- Parámetros:
--   @ZonaFiltro VARCHAR(3) - Código de zona para ordenamiento prioritario (opcional)
--
-- Retorna:
--   Ubigeo VARCHAR(6) - Código de ubigeo
--   Distrito VARCHAR(100) - Nombre del distrito
--   Provincia VARCHAR(100) - Nombre de la provincia
--   Departamento VARCHAR(100) - Nombre del departamento
--   Zona VARCHAR(3) - Código de zona asignada (puede ser NULL)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Ubigeo_GetAll]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Ubigeo_GetAll];
GO

CREATE PROCEDURE [dbo].[NX_Ubigeo_GetAll]
    @ZonaFiltro VARCHAR(3) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    /*
    Descripción: Obtiene la lista completa de todos los ubigeos con su zona asignada.
                 Si se proporciona @ZonaFiltro, ordena según prioridad:
                 1) Ubigeos de la zona filtrada
                 2) Ubigeos sin zona
                 3) Ubigeos de otras zonas
                 Dentro de cada grupo se ordena por DEPARTAMENTO, PROVINCIA, DISTRITO

    Parámetros:
      @ZonaFiltro VARCHAR(3) - Código de zona para ordenamiento prioritario (opcional)

    Retorna:
      Ubigeo VARCHAR(6) - Código de ubigeo
      Distrito VARCHAR(100) - Nombre del distrito
      Provincia VARCHAR(100) - Nombre de la provincia
      Departamento VARCHAR(100) - Nombre del departamento
      Zona VARCHAR(3) - Código de zona asignada (puede ser NULL)
    */

    SELECT 
        UBIGEO AS Ubigeo,
        DISTRITO AS Distrito,
        PROVINCIA AS Provincia,
        DEPARTAMENTO AS Departamento,
        ZONA AS Zona,
        -- Orden de prioridad para sorting
        CASE 
            WHEN @ZonaFiltro IS NOT NULL AND ZONA = @ZonaFiltro THEN 1  -- Primero: zona igual al filtro
            WHEN ZONA IS NULL THEN 2                                     -- Segundo: sin zona
            ELSE 3                                                       -- Tercero: otras zonas
        END AS OrdenPrioridad
    FROM CUE005
    ORDER BY 
        CASE 
            WHEN @ZonaFiltro IS NOT NULL AND ZONA = @ZonaFiltro THEN 1
            WHEN ZONA IS NULL THEN 2
            ELSE 3
        END,
        DEPARTAMENTO, 
        PROVINCIA, 
        DISTRITO;
END;
GO

PRINT 'Stored procedure NX_Ubigeo_GetAll creado exitosamente.';
GO


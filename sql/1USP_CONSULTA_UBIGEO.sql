USE BK01
-- =============================================
-- STORED PROCEDURE: USP_CONSULTA_UBIGEO (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: CUE005 (BD de datos), SUP001 (BD de login)
-- FECHA MODIFICACIÓN: 14/12/2025 - Sistema
-- =============================================
-- 
-- Descripción: Consulta ubigeos (distritos, provincias, departamentos)
--              ELIMINADOS los IF hardcodeados que usaban ROE01, ROE02
--              ELIMINADO el hardcode ROE00.DBO.SUP001
--              Ahora usa la BD actual para CUE005 y recibe @BD_LOGIN para consultar SUP001
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita los ubigeos
--   @BUSQUEDA VARCHAR(100) - Criterio de búsqueda (distrito, provincia o departamento)
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Consulta CUE005 en la BD actual
--       Usa @BD_LOGIN para consultar SUP001 (obtención de empresa - aunque ya no se usa)
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_CONSULTA_UBIGEO]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_CONSULTA_UBIGEO];
GO

CREATE PROCEDURE [dbo].[USP_CONSULTA_UBIGEO](
	@USUARIO VARCHAR(20),
	@BUSQUEDA VARCHAR(100),
	@BD_LOGIN VARCHAR(50)
)
-- =============================================
-- STORED PROCEDURE: USP_CONSULTA_UBIGEO (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: CUE005 (BD de datos), SUP001 (BD de login)
-- FECHA MODIFICACIÓN: 14/12/2025 - Sistema
-- =============================================
-- 
-- Descripción: Consulta ubigeos (distritos, provincias, departamentos)
--              ELIMINADOS los IF hardcodeados que usaban ROE01, ROE02
--              ELIMINADO el hardcode ROE00.DBO.SUP001
--              Ahora usa la BD actual para CUE005 y recibe @BD_LOGIN para consultar SUP001
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita los ubigeos
--   @BUSQUEDA VARCHAR(100) - Criterio de búsqueda (distrito, provincia o departamento)
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Consulta CUE005 en la BD actual
--       Usa @BD_LOGIN para consultar SUP001 (obtención de empresa - aunque ya no se usa)
-- =============================================
AS
BEGIN
	SET NOCOUNT ON;
	
	-- Ya no hay IF por empresa, usa directamente la BD actual (donde está el SP)
	-- CUE005 contiene los ubigeos y está en la BD de datos
	SELECT TOP(500) 
		UBIGEO, 
		DISTRITO, 
		PROVINCIA, 
		DEPARTAMENTO 
	FROM dbo.CUE005 
	WHERE DISTRITO LIKE '%' + @BUSQUEDA + '%' 
		OR PROVINCIA LIKE '%' + @BUSQUEDA + '%' 
		OR DEPARTAMENTO LIKE '%' + @BUSQUEDA + '%' 
	ORDER BY DEPARTAMENTO;
END;
GO

PRINT 'Stored procedure USP_CONSULTA_UBIGEO creado exitosamente.';
GO


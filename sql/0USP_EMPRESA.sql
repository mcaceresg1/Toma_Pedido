USE BK00
-- =============================================
-- STORED PROCEDURE: USP_EMPRESA (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: LOGIN (debe crearse en BK00, ROE00, etc.)
-- TABLAS: SUP001, SUP002, SUP003 (BD de login)
-- FECHA MODIFICACIÓN: 14/12/2025 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene información de la empresa por defecto del usuario
--              ELIMINADO el hardcode ROE00
--              Ahora usa @BD_LOGIN como parámetro para consultar tablas dinámicamente
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita la información de la empresa
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en la base de datos de LOGIN (BK00, ROE00, etc.)
--       Consulta SUP001, SUP002 y SUP003 que están en la BD de login
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_EMPRESA]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_EMPRESA];
GO

CREATE PROCEDURE [dbo].[USP_EMPRESA](
	@USUARIO VARCHAR(20),
	@BD_LOGIN VARCHAR(50)
)
-- =============================================
-- STORED PROCEDURE: USP_EMPRESA (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: LOGIN (debe crearse en BK00, ROE00, etc.)
-- TABLAS: SUP001, SUP002, SUP003 (BD de login)
-- FECHA MODIFICACIÓN: 14/12/2025 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene información de la empresa por defecto del usuario
--              ELIMINADO el hardcode ROE00
--              Ahora usa @BD_LOGIN como parámetro para consultar tablas dinámicamente
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita la información de la empresa
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (ej: ROE00, BK00)
--
-- NOTA: Este stored procedure debe crearse en la base de datos de LOGIN (BK00, ROE00, etc.)
--       Consulta SUP001, SUP002 y SUP003 que están en la BD de login
-- =============================================
AS
BEGIN
	SET NOCOUNT ON;
	
	DECLARE @EMPRESA VARCHAR(2);
	DECLARE @Sql NVARCHAR(MAX);
	
	-- Obtener la empresa por defecto del usuario desde SUP001
	SET @Sql = N'
		SELECT @EMPRESA_OUT = EMPRESA_DEFECTO 
		FROM [' + @BD_LOGIN + '].dbo.SUP001 
		WHERE ALIAS = @USUARIO_IN';
	
	DECLARE @Params1 NVARCHAR(MAX) = N'@USUARIO_IN VARCHAR(20), @EMPRESA_OUT VARCHAR(2) OUTPUT';
	EXEC sp_executesql @Sql, @Params1, @USUARIO_IN = @USUARIO, @EMPRESA_OUT = @EMPRESA OUTPUT;
	
	-- Obtener información completa de la empresa desde SUP002 y SUP003
	SET @Sql = N'
		SELECT 
			E.EMPRESA, 
			E.RUC, 
			E.CODIGO, 
			ED.PRECIO_TIENE_IMPUESTO, 
			ED.NOMBRE_PRECIO1, 
			ED.NOMBRE_PRECIO2, 
			ED.NOMBRE_PRECIO3, 
			ED.NOMBRE_PRECIO4, 
			ED.NOMBRE_PRECIO5 
		FROM [' + @BD_LOGIN + '].dbo.SUP002 E 
		JOIN [' + @BD_LOGIN + '].dbo.SUP003 ED ON E.CODIGO = ED.EMPRESA 
		WHERE E.CODIGO = @EMPRESA_IN';
	
	DECLARE @Params2 NVARCHAR(MAX) = N'@EMPRESA_IN VARCHAR(2)';
	EXEC sp_executesql @Sql, @Params2, @EMPRESA_IN = @EMPRESA;
END;
GO

PRINT 'Stored procedure USP_EMPRESA creado exitosamente.';
GO


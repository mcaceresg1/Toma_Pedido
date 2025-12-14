USE BK01
-- =============================================
-- STORED PROCEDURE: USP_CONDICION (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: CUE017 (BD de datos), SUP001 (BD de login - solo para validación opcional)
-- FECHA MODIFICACIÓN: 13/12/2025 20:40:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene lista de condiciones de pago
--              ELIMINADOS los IF hardcodeados que usaban ROE01, ROE02
--              Ahora usa la BD actual directamente
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita las condiciones (opcional, no se usa actualmente)
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (opcional, no se usa actualmente)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Consulta directamente CUE017 en la BD actual sin depender de la empresa del usuario
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_CONDICION]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_CONDICION];
GO

CREATE PROCEDURE [dbo].[USP_CONDICION](
    @USUARIO VARCHAR(20),
    @BD_LOGIN VARCHAR(50)
)
-- =============================================
-- STORED PROCEDURE: USP_CONDICION (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLAS: CUE017 (BD de datos), SUP001 (BD de login - solo para validación opcional)
-- FECHA MODIFICACIÓN: 13/12/2025 20:40:00 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene lista de condiciones de pago
--              ELIMINADOS los IF hardcodeados que usaban ROE01, ROE02
--              Ahora usa la BD actual directamente
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que solicita las condiciones (opcional, no se usa actualmente)
--   @BD_LOGIN VARCHAR(50) - Nombre de la base de datos de login (opcional, no se usa actualmente)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (BK01, ROE01, etc.)
--       Consulta directamente CUE017 en la BD actual sin depender de la empresa del usuario
-- =============================================
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Ya no hay IF por empresa, usa directamente la BD actual (donde está el SP)
    -- CUE017 contiene las condiciones de pago y está en la BD de datos
    SELECT * FROM dbo.CUE017;
END;
GO

PRINT 'Stored procedure USP_CONDICION creado exitosamente.';
GO


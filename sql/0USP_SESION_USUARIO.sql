USE BK00
-- =============================================
-- STORED PROCEDURE: USP_SESION_USUARIO (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: LOGIN (debe crearse en BK00, ROE00, etc.)
-- TABLA: SUP001 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 21:10:00 - Sistema
-- =============================================
-- 
-- Descripción: Autentica un usuario y devuelve información del mismo
--              CORREGIDO para usar dbo.SUP001 explícitamente (BD actual donde se ejecuta)
--              Este SP debe estar en la BD de login, no en la BD de datos
--
-- Parámetros:
--   @USER VARCHAR(20) - Alias del usuario
--   @PASSWORD VARCHAR(20) - Contraseña del usuario
--
-- NOTA IMPORTANTE: Este stored procedure DEBE crearse en la BD de login (ROE00, BK00, etc.)
--                  NO debe crearse en las BDs de datos (BK01, ROE01, etc.)
--                  La conexión desde DbLogin.cs usa DevConnStringDbLogin/OrgConnStringDbLogin
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_SESION_USUARIO]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_SESION_USUARIO];
GO

CREATE PROCEDURE [dbo].[USP_SESION_USUARIO]       
    @USER VARCHAR(20),      
    @PASSWORD VARCHAR(20)
-- =============================================
-- STORED PROCEDURE: USP_SESION_USUARIO (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: LOGIN (debe crearse en BK00, ROE00, etc.)
-- TABLA: SUP001 (BD de login)
-- FECHA MODIFICACIÓN: 13/12/2025 21:10:00 - Sistema
-- =============================================
-- 
-- Descripción: Autentica un usuario y devuelve información del mismo
--              CORREGIDO para usar dbo.SUP001 explícitamente (BD actual donde se ejecuta)
--              Este SP debe estar en la BD de login, no en la BD de datos
--
-- Parámetros:
--   @USER VARCHAR(20) - Alias del usuario
--   @PASSWORD VARCHAR(20) - Contraseña del usuario
--
-- NOTA IMPORTANTE: Este stored procedure DEBE crearse en la BD de login (ROE00, BK00, etc.)
--                  NO debe crearse en las BDs de datos (BK01, ROE01, etc.)
--                  La conexión desde DbLogin.cs usa DevConnStringDbLogin/OrgConnStringDbLogin
-- =============================================
AS      
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @RESPONSE INT;      
    DECLARE @PASS_ENCRY VARCHAR(20);      
    DECLARE @PASS_DESNCRY VARCHAR(20);
    DECLARE @COD_VENDEDOR NUMERIC(4,0);
    DECLARE @IDREGISTRO NUMERIC(10, 0);
    DECLARE @EMPRESAS VARCHAR(200);
    DECLARE @EMPRESA CHAR(2);
    
    -- Consultar SUP001 desde la BD actual (debe ser la BD de login)
    SET @PASS_ENCRY = (SELECT CLAVE FROM dbo.SUP001 WHERE ALIAS = @USER);    
    SET @PASS_DESNCRY = CONVERT(VARCHAR(20), @PASS_ENCRY);
    
    -- Debug prints (pueden comentarse en producción)
    -- PRINT @PASS_ENCRY      
    -- PRINT @PASS_DESNCRY      
    
    IF EXISTS(
        SELECT 1 
        FROM dbo.SUP001 
        WHERE ALIAS = @USER 
            AND @PASS_DESNCRY = @PASSWORD 
            AND BLOQUEADO = 0 
            AND GETDATE() < VENCE
    )      
    BEGIN
        SELECT 
            @COD_VENDEDOR = VENDEDOR, 
            @IDREGISTRO = IDREGISTRO, 
            @EMPRESAS = EMPRESAS, 
            @EMPRESA = EMPRESA_DEFECTO 
        FROM dbo.SUP001 
        WHERE ALIAS = @USER;
        
        SET @RESPONSE = 1; -- SUCCESS      
    END      
    ELSE      
    BEGIN      
        SET @RESPONSE = 0; -- ERROR 
        SET @COD_VENDEDOR = -1;
        SET @IDREGISTRO = 0;
        SET @EMPRESAS = '';
        SET @EMPRESA = '';
    END      
        
    SELECT 
        @RESPONSE AS RESPONSE, 
        @IDREGISTRO AS ID, 
        @COD_VENDEDOR AS VENDEDOR, 
        @EMPRESAS AS EMPRESAS, 
        @EMPRESA AS EMPRESA;
END;
GO

PRINT 'Stored procedure USP_SESION_USUARIO creado exitosamente.';
GO


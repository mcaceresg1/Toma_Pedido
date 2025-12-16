-- =============================================
-- STORED PROCEDURE: NX_SEGURIDAD_WEB_GET_PERMISOS
-- PROYECTO: Toma Pedido Web
-- BASE DE DATOS: LOGIN (BK00, ROE00, etc.)
-- TABLA: SUP011
-- FECHA CREACIÓN: 16/12/2025 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene el acceso a las opciones del menú WEB para un usuario específico.
--              Valida contra la tabla SUP011 filtrando por SISTEMA='WEB'.
--              Se usa para determinar qué opciones del menú (Ventas, Reportes, etc.) puede ver el usuario.
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Alias del usuario (mismo que en SUP001)
--   @EMPRESA CHAR(2) - Código de empresa (Por defecto '01' según requerimiento)
--
-- Retorna:
--   Lista de opciones permitidas (VE, RV, RC, MV)
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_SEGURIDAD_WEB_GET_PERMISOS]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_SEGURIDAD_WEB_GET_PERMISOS];
GO

CREATE PROCEDURE [dbo].[NX_SEGURIDAD_WEB_GET_PERMISOS]
    @USUARIO VARCHAR(20),
    @EMPRESA CHAR(2) = '01'
AS
BEGIN
    SET NOCOUNT ON;

    -- Validamos permisos cruzando el nivel del usuario con lo configurado en SUP011
    -- Se asume que SUP001 tiene un campo NIVEL_SEGURIDAD o similar que linkea con SUP011.NIVEL
    -- O bien, buscamos directamente si existe un registro para el nivel del usuario.
    
    -- NOTA: Como no tengo la estructura exacta de cómo se relaciona el USUARIO con el NIVEL en tu sistema actual,
    -- usaré la lógica estándar: 
    -- 1. Obtener el NIVEL del usuario desde SUP001 (Tabla de Usuarios)
    -- 2. Consultar SUP011 filtrando por ese NIVEL, SISTEMA='WEB' y EMPRESA

    -- Lógica Simplificada por requerimiento:
    -- 1. SISTEMA = 'WEB' (Duro)
    -- 2. NIVEL = '01' (Duro)
    -- 3. EMPRESA = @EMPRESA (Parámetro)
    -- 4. USUARIO = @USUARIO (Parámetro - Nuevo campo confirmado)

    SELECT 
        OPCION
    FROM dbo.SUP011
    WHERE SISTEMA = 'WEB'
      AND NIVEL = '01'
      AND EMPRESA = @EMPRESA
      AND USUARIO = @USUARIO;

END
GO

PRINT 'Stored procedure NX_SEGURIDAD_WEB_GET_PERMISOS creado exitosamente.';
GO

-- =============================================
-- Script para mostrar usuarios y contraseñas desencriptadas
-- Basado en TRACE_ERP - Mantenimiento de Usuarios
-- Método: CONVERT(VARCHAR(20), CLAVE)
-- =============================================

USE BK00;
GO

-- =============================================
-- MÉTODO DE TRACE_ERP: Convertir CLAVE (VARBINARY) a VARCHAR
-- =============================================
SELECT 
    ALIAS AS Usuario,
    CONVERT(VARCHAR(20), CLAVE) AS Password_Desencriptado,
    EMPRESA_DEFECTO,
    VENDEDOR,
    NOMBRE
FROM SUP001
WHERE ALIAS IN ('VENTA08', 'HANS')
ORDER BY ALIAS;
GO

-- =============================================
-- Ver todos los usuarios con contraseñas desencriptadas
-- =============================================
SELECT 
    ALIAS AS Usuario,
    CONVERT(VARCHAR(20), CLAVE) AS Password_Desencriptado,
    EMPRESA_DEFECTO,
    VENDEDOR,
    NOMBRE,
    BLOQUEADO
FROM SUP001
WHERE CLAVE IS NOT NULL
ORDER BY ALIAS;
GO

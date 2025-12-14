-- =============================================
-- SCRIPT MAESTRO: EJECUTAR TODOS LOS STORED PROCEDURES
-- PROYECTO: Toma Pedido
-- FECHA: 14/12/2025
-- =============================================
-- 
-- Este script ejecuta todos los SPs corregidos en las bases de datos correctas:
-- - BD LOGIN (ROE000): SPs de configuración (usuarios, empresas)
-- - BD DATOS (ROE001): SPs de operaciones (pedidos, clientes, productos, etc.)
--
-- INSTRUCCIONES:
-- 1. Ejecutar este script completo en SQL Server Management Studio
-- 2. O ejecutar cada sección por separado según la base de datos
-- 3. Verificar que todos los SPs se crean exitosamente
-- =============================================

USE [ROE000]
GO
PRINT '========================================='
PRINT 'EJECUTANDO SPs EN BD LOGIN (ROE000)'
PRINT '========================================='
GO

-- =============================================
-- 1. USP_EMPRESA - BD LOGIN
-- =============================================
PRINT 'Ejecutando: 0USP_EMPRESA.sql...'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_EMPRESA]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_EMPRESA];
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\0USP_EMPRESA.sql"
GO

-- =============================================
-- 2. USP_USUARIO - BD LOGIN
-- =============================================
PRINT 'Ejecutando: 0USP_USUARIO.sql...'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_USUARIO]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_USUARIO];
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\0USP_USUARIO.sql"
GO

-- =============================================
-- 3. USP_SESION_USUARIO - BD LOGIN
-- =============================================
PRINT 'Ejecutando: 0USP_SESION_USUARIO.sql...'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_SESION_USUARIO]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_SESION_USUARIO];
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\0USP_SESION_USUARIO.sql"
GO

PRINT 'SPs de BD LOGIN (ROE000) ejecutados correctamente.'
GO
PRINT ''
GO

-- =============================================
-- BD DATOS (ROE001)
-- =============================================

USE [ROE001]
GO
PRINT '========================================='
PRINT 'EJECUTANDO SPs EN BD DATOS (ROE001)'
PRINT '========================================='
GO

-- =============================================
-- 4. USP_CREAR_CLIENTE - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_CREAR_CLIENTE.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_CREAR_CLIENTE.sql"
GO

-- =============================================
-- 5. USP_SESION_CLIENTES - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_SESION_CLIENTES.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_SESION_CLIENTES.sql"
GO

-- =============================================
-- 6. USP_CONSULTA_PEDIDOS - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_CONSULTA_PEDIDOS.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_CONSULTA_PEDIDOS.sql"
GO

-- =============================================
-- 7. USP_CONSULTA_PEDIDO - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_CONSULTA_PEDIDO.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_CONSULTA_PEDIDO.sql"
GO

-- =============================================
-- 8. USP_CONSULTA_PRODUCTOS_PEDIDO - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_CONSULTA_PRODUCTOS_PEDIDO.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_CONSULTA_PRODUCTOS_PEDIDO.sql"
GO

-- =============================================
-- 9. USP_CONDICION - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_CONDICION.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_CONDICION.sql"
GO

-- =============================================
-- 10. USP_STOCK_PRODUCTOS - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_STOCK_PRODUCTOS.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_STOCK_PRODUCTOS.sql"
GO

-- =============================================
-- 11. USP_SESION_DOCUMENTOS - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_SESION_DOCUMENTOS.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_SESION_DOCUMENTOS.sql"
GO

-- =============================================
-- 12. USP_CONSULTA_UBIGEO - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_CONSULTA_UBIGEO.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_CONSULTA_UBIGEO.sql"
GO

-- =============================================
-- 13. USP_GET_REPORTE_CLIENTE - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_GET_REPORTE_CLIENTE.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_GET_REPORTE_CLIENTE.sql"
GO

-- =============================================
-- 14. USP_GET_REPORTE_PROVEEDOR - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_GET_REPORTE_PROVEEDOR.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_GET_REPORTE_PROVEEDOR.sql"
GO

-- =============================================
-- 15. USP_GET_REPORTE_PRODUCTO - BD DATOS
-- =============================================
PRINT 'Ejecutando: 1USP_GET_REPORTE_PRODUCTO.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\1USP_GET_REPORTE_PRODUCTO.sql"
GO

-- =============================================
-- 16. SP_PRODUCTOS - BD DATOS
-- =============================================
PRINT 'Ejecutando: SP_PRODUCTOS.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\SP_PRODUCTOS.sql"
GO

-- =============================================
-- 17. USP_SESION_MONEDAS - BD DATOS (Nota: aunque tiene prefijo 0, va en BD DATOS según documentación)
-- =============================================
PRINT 'Ejecutando: 0USP_SESION_MONEDAS.sql...'
GO

:r "E:\Fuentes Nexwork\Toma_Pedido\sql\0USP_SESION_MONEDAS.sql"
GO

PRINT ''
GO
PRINT '========================================='
PRINT 'TODOS LOS SPs EJECUTADOS CORRECTAMENTE'
PRINT '========================================='
GO



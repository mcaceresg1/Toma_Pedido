-- =============================================
-- SCRIPT: CREAR ÍNDICES PARA OPTIMIZAR USP_CONSULTA_PEDIDOS
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe ejecutarse en BK01, ROE01, etc.)
-- FECHA: 14/12/2025
-- =============================================
-- 
-- Descripción: Crea índices no agrupados para mejorar el rendimiento
--              de las búsquedas en USP_CONSULTA_PEDIDOS
--
-- NOTA: Estos índices mejoran significativamente el rendimiento de:
--       - Búsquedas por usuario y fecha
--       - Búsquedas por número de pedido (OPERACION)
--       - Búsquedas por RUC
--       - Búsquedas por nombre de cliente (RAZON)
-- =============================================

USE BK01
GO

-- Verificar si los índices ya existen antes de crearlos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PED009_USUARIO_FECHA' AND object_id = OBJECT_ID('dbo.PED009'))
BEGIN
    PRINT 'Creando índice IX_PED009_USUARIO_FECHA...';
    CREATE NONCLUSTERED INDEX IX_PED009_USUARIO_FECHA 
    ON dbo.PED009(USUARIO, FECHA DESC, OPERACION)
    INCLUDE (RUC, IDVENDEDOR, BASE, IMPUESTO, TOTAL, ORDEN_COMPRA, FACTURA, MONEDA);
    PRINT 'Índice IX_PED009_USUARIO_FECHA creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'Índice IX_PED009_USUARIO_FECHA ya existe.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PED009_OPERACION' AND object_id = OBJECT_ID('dbo.PED009'))
BEGIN
    PRINT 'Creando índice IX_PED009_OPERACION...';
    CREATE NONCLUSTERED INDEX IX_PED009_OPERACION 
    ON dbo.PED009(OPERACION)
    INCLUDE (USUARIO, FECHA, RUC, IDVENDEDOR, BASE, IMPUESTO, TOTAL, ORDEN_COMPRA, FACTURA, MONEDA);
    PRINT 'Índice IX_PED009_OPERACION creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'Índice IX_PED009_OPERACION ya existe.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PED009_RUC' AND object_id = OBJECT_ID('dbo.PED009'))
BEGIN
    PRINT 'Creando índice IX_PED009_RUC...';
    CREATE NONCLUSTERED INDEX IX_PED009_RUC 
    ON dbo.PED009(RUC)
    INCLUDE (USUARIO, FECHA, OPERACION, IDVENDEDOR, BASE, IMPUESTO, TOTAL, MONEDA);
    PRINT 'Índice IX_PED009_RUC creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'Índice IX_PED009_RUC ya existe.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CUE001_RAZON' AND object_id = OBJECT_ID('dbo.CUE001'))
BEGIN
    PRINT 'Creando índice IX_CUE001_RAZON...';
    CREATE NONCLUSTERED INDEX IX_CUE001_RAZON 
    ON dbo.CUE001(RAZON)
    INCLUDE (RUC, IDVENDEDOR, DIRECCION);
    PRINT 'Índice IX_CUE001_RAZON creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'Índice IX_CUE001_RAZON ya existe.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CUE001_RUC_IDVENDEDOR' AND object_id = OBJECT_ID('dbo.CUE001'))
BEGIN
    PRINT 'Creando índice IX_CUE001_RUC_IDVENDEDOR...';
    CREATE NONCLUSTERED INDEX IX_CUE001_RUC_IDVENDEDOR 
    ON dbo.CUE001(RUC, IDVENDEDOR)
    INCLUDE (RAZON, DIRECCION);
    PRINT 'Índice IX_CUE001_RUC_IDVENDEDOR creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'Índice IX_CUE001_RUC_IDVENDEDOR ya existe.';
END
GO

PRINT '=============================================';
PRINT 'SCRIPT DE ÍNDICES COMPLETADO';
PRINT '=============================================';
GO


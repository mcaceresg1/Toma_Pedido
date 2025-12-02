-- =============================================
-- SCRIPT DE VERIFICACIÓN
-- Verifica si SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA incluye el campo RUC
-- =============================================

USE ROE01;
GO

PRINT '=============================================';
PRINT 'VERIFICANDO STORED PROCEDURE';
PRINT '=============================================';
PRINT '';

-- Ver la definición del stored procedure
DECLARE @Definicion NVARCHAR(MAX);
SET @Definicion = OBJECT_DEFINITION(OBJECT_ID('SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA'));

IF @Definicion IS NULL
BEGIN
    PRINT '❌ ERROR: El stored procedure SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA NO EXISTE';
    PRINT '';
    PRINT 'SOLUCIÓN:';
    PRINT '1. Ejecutar el archivo: sql\SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA.sql';
END
ELSE IF CHARINDEX('PED009.RUC', @Definicion) > 0
BEGIN
    PRINT '✅ CORRECTO: El stored procedure SÍ incluye el campo RUC';
    PRINT '';
    PRINT 'Ahora puedes:';
    PRINT '1. Reiniciar el backend';
    PRINT '2. Refrescar el navegador';
    PRINT '3. Exportar Excel Detallado';
    PRINT '4. El campo DOCUMENTO (RUC) debe aparecer';
END
ELSE
BEGIN
    PRINT '❌ ERROR: El stored procedure NO incluye el campo RUC';
    PRINT '';
    PRINT 'SOLUCIÓN:';
    PRINT '1. Ejecutar el archivo actualizado:';
    PRINT '   E:\Fuentes Nexwork\Toma_Pedido\sql\SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA.sql';
    PRINT '';
    PRINT '2. Luego reiniciar el backend';
END

PRINT '';
PRINT '=============================================';
GO


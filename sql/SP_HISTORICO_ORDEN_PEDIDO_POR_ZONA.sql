USE ROE01;
GO

-- =============================================
-- STORED PROCEDURE: SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: ROE01 (Producción) / ROE001 (Desarrollo)
-- TABLA: PED009, PED008, CUE001, CUE004, CUE005, CUE010, INV009, ROE00.dbo.GLO002
-- FECHA CREACIÓN: 04/12/2025 20:37:22 - Sistema
-- =============================================
-- 
-- Descripción: Obtiene el histórico de pedidos agrupados y ordenados por zona geográfica.
--              Incluye información del vendedor, cliente, ubigeo y zona asignada.
--
-- Parámetros:
--   @FECHAINICIO DATETIME - Fecha inicial del rango de búsqueda (opcional)
--   @FECHAFIN DATETIME - Fecha final del rango de búsqueda (opcional)
--   @IDVENDEDOR INT - ID del vendedor para filtrar (opcional, NULL=todos)
--   @CONDESPACHO BIT - Filtrar por estado de despacho (opcional):
--                      1=Solo con despacho, 0=Solo sin despacho, NULL=Todos
--
-- Retorna: Lista de pedidos con campos de vendedor, operación, fecha, cliente,
--          total, estado, guía, factura, ubigeo y zona
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos (ROE01 y ROE001)
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA];
GO

CREATE PROCEDURE [dbo].[SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA]
    @FECHAINICIO DATETIME = NULL,
    @FECHAFIN DATETIME = NULL,
    @IDVENDEDOR INT = NULL,
    @CONDESPACHO BIT = NULL
AS
BEGIN
    SELECT 
        VEN.NOMBRE AS VENDEDOR,
        PED009.OPERACION, 
        PED009.FECHA, 
        LEFT(PED009.NOMBRE, 30) AS CLIENTE,
        PED009.RUC,
        PED009.REFERENCIA,
        PED009.TOTAL / NULLIF(PED009.TASA_DOLAR, 0) AS TOTAL,
        MON.SIMBOLO,
        REPLACE(PED009.GUIA,'20600145330-09-','') AS GUIA,
        (SELECT TOP 1 REFERENCIA FROM INV009 WHERE PEDIDO = PED009.OPERACION) AS FACTURA,
        CASE 
            WHEN PED009.ESTADO = '' THEN 'PENDIENTE' 
            WHEN PED009.ESTADO = 'A' THEN 'ANULADO' 
            WHEN PED009.ESTADO = 'D' THEN 'DESPACHADO' 
            WHEN PED009.ESTADO = 'P' THEN 'PARCIAL' 
        END AS ESTADO,
        PED009.ACEPTADA_POR_LA_SUNAT,
        CAST(CASE WHEN PED009.REFERENCIA_ANULADA <> '' THEN 1 ELSE 0 END AS BIT) AS ANU,
        (SELECT SUM(CANTIDAD) FROM PED008 WHERE PED008.OPERACION = PED009.OPERACION) AS ORGINAL,
        (SELECT SUM(CANTIDAD_DESPACHADA) FROM PED008 WHERE PED008.OPERACION = PED009.OPERACION) AS DESPACHADA,
        -- Campos adicionales para zona (al final)
        CONCAT(CUE005.DISTRITO, ', ', CUE005.PROVINCIA, ', ', CUE005.DEPARTAMENTO) AS UBIGEO,
        CUE010.CORTO AS ZONA
    FROM PED009
    INNER JOIN ROE00.dbo.GLO002 MON ON PED009.MONEDA = MON.CODIGO
    INNER JOIN CUE004 VEN ON PED009.IDVENDEDOR = VEN.IDVENDEDOR
    -- JOIN con tabla de clientes para obtener Ubigeo
    LEFT JOIN CUE001 ON PED009.RUC = CUE001.RUC
    -- JOIN con tabla de ubigeos para obtener Departamento, Provincia, Distrito
    LEFT JOIN CUE005 ON CUE001.UBIGEO = CUE005.UBIGEO
    -- JOIN con tabla de zonas usando la columna ZONA de CUE005
    LEFT JOIN CUE010 ON CUE005.ZONA = CUE010.ZONA
    WHERE 
        PED009.IDDOCUMENTO = 13
        AND (@FECHAINICIO IS NULL OR PED009.FECHA >= @FECHAINICIO)
        AND (@FECHAFIN IS NULL OR PED009.FECHA <= @FECHAFIN)
        AND (@IDVENDEDOR IS NULL OR PED009.IDVENDEDOR = @IDVENDEDOR)
        AND (@CONDESPACHO IS NULL OR 
             (@CONDESPACHO = 1 AND (SELECT SUM(CANTIDAD_DESPACHADA) FROM PED008 WHERE PED008.OPERACION = PED009.OPERACION) > 0) OR
             (@CONDESPACHO = 0 AND (SELECT SUM(CANTIDAD_DESPACHADA) FROM PED008 WHERE PED008.OPERACION = PED009.OPERACION) = 0))
    ORDER BY CONCAT(CUE005.DISTRITO, ', ', CUE005.PROVINCIA, ', ', CUE005.DEPARTAMENTO), PED009.OPERACION DESC;
END
GO

PRINT 'Stored procedure [SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA] creado exitosamente.';
GO

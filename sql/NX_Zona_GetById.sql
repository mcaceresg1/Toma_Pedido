-- =============================================
-- STORED PROCEDURE: NX_Zona_GetById
-- BASE DE DATOS: TomaPedido
-- TABLA: Zonas
-- =============================================
-- 
-- Descripción: Obtiene una zona específica por su código
--
-- NOTA: Este stored procedure debe crearse en cada ambiente
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_GetById]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Zona_GetById];
GO

CREATE PROCEDURE [dbo].[NX_Zona_GetById]
    @ZonaCodigo VARCHAR(3)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            ZonaCodigo,
            Descripcion,
            Corto
        FROM Zonas
        WHERE ZonaCodigo = @ZonaCodigo;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

PRINT 'Stored procedure NX_Zona_GetById creado exitosamente.';
GO


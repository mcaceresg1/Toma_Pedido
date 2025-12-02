-- =============================================
-- STORED PROCEDURE: NX_Zona_InsertUpdate
-- BASE DE DATOS: TomaPedido
-- TABLA: Zonas
-- =============================================
-- 
-- Descripción: Inserta o actualiza una zona
--
-- NOTA: Este stored procedure debe crearse en cada ambiente
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_InsertUpdate]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Zona_InsertUpdate];
GO

CREATE PROCEDURE [dbo].[NX_Zona_InsertUpdate]
    @ZonaCodigo VARCHAR(3),
    @Descripcion VARCHAR(100),
    @Corto VARCHAR(20) = NULL,
    @IsUpdate BIT = 0,
    @Mensaje NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Validar que el código no esté vacío
        IF @ZonaCodigo IS NULL OR LTRIM(RTRIM(@ZonaCodigo)) = ''
        BEGIN
            SET @Mensaje = 'error|El código de zona es requerido';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Validar que la descripción no esté vacía
        IF @Descripcion IS NULL OR LTRIM(RTRIM(@Descripcion)) = ''
        BEGIN
            SET @Mensaje = 'error|La descripción es requerida';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Convertir a mayúsculas
        SET @ZonaCodigo = UPPER(LTRIM(RTRIM(@ZonaCodigo)));
        SET @Descripcion = LTRIM(RTRIM(@Descripcion));
        SET @Corto = CASE WHEN @Corto IS NULL THEN NULL ELSE LTRIM(RTRIM(@Corto)) END;
        
        IF @IsUpdate = 0
        BEGIN
            -- INSERT
            -- Verificar que no exista
            IF EXISTS (SELECT 1 FROM Zonas WHERE ZonaCodigo = @ZonaCodigo)
            BEGIN
                SET @Mensaje = 'error|El código de zona ya existe';
                ROLLBACK TRANSACTION;
                RETURN;
            END
            
            INSERT INTO Zonas (ZonaCodigo, Descripcion, Corto)
            VALUES (@ZonaCodigo, @Descripcion, @Corto);
            
            SET @Mensaje = 'success|Zona creada exitosamente';
        END
        ELSE
        BEGIN
            -- UPDATE
            -- Verificar que exista
            IF NOT EXISTS (SELECT 1 FROM Zonas WHERE ZonaCodigo = @ZonaCodigo)
            BEGIN
                SET @Mensaje = 'error|La zona no existe';
                ROLLBACK TRANSACTION;
                RETURN;
            END
            
            UPDATE Zonas
            SET Descripcion = @Descripcion,
                Corto = @Corto
            WHERE ZonaCodigo = @ZonaCodigo;
            
            SET @Mensaje = 'success|Zona actualizada exitosamente';
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        SET @Mensaje = 'error|' + ERROR_MESSAGE();
    END CATCH
END
GO

PRINT 'Stored procedure NX_Zona_InsertUpdate creado exitosamente.';
GO


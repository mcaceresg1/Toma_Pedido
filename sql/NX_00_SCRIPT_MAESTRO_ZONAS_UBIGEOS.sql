-- =============================================
-- SCRIPT MAESTRO: Instalación completa de Zonas y Ubigeos
-- BASE DE DATOS: ROE01 (operativa)
-- PROYECTO: Toma de Pedidos
-- =============================================
-- 
-- Descripción: Script completo para instalar el módulo de Zonas y Ubigeos
--              Incluye creación de tablas y stored procedures
--
-- IMPORTANTE: Este script debe ejecutarse en la base de datos ROE01
-- =============================================

USE ROE01;
GO

PRINT '=============================================';
PRINT 'INSTALACIÓN DE MÓDULO ZONAS Y UBIGEOS';
PRINT 'Proyecto: Toma de Pedidos';
PRINT 'Base de Datos: ROE01';
PRINT '=============================================';
PRINT '';

-- =============================================
-- PASO 1: CREAR TABLAS
-- =============================================

PRINT '=============================================';
PRINT 'PASO 1: CREANDO TABLAS';
PRINT '=============================================';
PRINT '';

-- Tabla CUE010: Zonas
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CUE010]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[CUE010] (
        [ZONA] VARCHAR(3) NOT NULL,
        [DESCRIPCION] VARCHAR(100) NOT NULL,
        [CORTO] VARCHAR(20) NULL,
        CONSTRAINT [PK_CUE010] PRIMARY KEY CLUSTERED ([ZONA])
    );
    PRINT '✓ Tabla CUE010 (Zonas) creada exitosamente';
END
ELSE
BEGIN
    PRINT '  Tabla CUE010 ya existe';
END
GO

-- Agregar columna ZONA a CUE005 (Ubigeos) si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[CUE005]') AND name = 'ZONA')
BEGIN
    ALTER TABLE [dbo].[CUE005]
    ADD [ZONA] VARCHAR(3) NULL;
    PRINT '✓ Columna ZONA agregada a CUE005 (Ubigeos)';
END
ELSE
BEGIN
    PRINT '  Columna ZONA ya existe en CUE005';
END
GO

PRINT '';
PRINT '=============================================';
PRINT 'PASO 2: CREANDO STORED PROCEDURES - ZONAS';
PRINT '=============================================';
PRINT '';

-- =============================================
-- SP: NX_Zona_GetAll
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_GetAll]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Zona_GetAll];
GO

CREATE PROCEDURE [dbo].[NX_Zona_GetAll]
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            ZONA AS ZonaCodigo,
            DESCRIPCION AS Descripcion,
            CORTO AS Corto
        FROM CUE010
        ORDER BY ZONA;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

PRINT '✓ NX_Zona_GetAll creado exitosamente';
GO

-- =============================================
-- SP: NX_Zona_GetById
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
            ZONA AS ZonaCodigo,
            DESCRIPCION AS Descripcion,
            CORTO AS Corto
        FROM CUE010
        WHERE ZONA = @ZonaCodigo;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

PRINT '✓ NX_Zona_GetById creado exitosamente';
GO

-- =============================================
-- SP: NX_Zona_InsertUpdate
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
        
        -- Validar código
        IF @ZonaCodigo IS NULL OR LTRIM(RTRIM(@ZonaCodigo)) = ''
        BEGIN
            SET @Mensaje = 'error|El código de zona es requerido';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Validar descripción
        IF @Descripcion IS NULL OR LTRIM(RTRIM(@Descripcion)) = ''
        BEGIN
            SET @Mensaje = 'error|La descripción es requerida';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Limpiar datos
        SET @ZonaCodigo = UPPER(LTRIM(RTRIM(@ZonaCodigo)));
        SET @Descripcion = LTRIM(RTRIM(@Descripcion));
        SET @Corto = CASE WHEN @Corto IS NULL THEN NULL ELSE LTRIM(RTRIM(@Corto)) END;
        
        IF @IsUpdate = 0
        BEGIN
            -- INSERT
            IF EXISTS (SELECT 1 FROM CUE010 WHERE ZONA = @ZonaCodigo)
            BEGIN
                SET @Mensaje = 'error|El código de zona ya existe';
                ROLLBACK TRANSACTION;
                RETURN;
            END
            
            INSERT INTO CUE010 (ZONA, DESCRIPCION, CORTO)
            VALUES (@ZonaCodigo, @Descripcion, @Corto);
            
            SET @Mensaje = 'success|Zona creada exitosamente';
        END
        ELSE
        BEGIN
            -- UPDATE
            IF NOT EXISTS (SELECT 1 FROM CUE010 WHERE ZONA = @ZonaCodigo)
            BEGIN
                SET @Mensaje = 'error|La zona no existe';
                ROLLBACK TRANSACTION;
                RETURN;
            END
            
            UPDATE CUE010
            SET DESCRIPCION = @Descripcion,
                CORTO = @Corto
            WHERE ZONA = @ZonaCodigo;
            
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

PRINT '✓ NX_Zona_InsertUpdate creado exitosamente';
GO

-- =============================================
-- SP: NX_Zona_Delete
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Zona_Delete]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Zona_Delete];
GO

CREATE PROCEDURE [dbo].[NX_Zona_Delete]
    @ZonaCodigo VARCHAR(3),
    @Mensaje NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Verificar que exista
        IF NOT EXISTS (SELECT 1 FROM CUE010 WHERE ZONA = @ZonaCodigo)
        BEGIN
            SET @Mensaje = 'error|La zona no existe';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Verificar que no tenga ubigeos asignados
        IF EXISTS (SELECT 1 FROM CUE005 WHERE ZONA = @ZonaCodigo)
        BEGIN
            SET @Mensaje = 'error|No se puede eliminar la zona porque tiene ubigeos asignados';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Eliminar
        DELETE FROM CUE010 WHERE ZONA = @ZonaCodigo;
        
        SET @Mensaje = 'success|Zona eliminada exitosamente';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Mensaje = 'error|' + ERROR_MESSAGE();
    END CATCH
END
GO

PRINT '✓ NX_Zona_Delete creado exitosamente';
GO

PRINT '';
PRINT '=============================================';
PRINT 'PASO 3: CREANDO STORED PROCEDURES - UBIGEOS';
PRINT '=============================================';
PRINT '';

-- =============================================
-- SP: NX_Ubigeo_GetAll
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Ubigeo_GetAll]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Ubigeo_GetAll];
GO

CREATE PROCEDURE [dbo].[NX_Ubigeo_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        UBIGEO AS Ubigeo,
        DISTRITO AS Distrito,
        PROVINCIA AS Provincia,
        DEPARTAMENTO AS Departamento,
        ZONA AS Zona
    FROM CUE005
    ORDER BY DEPARTAMENTO, PROVINCIA, DISTRITO;
END;
GO

PRINT '✓ NX_Ubigeo_GetAll creado exitosamente';
GO

-- =============================================
-- SP: NX_Ubigeo_GetByZona
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Ubigeo_GetByZona]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Ubigeo_GetByZona];
GO

CREATE PROCEDURE [dbo].[NX_Ubigeo_GetByZona]
    @ZonaCodigo VARCHAR(3)
AS
BEGIN
    SET NOCOUNT ON;

    -- Obtener ubigeos usando la columna ZONA de CUE005
    SELECT UBIGEO
    FROM CUE005
    WHERE ZONA = @ZonaCodigo
    ORDER BY UBIGEO;
END;
GO

PRINT '✓ NX_Ubigeo_GetByZona creado exitosamente';
GO

-- =============================================
-- SP: NX_Ubigeo_SetByZona
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Ubigeo_SetByZona]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Ubigeo_SetByZona];
GO

CREATE PROCEDURE [dbo].[NX_Ubigeo_SetByZona]
    @ZonaCodigo VARCHAR(3),
    @Ubigeos NVARCHAR(MAX), -- JSON array de strings: ["010101", "010102", ...]
    @Mensaje NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Primero, limpiar el campo ZONA en CUE005 para los ubigeos que estaban en esta zona
        UPDATE CUE005
        SET ZONA = NULL
        WHERE ZONA = @ZonaCodigo;
        
        -- Insertar nuevas relaciones si hay ubigeos
        IF @Ubigeos IS NOT NULL AND LEN(LTRIM(RTRIM(@Ubigeos))) > 0 AND ISJSON(@Ubigeos) = 1
        BEGIN
            -- Actualizar el campo ZONA en CUE005 para cada ubigeo
            -- Esto permite reasignar ubigeos de una zona a otra
            UPDATE CUE005
            SET ZONA = @ZonaCodigo
            WHERE UBIGEO IN (
                SELECT value
                FROM OPENJSON(@Ubigeos)
                WHERE value IS NOT NULL AND LEN(LTRIM(RTRIM(value))) > 0
            );
        END
        
        SET @Mensaje = 'success|Los ubigeos de la zona han sido actualizados exitosamente.';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Mensaje = 'error|' + ERROR_MESSAGE();
    END CATCH
END;
GO

PRINT '✓ NX_Ubigeo_SetByZona creado exitosamente';
GO

PRINT '';
PRINT '=============================================';
PRINT 'INSTALACIÓN COMPLETADA EXITOSAMENTE';
PRINT '=============================================';
PRINT '';
PRINT 'Resumen:';
PRINT '- Tablas creadas/verificadas: 2';
PRINT '  * CUE010 (Zonas)';
PRINT '  * CUE005 (Ubigeos) - columna ZONA agregada';
PRINT '';
PRINT '- Stored Procedures creados: 7';
PRINT '  * NX_Zona_GetAll';
PRINT '  * NX_Zona_GetById';
PRINT '  * NX_Zona_InsertUpdate';
PRINT '  * NX_Zona_Delete';
PRINT '  * NX_Ubigeo_GetAll';
PRINT '  * NX_Ubigeo_GetByZona';
PRINT '  * NX_Ubigeo_SetByZona';
PRINT '';
PRINT 'El módulo de Zonas y Ubigeos está listo para usar.';
PRINT 'Accede desde el menú: Dashboard > Mantenimiento > Zonas / Ubigeos por Zona';
PRINT '';
PRINT 'NOTA: La relación entre zonas y ubigeos se maneja mediante';
PRINT '      la columna ZONA en la tabla CUE005 (sin tabla intermedia).';
PRINT '=============================================';
GO


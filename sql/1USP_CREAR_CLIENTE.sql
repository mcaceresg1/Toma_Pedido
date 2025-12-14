USE BK01
-- =============================================
-- STORED PROCEDURE: USP_CREAR_CLIENTE (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLA: CUE001
-- FECHA MODIFICACIÓN: 13/12/2025 19:25:00 - Sistema
-- =============================================
-- 
-- Descripción: Crea un nuevo cliente usando la base de datos actual de la conexión
--              ELIMINADOS los IF hardcodeados que verificaban @EMPRESA = '01' o '02'
--              y usaban PEDIDOS01, PEDIDOS02. Ahora usa la BD actual sin especificar nombre de BD
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que crea el cliente
--   @RAZON VARCHAR(150) - Razón social del cliente
--   @RUC VARCHAR(15) - RUC o DNI del cliente
--   @DIRECCION VARCHAR(200) - Dirección del cliente
--   @TELEFONO VARCHAR(100) - Teléfono del cliente
--   @CIUDAD VARCHAR(30) - Ciudad del cliente
--   @CONTACTO VARCHAR(30) - Nombre del contacto
--   @TELEFONO_CONTACTO VARCHAR(20) - Teléfono del contacto
--   @CORREO VARCHAR(50) - Correo electrónico
--   @UBIGEO VARCHAR(10) - Código de ubigeo
--   @CONDICION VARCHAR(2) - Condición de pago
--   @TIPO_DOCUMENTO VARCHAR(2) - Tipo de documento (01=RUC, 04=DNI)
--   @VENDEDOR NUMERIC(4,0) - ID del vendedor (obtenido por el código C# desde SUP001)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (ROE001, ROE01, etc.)
--       Usa la base de datos actual de la conexión, no hardcodea nombres de BD
--       ELIMINADOS los IF que verificaban empresa '01' o '02' porque ya no es necesario
-- =============================================

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USP_CREAR_CLIENTE]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[USP_CREAR_CLIENTE];
GO

CREATE PROCEDURE [dbo].[USP_CREAR_CLIENTE](
	@USUARIO VARCHAR(20),
	@RAZON VARCHAR(150),
	@RUC VARCHAR(15),
	@DIRECCION VARCHAR(200),
	@TELEFONO VARCHAR(100),
	@CIUDAD VARCHAR(30),
	@CONTACTO VARCHAR(30),
	@TELEFONO_CONTACTO VARCHAR(20),
	@CORREO VARCHAR(50),
	@UBIGEO VARCHAR(10),
	@CONDICION VARCHAR(2),
	@TIPO_DOCUMENTO VARCHAR(2),
	@VENDEDOR NUMERIC(4,0)
)
-- =============================================
-- STORED PROCEDURE: USP_CREAR_CLIENTE (CORREGIDO)
-- PROYECTO: Toma Pedido
-- BASE DE DATOS: DATOS (debe crearse en BK01, ROE01, etc.)
-- TABLA: CUE001
-- FECHA MODIFICACIÓN: 13/12/2025 19:25:00 - Sistema
-- =============================================
-- 
-- Descripción: Crea un nuevo cliente usando la base de datos actual de la conexión
--              ELIMINADOS los IF hardcodeados que verificaban @EMPRESA = '01' o '02'
--              y usaban PEDIDOS01, PEDIDOS02. Ahora usa la BD actual sin especificar nombre de BD
--
-- Parámetros:
--   @USUARIO VARCHAR(20) - Usuario que crea el cliente
--   @RAZON VARCHAR(150) - Razón social del cliente
--   @RUC VARCHAR(15) - RUC o DNI del cliente
--   @DIRECCION VARCHAR(200) - Dirección del cliente
--   @TELEFONO VARCHAR(100) - Teléfono del cliente
--   @CIUDAD VARCHAR(30) - Ciudad del cliente
--   @CONTACTO VARCHAR(30) - Nombre del contacto
--   @TELEFONO_CONTACTO VARCHAR(20) - Teléfono del contacto
--   @CORREO VARCHAR(50) - Correo electrónico
--   @UBIGEO VARCHAR(10) - Código de ubigeo
--   @CONDICION VARCHAR(2) - Condición de pago
--   @TIPO_DOCUMENTO VARCHAR(2) - Tipo de documento (01=RUC, 04=DNI)
--   @VENDEDOR NUMERIC(4,0) - ID del vendedor (obtenido por el código C# desde SUP001)
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos de datos (ROE001, ROE01, etc.)
--       Usa la base de datos actual de la conexión, no hardcodea nombres de BD
--       ELIMINADOS los IF que verificaban empresa '01' o '02' porque ya no es necesario
-- =============================================
AS
BEGIN
	SET NOCOUNT ON;
	
	BEGIN TRY
		BEGIN TRANSACTION;
		
		-- Verificar si el cliente ya existe en la BD actual (sin especificar nombre de BD)
		IF EXISTS (SELECT 1 FROM dbo.CUE001 WHERE RUC = @RUC AND CLASE LIKE 'C')
		BEGIN
			RAISERROR('El cliente ya se encuentra registrado.', 16, 1);
			ROLLBACK TRANSACTION;
			RETURN;
		END;
		
		-- Insertar el nuevo cliente en la BD actual (sin especificar nombre de BD)
		-- Ya no hay IF por empresa, se usa directamente la BD actual de la conexión
		INSERT INTO dbo.CUE001(
			IDVENDEDOR, RAZON, RUC, DIRECCION, TELEFONO, CIUDAD, CONTACTO, 
			TELEFONO_CONTACTO, CORREO, UBIGEO, CLASE, PRECIO, CONDICIONES, 
			ACTIVO, CREADO_WEB, DOMICILIADO, TIPO_DOCUMENTO, FECHA
		)
		VALUES(
			@VENDEDOR, @RAZON, @RUC, @DIRECCION, @TELEFONO, @CIUDAD, @CONTACTO, 
			@TELEFONO_CONTACTO, @CORREO, @UBIGEO, 'C', '1', @CONDICION, 
			1, 1, 1, @TIPO_DOCUMENTO, GETDATE()
		);
		
		COMMIT TRANSACTION;
	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION;
		
		DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
		RAISERROR(@ErrorMsg, 16, 1);
	END CATCH;
END;
GO

PRINT 'Stored procedure USP_CREAR_CLIENTE creado exitosamente.';
GO


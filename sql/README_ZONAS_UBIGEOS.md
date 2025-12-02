# 📋 INSTALACIÓN MÓDULO ZONAS Y UBIGEOS

## 📝 Descripción

Este módulo permite la gestión de zonas geográficas y la asignación de ubigeos a cada zona.

---

## 🗄️ Bases de Datos

- **ROE00**: Base de datos de configuración (usuarios, menús, empresas)
- **ROE01**: Base de datos operativa (pedidos, clientes, productos, **zonas**, **ubigeos**)

---

## 📦 Contenido del Módulo

### Tablas Creadas

1. **CUE010** - Zonas
   - `ZONA` (VARCHAR(3)) - Código de zona (PK)
   - `DESCRIPCION` (VARCHAR(100)) - Descripción de la zona
   - `CORTO` (VARCHAR(20)) - Descripción corta (opcional)

2. **CUE005** - Ubigeos (tabla existente, se agrega columna)
   - `ZONA` (VARCHAR(3)) - Código de zona asignada (nueva columna)

3. **CUE005_ZONA_UBIGEO** - Relación Zona-Ubigeo
   - `ZONA` (VARCHAR(3)) - Código de zona
   - `UBIGEO` (VARCHAR(10)) - Código de ubigeo
   - PK: (ZONA, UBIGEO)

### Stored Procedures Creados

#### Zonas:
- `NX_Zona_GetAll` - Obtiene todas las zonas
- `NX_Zona_GetById` - Obtiene una zona por código
- `NX_Zona_InsertUpdate` - Crea o actualiza una zona
- `NX_Zona_Delete` - Elimina una zona

#### Ubigeos:
- `NX_Ubigeo_GetAll` - Obtiene todos los ubigeos
- `NX_Ubigeo_GetByZona` - Obtiene ubigeos de una zona específica
- `NX_Ubigeo_SetByZona` - Asigna ubigeos a una zona

---

## 🚀 Instalación

### Paso 1: Ejecutar el Script Maestro

```sql
-- Abrir SQL Server Management Studio
-- Conectarse al servidor
-- Seleccionar la base de datos ROE01
-- Ejecutar el script maestro:

USE ROE01;
GO

-- Ejecutar todo el contenido de:
-- NX_00_SCRIPT_MAESTRO_ZONAS_UBIGEOS.sql
```

### Paso 2: Verificar la Instalación

```sql
-- Verificar que las tablas existan
SELECT * FROM sys.tables WHERE name IN ('CUE010', 'CUE005_ZONA_UBIGEO');

-- Verificar que los stored procedures existan
SELECT name FROM sys.procedures WHERE name LIKE 'NX_Zona%' OR name LIKE 'NX_Ubigeo%';

-- Debería mostrar 7 stored procedures
```

---

## 📖 Uso de los Stored Procedures

### Listar todas las zonas

```sql
EXEC NX_Zona_GetAll;
```

### Crear una nueva zona

```sql
DECLARE @Mensaje NVARCHAR(MAX);

EXEC NX_Zona_InsertUpdate
    @ZonaCodigo = 'LIM',
    @Descripcion = 'LIMA',
    @Corto = 'LIMA',
    @IsUpdate = 0,
    @Mensaje = @Mensaje OUTPUT;

PRINT @Mensaje;
```

### Actualizar una zona

```sql
DECLARE @Mensaje NVARCHAR(MAX);

EXEC NX_Zona_InsertUpdate
    @ZonaCodigo = 'LIM',
    @Descripcion = 'LIMA METROPOLITANA',
    @Corto = 'LIMA',
    @IsUpdate = 1,
    @Mensaje = @Mensaje OUTPUT;

PRINT @Mensaje;
```

### Eliminar una zona

```sql
DECLARE @Mensaje NVARCHAR(MAX);

EXEC NX_Zona_Delete
    @ZonaCodigo = 'LIM',
    @Mensaje = @Mensaje OUTPUT;

PRINT @Mensaje;
```

### Listar todos los ubigeos

```sql
EXEC NX_Ubigeo_GetAll;
```

### Obtener ubigeos de una zona

```sql
EXEC NX_Ubigeo_GetByZona @ZonaCodigo = 'LIM';
```

### Asignar ubigeos a una zona

```sql
DECLARE @Mensaje NVARCHAR(MAX);
DECLARE @Ubigeos NVARCHAR(MAX) = '["150101", "150102", "150103"]'; -- JSON array

EXEC NX_Ubigeo_SetByZona
    @ZonaCodigo = 'LIM',
    @Ubigeos = @Ubigeos,
    @Mensaje = @Mensaje OUTPUT;

PRINT @Mensaje;
```

---

## 🌐 Integración con el Frontend

El frontend de Angular ya está configurado para usar estos stored procedures a través de los servicios:

- **ZonaService** (`zona.service.ts`)
- **UbigeoService** (`ubigeo.service.ts`)

Los endpoints del backend deben configurarse para llamar a estos stored procedures.

---

## 🔧 Backend - Ejemplo de Implementación

### Controller (C#)

```csharp
[HttpGet]
public async Task<ActionResult<List<Zona>>> GetAll()
{
    try
    {
        using var connection = _connectionFactory.GetConnection("01");
        var zonas = await connection.QueryAsync<Zona>(
            "NX_Zona_GetAll",
            commandType: CommandType.StoredProcedure
        );
        return Ok(zonas.ToList());
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al obtener zonas");
        return StatusCode(500, new { message = ex.Message });
    }
}
```

---

## ✅ Validaciones Implementadas

### Zonas:
- ✅ Código de zona obligatorio (3 caracteres)
- ✅ Descripción obligatoria
- ✅ No permite códigos duplicados
- ✅ No permite eliminar zonas con ubigeos asignados

### Ubigeos:
- ✅ No permite asignar un ubigeo a múltiples zonas
- ✅ Valida JSON de entrada
- ✅ Limpia asignaciones previas antes de crear nuevas

---

## 🐛 Solución de Problemas

### Error: "La tabla CUE005 no existe"

**Solución:** La tabla CUE005 (Ubigeos) debe existir previamente en la base de datos. Verifica que esté creada.

### Error: "ISJSON no es una función reconocida"

**Solución:** Necesitas SQL Server 2016 o superior. Si usas una versión anterior, modifica el SP `NX_Ubigeo_SetByZona` para usar otro método de validación JSON.

### Error: "No se puede eliminar la zona porque tiene ubigeos asignados"

**Solución:** Primero debes desasignar los ubigeos de la zona usando `NX_Ubigeo_SetByZona` con un array vacío `[]`, luego podrás eliminar la zona.

---

## 📞 Soporte

Para dudas o problemas con la instalación, consultar:
- Documentación del proyecto: `NORMAS_DESARROLLO.md`
- Equipo de desarrollo

---

## 📅 Historial de Versiones

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.0 | 02/12/2025 | Versión inicial del módulo |

---

**✅ Módulo listo para usar en producción**


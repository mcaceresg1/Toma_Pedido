# 📋 INSTRUCCIONES: Ejecutar SPs en Desarrollo y Producción

## ⚠️ PROBLEMA ACTUAL

Los SPs NO existen o tienen versiones antiguas en:
- ❌ **Producción:** ROE01 (Error: Could not find stored procedure 'NX_Zona_GetAll')
- ❌ **Desarrollo:** ROE001 (Mismo error)

---

## 🎯 SOLUCIÓN

Ejecutar scripts en AMBAS bases de datos.

---

## 🔧 PRODUCCIÓN (ROE01 - 2 ceros)

### En SQL Server Management Studio:

```sql
-- 1. Conectar al servidor de PRODUCCIÓN
-- 2. Cambiar a base de datos ROE01

-- PASO 1: Limpiar (ejecutar completo)
USE ROE01;
-- Ejecutar: ___ACTUALIZAR_SPS_PRODUCCION.sql

-- PASO 2: Instalar Zonas (ejecutar completo)
USE ROE01;
-- Ejecutar: NX_00_SCRIPT_MAESTRO_ZONAS_UBIGEOS.sql
-- (Ya está configurado para ROE01)

-- PASO 3: Instalar Pedidos por Zona (ejecutar completo)
USE ROE01;
-- Ejecutar: SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA.sql
-- (Ya está configurado para ROE01)

-- PASO 4: Verificar
SELECT name FROM sys.procedures 
WHERE name LIKE 'NX_%' OR name LIKE 'SP_HISTORICO%'
ORDER BY name;
-- Deberías ver 8 SPs
```

---

## 🔧 DESARROLLO (ROE001 - 3 ceros)

### En SQL Server Management Studio:

```sql
-- 1. Conectar al servidor de DESARROLLO (puede ser el mismo servidor)
-- 2. Cambiar a base de datos ROE001

-- PASO 1: Limpiar (ejecutar completo)
USE ROE001;
-- Ejecutar: ___ACTUALIZAR_SPS_DESARROLLO.sql

-- PASO 2: Modificar temporalmente los scripts

-- ABRIR: NX_00_SCRIPT_MAESTRO_ZONAS_UBIGEOS.sql
-- CAMBIAR línea 13: USE ROE01; → USE ROE001;
-- EJECUTAR el archivo completo

-- ABRIR: SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA.sql
-- CAMBIAR línea 1: USE ROE01; → USE ROE001;
-- EJECUTAR el archivo completo

-- REVERTIR los cambios en los archivos (volver a ROE01)

-- PASO 3: Verificar
SELECT name FROM sys.procedures 
WHERE name LIKE 'NX_%' OR name LIKE 'SP_HISTORICO%'
ORDER BY name;
-- Deberías ver 8 SPs
```

---

## ✅ Verificación Final

### En cada base de datos ejecuta:

```sql
-- Ver SPs creados
SELECT 
    name AS [Stored Procedure],
    create_date AS [Fecha Creación],
    modify_date AS [Última Modificación]
FROM sys.procedures 
WHERE name LIKE 'NX_%' OR name LIKE 'SP_HISTORICO%'
ORDER BY name;

-- Ver tabla CUE010
SELECT * FROM CUE010;

-- Ver columna ZONA en CUE005
SELECT TOP 5 UBIGEO, DISTRITO, PROVINCIA, DEPARTAMENTO, ZONA 
FROM CUE005;
```

---

## 📝 Lista de SPs que deben existir (8 total):

1. ✅ NX_Zona_GetAll
2. ✅ NX_Zona_GetById
3. ✅ NX_Zona_InsertUpdate
4. ✅ NX_Zona_Delete
5. ✅ NX_Ubigeo_GetAll
6. ✅ NX_Ubigeo_GetByZona
7. ✅ NX_Ubigeo_SetByZona
8. ✅ SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA

---

## 🚀 Después de ejecutar en BD

### Reiniciar Backend:

```bash
# Detener con Ctrl+C
# Reiniciar
cd E:\Fuentes Nexwork\Toma_Pedido\Api.Roy
dotnet run
```

### Refrescar Frontend:

```
F5 en el navegador
```

---

## ✅ Resultado Esperado:

- ✅ En Gestión de Zonas: Se carga sin errores
- ✅ Puedes crear, editar y eliminar zonas
- ✅ En Ubigeos por Zona: Puedes asignar ubigeos
- ✅ En Pedidos por Zona: Se muestra el reporte

---

**IMPORTANTE:** Los scripts principales (`NX_00_SCRIPT_MAESTRO` y `SP_HISTORICO`) están configurados para **ROE01 (PRODUCCIÓN)**. Para desarrollo debes cambiar temporalmente a ROE001.

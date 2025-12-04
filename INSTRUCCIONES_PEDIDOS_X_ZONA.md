# 📋 INSTRUCCIONES: Implementación de Pedidos x Zona

## ✅ Cambios Realizados

### Frontend (Angular)

1. **Menú Reorganizado** (`dashboard.component.html`):
   - ✅ HOME (sin cambios)
   - ✅ VENTAS (submenú)
     - Registro Pedido
     - REPORTE VENTAS (submenú anidado)
       - Pedidos x Vendedor (antes "Reporte Pedidos")
       - Pedidos x Zona (nuevo)
   - ✅ REPORTE COMPRAS (submenú)
     - Productos
     - Proveedores

2. **Componente Orden Pedido** (`orden-pedido.component.ts`):
   - ✅ Detecta si está en modo "zona" mediante la ruta
   - ✅ Muestra columnas adicionales (Ubigeo y Zona) cuando está en modo zona

3. **Modelo TypeScript** (`Pedido.ts`):
   - ✅ Agregados campos opcionales `ubigeo?: string` y `zona?: string` a `HistoricoPedidoCabecera`

4. **Rutas** (`dashboard-routing.module.ts`):
   - ✅ Agregada ruta `/dashboard/pages/ordenPedidosZona` con data `{ modo: 'zona' }`

### Backend (.NET)

1. **Modelo C#** (`EcHistoricoPedidoCabecera.cs`):
   - ✅ Agregados campos opcionales `Ubigeo` y `Zona`

2. **Acceso a Datos** (`DbPedido.cs`):
   - ✅ Modificado `GetHistoricoPedidosCabecera` para mapear campos `UBIGEO` y `ZONA` desde el DataRow

---

## ⚠️ ACCIÓN REQUERIDA: Modificar Stored Procedure

**IMPORTANTE:** El stored procedure `SP_HISTORICO_ORDEN_PEDIDO_CABECERA` debe ser modificado para incluir los campos `UBIGEO` y `ZONA` en el SELECT.

### Estructura de Datos

Según la información proporcionada:
- Tabla `cue001` (Clientes) tiene el campo `Ubigeo`
- Tabla `cue005` (Ubigeos) contiene la información de Ubigeo y Zona
- El campo `Ubigeo` en `cue001` se enlaza con `cue005`

### Ejemplo de Modificación del Stored Procedure

El stored procedure debe hacer un JOIN con las tablas de clientes y ubigeos para obtener esta información:

```sql
-- Ejemplo de cómo debería verse el SELECT (ajustar según tu esquema real)
SELECT 
    -- ... otros campos existentes ...
    c.UBIGEO AS UBIGEO,
    u.ZONA AS ZONA
FROM 
    -- ... tu tabla principal de pedidos ...
    LEFT JOIN cue001 c ON -- condición de join con clientes
    LEFT JOIN cue005 u ON c.UBIGEO = u.UBIGEO -- join con tabla de ubigeos
WHERE 
    -- ... condiciones existentes ...
```

### Campos que debe devolver el SP:

El stored procedure `SP_HISTORICO_ORDEN_PEDIDO_CABECERA` debe incluir en su SELECT:
- `UBIGEO` (string, puede ser NULL)
- `ZONA` (string, puede ser NULL)

**Nota:** Si el stored procedure no devuelve estos campos, la aplicación seguirá funcionando pero las columnas Ubigeo y Zona aparecerán vacías en el reporte "Pedidos x Zona".

---

## 🧪 Pruebas Recomendadas

1. **Probar Menú:**
   - Verificar que el menú se expande correctamente
   - Verificar que "Pedidos x Vendedor" funciona como antes
   - Verificar que "Pedidos x Zona" muestra las columnas adicionales

2. **Probar Backend:**
   - Verificar que el endpoint `/api/pedidos/GetHistoricoPedidos` devuelve los campos `ubigeo` y `zona`
   - Verificar que los valores son correctos según la base de datos

3. **Probar Frontend:**
   - Verificar que "Pedidos x Vendedor" no muestra las columnas Ubigeo/Zona
   - Verificar que "Pedidos x Zona" muestra las columnas Ubigeo/Zona con datos correctos

---

## 📝 Notas Técnicas

- Los campos `Ubigeo` y `Zona` son opcionales (nullable) tanto en el backend como en el frontend
- Si el stored procedure no devuelve estos campos, la aplicación no fallará, solo mostrará valores vacíos
- El componente `OrdenPedidoComponent` es reutilizado para ambos reportes, diferenciándose por el parámetro de ruta

---

## 🔄 Siguiente Paso

**Modificar el stored procedure `SP_HISTORICO_ORDEN_PEDIDO_CABECERA` en la base de datos para incluir los campos UBIGEO y ZONA.**

Una vez modificado el stored procedure, la funcionalidad estará completamente operativa.

---

**Fecha de Implementación:** 30/12/2025  
**Estado:** ✅ Frontend y Backend listos - Pendiente modificación de Stored Procedure










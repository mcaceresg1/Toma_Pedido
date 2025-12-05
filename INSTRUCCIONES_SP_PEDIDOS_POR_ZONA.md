# 📋 INSTRUCCIONES: Stored Procedure para Pedidos por Zona

## ✅ Cambios Realizados en el Código

### Backend (.NET)

1. **Nuevo método en `IDbPedido`**: `GetHistoricoPedidosPorZona`
2. **Implementación en `DbPedido.cs`**: Usa el SP `SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA`
3. **Nuevo método en `IBcPedido`**: `GetHistoricoPedidosPorZona`
4. **Implementación en `BcPedido.cs`**: NO carga detalles (solo cabeceras)
5. **Nuevo endpoint en `PedidosController`**: `/api/pedidos/GetHistoricoPedidosPorZona`

### Frontend (Angular)

1. **Nuevo método en `VentasService`**: `getHistoricoPedidosPorZona()`
2. **Componente actualizado**: 
   - Usa el nuevo método cuando está en modo zona
   - NO muestra el detalle en modo zona
   - NO permite seleccionar órdenes en modo zona

---

## ⚠️ ACCIÓN REQUERIDA: Crear Stored Procedure

**IMPORTANTE:** Debes crear el stored procedure `SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA` en la base de datos.

### Características del SP

- **Nombre:** `SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA`
- **Parámetros:**
  - `@FECHAINICIO` (DateTime, nullable)
  - `@FECHAFIN` (DateTime, nullable)
  - `@IDVENDEDOR` (Int, nullable)

### Campos que debe devolver

El SP debe devolver los mismos campos que `SP_HISTORICO_ORDEN_PEDIDO_CABECERA`, pero **ADICIONALMENTE** debe incluir:

- `UBIGEO` (string, puede ser NULL) - desde tabla `cue001` (Clientes)
- `ZONA` (string, puede ser NULL) - desde tabla `cue005` (Ubigeos)

### Estructura de JOIN

El SP debe hacer JOIN con:
1. Tabla `cue001` (Clientes) para obtener el campo `Ubigeo` del cliente
2. Tabla `cue005` (Ubigeos) para obtener el campo `Zona` basado en el `Ubigeo`

### Ejemplo de Estructura SQL

```sql
CREATE OR ALTER PROCEDURE SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA
    @FECHAINICIO DATETIME = NULL,
    @FECHAFIN DATETIME = NULL,
    @IDVENDEDOR INT = NULL
AS
BEGIN
    SELECT 
        -- Campos existentes del SP original
        VENDEDOR,
        OPERACION,
        FECHA,
        CLIENTE,
        REFERENCIA,
        TOTAL,
        SIMBOLO,
        GUIA,
        FACTURA,
        ESTADO,
        ACEPTADA_POR_LA_SUNAT,
        ANU,
        ORGINAL,
        DESPACHADA,
        -- Campos adicionales para zona
        C.UBIGEO AS UBIGEO,
        U.ZONA AS ZONA
    FROM 
        -- Tu tabla principal de pedidos (ajustar según tu esquema)
        [TU_TABLA_PEDIDOS] P
        -- JOIN con clientes para obtener Ubigeo
        LEFT JOIN cue001 C ON P.COD_CLIENTE = C.COD_CLIENTE -- Ajustar según tu esquema
        -- JOIN con ubigeos para obtener Zona
        LEFT JOIN cue005 U ON C.UBIGEO = U.UBIGEO
    WHERE 
        -- Condiciones de fecha
        (@FECHAINICIO IS NULL OR P.FECHA >= @FECHAINICIO)
        AND (@FECHAFIN IS NULL OR P.FECHA <= @FECHAFIN)
        -- Condición de vendedor
        AND (@IDVENDEDOR IS NULL OR P.ID_VENDEDOR = @IDVENDEDOR)
    ORDER BY 
        P.FECHA DESC, P.OPERACION DESC
END
GO
```

**Nota:** Ajusta los nombres de tablas, campos y condiciones de JOIN según tu esquema de base de datos real.

---

## 📊 Diferencias entre los dos SPs

| Característica | SP_HISTORICO_ORDEN_PEDIDO_CABECERA | SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA |
|----------------|-------------------------------------|-------------------------------------|
| **Uso** | Pedidos x Vendedor | Pedidos x Zona |
| **Detalle** | Sí (se carga después) | No |
| **Campos adicionales** | No | Sí (UBIGEO, ZONA) |
| **JOIN con cue001** | No necesario | Sí |
| **JOIN con cue005** | No necesario | Sí |

---

## 🧪 Pruebas Recomendadas

1. **Crear el SP** en la base de datos
2. **Probar el SP directamente** con parámetros de prueba
3. **Verificar que devuelve** los campos UBIGEO y ZONA
4. **Probar el endpoint** `/api/pedidos/GetHistoricoPedidosPorZona`
5. **Verificar en el frontend** que:
   - Muestra las columnas Ubigeo y Zona
   - NO muestra el detalle
   - NO permite seleccionar órdenes

---

## 📝 Notas Técnicas

- El SP debe ser similar a `SP_HISTORICO_ORDEN_PEDIDO_CABECERA` pero con los JOINs adicionales
- Los campos UBIGEO y ZONA pueden ser NULL si el cliente no tiene ubigeo asignado
- El frontend maneja correctamente valores NULL mostrando "-" en esos casos

---

**Fecha de Implementación:** 30/12/2025  
**Estado:** ✅ Código listo - Pendiente creación del Stored Procedure















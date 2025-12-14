# PLAN DE OPTIMIZACIÓN - USP_CONSULTA_PEDIDOS

## PROBLEMAS IDENTIFICADOS

### 1. **Búsqueda con LIKE no optimizada** (CRÍTICO)
- **Problema**: `LIKE '%texto%'` no puede usar índices eficientemente
- **Ubicación**: Líneas 133-136
- **Impacto**: Escaneo completo de tabla para cada búsqueda
- **Solución**: Usar búsqueda condicional:
  - Si es numérico → buscar por OPERACION o RUC exacto
  - Si es texto → usar LIKE solo con comodín final (`texto%`) o FULL-TEXT SEARCH

### 2. **Conversiones costosas** (ALTO)
- **Problema**: `STR(TRY_CONVERT(BIGINT, ...))` se ejecuta para cada fila
- **Ubicación**: Línea 133
- **Impacto**: CPU intensivo en cada evaluación
- **Solución**: Validar el tipo de búsqueda ANTES del WHERE, evitar conversiones en el JOIN

### 3. **COUNT(*) OVER (PARTITION BY 0)** (ALTO)
- **Problema**: Calcula el total para TODAS las filas antes de paginar
- **Ubicación**: Línea 111
- **Impacto**: Procesa más datos de los necesarios
- **Solución**: Calcular COUNT(*) solo sobre las filas filtradas, después del WHERE

### 4. **Función escalar ESTADO_PEDIDO** (MEDIO)
- **Problema**: Se ejecuta para todas las filas, incluso las que no se mostrarán
- **Ubicación**: Línea 124
- **Impacto**: Llamadas a función innecesarias
- **Solución**: Mover la función después de la paginación o crear vista/indexed view

### 5. **Filtro de estado aplicado después** (MEDIO)
- **Problema**: El filtro de estado se aplica DESPUÉS de calcular COUNT
- **Ubicación**: Línea 143
- **Impacto**: Procesa más registros de los necesarios
- **Solución**: Aplicar filtro de estado ANTES del COUNT

### 6. **SQL Dinámico innecesario** (BAJO)
- **Problema**: Uso de sp_executesql solo para GLO002
- **Ubicación**: Líneas 106-164
- **Impacto**: Overhead de compilación dinámica
- **Solución**: Mantener (necesario para BD dinámica) pero optimizar consulta interna

## SOLUCIONES PROPUESTAS

### Solución 1: Optimizar búsqueda condicional
```sql
-- En lugar de:
WHERE (
    STR(TRY_CONVERT(BIGINT, @BUSQUEDA_IN)) LIKE LTRIM(STR(TRY_CONVERT(BIGINT, P.OPERACION))) OR
    RTRIM(P.OPERACION) LIKE '%' + @BUSQUEDA_IN + '%' OR
    RTRIM(P.RUC) LIKE '%' + @BUSQUEDA_IN + '%' OR
    RTRIM(C.RAZON) LIKE '%' + @BUSQUEDA_IN + '%'
)

-- Usar:
WHERE (
    -- Si es numérico puro, buscar exacto o con LIKE al final
    (@BUSQUEDA_IN IS NULL OR @BUSQUEDA_IN = '' OR
     ISNUMERIC(@BUSQUEDA_IN) = 1 AND (P.OPERACION = @BUSQUEDA_IN OR P.OPERACION LIKE @BUSQUEDA_IN + '%') OR
     P.RUC = @BUSQUEDA_IN OR P.RUC LIKE @BUSQUEDA_IN + '%' OR
     C.RAZON LIKE @BUSQUEDA_IN + '%')
)
```

### Solución 2: Mover COUNT fuera del CTE
```sql
-- Calcular COUNT solo sobre las filas que realmente se mostrarán
-- Aplicar filtros ANTES del COUNT
```

### Solución 3: Aplicar filtro de estado antes
```sql
-- Mover el filtro de estado dentro del CTE inicial
```

### Solución 4: Crear índices recomendados
```sql
-- Índice compuesto para búsqueda por usuario y fecha
CREATE NONCLUSTERED INDEX IX_PED009_USUARIO_FECHA 
ON PED009(USUARIO, FECHA DESC, OPERACION);

-- Índice para búsqueda por OPERACION
CREATE NONCLUSTERED INDEX IX_PED009_OPERACION 
ON PED009(OPERACION);

-- Índice para búsqueda por RUC
CREATE NONCLUSTERED INDEX IX_PED009_RUC 
ON PED009(RUC);

-- Índice para CUE001.RAZON (búsqueda de cliente)
CREATE NONCLUSTERED INDEX IX_CUE001_RAZON 
ON CUE001(RAZON);
```

## IMPACTO ESPERADO

- **Reducción de tiempo de ejecución**: 60-80%
- **Reducción de uso de CPU**: 50-70%
- **Reducción de I/O**: 40-60%
- **Mejora en búsquedas**: 5-10x más rápido

## ORDEN DE IMPLEMENTACIÓN

1. Crear índices (no bloqueante, puede hacerse en paralelo)
2. Optimizar lógica de búsqueda condicional
3. Optimizar COUNT y paginación
4. Mover filtro de estado
5. Probar y medir mejoras

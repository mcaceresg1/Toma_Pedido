# Revisión Completa del Proyecto Api.Roy

**Fecha:** 30/10/2025  
**Revisor:** Auto (AI Assistant)  
**Versión Revisada:** tp-v1.0.0-20251030

---

## 🔴 PROBLEMAS CRÍTICOS DE SEGURIDAD

### 1. Credenciales en Texto Plano (CRÍTICO)
**Ubicación:** `appsettings.json`

**Problema:**
```json
"OrgConnStringDbLogin": "data source=...; user id=sa; password=12335599"
"JWT": {
    "SECRET_KEY": "4p1-tr4c3-su990rt-304-"
}
```

**Riesgo:**
- Credenciales expuestas en el repositorio
- Acceso no autorizado a la base de datos
- Compromiso de seguridad si el repositorio es público o filtrado

**Solución:**
- Usar **Azure Key Vault** o **User Secrets** para desarrollo
- Usar **variables de entorno** en IIS para producción
- Mover todas las cadenas de conexión fuera del código
- Rotar la contraseña de `sa` inmediatamente

**Implementación sugerida:**
```csharp
// En Program.cs
builder.Configuration.AddAzureKeyVault(...);
// O usar variables de entorno:
builder.Configuration.AddEnvironmentVariables();
```

---

### 2. Usuario SA en Producción (CRÍTICO)
**Problema:** Uso del usuario `sa` (sysadmin) para conexiones de aplicación

**Riesgo:**
- Acceso completo al servidor SQL
- Violación de principio de menor privilegio
- Mayor superficie de ataque

**Solución:**
- Crear usuario específico para la aplicación con permisos mínimos
- Asignar solo permisos necesarios (SELECT, INSERT, UPDATE, DELETE en las tablas requeridas)
- Eliminar permisos de sistema

---

### 3. JWT - Validación Insuficiente
**Ubicación:** `Program.cs` líneas 32-38

**Problema:**
```csharp
ValidateIssuer = false,
ValidateAudience = false
```

**Riesgo:**
- Tokens emitidos por otros sistemas podrían ser aceptados
- Falta de validación de origen del token

**Solución:**
```csharp
ValidateIssuer = true,
ValidateAudience = true,
ValidIssuer = "https://apitp.nexwork-peru.com",
ValidAudience = "https://tp.nexwork-peru.com"
```

---

### 4. JWT - Tiempo de Expiración Inconsistente
**Ubicación:** `LoginController.cs` línea 62 vs `appsettings.json` línea 17

**Problema:**
- `LoginController` usa hardcoded 600 minutos
- `appsettings.json` define 120 minutos
- No se usa la configuración del archivo

**Solución:**
```csharp
var expireMinutes = int.Parse(config["JWT:JWT_EXPIRE_MINUTES"] ?? "120");
expires: DateTime.Now.AddMinutes(expireMinutes)
```

---

## ⚠️ PROBLEMAS IMPORTANTES

### 5. Manejo de Excepciones Inadecuado
**Ubicación:** Múltiples archivos (Controllers, Services, ResourceAccess)

**Problema:**
```csharp
catch (Exception ex)
{
    throw new Exception(ex.Message, ex);
}
```

**Issues:**
- En Controllers: deberían retornar `StatusCode(500)` o `BadRequest()` en lugar de lanzar excepciones
- Pérdida de información de stack trace original
- No hay logging de errores
- El cliente recibe mensajes de error genéricos o 500

**Solución sugerida:**
```csharp
// En Controllers
catch (Exception ex)
{
    _logger.LogError(ex, "Error en GetPedidos");
    return StatusCode(500, new { message = "Error interno del servidor", errorId = Guid.NewGuid() });
}

// Usar middleware global para manejo de excepciones
app.UseExceptionHandler(...);
```

---

### 6. Falta de Validación de Entrada
**Ubicación:** Todos los Controllers

**Problema:**
- No hay validación de modelos con Data Annotations
- No se valida null antes de usar parámetros
- No hay validación de rangos numéricos

**Ejemplo problemático:**
```csharp
public async Task<IActionResult> GetPedidos(EcFiltroPedido f, int numPag, int allReg, int cantFilas)
{
    // No valida si f es null
    // No valida si numPag es negativo
    // No valida si cantFilas es razonable
}
```

**Solución:**
```csharp
[HttpPost]
[Route("GetPedidos")]
public async Task<IActionResult> GetPedidos([FromBody] EcFiltroPedido f, [FromQuery] int numPag, [FromQuery] int allReg, [FromQuery] int cantFilas)
{
    if (f == null) return BadRequest("Filtro es requerido");
    if (numPag < 0 || allReg < 0 || cantFilas < 0 || cantFilas > 1000)
        return BadRequest("Parámetros inválidos");
    // ...
}

// O usar Data Annotations en el modelo
public class EcFiltroPedido
{
    [Required]
    public string Usuario { get; set; }
    [Range(0, int.MaxValue)]
    public int NumPag { get; set; }
}
```

---

### 7. Conversiones sin Manejo de Errores
**Ubicación:** `ResourceAccess/DbPedido.cs` y otros

**Problema:**
```csharp
Subtotal = Convert.ToDouble(r["IMP_STOT"]),
```

**Riesgo:**
- `FormatException` si el valor no es numérico
- `InvalidCastException` si el tipo no coincide
- `NullReferenceException` si el valor es DBNull

**Solución:**
```csharp
Subtotal = r["IMP_STOT"] != DBNull.Value ? Convert.ToDouble(r["IMP_STOT"]) : 0,
// O mejor aún:
Subtotal = Convert.ToDouble(r["IMP_STOT"] ?? 0),
// O con manejo explícito:
Subtotal = r.IsNull("IMP_STOT") ? 0 : Convert.ToDouble(r["IMP_STOT"]),
```

---

### 8. Código Duplicado - Patrón Try-Catch
**Problema:** El mismo patrón se repite 50+ veces:
```csharp
try { ... } catch (Exception ex) { throw new Exception(ex.Message, ex); }
```

**Solución:**
- Implementar middleware global de manejo de excepciones
- Usar un Exception Filter attribute personalizado
- O eliminar try-catch innecesarios y dejar que el middleware maneje

---

### 9. Métodos Async sin Await
**Problema:** Múltiples métodos marcados `async` que no usan `await`

**Ejemplo:**
```csharp
public async Task<EcUsuario> GetUser(string user)
{
    // No hay await, es síncrono realmente
    var result = db.ObtieneLista(...);
}
```

**Solución:**
- Remover `async` y retornar `Task.FromResult()` si es necesario
- O implementar realmente operaciones asíncronas

---

### 10. Falta de Logging Estructurado
**Problema:**
- No hay logging de operaciones críticas
- No hay seguimiento de errores
- No hay métricas de performance

**Solución:**
- Implementar Serilog o NLog
- Logging de todas las operaciones de BD
- Logging de autenticaciones y autorizaciones
- Logging de errores con contexto completo

---

### 11. Swagger Disponible en Producción
**Problema:** `app.UseSwagger()` y `app.UseSwaggerUI()` están activos en producción

**Riesgo:**
- Exposición de documentación de API
- Posible información sensible en ejemplos

**Solución:**
```csharp
if (!app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

---

## 📊 PROBLEMAS MENORES / MEJORAS

### 12. Warnings de Nulabilidad
**Problema:** 155 warnings de nulabilidad en compilación

**Impacto:** Menor - pero afecta mantenibilidad

**Solución:** Revisar y corregir sistemáticamente, usando nullable reference types correctamente

---

### 13. Falta de Health Checks
**Problema:** No hay endpoints de health check para monitoreo

**Solución:**
```csharp
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString);

app.MapHealthChecks("/health");
```

---

### 14. Falta de Rate Limiting
**Problema:** No hay protección contra abuso de API

**Solución:**
- Implementar rate limiting con middleware
- O usar Azure API Management

---

### 15. CORS en Desarrollo Permite Cualquier Puerto Localhost
**Problema:** `localhost:4200` y `localhost:8080` están hardcodeados

**Solución:** Usar configuración más flexible o variables de entorno

---

## ✅ ASPECTOS POSITIVOS

1. **Separación de capas:** Bien implementada (Controllers → Services → ResourceAccess)
2. **Uso de Interfaces:** Buen uso de contratos (IBc, IDb)
3. **Estructura de carpetas:** Organización clara
4. **Conexión a BD:** Corrección reciente de apertura explícita funcionando
5. **SSL/HTTPS:** Configurado correctamente en producción
6. **CORS:** Restringido apropiadamente en producción

---

## 📋 PRIORIZACIÓN DE CORRECCIONES

### Prioridad ALTA (Hacer inmediatamente):
1. Mover credenciales a variables de entorno o Key Vault
2. Cambiar usuario de BD de `sa` a usuario específico
3. Implementar manejo global de excepciones en Controllers
4. Validar entrada en todos los endpoints

### Prioridad MEDIA (Próximas 2 semanas):
5. Corregir JWT validation (issuer/audience)
6. Implementar logging estructurado
7. Deshabilitar Swagger en producción
8. Corregir conversiones sin manejo de errores

### Prioridad BAJA (Mejoras continuas):
9. Limpiar warnings de nulabilidad
10. Eliminar métodos async innecesarios
11. Implementar health checks
12. Considerar rate limiting

---

## 🔧 HERRAMIENTAS Y RECURSOS RECOMENDADOS

1. **Azure Key Vault** - Para secretos
2. **Serilog** - Para logging estructurado
3. **FluentValidation** - Para validación de modelos
4. **Polly** - Para manejo de reintentos y circuit breakers
5. **Application Insights** - Para monitoreo en Azure

---

## 📝 NOTAS FINALES

El proyecto tiene una base sólida pero requiere mejoras importantes en seguridad y manejo de errores. La mayoría de los problemas críticos pueden resolverse sin cambios mayores en la arquitectura.

**Estado General:** ⚠️ Funcional pero necesita mejoras de seguridad críticas

**Recomendación:** Implementar correcciones de Prioridad ALTA antes de considerar el proyecto listo para producción a largo plazo.


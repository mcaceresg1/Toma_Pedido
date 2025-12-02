# 📋 NORMAS PRINCIPALES OBLIGATORIAS - TOMA PEDIDO

## ⚠️ REGLAS FUNDAMENTALES DEL DESARROLLO

Este documento establece las **normas principales y obligatorias** que deben seguirse en el desarrollo del sistema Toma de Pedidos.

---

## 1. 🗄️ SIEMPRE USAR STORED PROCEDURES

### ✅ OBLIGATORIO
**TODAS las operaciones de base de datos DEBEN usar stored procedures. NO se permiten queries SQL directos.**

### Reglas específicas:

#### 1.1. Nomenclatura de Stored Procedures
- **Prefijo obligatorio:** `NX_` (Nexwork)
- **Formato:** `NX_[Entidad]_[Accion]`
- **Ejemplos:**
  - `NX_Pedido_GetAll` - Obtener todos los pedidos
  - `NX_Pedido_GetById` - Obtener pedido por ID
  - `NX_Pedido_InsertUpdate` - Insertar o actualizar pedido
  - `NX_Pedido_Delete` - Eliminar pedido
  - `NX_Zona_GetAll` - Obtener todas las zonas
  - `NX_Ubigeo_GetByZona` - Obtener ubigeos por zona

#### 1.2. Uso en Backend (C# / .NET)
```csharp
// ✅ CORRECTO - Usar stored procedure
var result = await connection.QueryAsync<Pedido>(
    "NX_Pedido_GetAll",
    commandType: CommandType.StoredProcedure
);

// ❌ INCORRECTO - NO usar queries directos
var sql = "SELECT * FROM Pedidos";
var result = await connection.QueryAsync<Pedido>(sql);
```

#### 1.3. Ubicación de Scripts SQL
- **Todos los stored procedures deben estar en:** `sql/NX_*.sql`
- **Archivo maestro:** `sql/NX_00_SCRIPT_MAESTRO_COMPLETO.sql`
- **Ejecutar en:** Cada base de datos de empresa
- **Documentar:** Cada stored procedure creado

#### 1.4. Parámetros de Stored Procedures
- Usar `DynamicParameters` de Dapper (backend C#)
- Parámetros con `@` (ej: `@IdPedido`, `@Cliente`)
- Para operaciones que retornan mensaje: usar `@Mensaje OUTPUT`
- Validar respuesta: `mensaje.StartsWith("success")`

---

## 2. 🚫 NUNCA USAR FALLBACK

### ✅ OBLIGATORIO
**PROHIBIDO implementar fallback a queries SQL directos cuando falla un stored procedure.**

### Reglas específicas:

#### 2.1. Manejo de Errores
```csharp
// ✅ CORRECTO - Lanzar excepción si falla el SP
try
{
    var result = await connection.QueryAsync<Pedido>(
        "NX_Pedido_GetAll",
        commandType: CommandType.StoredProcedure
    );
    return result.ToList();
}
catch (Exception ex)
{
    System.Diagnostics.Debug.WriteLine($"Error: {ex.Message}");
    throw; // Re-lanzar la excepción
}

// ❌ INCORRECTO - NO usar fallback
catch (Exception ex)
{
    // Fallback a SQL directo - PROHIBIDO
    var sql = "SELECT * FROM Pedidos";
    return await connection.QueryAsync<Pedido>(sql);
}
```

#### 2.2. Si el Stored Procedure no existe
- **Solución:** Crear el stored procedure en la base de datos
- **NO crear:** Fallback a queries directos
- **Verificar:** Que el SP esté creado antes de ejecutar el código

#### 2.3. Logging de Errores
- Registrar errores con `System.Diagnostics.Debug.WriteLine` (backend)
- Registrar errores con `console.error` (frontend)
- Incluir mensaje, stack trace e inner exception
- Re-lanzar la excepción para que el controller/service la maneje

---

## 3. 🏗️ BASES DE DATOS: DESARROLLO vs PRODUCCIÓN

### ✅ OBLIGATORIO
**Siempre trabajar con bases de datos de desarrollo. NUNCA afectar producción.**

### Reglas específicas:

#### 3.1. Estructura de Bases de Datos
- **Base de configuración:** Usuarios, menús, empresas
- **Base de datos operativa:** Pedidos, clientes, productos, zonas, ubigeos
- **Separación:** Configuración vs Datos operacionales

#### 3.2. Configuración de Conexión
```json
// appsettings.json / appsettings.Development.json
{
  "ConnectionStrings": {
    "Default": "Server=xxx;Database=TomaPedido_Dev;User Id=xxx;Password=***;TrustServerCertificate=True;"
  }
}
```

#### 3.3. Selección de Base de Datos
- El parámetro `empresa` o contexto de usuario determina el alcance de datos
- Validar permisos según usuario y empresa
- No exponer datos de otras empresas

#### 3.4. Stored Procedures por Base de Datos
- Stored procedures de configuración (usuarios, menús, empresas)
- Stored procedures de operaciones (pedidos, clientes, productos, zonas, ubigeos)
- **IMPORTANTE:** Ejecutar los SPs en cada ambiente (dev, test, prod)

#### 3.5. Verificación de Ambiente
- **Desarrollo:** Usar base de datos de desarrollo para pruebas
- **Producción:** NO modificar directamente
- **Backup:** Siempre tener backup antes de cambios importantes

---

## 4. 📁 ESTRUCTURA DE ARCHIVOS SQL

### ✅ OBLIGATORIO
**Seguir la estructura establecida para archivos SQL.**

### Reglas específicas:

#### 4.1. Nomenclatura de Archivos
- **Stored Procedures individuales:** `sql/NX_[Entidad]_[Accion].sql`
- **Script maestro:** `sql/NX_00_SCRIPT_MAESTRO_COMPLETO.sql`
- **Script ejecutar todos:** `sql/NX_00_EJECUTAR_TODOS.sql`

#### 4.2. Formato de Stored Procedures
```sql
-- =============================================
-- STORED PROCEDURE: NX_[Nombre]
-- BASE DE DATOS: TomaPedido
-- TABLA: [Tabla]
-- =============================================
-- 
-- Descripción: [Descripción]
--
-- NOTA: Este stored procedure debe crearse en cada ambiente
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NX_Nombre]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[NX_Nombre];
GO

CREATE PROCEDURE [dbo].[NX_Nombre]
    @Parametro VARCHAR(10),
    @Mensaje NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Lógica del stored procedure
        
        SET @Mensaje = 'success|Mensaje de éxito';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Mensaje = 'error|' + ERROR_MESSAGE();
    END CATCH
END
GO

PRINT 'Stored procedure NX_Nombre creado exitosamente.';
GO
```

#### 4.3. Mensajes de Retorno
- **Éxito:** `'success|Mensaje descriptivo'`
- **Error:** `'error|Mensaje de error'`
- **Validar en código:** `mensaje.StartsWith("success")`

---

## 5. 🔧 PATRONES DE CÓDIGO OBLIGATORIOS

### 5.1. Backend - Servicios (C# / .NET)
```csharp
public class PedidoService
{
    private readonly IDatabaseConnectionFactory _connectionFactory;

    public async Task<List<Pedido>> GetAllAsync(string empresa)
    {
        using var connection = _connectionFactory.GetConnection(empresa);
        
        try
        {
            var result = await connection.QueryAsync<Pedido>(
                "NX_Pedido_GetAll",
                commandType: CommandType.StoredProcedure
            );
            return result.ToList();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"PedidoService Error: {ex.Message}");
            throw;
        }
    }
}
```

### 5.2. Backend - Controllers
```csharp
[HttpGet]
public async Task<ActionResult<List<Pedido>>> GetAll()
{
    try
    {
        var empresa = GetEmpresaFromUser();
        if (string.IsNullOrEmpty(empresa))
        {
            return BadRequest(new { message = "No se pudo obtener la empresa del usuario" });
        }

        var items = await _service.GetAllAsync(empresa);
        return Ok(items);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al obtener pedidos");
        return StatusCode(500, new { message = $"Error al obtener pedidos: {ex.Message}" });
    }
}
```

### 5.3. Frontend - Servicios (Angular / TypeScript)
```typescript
@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly URL = `${environment.api}pedidos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.URL);
  }

  getById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.URL}/${id}`);
  }

  create(pedido: PedidoCreateDto): Observable<Pedido> {
    return this.http.post<Pedido>(this.URL, pedido);
  }

  update(id: number, pedido: PedidoUpdateDto): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.URL}/${id}`, pedido);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.URL}/${id}`);
  }
}
```

### 5.4. Frontend - Componentes (Angular)
```typescript
export class PedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = false;
  error: string | null = null;

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.loading = true;
    this.error = null;
    
    this.pedidoService.getAll().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar pedidos: ' + (err.error?.message || err.message);
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }
}
```

### 5.5. Parámetro Empresa/Usuario
- **Backend:** Obtener de JWT o claims del usuario
- **Frontend:** El token JWT se envía automáticamente en headers
- **Validar:** Siempre verificar permisos y contexto de usuario
- **Seguridad:** No exponer datos de otras empresas/usuarios

---

## 6. 🚨 PROHIBICIONES EXPLÍCITAS

### ❌ NUNCA HACER:

1. **NO usar queries SQL directos** en servicios/repositorios
2. **NO implementar fallback** a SQL directo cuando falla un SP
3. **NO modificar producción** directamente
4. **NO crear stored procedures** sin el prefijo `NX_`
5. **NO omitir validaciones** de permisos y contexto de usuario
6. **NO usar `CommandType.Text`** en lugar de `CommandType.StoredProcedure`
7. **NO silenciar excepciones** con `catch` vacío
8. **NO retornar listas vacías** cuando hay error (lanzar excepción)
9. **NO modificar** la estructura de bases de datos sin documentar
10. **NO commitear** código sin pruebas
11. **NO hardcodear** credenciales o configuraciones sensibles
12. **NO exponer** endpoints sin autenticación/autorización

---

## 7. 🎨 ESTÁNDARES DE CÓDIGO FRONTEND

### 7.1. Componentes Angular
- Usar **standalone components** cuando sea posible
- Implementar `OnInit` para inicialización
- Separar lógica de presentación
- Usar **signals** para estado reactivo cuando corresponda

### 7.2. Estilos
- Usar **SCSS** para estilos
- Seguir nomenclatura **BEM** para clases CSS
- Estilos encapsulados por componente
- Reutilizar estilos globales cuando corresponda

### 7.3. Tipado TypeScript
- Usar **interfaces** para modelos de datos
- Evitar uso de `any`
- Definir DTOs para operaciones de creación/actualización
- Documentar propiedades cuando sea necesario

### 7.4. Manejo de Estado
- Usar **observables** para datos asíncronos
- Implementar loading states
- Mostrar mensajes de error al usuario
- Limpiar subscripciones cuando sea necesario

---

## 8. 🔒 SEGURIDAD

### 8.1. Autenticación y Autorización
- Implementar guards en rutas protegidas
- Validar permisos en backend y frontend
- Usar JWT tokens con expiración
- No almacenar información sensible en localStorage

### 8.2. Validación de Datos
- Validar en frontend (UX)
- **Validar siempre en backend** (seguridad)
- Sanitizar inputs
- Usar stored procedures con parámetros (previene SQL injection)

### 8.3. Manejo de Errores
- No exponer detalles técnicos al usuario final
- Registrar errores en logs del servidor
- Mostrar mensajes amigables al usuario
- Implementar manejo global de errores

---

## 9. ✅ CHECKLIST ANTES DE COMMIT

Antes de hacer commit de cambios, verificar:

**Backend:**
- [ ] Todos los métodos usan `CommandType.StoredProcedure`
- [ ] No hay fallback a queries SQL directos
- [ ] Los stored procedures están creados en `sql/NX_*.sql`
- [ ] Los stored procedures tienen el prefijo `NX_`
- [ ] Se valida el contexto de usuario/empresa
- [ ] Los errores se registran y se re-lanzan
- [ ] Se trabaja con base de datos de desarrollo
- [ ] Los mensajes usan formato `success|` o `error|`
- [ ] Se incluye logging adecuado

**Frontend:**
- [ ] Los componentes implementan manejo de errores
- [ ] Se muestran estados de loading
- [ ] Se validan los formularios
- [ ] Los servicios tienen tipado correcto
- [ ] No hay código comentado o console.logs innecesarios
- [ ] Los estilos están encapsulados
- [ ] Se limpian las subscripciones cuando corresponda

**General:**
- [ ] El código está formateado correctamente
- [ ] No hay credenciales hardcodeadas
- [ ] Los nombres de variables/métodos son descriptivos
- [ ] Se ha probado la funcionalidad
- [ ] Se ha actualizado documentación si es necesario

---

## 10. 📚 ESTRUCTURA DEL PROYECTO

### 10.1. Backend (si aplica)
```
Backend/
├── Controllers/          # Endpoints de API
├── Services/            # Lógica de negocio
├── Repositories/        # Acceso a datos
├── Models/              # Modelos de datos
├── DTOs/                # Data Transfer Objects
├── Helpers/             # Utilidades
├── Middleware/          # Middleware personalizados
└── sql/                 # Stored procedures
    ├── NX_*.sql
    └── NX_00_SCRIPT_MAESTRO_COMPLETO.sql
```

### 10.2. Frontend (Angular)
```
src/
├── app/
│   ├── modules/
│   │   ├── auth/           # Autenticación
│   │   └── dashboard/      # Dashboard principal
│   │       ├── components/ # Componentes reutilizables
│   │       ├── pages/      # Páginas/vistas
│   │       ├── services/   # Servicios
│   │       └── reportes/   # Reportes
│   ├── core/
│   │   ├── guards/         # Guards de rutas
│   │   ├── interceptors/   # HTTP interceptors
│   │   └── services/       # Servicios globales
│   └── shared/
│       └── util/           # Utilidades compartidas
├── models/                 # Modelos TypeScript
├── environments/           # Configuraciones de ambiente
└── assets/                 # Recursos estáticos
```

---

## 11. 📖 DOCUMENTACIÓN

### 11.1. Comentarios en Código
- Comentar lógica compleja
- Documentar stored procedures
- Explicar decisiones de diseño importantes
- Usar JSDoc para funciones públicas (TypeScript)

### 11.2. README
- Mantener README.md actualizado
- Incluir instrucciones de instalación
- Documentar variables de entorno
- Listar requisitos previos

### 11.3. Cambios en Base de Datos
- Documentar cada cambio en scripts SQL
- Incluir fecha y autor
- Describir propósito del cambio
- Mantener historial de versiones

---

## 12. 🚀 PASOS DESPUÉS DE PROGRAMAR

### ✅ CHECKLIST POST-DESARROLLO

Cuando termines de implementar una funcionalidad, sigue estos pasos en orden:

#### **PASO 1: Ejecutar Scripts SQL (si aplica)**

Si creaste o modificaste tablas/stored procedures:

```bash
# 1. Abrir SQL Server Management Studio
# 2. Conectarte al servidor
# 3. Seleccionar la base de datos correcta:
#    - ROE00 para configuración (usuarios, menús)
#    - ROE01 para operaciones (pedidos, productos, zonas, etc.)

USE ROE01;  -- O ROE00 según corresponda
GO

# 4. Ejecutar el script maestro correspondiente
-- Ejemplo: NX_00_SCRIPT_MAESTRO_ZONAS_UBIGEOS.sql

# 5. Verificar que se crearon correctamente:
SELECT name FROM sys.tables WHERE name LIKE 'CUE%';
SELECT name FROM sys.procedures WHERE name LIKE 'NX_%';
```

**⚠️ IMPORTANTE:**
- Ejecutar primero en ambiente de **desarrollo** (ROE01)
- Verificar que todo funcione correctamente
- Solo después ejecutar en **producción**
- **SIEMPRE hacer backup antes de ejecutar en producción**

---

#### **PASO 2: Verificar el Backend (si aplica)**

Si modificaste o agregaste endpoints:

```bash
# 1. Detener el backend si está corriendo
# 2. Compilar (si es necesario)
# 3. Reiniciar el backend

# Verificar que el backend esté corriendo:
# - Revisar los logs de inicio
# - Verificar que no haya errores de compilación
# - Probar endpoints con Postman/Swagger
```

**Endpoints a verificar:**
- GET `/api/zonas` - Listar zonas
- POST `/api/zonas` - Crear zona
- PUT `/api/zonas/:id` - Actualizar zona
- DELETE `/api/zonas/:id` - Eliminar zona
- GET `/api/ubigeos` - Listar ubigeos
- GET `/api/ubigeos/zona/:zonaCodigo` - Ubigeos por zona
- POST `/api/ubigeos/zona/:zonaCodigo` - Asignar ubigeos a zona

---

#### **PASO 3: Iniciar Backend y Frontend**

**Opción A: Script Automático (RECOMENDADO) 🚀**

```bash
# Ir a la carpeta sql
cd E:\Fuentes Nexwork\Toma_Pedido\sql

# Ejecutar el script de inicio
___iniciar.bat

# El script hará TODO automáticamente:
# - Cerrará procesos anteriores
# - Compilará el backend
# - Instalará dependencias del frontend (si es necesario)
# - Iniciará ambos servicios en ventanas separadas
```

**URLs de acceso:**
- Backend: http://localhost:5000
- Frontend: http://localhost:4200

**Opción B: Manual (si prefieres control individual)**

```bash
# BACKEND (Api.Roy)
cd Api.Roy
dotnet restore
dotnet build
dotnet run
# Servidor corriendo en http://localhost:5000

# FRONTEND (Web.Roy) - En otra terminal
cd Web.Roy
npm install  # Solo si agregaste dependencias
ng serve
# Servidor corriendo en http://localhost:4200
```

**Verificar:**
- ✅ No hay errores de compilación
- ✅ No hay errores de TypeScript
- ✅ Backend responde en http://localhost:5000
- ✅ Frontend carga en http://localhost:4200

---

#### **PASO 4: Probar la Funcionalidad**

1. **Abrir el navegador** y acceder a la aplicación
   - Desarrollo: `http://localhost:4200` (o el puerto configurado)
   - Producción: URL del servidor

2. **Navegar a la funcionalidad nueva**
   - Ejemplo: Dashboard > Mantenimiento > Zonas

3. **Probar TODOS los casos:**
   - ✅ Crear nuevo registro
   - ✅ Editar registro existente
   - ✅ Eliminar registro
   - ✅ Listar registros
   - ✅ Filtros y búsquedas
   - ✅ Validaciones (campos requeridos, formatos, etc.)
   - ✅ Mensajes de error
   - ✅ Mensajes de éxito

4. **Probar casos extremos:**
   - ❌ Intentar crear duplicados
   - ❌ Intentar eliminar con dependencias
   - ❌ Enviar campos vacíos
   - ❌ Intentar operaciones sin permisos

---

#### **PASO 5: Revisar Logs**

**Backend:**
```bash
# Revisar logs del servidor
# Buscar errores o warnings

# Verificar que los stored procedures se ejecuten correctamente
# Verificar tiempos de respuesta
```

**Frontend (Consola del navegador):**
```javascript
// Abrir DevTools (F12)
// Verificar que no haya errores en la consola
// Revisar las llamadas HTTP en la pestaña Network
// Verificar que las respuestas sean correctas
```

---

#### **PASO 6: Documentar Cambios**

1. **Actualizar README** (si aplica)
   - Describir la nueva funcionalidad
   - Agregar instrucciones de uso

2. **Documentar Scripts SQL**
   - Agregar comentarios en el código
   - Actualizar README de scripts SQL

3. **Comentar código complejo**
   - Agregar JSDoc en funciones importantes
   - Explicar lógica no obvia

---

#### **PASO 7: Commit y Push**

```bash
# Verificar cambios
git status

# Agregar archivos
git add .

# Commit con mensaje descriptivo
git commit -m "feat: Agregar módulo de mantenimiento de zonas y ubigeos

- Creadas tablas CUE010 y CUE005_ZONA_UBIGEO
- Implementados 7 stored procedures (NX_Zona_*, NX_Ubigeo_*)
- Creado componente mantenimiento-zonas con tabs
- Agregada opción en menú Dashboard > Mantenimiento
- Implementados servicios zona.service y ubigeo.service
- Agregada documentación completa"

# Push al repositorio
git push origin [nombre-de-tu-rama]
```

**Formato de mensajes de commit:**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (sin cambios de lógica)
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Cambios en configuración, dependencias, etc.

---

### 📋 RESUMEN RÁPIDO

```bash
# 1. SCRIPTS SQL
USE ROE01;
EXEC [script_maestro.sql]

# 2. INICIAR SERVICIOS
cd E:\Fuentes Nexwork\Toma_Pedido\sql
___iniciar.bat
# Esto inicia automáticamente Backend y Frontend

# ALTERNATIVA MANUAL:
# Backend: cd Api.Roy → dotnet run
# Frontend: cd Web.Roy → ng serve

# 3. PROBAR
# - Abrir navegador: http://localhost:4200
# - Probar TODOS los casos
# - Verificar errores en consola (F12)
# - Verificar backend: http://localhost:5000

# 4. LOGS
# - Backend: revisar ventana del Backend
# - Frontend: DevTools > Console y Network

# 5. DOCUMENTAR
# - Actualizar README
# - Comentar código

# 6. GIT
git add .
git commit -m "feat: [descripción]"
git push origin [rama]
```

---

### ⚠️ ANTES DE PRODUCCIÓN

**CHECKLIST OBLIGATORIO:**

- [ ] Scripts SQL probados en desarrollo
- [ ] Backup de base de datos producción creado
- [ ] Backend compilado sin errores
- [ ] Frontend compilado sin errores
- [ ] Todas las funcionalidades probadas
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del backend
- [ ] Documentación actualizada
- [ ] Cambios commiteados y pusheados
- [ ] Pull request aprobado (si aplica)
- [ ] Plan de rollback preparado (por si algo falla)

---

## 13. 🛠️ HERRAMIENTAS Y SCRIPTS ÚTILES

### Script de Inicio Automático

**Ubicación:** `sql/___iniciar.bat`

**Descripción:** Inicia automáticamente Backend y Frontend con un solo comando.

**Uso:**
```bash
cd E:\Fuentes Nexwork\Toma_Pedido\sql
___iniciar.bat
```

**Documentación completa:** `sql/README_INICIAR.md`

**Qué hace:**
- ✅ Cierra procesos anteriores (puertos 5000 y 4200)
- ✅ Restaura paquetes NuGet (Backend)
- ✅ Compila el Backend (Api.Roy)
- ✅ Instala dependencias npm (Frontend, si es necesario)
- ✅ Inicia Backend en puerto 5000
- ✅ Inicia Frontend en puerto 4200
- ✅ Abre 2 ventanas separadas para cada servicio

---

### Scripts SQL

**Ubicación:** `sql/`

Todos los scripts SQL maestros están en esta carpeta:
- `NX_00_SCRIPT_MAESTRO_ZONAS_UBIGEOS.sql` - Módulo de Zonas y Ubigeos
- `README_ZONAS_UBIGEOS.md` - Documentación del módulo

---

## 14. 📞 CONTACTO Y SOPORTE

Para dudas o aclaraciones sobre estas normas:
- Consultar con el equipo de desarrollo
- Revisar documentación del proyecto
- Validar con ejemplos existentes en el código

---

## 📅 Última Actualización
**2 de Diciembre de 2025** - Agregado script de inicio automático y sección de herramientas

---

**⚠️ IMPORTANTE: Estas normas son OBLIGATORIAS. Cualquier desviación debe ser aprobada explícitamente por el equipo de desarrollo.**


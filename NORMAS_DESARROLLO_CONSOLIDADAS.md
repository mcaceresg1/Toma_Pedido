# 📋 NORMAS DE DESARROLLO CONSOLIDADAS - NEXWORK

## ⚠️ REGLAS FUNDAMENTALES DEL DESARROLLO

Este documento establece las **normas principales y obligatorias** que deben seguirse en el desarrollo de todos los sistemas Nexwork.

**Proyectos aplicables:**
- ✅ **Trace ERP** (Backend: C# .NET | Frontend: Angular | BD: SQL Server)
- ✅ **Toma Pedido** (Backend: C# .NET | Frontend: Angular | BD: SQL Server)  
- ✅ **Tickets Control** (Backend: Node.js + TypeScript | Frontend: Angular | BD: SQL Server)

**Última actualización:** 4 de Diciembre de 2025

---

## 0. 📋 PLAN DE TRABAJO Y CONFIRMACIÓN

### ✅ OBLIGATORIO
**Antes de ejecutar cualquier acción significativa, se DEBE presentar un plan de trabajo y esperar la confirmación del usuario.**

### Reglas específicas:

#### 0.1. Cuándo Mostrar el Plan
- Antes de ejecutar comandos que modifiquen el sistema (deploy, build, install, migraciones)
- Antes de modificar múltiples archivos (más de 3)
- Antes de ejecutar scripts de base de datos
- Antes de cambios en infraestructura o configuración
- Antes de cualquier operación que no sea trivial

#### 0.2. Formato del Plan
```
📋 PLAN DE TRABAJO:
1. [Paso 1] - Descripción breve
2. [Paso 2] - Descripción breve
3. [Paso 3] - Descripción breve

¿Confirmas para proceder?
```

#### 0.3. Excepciones
- Operaciones de solo lectura (revisar archivos, buscar código)
- Consultas de información
- Respuestas a preguntas directas
- Correcciones de sintaxis menores (typos)

---

## 1. 🗄️ SIEMPRE USAR STORED PROCEDURES

### ✅ OBLIGATORIO
**TODAS las operaciones de base de datos DEBEN usar stored procedures. NO se permiten queries SQL directos.**

### Nomenclatura de Stored Procedures

#### 1.1. Prefijos por Proyecto:

**Trace ERP y Toma Pedido:**
- **Prefijo obligatorio:** `NX_` (Nexwork)
- **Formato:** `NX_[Entidad]_[Accion]`
- **Ejemplos:**
  - `NX_Receta_GetAll`
  - `NX_Pedido_InsertUpdate`
  - `NX_Cliente_Delete`
  - `NX_Zona_GetById`

**Tickets Control:**
- **Prefijos por módulo:**
  - `TIC_` - Tickets (ej: `TIC_ListaTickets`, `TIC_InsTicket`)
  - `GEN_` - General/Configuración (ej: `GEN_ListaCBO`)
- **Formato:** `[PREFIJO]_[Entidad/Accion]`

#### 1.2. Uso en Backend

**C# / .NET (Trace ERP, Toma Pedido):**
```csharp
// ✅ CORRECTO - Usar stored procedure
public async Task<List<Entidad>> GetAllAsync(string empresa)
{
    using var connection = _connectionFactory.GetConnection(empresa);
    
    try
    {
        var result = await connection.QueryAsync<Entidad>(
            "NX_Entidad_GetAll",
            commandType: CommandType.StoredProcedure
        );
        return result.ToList();
    }
    catch (Exception ex)
    {
        System.Diagnostics.Debug.WriteLine($"Error: {ex.Message}");
        throw;
    }
}

// ❌ INCORRECTO - NO usar queries directos
var sql = "SELECT * FROM Tabla";
var result = await connection.QueryAsync<Entidad>(sql);
```

**Node.js + TypeScript (Tickets Control):**
```typescript
// ✅ CORRECTO - Usar stored procedure
async getAll(): Promise<Ticket[]> {
  try {
    const pool = await this.dbConnection.getPool();
    const result = await pool.request()
      .execute('TIC_ListaTickets'); // ✅ Stored Procedure
    
    return result.recordset;
  } catch (error) {
    console.error('Error en getAll:', error);
    throw new DatabaseError('Error al obtener tickets');
  }
}

// ❌ INCORRECTO - NO usar queries directos
const result = await pool.request()
  .query('SELECT * FROM TIC_TICKETS'); // ❌ Query directo
```

#### 1.3. Ubicación de Scripts SQL

⚠️ **OBLIGATORIO: Todos los archivos .SQL que se creen para ejecutar DEBEN ir en:**

**Trace ERP:**
```
E:\Fuentes Nexwork\Trace_ERP\sql\
```

**Toma Pedido:**
```
E:\Fuentes Nexwork\Toma_Pedido\sql\
```

**Tickets Control:**
```
E:\Fuentes Nexwork\Tickets_Control\SP Control de versiones\
```

**NO colocar scripts SQL en:**
- ❌ `[Backend]\ScriptsDB\` (solo para referencia/backup)
- ❌ Dentro de carpetas de código fuente
- ❌ Cualquier otra ubicación

**Razón:** Centralizar todos los scripts ejecutables en un solo directorio facilita:
- ✅ Encontrarlos rápidamente
- ✅ Ejecutarlos en orden
- ✅ Mantener control de versiones
- ✅ Documentarlos adecuadamente

#### 1.4. Formato de Stored Procedures

```sql
-- =============================================
-- STORED PROCEDURE: [Prefijo]_[Nombre]
-- PROYECTO: [Trace ERP / Toma Pedido / Tickets Control]
-- BASE DE DATOS: [Nombre BD]
-- TABLA: [Tabla principal]
-- FECHA CREACIÓN: [DD/MM/YYYY HH:MM] - [Autor]
-- =============================================
-- 
-- Descripción: [Descripción detallada]
--
-- Parámetros:
--   @Param1 INT - [Descripción]
--   @Param2 VARCHAR(50) - [Descripción]
--   @Mensaje NVARCHAR(MAX) OUTPUT - Mensaje de resultado
--
-- NOTA: Este stored procedure debe crearse en CADA base de datos correspondiente
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Prefijo_Nombre]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Prefijo_Nombre];
GO

CREATE PROCEDURE [dbo].[Prefijo_Nombre]
    @Param1 INT,
    @Param2 VARCHAR(50),
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

PRINT 'Stored procedure [Prefijo_Nombre] creado exitosamente.';
GO
```

#### 1.5. Mensajes de Retorno
- **Éxito:** `'success|Mensaje descriptivo'`
- **Error:** `'error|Mensaje de error'`
- **Validar en código:** `mensaje.StartsWith("success")`

#### 1.6. Parámetros de Stored Procedures

**C# / .NET:**
```csharp
var parameters = new DynamicParameters();
parameters.Add("@IdEntidad", id);
parameters.Add("@Mensaje", dbType: DbType.String, direction: ParameterDirection.Output, size: 500);

await connection.ExecuteAsync(
    "NX_Entidad_InsertUpdate",
    parameters,
    commandType: CommandType.StoredProcedure
);

var mensaje = parameters.Get<string>("@Mensaje");
if (!mensaje.StartsWith("success"))
{
    throw new Exception(mensaje.Replace("error|", ""));
}
```

**Node.js + TypeScript:**
```typescript
const result = await pool.request()
  .input('nIdTicket', sql.Int, id)
  .input('sAsunto', sql.VarChar(200), data.asunto)
  .output('mensaje', sql.VarChar(500))
  .execute('TIC_InsTicket');

const mensaje = result.output.mensaje;
if (!mensaje.startsWith('success')) {
  throw new Error(mensaje.replace('error|', ''));
}
```

---

## 2. 🚫 NUNCA USAR FALLBACK

### ✅ OBLIGATORIO
**PROHIBIDO implementar fallback a queries SQL directos cuando falla un stored procedure.**

### Reglas específicas:

#### 2.1. Manejo de Errores

**C# / .NET:**
```csharp
// ✅ CORRECTO - Lanzar excepción si falla el SP
try
{
    var result = await connection.QueryAsync<Entidad>(
        "NX_Entidad_GetAll",
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
    var sql = "SELECT * FROM Tabla";
    return await connection.QueryAsync<Entidad>(sql);
}
```

**Node.js + TypeScript:**
```typescript
// ✅ CORRECTO - Lanzar excepción si falla el SP
try {
  const result = await pool.request()
    .execute('TIC_ListaTickets');
  return result.recordset;
} catch (error) {
  console.error('Error en TIC_ListaTickets:', error);
  throw new DatabaseError('Error al obtener tickets', error);
}

// ❌ INCORRECTO - NO usar fallback
catch (error) {
  // ❌ NUNCA HACER ESTO
  const fallback = await pool.request()
    .query('SELECT * FROM TIC_TICKETS');
  return fallback.recordset;
}
```

#### 2.2. Si el Stored Procedure no existe
- **Solución:** Crear el stored procedure en la base de datos
- **NO crear:** Fallback a queries directos
- **Verificar:** Que el SP esté creado antes de ejecutar el código

#### 2.3. Logging de Errores
- **C# / .NET:** `System.Diagnostics.Debug.WriteLine($"Error: {ex.Message}")`
- **Node.js:** `console.error('Error:', error)`
- Incluir mensaje, stack trace e inner exception
- Re-lanzar la excepción para que el controller/use case la maneje

---

## 3. 🏗️ BASES DE DATOS: DESARROLLO vs PRODUCCIÓN

### ✅ OBLIGATORIO
**Siempre trabajar con bases de datos de desarrollo. NUNCA afectar producción directamente.**

### Estructura de Bases de Datos por Proyecto

#### 3.1. Trace ERP
- **ROE000:** Base de configuración (usuarios, menús, empresas)
- **ROE001:** Base de datos de desarrollo/empresa 01
- **ROE002, ROE003, etc.:** Otras empresas
- **⚠️ REGLA CRÍTICA:** NO USAR NUNCA `ROE00` ni `ROE01` (son PRODUCCIÓN sin el tercer cero)

**Configuración:**
```json
// appsettings.Development.json
{
  "ConnectionStrings": {
    "ROE000": "Server=xxx;Database=ROE000;User Id=sa;Password=***;TrustServerCertificate=True;",
    "Default": "Server=xxx;Database=ROE000;User Id=sa;Password=***;TrustServerCertificate=True;"
  },
  "DatabaseSettings": {
    "ConfigDatabaseName": "ROE000",
    "DataDatabaseName": "ROE001",
    "DatabasePrefix": "ROE"
  }
}
```

**Selección de Base de Datos:**
- El parámetro `empresa` determina la base de datos
- `empresa = "000"` o `null` → ROE000 (configuración)
- `empresa = "001"` → ROE001
- `empresa = "002"` → ROE002
- Se construye como: `ROE{empresa.PadLeft(3, '0')}`

#### 3.2. Toma Pedido
- **Base de configuración:** Usuarios, menús, empresas
- **Base de datos operativa:** Pedidos, clientes, productos, zonas, ubigeos

**Configuración:**
```json
// appsettings.Development.json
{
  "ConnectionStrings": {
    "DevConnStringDbLogin": "Server=xxx;Database=TomaPedido_Config_Dev;...",
    "DevConnStringDbData": "Server=xxx;Database=TomaPedido_Data_Dev;..."
  }
}
```

#### 3.3. Tickets Control
- **Base única:** Todas las tablas en una sola base de datos
- **Nomenclatura tablas:** `TIC_*` para tickets, `GEN_*` para configuración

**Configuración:**
```typescript
// .env
DB_SERVER=localhost
DB_NAME=TicketsControl_Dev
DB_USER=sa
DB_PASSWORD=***
```

### 3.4. Stored Procedures por Base de Datos

**Trace ERP:**
- **ROE000:** SPs de configuración (usuarios, menús, empresas) - SOLO estos
- **ROE001, ROE002, etc.:** SPs de operaciones (clientes, productos, recetas, ventas, etc.)
- **IMPORTANTE:** Ejecutar SPs operativos en CADA base de datos de empresa

**Toma Pedido:**
- SPs de configuración en BD de configuración
- SPs de operaciones en BD de datos
- **IMPORTANTE:** Ejecutar en cada ambiente (dev, test, prod)

**Tickets Control:**
- Todos los SPs en la misma BD
- Separar por prefijo: `TIC_*` operativos, `GEN_*` configuración

### 3.5. Verificación de Ambiente
- **Desarrollo:** Usar BD de desarrollo para TODAS las pruebas
- **Producción:** NO modificar directamente - SIEMPRE probar en dev primero
- **Backup:** SIEMPRE hacer backup antes de cambios importantes en cualquier ambiente

---

## 4. 🔧 ARQUITECTURA Y PATRONES DE CÓDIGO

### 4.1. Arquitectura por Proyecto

#### Trace ERP y Toma Pedido (C# / .NET)
**Patrón:** Repository + Service Pattern

```
Backend/
├── Controllers/          # Endpoints de API
├── Services/            # Lógica de negocio
├── Repositories/        # Acceso a datos (implementan interfaces)
├── Models/              # Modelos de datos
├── DTOs/                # Data Transfer Objects
├── Helpers/             # Utilidades
└── Middleware/          # Middleware personalizados
```

**Flujo:**
```
Controller → Service → Repository → SQL Server (SP)
    ↓          ↓           ↓
Orquesta  Lógica de   Acceso a
         negocio       datos
```

#### Tickets Control (Node.js + TypeScript)
**Patrón:** Arquitectura Hexagonal (Clean Architecture)

```
src/
├── domain/              # Núcleo - NO depende de nadie
│   ├── entities/       
│   ├── dtos/
│   └── repositories/   # Solo interfaces
│
├── application/        # Casos de Uso
│   └── use-cases/     # Lógica de negocio
│
├── infrastructure/     # Implementaciones
│   ├── database/
│   ├── repositories/  # Implementa interfaces de domain
│   └── services/
│
├── adapters/          # Interfaz externa
│   ├── controllers/   # Solo orquestación
│   └── routes/
│
└── shared/            # Código compartido
    ├── config/
    ├── middleware/
    ├── utils/
    └── validators/
```

**Reglas de Dependencia:**
```
Adapters (Controllers) → Application (Use Cases) → Domain ← Infrastructure
                                                      ↑
                                          NO depende de nadie
```

### 4.2. Patrones de Código Obligatorios

#### Controllers / Adapters - Solo orquestación

**C# / .NET:**
```csharp
[HttpGet]
public async Task<ActionResult<List<Entidad>>> GetAll()
{
    try
    {
        var empresa = UserContextHelper.GetEmpresaFromClaims(User);
        if (string.IsNullOrEmpty(empresa))
        {
            return BadRequest(new { message = "No se pudo obtener la empresa del usuario" });
        }

        var items = await _service.GetAllAsync(empresa);
        return Ok(items);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al obtener {Entidad}", nameof(Entidad));
        return StatusCode(500, new { message = $"Error: {ex.Message}" });
    }
}
```

**Node.js + TypeScript:**
```typescript
export class TicketController {
  constructor(private getAllTicketsUseCase: GetAllTicketsUseCase) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tickets = await this.getAllTicketsUseCase.execute();
      res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  }
}
```

#### Services / Use Cases - Lógica de negocio

**C# / .NET:**
```csharp
public class EntidadService
{
    private readonly IEntidadRepository _repository;
    
    public async Task<List<Entidad>> GetAllAsync(string empresa)
    {
        // Validaciones de negocio
        if (string.IsNullOrEmpty(empresa))
            throw new ArgumentException("Empresa es requerida");
            
        // Llamar al repositorio
        return await _repository.GetAllAsync(empresa);
    }
}
```

**Node.js + TypeScript:**
```typescript
export class CreateTicketUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private emailService: EmailService
  ) {}

  async execute(data: TicketCreateDto): Promise<Ticket> {
    // Validaciones de negocio
    if (!data.asunto || data.asunto.length < 5) {
      throw new ValidationError('El asunto debe tener al menos 5 caracteres');
    }

    const ticket = await this.ticketRepository.create(data);
    await this.emailService.sendTicketCreatedNotification(ticket);
    
    return ticket;
  }
}
```

#### Repositories - Solo acceso a datos

**C# / .NET:**
```csharp
public class EntidadRepository : IEntidadRepository
{
    private readonly IDatabaseConnectionFactory _connectionFactory;

    public async Task<List<Entidad>> GetAllAsync(string empresa)
    {
        using var connection = _connectionFactory.GetConnection(empresa);
        
        try
        {
            var result = await connection.QueryAsync<Entidad>(
                "NX_Entidad_GetAll",
                commandType: CommandType.StoredProcedure
            );
            return result.ToList();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }
}
```

**Node.js + TypeScript:**
```typescript
export class TicketRepository implements ITicketRepository {
  constructor(private dbConnection: DatabaseConnection) {}

  async getAll(): Promise<Ticket[]> {
    try {
      const pool = await this.dbConnection.getPool();
      const result = await pool.request()
        .execute('TIC_ListaTickets');
      
      return result.recordset.map(row => this.mapToEntity(row));
    } catch (error) {
      throw new DatabaseError('Error al obtener tickets', error);
    }
  }

  private mapToEntity(row: any): Ticket {
    return new Ticket(
      row.nIdTicket,
      row.sAsunto,
      row.sDescripcion,
      // ...
    );
  }
}
```

### 4.3. Parámetro Empresa / Contexto Usuario

**Trace ERP y Toma Pedido:**
- **Obtener de JWT:** `UserContextHelper.GetEmpresaFromClaims(User)`
- **Claim en JWT:** `"empresa"` con valor como "001", "002", etc.
- **Validar:** Siempre verificar que no sea null o vacío
- **Pasar a repositorio:** Siempre pasar el parámetro `empresa`

**Tickets Control:**
- **Obtener de JWT:** Claims del token
- **Validar:** En middleware de autenticación
- **Pasar:** A través de Request o contexto

---

## 5. 🎨 ESTÁNDARES DE CÓDIGO FRONTEND (ANGULAR)

### 5.1. Componentes

```typescript
@Component({
  selector: 'app-entidad-list',
  standalone: true,  // ✅ Preferir standalone cuando sea posible
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './entidad-list.component.html',
  styleUrls: ['./entidad-list.component.scss']
})
export class EntidadListComponent implements OnInit {
  entities: Entidad[] = [];
  loading = false;
  error: string | null = null;

  constructor(private entidadService: EntidadService) {}

  ngOnInit(): void {
    this.loadEntities();
  }

  loadEntities(): void {
    this.loading = true;
    this.error = null;
    
    this.entidadService.getAll().subscribe({
      next: (entities) => {
        this.entities = entities;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos: ' + (err.error?.message || err.message);
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }
}
```

### 5.2. Servicios

```typescript
@Injectable({
  providedIn: 'root'
})
export class EntidadService {
  private readonly API_URL = `${environment.apiUrl}/entidades`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Entidad[]> {
    return this.http.get<Entidad[]>(this.API_URL);
  }

  getById(id: number): Observable<Entidad> {
    return this.http.get<Entidad>(`${this.API_URL}/${id}`);
  }

  create(entity: EntidadCreateDto): Observable<Entidad> {
    return this.http.post<Entidad>(this.API_URL, entity);
  }

  update(id: number, entity: EntidadUpdateDto): Observable<Entidad> {
    return this.http.put<Entidad>(`${this.API_URL}/${id}`, entity);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
```

### 5.3. Estilos
- Usar **SCSS** para estilos
- Seguir nomenclatura **BEM** para clases CSS
- Estilos encapsulados por componente
- Reutilizar estilos globales cuando corresponda

**Ejemplo BEM:**
```scss
.entidad-list {
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
  }

  &__item {
    padding: 10px;
    border-bottom: 1px solid #ddd;

    &--active {
      background-color: #f0f0f0;
    }

    &--disabled {
      opacity: 0.5;
    }
  }
}
```

### 5.4. Tipado TypeScript
- Usar **interfaces** para modelos de datos
- **Evitar uso de `any`** - usar tipos específicos
- Definir DTOs para operaciones de creación/actualización
- Documentar propiedades cuando sea necesario

```typescript
// ✅ CORRECTO
export interface Entidad {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface EntidadCreateDto {
  nombre: string;
  descripcion: string;
}

// ❌ INCORRECTO
export interface Entidad {
  id: any;  // ❌ No usar 'any'
  data: any;  // ❌ No usar 'any'
}
```

### 5.5. Manejo de Estado
- Usar **observables** para datos asíncronos
- Implementar loading states
- Mostrar mensajes de error al usuario
- Limpiar subscripciones cuando sea necesario (usar `takeUntil` o `async` pipe)

```typescript
import { Subject, takeUntil } from 'rxjs';

export class MiComponente implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.service.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // ...
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## 6. 🔒 SEGURIDAD

### 6.1. Autenticación y Autorización
- Implementar guards en rutas protegidas (Angular)
- Validar permisos en backend Y frontend
- Usar JWT tokens con expiración
- No almacenar información sensible en localStorage (solo tokens)

**Angular Guard:**
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}
```

**Backend Middleware (C#):**
```csharp
[Authorize]  // ✅ Obligatorio en endpoints protegidos
[HttpGet]
public async Task<ActionResult> GetProtectedData()
{
    // ...
}
```

**Backend Middleware (Node.js):**
```typescript
router.post('/tickets',
  authMiddleware,        // ✅ Obligatorio
  createTicketValidator,
  validationMiddleware,
  ticketController.create
);
```

### 6.2. Validación de Datos
- Validar en frontend (UX - para mejor experiencia)
- **Validar SIEMPRE en backend** (seguridad - es lo crítico)
- Sanitizar inputs
- Usar stored procedures con parámetros (previene SQL injection)

**Frontend (Angular):**
```typescript
this.form = this.fb.group({
  nombre: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
  edad: ['', [Validators.required, Validators.min(18)]]
});
```

**Backend (C#):**
```csharp
[HttpPost]
public async Task<ActionResult> Create([FromBody] EntidadDto dto)
{
    // Validaciones
    if (string.IsNullOrEmpty(dto.Nombre))
        return BadRequest(new { message = "Nombre es requerido" });
    
    if (dto.Nombre.Length < 3)
        return BadRequest(new { message = "Nombre debe tener al menos 3 caracteres" });
    
    // Procesar...
}
```

**Backend (Node.js):**
```typescript
export const createTicketValidator = [
  body('asunto')
    .notEmpty().withMessage('El asunto es requerido')
    .isLength({ min: 5, max: 200 }),
  
  body('descripcion')
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10 })
];
```

### 6.3. Variables de Entorno

**C# / .NET:**
```json
// appsettings.json - NO commitear con datos reales
{
  "ConnectionStrings": {
    "Default": "Server=xxx;Database=xxx;User Id=xxx;Password=***;"
  },
  "JWT": {
    "SECRET_KEY": "tu-clave-secreta-muy-larga-de-al-menos-64-caracteres-para-HmacSha512",
    "JWT_EXPIRE_MINUTES": "120",
    "Issuer": "https://api.tudominio.com",
    "Audience": "https://tudominio.com"
  }
}
```

**Node.js:**
```bash
# .env - NO commitear
DB_SERVER=localhost
DB_NAME=MiBaseDatos_Dev
DB_USER=sa
DB_PASSWORD=***
JWT_SECRET=tu-clave-secreta-muy-larga
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=development
```

**Uso:**
```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  database: {
    server: process.env.DB_SERVER!,
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
  }
};
```

### 6.4. Manejo de Errores
- No exponer detalles técnicos al usuario final
- Registrar errores en logs del servidor
- Mostrar mensajes amigables al usuario
- Implementar manejo global de errores

---

## 7. 🚨 PROHIBICIONES EXPLÍCITAS

### ❌ NUNCA HACER:

**Base de Datos:**
1. **NO usar queries SQL directos** en servicios/repositorios
2. **NO implementar fallback** a SQL directo cuando falla un SP
3. **NO modificar producción** directamente sin probar en desarrollo
4. **NO crear stored procedures** sin el prefijo correcto (`NX_`, `TIC_`, `GEN_`)
5. **NO omitir el parámetro `empresa`** en métodos (Trace/TomaPedido)
6. **NO usar `CommandType.Text`** en lugar de `CommandType.StoredProcedure`
7. **NO colocar scripts SQL** fuera de la carpeta designada

**Código:**
8. **NO silenciar excepciones** con `catch` vacío
9. **NO retornar listas vacías** cuando hay error (lanzar excepción)
10. **NO commitear** código sin pruebas
11. **NO hardcodear** credenciales o configuraciones sensibles
12. **NO exponer** endpoints sin autenticación/autorización
13. **NO usar `any`** en TypeScript (salvo casos muy específicos)
14. **NO poner lógica de negocio** en controllers/componentes

**Git:**
15. **NO commitear** archivos `.env` o `appsettings.json` con datos reales
16. **NO commitear** certificados o claves privadas
17. **NO hacer** force push a main/master
18. **NO skip** hooks de git (--no-verify)

**Arquitectura:**
19. **(Tickets)** NO romper arquitectura hexagonal (lógica en controllers)
20. **(Tickets)** NO mezclar capas (Infrastructure llamando a Application)
21. **(Trace/TomaPedido)** NO usar nombres hardcodeados de BD (usar servicios)

---

## 8. ✅ CHECKLIST ANTES DE COMMIT

### Backend:
- [ ] Todos los métodos usan `CommandType.StoredProcedure` (C#) o `.execute()` (Node.js)
- [ ] No hay fallback a queries SQL directos
- [ ] Los stored procedures están en la carpeta `sql/` correcta
- [ ] Los stored procedures tienen el prefijo correcto
- [ ] Se usa el parámetro `empresa` correctamente (si aplica)
- [ ] Se valida que `empresa` no sea null (si aplica)
- [ ] Los errores se registran y se re-lanzan
- [ ] Se trabaja con base de datos de desarrollo
- [ ] Los mensajes de SPs usan formato `success|` o `error|`
- [ ] Se incluye logging adecuado
- [ ] No hay `any` en TypeScript (Node.js)
- [ ] Se respeta la arquitectura del proyecto

### Frontend:
- [ ] Los componentes implementan manejo de errores
- [ ] Se muestran estados de loading
- [ ] Se validan los formularios
- [ ] Los servicios tienen tipado correcto
- [ ] No hay código comentado o console.logs innecesarios
- [ ] Los estilos están encapsulados
- [ ] Se limpian las subscripciones (takeUntil o async pipe)
- [ ] No hay `any` en TypeScript

### General:
- [ ] El código está formateado correctamente
- [ ] No hay credenciales hardcodeadas
- [ ] Los nombres de variables/métodos son descriptivos
- [ ] Se ha probado la funcionalidad
- [ ] Se ha actualizado documentación si es necesario
- [ ] No se commitean archivos `.env` o con datos sensibles

---

## 9. 🚀 PASOS DESPUÉS DE PROGRAMAR

### PASO 1: Ejecutar Scripts SQL (si aplica)

**Trace ERP:**
```sql
-- 1. Abrir SQL Server Management Studio
-- 2. Seleccionar base de datos:
--    ROE000 para configuración
--    ROE001, ROE002, etc. para operaciones

USE ROE001;
GO

-- 3. Ejecutar el script .sql
-- 4. Verificar:
SELECT name FROM sys.procedures WHERE name LIKE 'NX_%';
```

**Toma Pedido:**
```sql
USE TomaPedido_Data_Dev;
GO

-- Ejecutar el script .sql
-- Verificar:
SELECT name FROM sys.procedures WHERE name LIKE 'NX_%';
```

**Tickets Control:**
```sql
USE TicketsControl_Dev;
GO

-- Ejecutar el script .sql
-- Verificar:
SELECT name FROM sys.procedures WHERE name LIKE 'TIC_%' OR name LIKE 'GEN_%';
```

### PASO 2: Compilar y Reiniciar Backend

**C# / .NET (Trace ERP, Toma Pedido):**
```bash
# Detener el backend (Ctrl+C)

# Navegar a la carpeta
cd [Proyecto]-Backend

# Limpiar y compilar
dotnet clean
dotnet build

# Ejecutar
dotnet run

# O en modo watch:
dotnet watch run
```

**Node.js (Tickets Control):**
```bash
# Detener el backend (Ctrl+C)

cd Tickets-Backend

# Desarrollo (con auto-reload)
npm run dev

# O compilado:
npm run build
npm start
```

### PASO 3: Compilar Frontend

**Todos los proyectos (Angular):**
```bash
cd [Proyecto]-Frontend

# Instalar dependencias (si agregaste nuevas)
npm install

# Ejecutar en desarrollo
ng serve

# O puerto específico:
ng serve --port 4200
```

### PASO 4: Probar la Funcionalidad

1. **Abrir navegador:** `http://localhost:[puerto]`
2. **Iniciar sesión**
3. **Navegar a la funcionalidad**
4. **Probar TODOS los casos:**
   - ✅ Crear
   - ✅ Listar
   - ✅ Editar
   - ✅ Eliminar
   - ✅ Validaciones
   - ✅ Mensajes de error/éxito
5. **Probar casos extremos:**
   - ❌ Campos vacíos
   - ❌ Datos inválidos
   - ❌ Sin permisos
6. **Verificar logs:**
   - Backend: consola
   - Frontend: DevTools (F12) → Console y Network

### PASO 5: Documentar y Commit

```bash
# Verificar cambios
git status

# Agregar archivos
git add .

# Commit con mensaje descriptivo
git commit -m "feat: Descripción breve

- Detalle 1
- Detalle 2
- Detalle 3"

# Push
git push origin [rama]
```

**Formato de mensajes de commit:**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato
- `refactor:` - Refactorización
- `test:` - Tests
- `chore:` - Configuración, dependencias
- `sql:` - Stored procedures

---

## 10. ⚠️ ANTES DE PRODUCCIÓN

### CHECKLIST OBLIGATORIO:

**Scripts SQL:**
- [ ] Probados en desarrollo
- [ ] Probados en todas las BDs necesarias
- [ ] Backup de producción creado
- [ ] **Verificación pre-despliegue completada**

**Backend:**
- [ ] Compilado sin errores
- [ ] No hay errores en logs
- [ ] SPs probados manualmente
- [ ] SPs retornan mensajes correctos
- [ ] Configuración de producción verificada vs código
- [ ] JWT con algoritmo y clave correctos

**Frontend:**
- [ ] Compilado sin errores
- [ ] No hay errores en consola del navegador
- [ ] No hay errores de TypeScript
- [ ] No hay errores de linting

**Pruebas:**
- [ ] Todas las funcionalidades probadas
- [ ] Probado en múltiples empresas (si aplica)
- [ ] Casos extremos probados
- [ ] Validaciones probadas

**Seguridad:**
- [ ] No se exponen datos sensibles
- [ ] Endpoints protegidos con autenticación
- [ ] Variables de entorno configuradas
- [ ] Certificados SSL válidos (si aplica)

**Plan de Contingencia:**
- [ ] Plan de rollback preparado
- [ ] Equipo notificado sobre el deploy
- [ ] Horario de deploy planificado (fuera de horas pico)
- [ ] Monitoreo post-deploy planificado

---

## 11. 📚 REFERENCIAS POR PROYECTO

### Trace ERP
- Archivo maestro de SPs: `sql/NX_00_SCRIPT_MAESTRO_COMPLETO.sql`
- Documentación: `RESUMEN_COMPLETO.md`
- Configuración BD: `Trace-Backend/appsettings.json`

### Toma Pedido
- Archivo maestro de SPs: `sql/NX_00_SCRIPT_MAESTRO_*.sql`
- Script de inicio: `sql/___iniciar.bat`
- Documentación: `README.md`

### Tickets Control
- SPs versionados: `SP Control de versiones/`
- Documentación arquitectura: `README.md`
- Configuración: `.env`

---

## 12. 📞 CONTACTO Y SOPORTE

Para dudas o aclaraciones sobre estas normas:
- Consultar con el equipo de desarrollo
- Revisar documentación del proyecto específico
- Validar con ejemplos existentes en el código
- Revisar commits anteriores del proyecto

---

## 📅 Historial de Cambios

- **4 de Diciembre de 2025** - Creación del documento consolidado de normas
  - Integración de normas de Trace ERP, Toma Pedido y Tickets Control
  - Consideración de diferencias .NET vs Node.js
  - Unificación de mejores prácticas

---

**⚠️ IMPORTANTE: Estas normas son OBLIGATORIAS para todos los proyectos Nexwork. Cualquier desviación debe ser aprobada explícitamente por el equipo de desarrollo.**

**📄 Este documento debe copiarse en cada directorio de proyecto para fácil acceso.**


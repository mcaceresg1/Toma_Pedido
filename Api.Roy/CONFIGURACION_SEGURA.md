# Configuración Segura de Credenciales

**Fecha:** 3 de Noviembre, 2025  
**Estado:** ✅ Implementado

---

## 🔒 User Secrets (Desarrollo Local)

Las credenciales sensibles ya NO están en `appsettings.json`. En su lugar, se usan **User Secrets** para desarrollo.

### **User Secrets ya configurado:**

El proyecto ya tiene User Secrets inicializado con las siguientes credenciales:

```
UserSecretsId: bdb9db27-ce88-48e4-8aa4-9ef3051c67cc
```

### **Credenciales almacenadas en User Secrets:**

1. `JWT:SECRET_KEY`
2. `ConnectionStrings:DevConnStringDbLogin`
3. `ConnectionStrings:DevConnStringDbData`

### **Para agregar más secrets:**

```bash
cd Api.Roy
dotnet user-secrets set "Clave:Subclave" "valor"
```

### **Para ver todos los secrets:**

```bash
cd Api.Roy
dotnet user-secrets list
```

### **Para eliminar un secret:**

```bash
cd Api.Roy
dotnet user-secrets remove "Clave:Subclave"
```

### **Ubicación de User Secrets:**

Los secrets se almacenan en:
- **Windows:** `%APPDATA%\Microsoft\UserSecrets\bdb9db27-ce88-48e4-8aa4-9ef3051c67cc\secrets.json`
- **Linux/Mac:** `~/.microsoft/usersecrets/bdb9db27-ce88-48e4-8aa4-9ef3051c67cc/secrets.json`

---

## 🌐 Variables de Entorno (Producción)

Para producción, usa **Variables de Entorno** en lugar de User Secrets.

### **En IIS (Windows Server):**

1. Abre IIS Manager
2. Selecciona tu aplicación
3. Ve a **Configuration Editor**
4. Sección: `system.webServer/aspNetCore`
5. Agrega en `environmentVariables`:

```xml
<environmentVariables>
  <environmentVariable name="ConnectionStrings__OrgConnStringDbLogin" value="data source=...;password=..." />
  <environmentVariable name="ConnectionStrings__OrgConnStringDbData" value="data source=...;password=..." />
  <environmentVariable name="JWT__SECRET_KEY" value="tu-clave-secreta" />
</environmentVariables>
```

### **En Azure App Service:**

1. Ve a **Configuration** → **Application settings**
2. Agrega las siguientes variables:
   - `ConnectionStrings__OrgConnStringDbLogin`
   - `ConnectionStrings__OrgConnStringDbData`
   - `JWT__SECRET_KEY`

### **En Docker:**

```yaml
services:
  api:
    environment:
      - ConnectionStrings__OrgConnStringDbLogin=data source=...
      - ConnectionStrings__OrgConnStringDbData=data source=...
      - JWT__SECRET_KEY=tu-clave-secreta
```

### **En Linux (systemd):**

Edita el archivo de servicio:

```ini
[Service]
Environment="ConnectionStrings__OrgConnStringDbLogin=data source=..."
Environment="ConnectionStrings__OrgConnStringDbData=data source=..."
Environment="JWT__SECRET_KEY=tu-clave-secreta"
```

---

## 📝 Configuración por Entorno

### **Desarrollo (User Secrets):**
```bash
dotnet user-secrets set "JWT:SECRET_KEY" "tu-clave-dev"
dotnet user-secrets set "ConnectionStrings:DevConnStringDbLogin" "Server=localhost;..."
```

### **Staging/Producción (Variables de Entorno):**
```bash
export ConnectionStrings__OrgConnStringDbLogin="Server=prod-server;..."
export JWT__SECRET_KEY="tu-clave-prod-super-segura"
```

---

## ⚠️ IMPORTANTE - NO Commitear Credenciales

### **Archivos que NO deben tener credenciales:**
- ✅ `appsettings.json` - Solo placeholders
- ✅ `appsettings.Development.json` - Solo placeholders
- ✅ `appsettings.Production.json` - Solo placeholders

### **Archivos seguros (no en Git):**
- ✅ User Secrets (fuera del proyecto)
- ✅ Variables de entorno (en el servidor)
- ✅ Azure Key Vault (recomendado para producción)

---

## 🔄 Orden de Prioridad de Configuración

ASP.NET Core lee la configuración en este orden (último gana):

1. `appsettings.json`
2. `appsettings.{Environment}.json`
3. **User Secrets** (solo en Development)
4. **Variables de Entorno**
5. Argumentos de línea de comandos

Esto significa que:
- En desarrollo: **User Secrets** sobrescribe `appsettings.json`
- En producción: **Variables de Entorno** sobrescriben `appsettings.json`

---

## 🔐 Azure Key Vault (Recomendado para Producción)

Para máxima seguridad en producción, usa Azure Key Vault:

### **1. Instala el paquete:**

```bash
dotnet add package Azure.Extensions.AspNetCore.Configuration.Secrets
dotnet add package Azure.Identity
```

### **2. Configura en Program.cs:**

```csharp
if (builder.Environment.IsProduction())
{
    var keyVaultEndpoint = new Uri(builder.Configuration["KeyVault:Endpoint"]);
    builder.Configuration.AddAzureKeyVault(
        keyVaultEndpoint,
        new DefaultAzureCredential());
}
```

### **3. Almacena secrets en Key Vault:**

```bash
az keyvault secret set --vault-name "tu-key-vault" --name "JWT--SECRET-KEY" --value "tu-clave"
az keyvault secret set --vault-name "tu-key-vault" --name "ConnectionStrings--OrgConnStringDbLogin" --value "Server=..."
```

---

## 📊 Comparación de Métodos

| Método | Desarrollo | Producción | Seguridad | Facilidad |
|--------|------------|------------|-----------|-----------|
| **appsettings.json** | ❌ No usar | ❌ No usar | 🔴 Baja | ✅ Fácil |
| **User Secrets** | ✅ Recomendado | ❌ No disponible | 🟡 Media | ✅ Fácil |
| **Variables de Entorno** | ⚠️ Opcional | ✅ Recomendado | 🟢 Alta | 🟡 Media |
| **Azure Key Vault** | ⚠️ Opcional | ✅ Muy recomendado | 🟢 Muy Alta | 🔴 Complejo |

---

## ✅ Checklist de Seguridad

- [x] User Secrets inicializado
- [x] Credenciales movidas a User Secrets
- [x] `appsettings.json` limpio (sin credenciales)
- [ ] Variables de entorno configuradas en producción
- [ ] `.gitignore` incluye `secrets.json`
- [ ] Documentación de configuración creada
- [ ] Equipo informado del cambio

---

## 🆘 Solución de Problemas

### **Error: "No connection string named '...' was found"**

**Causa:** User Secrets no está configurado o la API está leyendo de `appsettings.json`

**Solución:**
```bash
cd Api.Roy
dotnet user-secrets list  # Verifica que los secrets existan
dotnet user-secrets set "ConnectionStrings:DevConnStringDbLogin" "tu-connection-string"
```

### **Error: JWT SECRET_KEY es null**

**Causa:** La clave no está en User Secrets ni en variables de entorno

**Solución:**
```bash
dotnet user-secrets set "JWT:SECRET_KEY" "4p1-tr4c3-su990rt-304-"
```

### **En producción no funciona**

**Causa:** Variables de entorno no configuradas

**Solución:** Configura las variables de entorno en IIS/Azure/Docker según la sección correspondiente arriba.

---

## 📞 Referencias

- [User Secrets en ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets)
- [Configuration en ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/)
- [Azure Key Vault](https://learn.microsoft.com/en-us/aspnet/core/security/key-vault-configuration)

---

**Documento creado:** 3 de Noviembre, 2025  
**Última actualización:** 3 de Noviembre, 2025


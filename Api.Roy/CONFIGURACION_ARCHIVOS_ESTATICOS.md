# Configuración de Archivos Estáticos (Logos de Empresas)

## 📋 Resumen

Se ha configurado el API para servir archivos estáticos (imágenes PNG de logos de empresas) desde la carpeta `public`.

## ✅ Cambios Realizados

### 1. Carpeta `public` creada
- **Ubicación**: `Api.Roy/public/`
- **Propósito**: Almacenar logos de empresas en formato PNG

### 2. Modificaciones en `Program.cs`

#### Se agregó el using:
```csharp
using Microsoft.Extensions.FileProviders;
```

#### Se agregó la configuración de archivos estáticos (líneas 194-200):
```csharp
// Configurar archivos estáticos (logos de empresas)
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "public")),
    RequestPath = "/public"
});
```

### 3. Logo de ejemplo
- Se creó `public/ROE00.png` como ejemplo

## 🔗 Cómo Usar

### Agregar un nuevo logo:

1. Obtener el **código de la empresa** desde la base de datos
2. Crear o conseguir el logo en formato PNG (recomendado: 200x200 px)
3. Nombrar el archivo: `[CODIGO_EMPRESA].png`
4. Colocar el archivo en la carpeta `Api.Roy/public/`

**Ejemplo:**
```
Api.Roy/public/ROE00.png
Api.Roy/public/INR01.png
```

### URLs de Acceso

**Desarrollo:**
```
http://localhost:5070/public/ROE00.png
http://localhost:5070/public/INR01.png
```

**Producción:**
```
https://api.nexwork-peru.com/public/ROE00.png
https://api.nexwork-peru.com/public/INR01.png
```

## 📍 Dónde se Usa en la Aplicación Web

Los logos se cargan automáticamente desde:

### `dashboard.component.ts`

**Logo del usuario (empresa por defecto):**
```typescript
// Línea 95-98
this.logoEmpresa.set(
  `${environment.api.replace('/api/', '/public/')}${
    resp.empresaDefecto
  }.png`
);
```

**Logos del selector de empresas:**
```typescript
// Línea 119-121
logo: `${environment.api.replace('/api/', '/public/')}${
  it.codigo
}.png`,
```

## 🧪 Probar la Configuración

### Desde el navegador:
1. Abrir: `http://localhost:5070/public/ROE00.png`
2. Debería mostrar el logo de la empresa ROE00

### Desde la consola del navegador (F12):
1. Hacer login en la aplicación
2. Ir al tab Network
3. Buscar peticiones a `/public/*.png`
4. Verificar que devuelvan status `200 OK`

## ⚠️ Importante

- **CORS**: Los archivos estáticos están sujetos a las mismas políticas CORS del API
- **Permisos**: La carpeta `public` debe tener permisos de lectura en el servidor
- **Nomenclatura**: Los nombres de archivo son sensibles a mayúsculas/minúsculas
- **Formato**: Preferir PNG para soporte de transparencia
- **Caché**: Los navegadores pueden cachear las imágenes, usar Ctrl+F5 para refrescar

## 📂 Estructura de Carpetas

```
Api.Roy/
├── public/                  ← Nueva carpeta
│   ├── README.md           ← Instrucciones
│   ├── ROE00.png          ← Logo de ejemplo
│   └── [CODIGO].png       ← Otros logos
├── Program.cs              ← Modificado
└── ...
```

## 🚀 Despliegue en Producción

### IIS (Windows Server)

La carpeta `public` se desplegará automáticamente con el API. No requiere configuración adicional.

### Linux (Nginx/Apache)

Asegurarse de que:
1. La carpeta `public` tenga permisos `755`
2. Los archivos PNG tengan permisos `644`

```bash
chmod 755 public/
chmod 644 public/*.png
```

---

**Fecha de implementación:** 2025-11-03  
**Versión del API:** .NET 8.0


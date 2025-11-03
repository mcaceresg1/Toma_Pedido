# Carpeta de Logos de Empresas

Esta carpeta contiene los logos (imágenes PNG) de las empresas que se muestran en la aplicación web.

## 📋 Instrucciones

### Nomenclatura de Archivos

Los archivos deben nombrarse con el **código de la empresa** seguido de la extensión `.png`:

```
[CODIGO_EMPRESA].png
```

**Ejemplos:**
- `ROE00.png` - Logo de la empresa ROE00
- `INR01.png` - Logo de la empresa INR01
- `ABC123.png` - Logo de la empresa ABC123

### Formato de Imágenes

- **Formato**: PNG (recomendado por soporte de transparencia)
- **Tamaño recomendado**: 200x200 px o similar (cuadrado)
- **Fondo**: Preferiblemente transparente

### URL de Acceso

Los logos estarán disponibles en:

**Desarrollo:**
```
http://localhost:5070/public/[CODIGO_EMPRESA].png
```

**Producción:**
```
https://api.nexwork-peru.com/public/[CODIGO_EMPRESA].png
```

### Dónde se Usan

Los logos se cargan automáticamente en:

1. **Dashboard** - Avatar del usuario (empresa por defecto)
2. **Menú de empresas** - Selector de empresa del usuario

### ⚠️ Importante

- Si falta un logo, la aplicación intentará cargarlo pero mostrará un error 404 en la consola del navegador
- Los logos deben tener el nombre exacto del código de empresa (sensible a mayúsculas/minúsculas)
- Esta carpeta debe tener permisos de lectura en el servidor de producción

### 🔐 Seguridad

- Esta carpeta es de **solo lectura** desde el navegador
- No se pueden subir archivos desde la aplicación web
- Solo el administrador del servidor puede agregar/modificar logos

---

**Última actualización:** 2025-11-03


# 🚀 Script de Inicio Automático - Toma de Pedidos

## 📄 Archivo

```
___iniciar.bat
```

**Ubicación:** `E:\Fuentes Nexwork\Toma_Pedido\sql\___iniciar.bat`

---

## 📝 ¿Qué hace este script?

Este script automatiza **TODO** el proceso de inicio del sistema:

1. ✅ Cierra procesos anteriores en puertos 5000 y 4200
2. ✅ Verifica que existan los directorios Api.Roy y Web.Roy
3. ✅ Verifica que estén instalados .NET y Node.js
4. ✅ Restaura paquetes NuGet del backend
5. ✅ Compila el backend (Api.Roy)
6. ✅ Instala dependencias npm del frontend (si es necesario)
7. ✅ Inicia el backend en una ventana separada
8. ✅ Inicia el frontend en otra ventana separada
9. ✅ Muestra las URLs de acceso

---

## 🚀 CÓMO USARLO

### Opción 1: Doble clic

```
1. Ir a: E:\Fuentes Nexwork\Toma_Pedido\sql\
2. Hacer doble clic en: ___iniciar.bat
3. Esperar a que termine (abrirá 2 ventanas nuevas)
```

### Opción 2: Desde terminal

```bash
# Abrir PowerShell o CMD
cd E:\Fuentes Nexwork\Toma_Pedido\sql
___iniciar.bat
```

---

## 📺 ¿Qué verás?

El script abrirá **3 ventanas**:

### Ventana 1: Script Principal (se puede cerrar después)
```
============================================
  TOMA DE PEDIDOS - Iniciar Servicios
  Backend (Api.Roy) y Frontend (Web.Roy)
============================================

[PASO 1] Verificando directorios...
[PASO 2] Verificando herramientas...
[PASO 3] Preparando Backend (Api.Roy)...
[PASO 4] Backend preparado. Preparando Frontend (Web.Roy)...
[PASO 5] Frontend preparado. Creando scripts de inicio...
[PASO 6] Scripts creados. Iniciando servicios...
[PASO 7] Servicios iniciados. Resumen final...

============================================
  Servicios Iniciados
============================================

Backend:  http://localhost:5000
Frontend: http://localhost:4200
```

### Ventana 2: Backend (NO CERRAR)
```
============================================
  TOMA DE PEDIDOS - BACKEND
============================================

Servidor disponible en:
  - HTTP:  http://localhost:5000
  - HTTPS: https://localhost:5001

API Health: http://localhost:5000/api/health

Presiona Ctrl+C para detener el servidor

============================================

info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### Ventana 3: Frontend (NO CERRAR)
```
============================================
  TOMA DE PEDIDOS - FRONTEND
============================================

Servidor de desarrollo disponible en:
  - URL: http://localhost:4200

Presiona Ctrl+C para detener el servidor

============================================

✔ Browser application bundle generation complete.
Initial Chunk Files | Names         | Size
main.js            | main          | 2.5 MB
...
✔ Compiled successfully.
```

---

## 🌐 URLs de Acceso

Después de que el script termine:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:4200 | Aplicación Angular |
| **Backend** | http://localhost:5000 | API REST |
| **Backend (HTTPS)** | https://localhost:5001 | API REST (SSL) |
| **Health Check** | http://localhost:5000/api/health | Verificar estado del API |

---

## ⏱️ Tiempo Estimado

- **Primera vez:** 5-10 minutos (instala dependencias npm)
- **Siguiente vez:** 1-2 minutos (todo ya está instalado)

---

## 🛑 CÓMO DETENER LOS SERVICIOS

### Opción 1: Cerrar ventanas
```
Simplemente cierra las ventanas del Backend y Frontend
```

### Opción 2: Ctrl+C
```
En cada ventana (Backend y Frontend):
1. Presionar Ctrl+C
2. Confirmar con Y (si pregunta)
3. Cerrar la ventana
```

### Opción 3: Ejecutar script de detención (si existe)
```bash
cd E:\Fuentes Nexwork\Toma_Pedido\sql
detener-servicios.bat
```

---

## ❌ SOLUCIÓN DE PROBLEMAS

### Error: "Puerto 5000 aun en uso"

**Solución:**
```bash
# Buscar proceso usando el puerto
netstat -ano | findstr :5000

# Anotar el PID (última columna)
# Cerrar el proceso (reemplazar 1234 con el PID real)
taskkill /F /PID 1234
```

### Error: "Puerto 4200 aun en uso"

**Solución:**
```bash
# Buscar proceso usando el puerto
netstat -ano | findstr :4200

# Cerrar el proceso
taskkill /F /PID 1234
```

### Error: ".NET SDK no esta instalado"

**Solución:**
1. Descargar .NET 6.0 o 8.0 SDK
2. Instalar
3. Reiniciar terminal
4. Verificar: `dotnet --version`

### Error: "Node.js no esta instalado"

**Solución:**
1. Descargar Node.js LTS
2. Instalar
3. Reiniciar terminal
4. Verificar: `node --version`

### Error: "No se encuentra el directorio Api.Roy"

**Solución:**
- Verificar que estés en la carpeta correcta
- El script debe ejecutarse desde `E:\Fuentes Nexwork\Toma_Pedido\sql\`

### Error al compilar el backend

**Solución:**
```bash
cd E:\Fuentes Nexwork\Toma_Pedido\Api.Roy
dotnet clean
dotnet restore
dotnet build
```

### Error al instalar dependencias npm

**Solución:**
```bash
cd E:\Fuentes Nexwork\Toma_Pedido\Web.Roy
rm -rf node_modules package-lock.json  # PowerShell
npm cache clean --force
npm install
```

---

## 📋 REQUISITOS PREVIOS

- ✅ Windows 10/11
- ✅ .NET 6.0 o 8.0 SDK instalado
- ✅ Node.js LTS instalado
- ✅ Puertos 4200 y 5000 libres

---

## 🔧 PERSONALIZACIÓN

Si quieres cambiar los puertos, edita:

### Backend (Api.Roy):
```
E:\Fuentes Nexwork\Toma_Pedido\Api.Roy\Properties\launchSettings.json
```

### Frontend (Web.Roy):
```
E:\Fuentes Nexwork\Toma_Pedido\Web.Roy\angular.json
```

Después edita el script `___iniciar.bat` para usar los nuevos puertos.

---

## 📞 SOPORTE

Para problemas o dudas:
- Revisar los logs en las ventanas del Backend y Frontend
- Revisar documentación: `NORMAS_DESARROLLO.md`
- Consultar con el equipo de desarrollo

---

## ✅ CHECKLIST DE USO

Antes de ejecutar el script:

- [ ] Estoy en la carpeta `sql/`
- [ ] Tengo .NET SDK instalado
- [ ] Tengo Node.js instalado
- [ ] Los puertos 4200 y 5000 están libres
- [ ] Tengo conexión a Internet (para restaurar paquetes)

---

**¡Listo para usar!** 🚀


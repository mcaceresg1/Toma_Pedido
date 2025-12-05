# 🚀 GUÍA DE INICIALIZACIÓN - TOMA DE PEDIDOS

## ⚠️ IMPORTANTE: Ejecutar en este orden

---

## 📋 PASO 1: Actualizar Stored Procedures en Base de Datos

### 1️⃣ Abrir SQL Server Management Studio

```
- Conectarse al servidor
- Base de datos: ROE001 (3 ceros - operativa)
```

### 2️⃣ Ejecutar Scripts en ORDEN:

#### **A) Limpiar SPs antiguos (PRIMERO):**
```sql
-- Archivo: ___ACTUALIZAR_SPS.sql
-- Elimina SPs antiguos que usan tablas incorrectas
```

#### **B) Instalar módulo de Zonas y Ubigeos:**
```sql
-- Archivo: NX_00_SCRIPT_MAESTRO_ZONAS_UBIGEOS.sql
-- Crea:
--   - Tabla CUE010 (Zonas)
--   - Columna ZONA en CUE005
--   - 7 SPs de Zonas y Ubigeos
```

#### **C) Instalar SP de Pedidos por Zona:**
```sql
-- Archivo: SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA.sql
-- Crea SP para reporte de pedidos por zona
```

### 3️⃣ Verificar instalación:

```sql
USE ROE001;
GO

-- Ver SPs instalados
SELECT name, create_date, modify_date
FROM sys.procedures 
WHERE name LIKE 'NX_%' OR name LIKE 'SP_HISTORICO%'
ORDER BY name;

-- Ver tablas
SELECT name FROM sys.tables 
WHERE name IN ('CUE010', 'CUE005');

-- Ver columna ZONA en CUE005
SELECT name FROM sys.columns 
WHERE object_id = OBJECT_ID('CUE005') AND name = 'ZONA';
```

---

## 📋 PASO 2: Iniciar Backend y Frontend

### Opción A: Usar script automático

```batch
cd E:\Fuentes Nexwork\Toma_Pedido\sql
___iniciar.bat
```

Este script:
- ✅ Mata procesos en puertos 5070 y 4200
- ✅ Verifica directorios y herramientas
- ✅ Compila el backend
- ✅ Instala dependencias npm si es necesario
- ✅ Inicia Backend y Frontend en ventanas separadas

### Opción B: Manual

**Backend:**
```bash
cd E:\Fuentes Nexwork\Toma_Pedido\Api.Roy
dotnet restore
dotnet build
dotnet run
```

**Frontend (en otra terminal):**
```bash
cd E:\Fuentes Nexwork\Toma_Pedido\Web.Roy
npm install
npm start
```

---

## 🌐 URLs de Acceso

- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:5070
- **Swagger:** http://localhost:5070/swagger
- **Health Check:** http://localhost:5070/health

---

## ✅ Checklist de Verificación

Antes de usar la aplicación, verifica:

- [ ] SQL Server ejecutándose
- [ ] Base de datos ROE001 existe
- [ ] Tabla CUE010 creada
- [ ] Columna ZONA existe en CUE005
- [ ] 7 SPs de Zonas/Ubigeos instalados
- [ ] SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA instalado
- [ ] Backend corriendo en puerto 5070
- [ ] Frontend corriendo en puerto 4200
- [ ] Sin errores en consola del navegador
- [ ] Login funciona correctamente

---

## 🐛 Solución de Problemas Comunes

### Error: "Invalid object name 'Zonas'"

**Causa:** SPs antiguos usan tabla 'Zonas' en lugar de 'CUE010'

**Solución:**
```sql
-- 1. Ejecutar: ___ACTUALIZAR_SPS.sql (limpia SPs antiguos)
-- 2. Ejecutar: NX_00_SCRIPT_MAESTRO_ZONAS_UBIGEOS.sql (instala nuevos SPs)
```

### Error: "Port 4200 is already in use"

**Solución:**
```batch
-- Ejecutar el script que mata procesos:
cd E:\Fuentes Nexwork\Toma_Pedido\sql
___iniciar.bat

-- O manualmente:
netstat -ano | findstr ":4200"
taskkill /F /PID [PID_DEL_PROCESO]
```

### Error 500 en "Pedidos por Zona"

**Causa:** SP no instalado o usa tablas incorrectas

**Solución:**
```sql
USE ROE001;
-- Ejecutar: SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA.sql
```

### Warning: "Module stream has been externalized"

**Causa:** Librería xlsx-js-style usa módulos de Node.js

**Solución:** Es un warning cosmético, NO afecta funcionalidad. Puede ignorarse.

---

## 📞 Soporte

Para más ayuda:
- Ver: `NORMAS_DESARROLLO_CONSOLIDADAS.md`
- Ver: `README_ZONAS_UBIGEOS.md`

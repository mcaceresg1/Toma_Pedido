# Próximos Pasos - Api.Roy

## Recordatorios Importantes

### 1. Renovación de Certificado SSL (Prioridad Alta)
**Fecha actual de certificado:** 26/01/2026
**Acción requerida:** Renovar certificado de Let's Encrypt antes de esta fecha

**Cómo renovar:**
1. Usando win-acme: https://www.win-acme.com/
2. O configurar renovación automática con Certbot
3. Verificar que la renovación se aplique a todos los bindings de IIS

**Documentación:** Ver `CONFIGURACION_SSL_IIS.md`

---

### 2. Migración a .NET 8 (Prioridad Media)
**Razón:** .NET 6 está fuera de soporte (EOL)
**Fecha objetivo:** Planificar para los próximos 3 meses

**Pasos para migración:**
1. Actualizar TargetFramework en ApiRoy.csproj de `net6.0` a `net8.0`
2. Revisar dependencias NuGet y actualizar a versiones compatibles con .NET 8
3. Probar en entorno de desarrollo
4. Publicar y desplegar en producción

**Comandos útiles:**
```bash
# Actualizar proyecto a .NET 8
dotnet add ApiRoy.csproj reference --framework net8.0

# Verificar compatibilidad
dotnet list package --outdated

# Actualizar todos los paquetes
dotnet add package <NombrePaquete>
```

---

### 3. Revisión de Seguridad (Prioridad Media)

**Items pendientes:**
- [ ] Mover cadenas de conexión de `appsettings.json` a variables de entorno o Azure Key Vault
- [ ] Implementar roles y permisos más granulares en JWT
- [ ] Considerar agregar rate limiting a los endpoints
- [ ] Implementar logging estructurado (Serilog)

---

### 4. Mejoras Técnicas (Prioridad Baja)

**Items sugeridos:**
- [ ] Limpiar warnings de nulabilidad (155 warnings actuales)
- [ ] Convertir métodos `async` sin `await` a métodos síncronos
- [ ] Considerar migrar a MediatR para separación de responsabilidades
- [ ] Agregar tests unitarios (actualmente no hay)
- [ ] Implementar health checks para monitoreo

---

## Configuración Actual del Entorno

### Producción
- **Frontend:** https://tp.nexwork-peru.com
- **API:** https://apitp.nexwork-peru.com
- **IIS Path:** C:\inetpub\wwwroot\Api.roy
- **Database:** 161.132.56.68 (ROE00, ROE01)
- **Certificado SSL:** Let's Encrypt (válido hasta 26/01/2026)

### Desarrollo
- **Database:** 161.132.56.68 (PEDIDOS00, PEDIDOS01)

---

## Notas Importantes

### Certificado Actual
El certificado wildcard está instalado correctamente y cubre:
- apitp.nexwork-peru.com
- tp.nexwork-peru.com  
- tk.nexwork-peru.com

### CORS Configurado
- Producción: Solo `https://tp.nexwork-peru.com`
- Desarrollo: localhost:4200, localhost:8080

### Última Publicación
- **Fecha:** 30/10/2025
- **Tag:** tp-v1.0.0-20251030
- **Commit:** 7edb7af

---

## Contacto y Recursos

- **Repositorio:** https://github.com/projects-sst/Api.Roy
- **Release:** https://github.com/projects-sst/Api.Roy/releases/tag/tp-v1.0.0-20251030
- **Documentación SSL:** CONFIGURACION_SSL_IIS.md
- **Documentación .NET 8:** https://learn.microsoft.com/dotnet/core/whats-new/dotnet-8


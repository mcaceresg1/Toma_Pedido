# Configuración SSL para apitp.nexwork-peru.com en IIS

Este documento explica cómo configurar IIS para que `apitp.nexwork-peru.com` use el mismo certificado wildcard de Let's Encrypt que `tp.nexwork-peru.com`.

## Requisitos Previos

- Certificado wildcard de Let's Encrypt instalado en IIS para `*.nexwork-peru.com`
- IIS con ASP.NET Core Hosting Bundle instalado
- Acceso administrativo al servidor IIS

## Pasos para Configurar el Binding HTTPS

### Paso 1: Abrir IIS Manager

1. Inicia **IIS Manager** (ejecuta `inetmgr` desde la línea de comandos)
2. En el panel izquierdo, expande el servidor y luego **Sites**

### Paso 2: Configurar el Sitio de la API

1. **Localiza o crea el sitio** para `apitp.nexwork-peru.com`:
   - Si ya existe, haz clic derecho sobre él y selecciona **Edit Bindings...**
   - Si no existe, crea un nuevo sitio:
     - Haz clic derecho en **Sites** → **Add Website...**
     - **Site name**: `ApiRoy` (o el nombre que prefieras)
     - **Physical path**: Ruta donde está publicada la aplicación (ej: `C:\inetpub\wwwroot\ApiRoy`)
     - **Host name**: `apitp.nexwork-peru.com`
     - **Port**: `443` (HTTPS)
     - **IP address**: Selecciona la IP del servidor

### Paso 3: Agregar Binding HTTPS con el Certificado Wildcard

1. En la ventana **Site Bindings**, haz clic en **Add...**
2. Configura el nuevo binding:
   - **Type**: `https`
   - **IP address**: La misma IP del servidor
   - **Port**: `443`
   - **Host name**: `apitp.nexwork-peru.com`
   - **SSL certificate**: Selecciona el certificado wildcard de Let's Encrypt (`*.nexwork-peru.com`)
     - Debería aparecer en la lista como algo como: **"R3 - Let's Encrypt"** o **"Let's Encrypt Authority"** con el nombre del dominio

3. Haz clic en **OK**

### Paso 4: Verificar el Certificado

Para verificar que el certificado correcto está asignado:

1. En **IIS Manager**, selecciona el servidor (no el sitio)
2. Haz doble clic en **Server Certificates**
3. Busca el certificado wildcard de Let's Encrypt
4. Verifica que el **Issued To** sea `*.nexwork-peru.com` o similar
5. Verifica que el certificado no haya expirado

### Paso 5: Verificar el Binding

1. Regresa al sitio `apitp.nexwork-peru.com`
2. Haz clic derecho → **Edit Bindings...**
3. Verifica que el binding HTTPS tenga:
   - ✅ Tipo: `https`
   - ✅ Puerto: `443`
   - ✅ Host name: `apitp.nexwork-peru.com`
   - ✅ SSL certificate: El certificado wildcard de Let's Encrypt

### Paso 6: Reiniciar el Sitio

1. En IIS Manager, selecciona el sitio `apitp.nexwork-peru.com`
2. En el panel derecho, haz clic en **Restart** o **Stop** y luego **Start**

## Verificación

### Verificar desde el Navegador

1. Abre un navegador y ve a `https://apitp.nexwork-peru.com`
2. Haz clic en el **candado** en la barra de direcciones
3. Verifica que muestre:
   - ✅ **Connection is secure**
   - ✅ El certificado es válido
   - ✅ El certificado es emitido por "Let's Encrypt"

### Verificar desde PowerShell

```powershell
# Verificar binding HTTPS
Get-WebBinding -Name "ApiRoy" | Where-Object { $_.protocol -eq "https" }

# Verificar certificado
Get-ChildItem Cert:\LocalMachine\WebHosting | Where-Object { $_.Subject -like "*nexwork-peru.com*" } | Format-List *
```

## Troubleshooting

### Error: "The specified port is already in use"
- Asegúrate de que no hay otro sitio usando el puerto 443 con el mismo hostname
- Verifica que solo un binding tiene `apitp.nexwork-peru.com` en el puerto 443

### Error: "A binding parameter is invalid"
- Verifica que el hostname no tenga espacios
- Asegúrate de que el certificado esté correctamente instalado en "Server Certificates"

### El certificado no aparece en la lista
- Verifica que el certificado wildcard esté instalado en el servidor
- En **Server Certificates**, verifica que el certificado esté presente
- Si falta, importa el certificado desde el sitio `tp.nexwork-peru.com` que ya lo tiene configurado

### El sitio no responde después de configurar HTTPS
- Verifica que el firewall permita el tráfico en el puerto 443
- Verifica que el DNS apunte correctamente a la IP del servidor
- Revisa los logs en `C:\inetpub\wwwroot\ApiRoy\logs\` (si están habilitados)

## Configuración de DNS

Asegúrate de que el DNS tenga registrado:
```
apitp.nexwork-peru.com    A    [IP_DEL_SERVIDOR]
```

## Notas Importantes

- El certificado wildcard `*.nexwork-peru.com` cubre automáticamente `apitp.nexwork-peru.com`
- El certificado de Let's Encrypt expira cada 90 días, necesitas renovarlo regularmente
- Considera configurar la renovación automática del certificado usando ACME (ej: win-acme)

## Renovación del Certificado

Para renovar el certificado de Let's Encrypt:

1. Usa una herramienta como **win-acme** (https://www.win-acme.com/)
2. O configura la renovación automática en tu servidor
3. Después de renovar, el certificado se aplicará automáticamente a todos los sitios que lo usan (incluyendo `apitp.nexwork-peru.com`)


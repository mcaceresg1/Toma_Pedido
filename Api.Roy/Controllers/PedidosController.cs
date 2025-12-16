namespace ApiRoy.Controllers
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;
    using System.Linq;

    [ApiController]
    [Route("api/pedidos")]
    public class PedidosController : Controller
    {
        private readonly IBcPedido _bcPedido;
        private readonly ILogger<PedidosController> _logger;

        public PedidosController(
            IBcPedido bcPedido,
            ILogger<PedidosController> logger
            )
        {
            _bcPedido = bcPedido;
            _logger = logger;
        }


        [Authorize]
        [HttpPost]
        [Route("GetPedidos")]
        public async Task<IActionResult> GetPedidos(
            EcFiltroPedido f,
            int numPag, int allReg, int cantFilas)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcPedido.GetPedidos(f, user, numPag, allReg, cantFilas);
                return StatusCode(StatusCodes.Status200OK, response);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        [Authorize]
        [HttpPost]
        [Route("GetPedido")]
        public async Task<IActionResult> GetPedido(string operacion)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcPedido.GetPedido(user, operacion);
                if (response == null) return NotFound();
                return StatusCode(StatusCodes.Status200OK, response);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        [Authorize]
        [HttpPost]
        [Route("GetPedidoProductos")]
        public async Task<IActionResult> GetPedidoProductos(string operacion)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcPedido.GetPedidoProductos(user, operacion);
                if (response == null) return NotFound();
                return StatusCode(StatusCodes.Status200OK, response);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        [Authorize]
        [HttpPost]
        [Route("GetStockProductos")]
        public async Task<IActionResult> GetStockProductos([FromBody] EcFiltroProducto f, string rucCliente, int numPag, int allReg, int cantFilas)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcPedido.GetStockProductos(f, user, rucCliente, numPag, allReg, cantFilas);
                return StatusCode(StatusCodes.Status200OK, response);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("GetClientes")]
        public async Task<IActionResult> GetClientes(string? criterio)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcPedido.GetClientes(user, criterio ?? string.Empty);
                return StatusCode(StatusCodes.Status200OK, response);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("GetCondicion")]
        public async Task<IActionResult> GetCondicion()
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcPedido
                    .ObtenerCondicion(user);
                if (response != null)
                {
                    return StatusCode(StatusCodes.Status200OK, response);
                }
                return Unauthorized();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("BuscarUbigeo")]
        public async Task<IActionResult> BuscarUbigeo([FromQuery] string? busqueda)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcPedido
                    .ObtenerUbigeos(user, busqueda ?? string.Empty);
                if (response != null)
                {
                    return StatusCode(StatusCodes.Status200OK, response);
                }
                return Unauthorized();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("ConsultarCliente/{documento}")]
        public async Task<IActionResult> ConsultarCliente(string documento)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                // Limpiar documento (solo alfanuméricos, hasta 20 caracteres)
                var documentoLimpio = new string(documento.Where(c => char.IsLetterOrDigit(c)).ToArray());
                
                if (string.IsNullOrEmpty(documentoLimpio) || documentoLimpio.Length == 0 || documentoLimpio.Length > 20)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new
                    {
                        ok = false,
                        message = "El documento debe tener entre 1 y 20 caracteres alfanuméricos"
                    });
                }

                // Determinar si es RUC (11 dígitos) o DNI (8 dígitos) para consultar APIs externas
                // Para otros tipos de documento, solo se consultará en la base de datos
                if (documentoLimpio.Length == 11 && documentoLimpio.All(char.IsDigit))
                {
                    // Es RUC - consultar API externa
                    var response = await _bcPedido.ConsultarClientePorRuc(documentoLimpio);
                    return StatusCode(StatusCodes.Status200OK, response);
                }
                else if (documentoLimpio.Length == 8 && documentoLimpio.All(char.IsDigit))
                {
                    // Es DNI - consultar API externa
                    var response = await _bcPedido.ConsultarClientePorDni(documentoLimpio);
                    return StatusCode(StatusCodes.Status200OK, response);
                }
                else
                {
                    // Otro tipo de documento (Carnet Extranjería, Pasaporte, etc.)
                    // Solo buscar en la base de datos, no hay APIs externas disponibles para estos tipos
                    // Reutilizar ValidarDniExiste que busca por RUC (que es donde se almacena cualquier documento)
                    var existeEnBD = await _bcPedido.ValidarDniExiste(documentoLimpio);
                    if (existeEnBD)
                    {
                        // Obtener datos del cliente desde la BD
                        var datosCliente = await _bcPedido.ObtenerDatosClientePorDni(documentoLimpio);
                        return StatusCode(StatusCodes.Status200OK, new
                        {
                            existeEnBD = true,
                            datosApi = datosCliente,
                            mensaje = datosCliente != null 
                                ? $"El documento ya es cliente\n\nNombre: {datosCliente.Nombre ?? datosCliente.RazonSocial ?? "N/A"}\nDirección: {datosCliente.Direccion ?? "N/A"}"
                                : "El documento ya existe en la base de datos"
                        });
                    }
                    else
                    {
                        return StatusCode(StatusCodes.Status200OK, new
                        {
                            existeEnBD = false,
                            datosApi = (object?)null,
                            mensaje = "El documento no existe en la base de datos. Debe crear el cliente manualmente."
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al consultar cliente por documento: {Documento}", documento);
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    ok = false,
                    message = $"Error al consultar cliente: {ex.Message}"
                });
            }
        }

        [Authorize]
        [HttpPost]
        [Route("CrearCliente")]
        public async Task<IActionResult> CrearCliente([FromBody] EcNuevoCliente cliente)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcPedido.CrearCliente(user, cliente);
                return StatusCode(StatusCodes.Status200OK, new
                {
                    ok = true,
                    message = "Cliente agregado existosamente."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize]
        [HttpPost]
        [Route("SavePedido")]
        public async Task<IActionResult> SavePedido([FromBody] EcNuevoPedido pedido)
        {
            try
            {
                string? clienteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                string maquina = clienteIp ?? "Desconocido";

                if (!string.IsNullOrEmpty(clienteIp))
                {
                    try
                    {
                        var hostEntry = System.Net.Dns.GetHostEntry(clienteIp);
                        maquina = hostEntry.HostName;
                    }
                    catch
                    {
                        // Si falla la resolución DNS, se mantiene el valor de maquina
                    }
                }
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                _logger.LogInformation("SavePedido - Usuario: {User}, RUC: {Ruc}, Total: {Total}", user, pedido.Ruc, pedido.Total);
                
                var resultado = await _bcPedido.SavePedido(user, maquina, pedido);
                
                _logger.LogInformation("SavePedido - Pedido guardado exitosamente para usuario: {User}", user);
                
                return StatusCode(StatusCodes.Status200OK, new
                {
                    ok = resultado,
                    message = "Pedido creado correctamente"
                });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SavePedido - ERROR al guardar pedido. Usuario: {User}, RUC: {Ruc}, Mensaje: {Message}, InnerException: {Inner}", 
                    User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value,
                    pedido?.Ruc,
                    ex.Message,
                    ex.InnerException?.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    ok = false,
                    message = $"Error al guardar pedido: {ex.Message}",
                    detail = ex.InnerException?.Message
                });
            }
        }
        [Authorize]
        [HttpPut]
        [Route("UpdatePedido/{operacion}")]
        public async Task<IActionResult> UpdatePedido(string operacion, [FromBody] EcActualizarPedido pedido)
        {
            try
            {
                // Validar el modelo
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(e => e.Value?.Errors.Count > 0)
                        .Select(e => new
                        {
                            Field = e.Key,
                            Errors = e.Value?.Errors.Select(x => x.ErrorMessage).ToArray()
                        })
                        .ToList();

                    _logger.LogWarning("UpdatePedido - Error de validación para operación {Operacion}. Errores: {Errors}", 
                        operacion, System.Text.Json.JsonSerializer.Serialize(errors));

                    return StatusCode(StatusCodes.Status400BadRequest, new
                    {
                        ok = false,
                        message = "Error de validación",
                        errors = errors
                    });
                }

                // Validar que el pedido no sea null
                if (pedido == null)
                {
                    _logger.LogWarning("UpdatePedido - Pedido es null para operación {Operacion}", operacion);
                    return StatusCode(StatusCodes.Status400BadRequest, new
                    {
                        ok = false,
                        message = "El pedido no puede ser nulo"
                    });
                }

                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                _logger.LogInformation("UpdatePedido - Usuario: {User}, Operación: {Operacion}, Total: {Total}, Productos: {CantidadProductos}", 
                    user, operacion, pedido.Total, pedido.Productos?.Count ?? 0);

                var resultado = await _bcPedido.UpdatePedido(user, operacion, pedido);

                if (resultado)
                {
                    _logger.LogInformation("UpdatePedido - Pedido actualizado exitosamente. Usuario: {User}, Operación: {Operacion}", user, operacion);
                    return StatusCode(StatusCodes.Status200OK, new
                    {
                        ok = true,
                        message = "Pedido actualizado correctamente"
                    });
                }
                else
                {
                    _logger.LogWarning("UpdatePedido - No se pudo actualizar el pedido. Usuario: {User}, Operación: {Operacion}", user, operacion);
                    return StatusCode(StatusCodes.Status400BadRequest, new
                    {
                        ok = false,
                        message = "No se pudo actualizar el pedido"
                    });
                }
            }
            catch (Exception ex)
            {
                var errorId = Guid.NewGuid().ToString();
                _logger.LogError(ex, "UpdatePedido - Error al actualizar pedido. Operación: {Operacion}. ErrorId: {ErrorId}", operacion, errorId);
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    ok = false,
                    message = "Ha ocurrido un error interno del servidor",
                    errorId = errorId
                });
            }
        }

        [Authorize]
        [HttpGet]
        [Route("GetMonedas")]
        public async Task<IActionResult> GetMonedas()
        {
            try
            {
                var response = await _bcPedido.GetMonedas();
                return StatusCode(StatusCodes.Status200OK, response);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
      
        [Authorize]
        [HttpGet]
        [Route("GetTiposDocumento")]
        public async Task<IActionResult> GetTiposDocumento()
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcPedido.GetTiposDocumento(user);
                return StatusCode(StatusCodes.Status200OK, response);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("GetHistoricoPedidos")]
        public async Task<IActionResult> GetHistoricoPedidos([FromQuery] DateTime? fechaInicio = null,[FromQuery] DateTime? fechaFin = null,[FromQuery] int? vendedorId = null)
        {
            try
            {
                var result = await _bcPedido.GetHistoricoPedidos(fechaInicio, fechaFin, vendedorId);
                return StatusCode(StatusCodes.Status200OK, result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("GetHistoricoPedidosPorZona")]
        public async Task<IActionResult> GetHistoricoPedidosPorZona([FromQuery] DateTime? fechaInicio = null, [FromQuery] DateTime? fechaFin = null, [FromQuery] int? vendedorId = null, [FromQuery] bool? conDespacho = null)
        {
            try
            {
                var result = await _bcPedido.GetHistoricoPedidosPorZona(fechaInicio, fechaFin, vendedorId, conDespacho);
                return StatusCode(StatusCodes.Status200OK, result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("GetVendedores")]
        public async Task<IActionResult> GetVendedores()
        {
            var vendedores = await _bcPedido.GetVendedores();
            return Ok(vendedores);
        }


    }
}

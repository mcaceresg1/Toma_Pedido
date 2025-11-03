namespace ApiRoy.Controllers
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    [ApiController]
    [Route("api/pedidos")]
    public class PedidosController : Controller
    {
        private readonly IBcPedido _bcPedido;

        public PedidosController(
            IBcPedido bcPedido
            )
        {
            _bcPedido = bcPedido;
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
                var response = await _bcPedido.GetClientes(user, criterio);
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

                return StatusCode(StatusCodes.Status200OK, new
                {
                    ok = await _bcPedido.SavePedido(user, maquina, pedido),
                    message = "Pedido creado correctamente"
                });

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        [Authorize]
        [HttpPut]
        [Route("UpdatePedido/{operacion}")]
        public async Task<IActionResult> UpdatePedido(string operacion, [FromBody] EcActualizarPedido pedido)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                return StatusCode(StatusCodes.Status200OK, new
                {
                    ok = await _bcPedido.UpdatePedido(user, operacion, pedido),
                    message = "Pedido creado correctamente"
                });

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
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

        [HttpGet("GetVendedores")]
        public async Task<IActionResult> GetVendedores()
        {
            var vendedores = await _bcPedido.GetVendedores();
            return Ok(vendedores);
        }


    }
}

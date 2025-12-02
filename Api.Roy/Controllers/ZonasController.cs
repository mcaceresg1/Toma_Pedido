namespace ApiRoy.Controllers
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    [ApiController]
    [Route("api/zonas")]
    public class ZonasController : Controller
    {
        private readonly IBcZona _bcZona;

        public ZonasController(IBcZona bcZona)
        {
            _bcZona = bcZona;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                var zonas = await _bcZona.GetAll(user);
                return StatusCode(StatusCodes.Status200OK, zonas);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("{zonaCodigo}")]
        public async Task<IActionResult> GetByCodigo(string zonaCodigo)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                var zona = await _bcZona.GetByCodigo(zonaCodigo, user);
                if (zona == null) { return NotFound(); }

                return StatusCode(StatusCodes.Status200OK, zona);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EcZonaCreateDto zona)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                var mensaje = await _bcZona.Create(zona, user);

                if (mensaje.StartsWith("success"))
                    return StatusCode(StatusCodes.Status201Created, new { message = mensaje });
                else
                    return StatusCode(StatusCodes.Status400BadRequest, new { message = mensaje });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{zonaCodigo}")]
        public async Task<IActionResult> Update(string zonaCodigo, [FromBody] EcZonaUpdateDto zona)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                var mensaje = await _bcZona.Update(zonaCodigo, zona, user);

                if (mensaje.StartsWith("success"))
                    return StatusCode(StatusCodes.Status200OK, new { message = mensaje });
                else
                    return StatusCode(StatusCodes.Status400BadRequest, new { message = mensaje });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("{zonaCodigo}")]
        public async Task<IActionResult> Delete(string zonaCodigo)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                var mensaje = await _bcZona.Delete(zonaCodigo, user);

                if (mensaje.StartsWith("success"))
                    return StatusCode(StatusCodes.Status200OK, new { message = mensaje });
                else
                    return StatusCode(StatusCodes.Status400BadRequest, new { message = mensaje });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}


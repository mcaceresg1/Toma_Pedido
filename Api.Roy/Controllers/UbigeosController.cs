namespace ApiRoy.Controllers
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    [ApiController]
    [Route("api/ubigeos")]
    public class UbigeosController : Controller
    {
        private readonly IBcUbigeo _bcUbigeo;

        public UbigeosController(IBcUbigeo bcUbigeo)
        {
            _bcUbigeo = bcUbigeo;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                var ubigeos = await _bcUbigeo.GetAll(user);
                return StatusCode(StatusCodes.Status200OK, ubigeos);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("zona/{zonaCodigo}")]
        public async Task<IActionResult> GetByZona(string zonaCodigo)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                var ubigeos = await _bcUbigeo.GetByZona(zonaCodigo, user);
                return StatusCode(StatusCodes.Status200OK, ubigeos);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("zona/{zonaCodigo}")]
        public async Task<IActionResult> SetByZona(string zonaCodigo, [FromBody] List<string> ubigeos)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }

                var mensaje = await _bcUbigeo.SetByZona(zonaCodigo, ubigeos, user);

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


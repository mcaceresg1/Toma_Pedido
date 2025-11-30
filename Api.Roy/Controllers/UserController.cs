using ApiRoy.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ApiRoy.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/user")]
    public class UserController : Controller
    {
        private readonly IBcUser _bcUser;
        public UserController(IBcUser bcUser)
        {
            _bcUser = bcUser;
        }

        [Authorize]
        [HttpGet]
        [Route("GetUser")]
        public async Task<IActionResult> GetUser()
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcUser.GetUser(user);
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
        [Route("GetConnectionDetails")]
        public Task<IActionResult> GetConnectionDetails()
        {
            try
            {
                var response = _bcUser.GetConnectionDetails();
                if (response != null)
                {
                    return Task.FromResult<IActionResult>(StatusCode(StatusCodes.Status200OK, response));
                }
                return Task.FromResult<IActionResult>(Unauthorized());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("GetEmpresas")]
        public async Task<IActionResult> GetEmpresas()
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcUser
                    .ObtenerEmpresas(user);
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
        [Route("GetEmpresa")]
        public async Task<IActionResult> GetEmpresa()
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                var response = await _bcUser
                    .ObtenerEmpresa(user);
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
        [Route("CambiarEmpresa")]
        public async Task<IActionResult> CambiarEmpresa([FromQuery] string codigo)
        {
            try
            {
                var user = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                if (user == null) { return Unauthorized(); }
                await _bcUser
                    .CambiarEmpresa(user, codigo);

                return StatusCode(StatusCodes.Status200OK, new
                {
                    message = "OK"
                });

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}

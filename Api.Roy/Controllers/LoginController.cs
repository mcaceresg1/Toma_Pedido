namespace ApiRoy.Controllers
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.IdentityModel.Tokens;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;

    [ApiController]
    [Route("api/login")]
    public class LoginController : Controller
    {
        private readonly IBcLogin _bcLogin;
        private readonly IConfiguration _config;
        private readonly ILogger<LoginController> _logger;

        public LoginController(IBcLogin login, IConfiguration configuration, ILogger<LoginController> logger)
        {
            _bcLogin = login;
            _config = configuration;
            _logger = logger;
        }

        [HttpPost]
        [Route("Authenticate")]
        public async Task<IActionResult> Login(EcLogin ecLogin)
        {
            if(ecLogin == null)
            {
                return BadRequest(new { message = "Usuario o contraseña no válidos." });
            }
            try
            {
                _logger.LogInformation("Intento de login para usuario: {Usuario}", ecLogin.Usuario);
                
                var resultLogin = await _bcLogin.Login(ecLogin);
                
                if(resultLogin == null)
                {
                    _logger.LogWarning("Login fallido para usuario: {Usuario}", ecLogin.Usuario);
                    return BadRequest(new { message = "Usuario o contraseña no válidos" });
                }
                
                var token = GenerateToken(ecLogin);
                _logger.LogInformation("Login exitoso para usuario: {Usuario}", ecLogin.Usuario);
                
                return StatusCode(200, new
                {
                    message = token,
                    user = resultLogin
                });
            } catch (Exception ex)
            {
                _logger.LogError(ex, "Error en login para usuario: {Usuario}", ecLogin?.Usuario);
                throw new Exception(ex.Message, ex);
            }
            
        }

        private string GenerateToken(EcLogin p)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, p.Usuario)
            };
            var secretKey = _config.GetSection("JWT:SECRET_KEY").Value ?? throw new InvalidOperationException("JWT Secret Key no configurada");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            
            // Leer tiempo de expiración desde configuración
            var expireMinutesStr = _config.GetSection("JWT:JWT_EXPIRE_MINUTES").Value ?? "120";
            var expireMinutes = int.TryParse(expireMinutesStr, out var minutes) ? minutes : 120;
            
            // Leer Issuer y Audience desde configuración
            var issuer = _config.GetSection("JWT:Issuer").Value;
            var audience = _config.GetSection("JWT:Audience").Value;
            
            var securityToken = new JwtSecurityToken(
                                issuer: issuer,
                                audience: audience,
                                claims: claims,
                                expires: DateTime.Now.AddMinutes(expireMinutes),
                                signingCredentials: creds);
            string token = new JwtSecurityTokenHandler().WriteToken(securityToken);
            return token;
        }
    }
}

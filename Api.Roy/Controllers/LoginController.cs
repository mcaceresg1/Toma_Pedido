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
        private readonly IWebHostEnvironment _environment;

        public LoginController(IBcLogin login, IConfiguration configuration, ILogger<LoginController> logger, IWebHostEnvironment environment)
        {
            _bcLogin = login;
            _config = configuration;
            _logger = logger;
            _environment = environment;
        }

        [HttpGet]
        [Route("GetEnvironmentInfo")]
        public IActionResult GetEnvironmentInfo()
        {
            try
            {
                var isDevelopment = _environment.IsDevelopment();
                var environment = isDevelopment ? "Desarrollo" : "Producción";
                
                string connStringLogin;
                string connStringData;
                
                if (isDevelopment)
                {
                    connStringLogin = _config.GetConnectionString("DevConnStringDbLogin") ?? "";
                    connStringData = _config.GetConnectionString("DevConnStringDbData") ?? "";
                    
                    // Log detallado para debug
                    _logger.LogDebug("[GetEnvironmentInfo] Ambiente: Development");
                    _logger.LogDebug("[GetEnvironmentInfo] DevConnStringDbLogin: {ConnString}", connStringLogin);
                    _logger.LogDebug("[GetEnvironmentInfo] DevConnStringDbData: {ConnString}", connStringData);
                }
                else
                {
                    connStringLogin = _config.GetConnectionString("OrgConnStringDbLogin") ?? "";
                    connStringData = _config.GetConnectionString("OrgConnStringDbData") ?? "";
                    
                    _logger.LogDebug("[GetEnvironmentInfo] Ambiente: Production");
                    _logger.LogDebug("[GetEnvironmentInfo] OrgConnStringDbLogin: {ConnString}", connStringLogin);
                    _logger.LogDebug("[GetEnvironmentInfo] OrgConnStringDbData: {ConnString}", connStringData);
                }
                
                // Extraer el nombre de la base de datos de la cadena de conexión
                var dbLoginName = ExtractDatabaseName(connStringLogin);
                var dbDataName = ExtractDatabaseName(connStringData);
                
                _logger.LogDebug("[GetEnvironmentInfo] BD Login extraída: {DbLogin}", dbLoginName);
                _logger.LogDebug("[GetEnvironmentInfo] BD Datos extraída: {DbData}", dbDataName);
                
                return Ok(new
                {
                    ambiente = environment,
                    bdLogin = dbLoginName,
                    bdData = dbDataName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener información del ambiente");
                return StatusCode(500, new { message = "Error al obtener información del ambiente" });
            }
        }
        
        private string ExtractDatabaseName(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
                return "N/A";
            
            // Buscar "Initial Catalog=" o "Database=" (ambos formatos)
            var match = System.Text.RegularExpressions.Regex.Match(
                connectionString, 
                @"(?:initial catalog|database)=([^;]+)", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            return match.Success ? match.Groups[1].Value : "N/A";
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
            
            // Validar tamaño de clave para HmacSha512 (mínimo 64 bytes = 512 bits)
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            if (keyBytes.Length < 64)
            {
                _logger.LogError("JWT SECRET_KEY es demasiado corta. Longitud actual: {Length} bytes. Se requiere mínimo 64 bytes (512 bits) para HmacSha512Signature", keyBytes.Length);
                throw new InvalidOperationException($"JWT SECRET_KEY debe tener al menos 64 bytes (512 bits). Longitud actual: {keyBytes.Length} bytes");
            }
            
            var key = new SymmetricSecurityKey(keyBytes);
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

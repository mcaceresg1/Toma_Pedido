namespace ApiRoy.Controllers
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.IdentityModel.Tokens;
    using Microsoft.Data.SqlClient;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;

    [ApiController]
    [Route("api/login")]
    public class LoginController : Controller
    {
        private readonly IBcLogin _bcLogin;
        private readonly IBcPedido _bcPedido;
        private readonly IConfiguration _config;
        private readonly ILogger<LoginController> _logger;
        private readonly IWebHostEnvironment _environment;

        public LoginController(IBcLogin login, IBcPedido bcPedido, IConfiguration configuration, ILogger<LoginController> logger, IWebHostEnvironment environment)
        {
            _bcLogin = login;
            _bcPedido = bcPedido;
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
            
            // Si contiene valores placeholder, retornar N/A
            if (connectionString.Contains("USAR_VARIABLES_DE_ENTORNO") || 
                connectionString.Contains("CONFIGURAR_EN_USER_SECRETS") ||
                connectionString.Contains("CONFIGURAR"))
            {
                return "N/A (No configurado)";
            }
            
            // Buscar "Initial Catalog=" o "Database=" (ambos formatos), permitiendo espacios
            var match = System.Text.RegularExpressions.Regex.Match(
                connectionString, 
                @"(?:initial\s+catalog|database)\s*=\s*([^;]+)", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            if (match.Success)
            {
                var dbName = match.Groups[1].Value.Trim();
                return string.IsNullOrEmpty(dbName) ? "N/A" : dbName;
            }
            
            return "N/A";
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
                
                // Determinar rol basado en si es Vendedor o no
                // Si Vendedor es 0, asumimos que es un usuario Administrativo/Interno
                // Si Vendedor > 0, es un Tomapedidos
                string role = resultLogin.Vendedor == 0 ? "Administrador" : "Tomapedidos";
                
                var token = GenerateToken(ecLogin, role, resultLogin.Permisos);
                _logger.LogInformation("Login exitoso para usuario: {Usuario}", ecLogin.Usuario);
                
                // Registrar empresas del usuario después del login exitoso
                try
                {
                    _bcPedido.RegistrarEmpresasUsuario(ecLogin.Usuario);
                }
                catch (Exception ex)
                {
                    // No interrumpir el login si falla el log de empresas
                    _logger.LogWarning(ex, "No se pudo registrar información de empresas para usuario: {Usuario}", ecLogin.Usuario);
                }
                
                return StatusCode(200, new
                {
                    message = token,
                    user = resultLogin
                });
            }
            catch (InvalidOperationException ex)
            {
                // Errores de configuración (JWT, connection strings, etc.)
                _logger.LogError(ex, "Error de configuración en login para usuario: {Usuario}. Error: {Error}", ecLogin?.Usuario ?? "N/A", ex.Message);
                _logger.LogError("StackTrace: {StackTrace}", ex.StackTrace ?? "N/A");
                if (ex.InnerException != null)
                {
                    _logger.LogError("InnerException: {InnerError}", ex.InnerException.Message);
                }
                // Relanzar para que el middleware lo maneje como BadRequest (InvalidOperationException -> 400)
                throw;
            }
            catch (SqlException sqlEx)
            {
                // Errores de SQL Server
                _logger.LogError(sqlEx, "Error de base de datos en login para usuario: {Usuario}. Error SQL: {Error}, Number: {Number}, State: {State}", 
                    ecLogin?.Usuario ?? "N/A", sqlEx.Message, sqlEx.Number, sqlEx.State);
                _logger.LogError("Server: {Server}, Procedure: {Procedure}", sqlEx.Server ?? "N/A", sqlEx.Procedure ?? "N/A");
                // Relanzar para que el middleware lo maneje como InternalServerError
                throw;
            }
            catch (Exception ex)
            {
                // Cualquier otro error
                _logger.LogError(ex, "Error inesperado en login para usuario: {Usuario}. Tipo: {Type}, Mensaje: {Error}", 
                    ecLogin?.Usuario ?? "N/A", ex.GetType().Name, ex.Message);
                _logger.LogError("StackTrace: {StackTrace}", ex.StackTrace ?? "N/A");
                if (ex.InnerException != null)
                {
                    _logger.LogError("InnerException - Tipo: {Type}, Mensaje: {Error}", 
                        ex.InnerException.GetType().Name, ex.InnerException.Message);
                }
                // Relanzar para que el middleware lo maneje
                throw;
            }
        }

        private string GenerateToken(EcLogin p, string role, IEnumerable<string>? permisos)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, p.Usuario),
                new Claim(ClaimTypes.Role, role)
            };

            // Permisos por usuario (SUP011): VE/RV/RC/MV
            if (permisos != null)
            {
                foreach (var permiso in permisos
                             .Where(p => !string.IsNullOrWhiteSpace(p))
                             .Select(p => p.Trim())
                             .Distinct(StringComparer.OrdinalIgnoreCase))
                {
                    claims.Add(new Claim("permiso", permiso.ToUpperInvariant()));
                }
            }
            var secretKey = _config.GetSection("JWT:SECRET_KEY").Value ?? throw new InvalidOperationException("JWT Secret Key no configurada");
            
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var key = new SymmetricSecurityKey(keyBytes);
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
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

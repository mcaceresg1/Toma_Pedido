namespace ApiRoy.ResourceAccess
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using ApiRoy.ResourceAccess.Database;
    using System.Data;

    public class DbLogin : IDbLogin
    {
        private readonly DBManager db;
        private static IConfiguration? _StaticConfig { get; set; }
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<DbLogin> _logger;

        public DbLogin(IConfiguration config, IWebHostEnvironment environment, ILogger<DbLogin> logger)
        {
            _environment = environment;
            _StaticConfig = config;
            _logger = logger;
            string? DbConnString;
            if (this._environment.IsDevelopment())
            {
                DbConnString = _StaticConfig.GetConnectionString("DevConnStringDbLogin");
                _logger.LogDebug("[DbLogin] Ambiente: Development");
                _logger.LogDebug("[DbLogin] Connection String obtenida: {ConnString}", DbConnString ?? "NULL");
                if (string.IsNullOrEmpty(DbConnString) || DbConnString.Contains("CONFIGURAR"))
                {
                    throw new InvalidOperationException($"DevConnStringDbLogin no está configurado correctamente. Valor actual: {DbConnString}");
                }
            }
            else
            {
                DbConnString = _StaticConfig.GetConnectionString("OrgConnStringDbLogin");
                _logger.LogDebug("[DbLogin] Ambiente: Production");
                _logger.LogDebug("[DbLogin] Connection String obtenida: {ConnString}", DbConnString ?? "NULL");
            }
            db = new DBManager(DbConnString ?? throw new InvalidOperationException("Connection string not configured"));
        }

        public Task<EcLoginResult?> Login(EcLogin ecLogin)
        {
            try
            {
                EcLoginResult? GetItem(DataRow r)
                {
                    // Log detallado de lo que devuelve el stored procedure
                    var response = Convert.ToInt32(r["RESPONSE"]);
                    _logger.LogDebug("[DbLogin.GetItem] RESPONSE recibido: {Response}", response);
                    _logger.LogDebug("[DbLogin.GetItem] EMPRESA: {Empresa}, VENDEDOR: {Vendedor}, ID: {Id}", 
                        r["EMPRESA"]?.ToString() ?? "NULL", 
                        r["VENDEDOR"]?.ToString() ?? "NULL", 
                        r["ID"]?.ToString() ?? "NULL");
                    
                    if (response == 1)
                    {
                        return new EcLoginResult()
                        {
                            Empresa = r["EMPRESA"]?.ToString(),
                            Response = response,
                            Empresas = Convert.ToString(r["EMPRESAS"]),
                            Vendedor = Convert.ToInt32(r["VENDEDOR"]),
                            Id = Convert.ToInt32(r["ID"]),
                        };
                    }
                    else
                    {
                        _logger.LogDebug("[DbLogin.GetItem] RESPONSE != 1, devolviendo null. RESPONSE = {Response}", response);
                    }
                    return null;
                }
                var parametros = new List<DbParametro>
                {
                    new DbParametro("@USER", SqlDbType.VarChar, ParameterDirection.Input, ecLogin.Usuario),
                    new DbParametro("@PASSWORD", SqlDbType.VarChar, ParameterDirection.Input, ecLogin.Clave),
                };
                Func<DataRow, EcLoginResult?> GetItemDelegate = GetItem;

                var result = db.ObtieneLista("USP_SESION_USUARIO", GetItemDelegate, parametros);
                
                // Log para debug
                _logger.LogDebug("[DbLogin.Login] Usuario: {Usuario}, Resultado: {Result}", ecLogin.Usuario, result == null ? "NULL" : $"Count={result.Count}");
                
                if (result == null || result.Count == 0)
                {
                    _logger.LogWarning("[DbLogin.Login] Login fallido - resultado null o vacío para usuario: {Usuario}", ecLogin.Usuario);
                    return Task.FromResult<EcLoginResult?>(null);
                }
                
                // === NUEVO: Obtener permisos desde SUP011 ===
                try 
                {
                    string? GetPermisoItem(DataRow r)
                    {
                        return r["OPCION"]?.ToString();
                    }
                    
                    // Usar la empresa por defecto del usuario o '01' si es nula
                    var empresaPermisos = result[0].Empresa ?? "01";
                    
                    var paramsPermisos = new List<DbParametro>
                    {
                        new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, ecLogin.Usuario),
                        new DbParametro("@EMPRESA", SqlDbType.VarChar, ParameterDirection.Input, empresaPermisos)
                    };
                    
                    Func<DataRow, string?> GetPermisoItemDelegate = GetPermisoItem;
                    
                    // Llamar al SP nuevo
                    var permisos = db.ObtieneLista("NX_SEGURIDAD_WEB_GET_PERMISOS", GetPermisoItemDelegate, paramsPermisos);
                    
                    // Asignar al resultado, filtrando nulos
                    if (permisos != null)
                    {
                        result[0].Permisos = permisos.Where(p => p != null).Cast<string>().ToList();
                        _logger.LogInformation("[DbLogin.Login] Permisos obtenidos para {Usuario}: {Count}", ecLogin.Usuario, result[0].Permisos?.Count);
                    }
                    else
                    {
                        result[0].Permisos = new List<string>();
                        _logger.LogWarning("[DbLogin.Login] No se obtuvieron permisos para {Usuario}", ecLogin.Usuario);
                    }
                }
                catch (Exception exPermisos)
                {
                    _logger.LogError(exPermisos, "Error al obtener permisos para usuario {Usuario}", ecLogin.Usuario);
                    // No fallar el login completo, solo dejar permisos vacíos
                    result[0].Permisos = new List<string>();
                }
                // ===========================================
                
                _logger.LogInformation("[DbLogin.Login] Login exitoso para usuario: {Usuario}, Response: {Response}", ecLogin.Usuario, result[0]?.Response);
                return Task.FromResult<EcLoginResult?>(result[0]);

            }
            catch (Exception ex)
            {
                // Log detallado del error
                _logger.LogError(ex, "[ERROR DbLogin.Login] Excepción al intentar login para usuario: {Usuario}. Error: {Error}", ecLogin.Usuario, ex.Message);
                _logger.LogError("[ERROR DbLogin.Login] StackTrace: {StackTrace}", ex.StackTrace ?? "N/A");
                if (ex.InnerException != null)
                {
                    _logger.LogError("[ERROR DbLogin.Login] InnerException: {InnerError}", ex.InnerException.Message);
                }
                throw new Exception(ex.Message, ex);
            }
        }
    }
}

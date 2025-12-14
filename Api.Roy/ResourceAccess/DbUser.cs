
namespace ApiRoy.ResourceAccess
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using ApiRoy.ResourceAccess.Database;
    using System.Data;
    using System.Text.RegularExpressions;

    public class DbUser : IDbUser
    {
        private readonly DBManager db;
        public DbConnection? DbConn { get; set; }
        private static IConfiguration _StaticConfig { get; set; } = null!;
        private readonly IWebHostEnvironment _environment;
        private string DbConnString { get; set; } = string.Empty;

        public DbUser(IConfiguration config, IWebHostEnvironment environment)
        {
            _environment = environment;
            _StaticConfig = config;
            if (this._environment.IsDevelopment())
            {
                DbConnString = _StaticConfig.GetConnectionString("DevConnStringDbLogin") ?? throw new InvalidOperationException("DevConnStringDbLogin no está configurado");
            }
            else
            {
                DbConnString = _StaticConfig.GetConnectionString("OrgConnStringDbLogin") ?? throw new InvalidOperationException("OrgConnStringDbLogin no está configurado");
            }
            db = new DBManager(DbConnString);
        }

        public Task<EcUsuario?> GetUser(string user)
        {
            try
            {
                EcUsuario GetItem(DataRow r)
                {
                    return new EcUsuario()
                    {
                        CodUsuario = Convert.ToInt32(r["IDREGISTRO"]),
                        CodVendedor = Convert.ToInt32(r["VENDEDOR"]),
                        NombreUsuario = r["NOMBRE"]?.ToString(),
                        Alias = r["ALIAS"]?.ToString(),
                        EmpresaDefecto = r["EMPRESA_DEFECTO"]?.ToString(),
                        Empresas = r["EMPRESAS"]?.ToString(),
                        EditaPrecio = Convert.ToBoolean(r["PUEDE_CAMBIAR_PRECIO_FACTURACION"]),
                        FuncionesEspeciales = Convert.ToBoolean(r["OPERACIONES_ESPECIALES"]),
                        PreciosPermitidos = r["PRECIO_PERMITIDOS"]?.ToString()
                    };
                }
                // Obtener el nombre de la BD de login
                string loginDbName = GetLoginDatabaseName();
                
                var parametros = new List<DbParametro>
                {
                    new DbParametro("@USER", SqlDbType.VarChar, ParameterDirection.Input, user),
                    new DbParametro("@BD_LOGIN", SqlDbType.VarChar, ParameterDirection.Input, loginDbName),
                };
                Func<DataRow, EcUsuario> GetItemDelegate = GetItem;

                var result = db.ObtieneLista("USP_USUARIO", GetItemDelegate, parametros);
                if (result == null || result.Count == 0 || result[0] == null)
                {
                    return Task.FromResult<EcUsuario?>(null);
                }
                return Task.FromResult<EcUsuario?>(result[0]);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public Task<List<EcEmpresa>> ObtenerEmpresas(string usuario)
        {
            try
            {
                EcEmpresa GetItem(DataRow r)
                {

                    return new EcEmpresa()
                    {
                        Codigo = r["CODIGO"]?.ToString() ?? string.Empty,
                        Nombre = r["EMPRESA"]?.ToString() ?? string.Empty,
                        PrecioUsaImpuesto = Convert.ToBoolean(r["PRECIO_TIENE_IMPUESTO"])
                    };

                }
                var parametros = new List<DbParametro>
                {
                    new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                };
                Func<DataRow, EcEmpresa> GetItemDelegate = GetItem;

                var result = db.ObtieneLista("ST_OBTENER_EMPRESAS_USUARIO", GetItemDelegate, parametros);
                return Task.FromResult(result);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public Task<EcEmpresa> ObtenerEmpresa(string usuario)
        {
            try
            {
                EcEmpresa GetItem(DataRow r)
                {

                    return new EcEmpresa()
                    {
                        Codigo = r["CODIGO"]?.ToString() ?? string.Empty,
                        Nombre = r["EMPRESA"]?.ToString() ?? string.Empty,
                        PrecioUsaImpuesto = Convert.ToBoolean(r["PRECIO_TIENE_IMPUESTO"]),
                        Ruc = r["RUC"]?.ToString() ?? string.Empty,
                        NombrePrecio1 = r["NOMBRE_PRECIO1"]?.ToString() ?? string.Empty,
                        NombrePrecio2 = r["NOMBRE_PRECIO2"]?.ToString() ?? string.Empty,
                        NombrePrecio3 = r["NOMBRE_PRECIO3"]?.ToString() ?? string.Empty,
                        NombrePrecio4 = r["NOMBRE_PRECIO4"]?.ToString() ?? string.Empty,
                        NombrePrecio5 = r["NOMBRE_PRECIO5"]?.ToString() ?? string.Empty,
                        DetallesPago = (r["CODIGO"]?.ToString() ?? string.Empty) == "01" ? "Banco: BCP  CTA. CORRIENTE: 194-2293444-0-99 CCI: 002-194-00-2293444-09-995" :
                        "Banco: BCP  CTA. CORRIENTE: 194-8742786-0-67 CCI: 002-194-0087427860-6-7-98"
                    };

                }
                // Obtener el nombre de la BD de login
                string loginDbName = GetLoginDatabaseName();
                
                var parametros = new List<DbParametro>
                {
                    new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                    new DbParametro("@BD_LOGIN", SqlDbType.VarChar, ParameterDirection.Input, loginDbName),
                };
                Func<DataRow, EcEmpresa> GetItemDelegate = GetItem;

                var result = db.ObtieneLista("USP_EMPRESA", GetItemDelegate, parametros);
                if (result.Count == 0)
                {
                    throw new Exception("No se encontró la empresa.");
                }
                else
                {
                    return Task.FromResult(result[0]);
                }

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public Task CambiarEmpresa(string usuario, string codigo)
        {
            try
            {

                var parametros = new List<DbParametro>
                {
                    new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                    new DbParametro("@EMPRESA", SqlDbType.VarChar, ParameterDirection.Input, codigo)
                };

                var result = db.ObtieneNQ("ST_CAMBIAR_EMPRESA", parametros);
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public string GetConnectionDetails()
        {
            try
            {
                // Obtener ambas cadenas de conexión
                string connStringLogin = DbConnString;
                string connStringData = string.Empty;
                
                if (_environment.IsDevelopment())
                {
                    connStringData = _StaticConfig.GetConnectionString("DevConnStringDbData") ?? string.Empty;
                }
                else
                {
                    connStringData = _StaticConfig.GetConnectionString("OrgConnStringDbData") ?? string.Empty;
                }

                // Extraer nombres de bases de datos usando el mismo método que LoginController
                string dbLoginName = ExtractDatabaseName(connStringLogin);
                string dbDataName = ExtractDatabaseName(connStringData);

                if (!string.IsNullOrEmpty(dbLoginName) && !string.IsNullOrEmpty(dbDataName))
                {
                    return $"BD Login: {dbLoginName} | BD Data: {dbDataName}";
                }
                else if (!string.IsNullOrEmpty(dbLoginName))
                {
                    return $"BD Login: {dbLoginName}";
            }
            else
            {
                return "No se pudo extraer la información del string de conexión.";
            }
            }
            catch (Exception ex)
            {
                return $"Error al obtener información de conexión: {ex.Message}";
            }
        }

        private string ExtractDatabaseName(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
                return string.Empty;
            
            // Usar el mismo patrón que LoginController que ya funciona correctamente
            // Buscar "Initial Catalog=" o "Database=" (ambos formatos)
            var match = Regex.Match(
                connectionString, 
                @"(?:initial\s+catalog|database)\s*=\s*([^;]+)", 
                RegexOptions.IgnoreCase
            );
            
            return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
        }

        /// <summary>
        /// Obtiene el nombre de la base de datos de login desde la configuración
        /// </summary>
        private string GetLoginDatabaseName()
        {
            string loginDbConnString;
            if (_environment.IsDevelopment())
            {
                loginDbConnString = _StaticConfig.GetConnectionString("DevConnStringDbLogin") ?? throw new InvalidOperationException("DevConnStringDbLogin no está configurado");
            }
            else
            {
                loginDbConnString = _StaticConfig.GetConnectionString("OrgConnStringDbLogin") ?? throw new InvalidOperationException("OrgConnStringDbLogin no está configurado");
            }
            
            string loginDbName = ExtractDatabaseName(loginDbConnString);
            if (string.IsNullOrEmpty(loginDbName))
            {
                throw new InvalidOperationException("No se pudo determinar el nombre de la base de datos de login");
            }
            
            return loginDbName;
        }
    }
}

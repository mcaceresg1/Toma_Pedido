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

        public DbLogin(IConfiguration config, IWebHostEnvironment environment)
        {
            _environment = environment;
            _StaticConfig = config;
            string? DbConnString;
            if (this._environment.IsDevelopment())
            {
                DbConnString = _StaticConfig.GetConnectionString("DevConnStringDbLogin");
            }
            else
            {
                DbConnString = _StaticConfig.GetConnectionString("OrgConnStringDbLogin");
            }
            db = new DBManager(DbConnString ?? throw new InvalidOperationException("Connection string not configured"));
        }

        public async Task<EcLoginResult?> Login(EcLogin ecLogin)
        {
            try
            {
                EcLoginResult? GetItem(DataRow r)
                {
                    if (Convert.ToInt32(r["RESPONSE"]) == 1)
                    {
                        return new EcLoginResult()
                        {
                            Empresa = r["EMPRESA"]?.ToString(),
                            Response = Convert.ToInt32(r["RESPONSE"]),
                            Empresas = Convert.ToString(r["EMPRESAS"]),
                            Vendedor = Convert.ToInt32(r["VENDEDOR"]),
                            Id = Convert.ToInt32(r["ID"]),
                        };
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
                if (result == null || result.Count == 0)
                {
                    return null;
                }
                return result[0];

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}

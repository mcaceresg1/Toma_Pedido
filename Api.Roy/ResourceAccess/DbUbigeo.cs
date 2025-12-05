namespace ApiRoy.ResourceAccess
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using ApiRoy.ResourceAccess.Database;
    using System.Data;

    public class DbUbigeo : IDbUbigeo
    {
        private readonly DBManager dbData;
        private static IConfiguration _StaticConfig { get; set; } = null!;
        private readonly IWebHostEnvironment _environment;

        public DbUbigeo(IConfiguration config, IWebHostEnvironment environment)
        {
            _StaticConfig = config;
            this._environment = environment;
            if (this._environment.IsDevelopment())
            {
                var connString = _StaticConfig.GetConnectionString("DevConnStringDbData") ?? throw new InvalidOperationException("DevConnStringDbData no está configurado");
                dbData = new DBManager(connString);
            }
            else
            {
                var connString = _StaticConfig.GetConnectionString("OrgConnStringDbData") ?? throw new InvalidOperationException("OrgConnStringDbData no está configurado");
                dbData = new DBManager(connString);
            }
        }

        public Task<List<EcUbigeo>> GetAll(string usuario, string? zonaFiltro = null)
        {
            return Task.Run(() =>
            {
                EcUbigeo GetItem(DataRow r)
                {
                    return new EcUbigeo
                    {
                        Ubigeo = r["Ubigeo"]?.ToString() ?? string.Empty,
                        Distrito = r["Distrito"]?.ToString() ?? string.Empty,
                        Provincia = r["Provincia"]?.ToString() ?? string.Empty,
                        Departamento = r["Departamento"]?.ToString() ?? string.Empty,
                        Zona = r["Zona"]?.ToString()
                    };
                }

                List<DbParametro> parametros = new List<DbParametro>
                {
                    new DbParametro("@ZonaFiltro", SqlDbType.VarChar, ParameterDirection.Input, 
                        string.IsNullOrEmpty(zonaFiltro) ? (object)DBNull.Value : zonaFiltro, 3)
                };
                
                return dbData.ObtieneLista("NX_Ubigeo_GetAll", GetItem, parametros);
            });
        }

        public Task<List<string>> GetByZona(string zonaCodigo, string usuario)
        {
            return Task.Run(() =>
            {
                List<DbParametro> parametros = new List<DbParametro>
                {
                    new DbParametro("@ZonaCodigo", SqlDbType.VarChar, ParameterDirection.Input, zonaCodigo, 3)
                };

                return dbData.ObtieneLista("NX_Ubigeo_GetByZona", (DataRow r) =>
                {
                    return r["UBIGEO"]?.ToString() ?? string.Empty;
                }, parametros);
            });
        }

        public Task<string> SetByZona(string zonaCodigo, List<string> ubigeos, string usuario)
        {
            return Task.Run(() =>
            {
                // Convertir lista a JSON array
                var ubigeosJson = System.Text.Json.JsonSerializer.Serialize(ubigeos ?? new List<string>());

                List<DbParametro> parametros = new List<DbParametro>
                {
                    new DbParametro("@ZonaCodigo", SqlDbType.VarChar, ParameterDirection.Input, zonaCodigo, 3),
                    new DbParametro("@Ubigeos", SqlDbType.NVarChar, ParameterDirection.Input, ubigeosJson, -1),
                    new DbParametro("@Mensaje", SqlDbType.NVarChar, ParameterDirection.Output, DBNull.Value, -1)
                };

                dbData.ObtieneNQ("NX_Ubigeo_SetByZona", parametros);

                var mensaje = parametros[2].Parametro.Value?.ToString() ?? "error|Error desconocido";
                return mensaje;
            });
        }
    }
}


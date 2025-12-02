namespace ApiRoy.ResourceAccess
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using ApiRoy.ResourceAccess.Database;
    using System.Data;

    public class DbZona : IDbZona
    {
        private readonly DBManager dbData;
        private static IConfiguration _StaticConfig { get; set; } = null!;
        private readonly IWebHostEnvironment _environment;

        public DbZona(IConfiguration config, IWebHostEnvironment environment)
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

        public Task<List<EcZona>> GetAll(string usuario)
        {
            return Task.Run(() =>
            {
                EcZona GetItem(DataRow r)
                {
                    return new EcZona
                    {
                        ZonaCodigo = r["ZonaCodigo"]?.ToString() ?? string.Empty,
                        Descripcion = r["Descripcion"]?.ToString() ?? string.Empty,
                        Corto = r["Corto"]?.ToString()
                    };
                }

                List<DbParametro> parametros = new List<DbParametro>();
                return dbData.ObtieneLista("NX_Zona_GetAll", GetItem, parametros);
            });
        }

        public Task<EcZona?> GetByCodigo(string zonaCodigo, string usuario)
        {
            return Task.Run(() =>
            {
                List<DbParametro> parametros = new List<DbParametro>
                {
                    new DbParametro("@ZonaCodigo", SqlDbType.VarChar, ParameterDirection.Input, zonaCodigo)
                };

                var lista = dbData.ObtieneLista("NX_Zona_GetById", (DataRow r) =>
                {
                    return new EcZona
                    {
                        ZonaCodigo = r["ZonaCodigo"]?.ToString() ?? string.Empty,
                        Descripcion = r["Descripcion"]?.ToString() ?? string.Empty,
                        Corto = r["Corto"]?.ToString()
                    };
                }, parametros);

                return lista.FirstOrDefault();
            });
        }

        public Task<string> Create(EcZonaCreateDto zona, string usuario)
        {
            return Task.Run(() =>
            {
                List<DbParametro> parametros = new List<DbParametro>
                {
                    new DbParametro("@ZonaCodigo", SqlDbType.VarChar, ParameterDirection.Input, zona.ZonaCodigo, 3),
                    new DbParametro("@Descripcion", SqlDbType.VarChar, ParameterDirection.Input, zona.Descripcion, 100),
                    new DbParametro("@Corto", SqlDbType.VarChar, ParameterDirection.Input, zona.Corto ?? (object)DBNull.Value, 20),
                    new DbParametro("@IsUpdate", SqlDbType.Bit, ParameterDirection.Input, 0),
                    new DbParametro("@Mensaje", SqlDbType.NVarChar, ParameterDirection.Output, DBNull.Value, -1)
                };

                dbData.ObtieneNQ("NX_Zona_InsertUpdate", parametros);

                var mensaje = parametros[4].Parametro.Value?.ToString() ?? "error|Error desconocido";
                return mensaje;
            });
        }

        public Task<string> Update(string zonaCodigo, EcZonaUpdateDto zona, string usuario)
        {
            return Task.Run(() =>
            {
                List<DbParametro> parametros = new List<DbParametro>
                {
                    new DbParametro("@ZonaCodigo", SqlDbType.VarChar, ParameterDirection.Input, zonaCodigo, 3),
                    new DbParametro("@Descripcion", SqlDbType.VarChar, ParameterDirection.Input, zona.Descripcion, 100),
                    new DbParametro("@Corto", SqlDbType.VarChar, ParameterDirection.Input, zona.Corto ?? (object)DBNull.Value, 20),
                    new DbParametro("@IsUpdate", SqlDbType.Bit, ParameterDirection.Input, 1),
                    new DbParametro("@Mensaje", SqlDbType.NVarChar, ParameterDirection.Output, DBNull.Value, -1)
                };

                dbData.ObtieneNQ("NX_Zona_InsertUpdate", parametros);

                var mensaje = parametros[4].Parametro.Value?.ToString() ?? "error|Error desconocido";
                return mensaje;
            });
        }

        public Task<string> Delete(string zonaCodigo, string usuario)
        {
            return Task.Run(() =>
            {
                List<DbParametro> parametros = new List<DbParametro>
                {
                    new DbParametro("@ZonaCodigo", SqlDbType.VarChar, ParameterDirection.Input, zonaCodigo, 3),
                    new DbParametro("@Mensaje", SqlDbType.NVarChar, ParameterDirection.Output, DBNull.Value, -1)
                };

                dbData.ObtieneNQ("NX_Zona_Delete", parametros);

                var mensaje = parametros[1].Parametro.Value?.ToString() ?? "error|Error desconocido";
                return mensaje;
            });
        }
    }
}


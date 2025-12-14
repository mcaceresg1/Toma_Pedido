namespace ApiRoy.ResourceAccess
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using ApiRoy.ResourceAccess.Database;
    using System;
    using System.Data;
    using Microsoft.Data.SqlClient;

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
                    // El stored procedure devuelve las columnas con alias: Ubigeo, Distrito, Provincia, Departamento, Zona
                    return new EcUbigeo
                    {
                        Ubigeo = r["Ubigeo"]?.ToString() ?? string.Empty,
                        Distrito = r["Distrito"]?.ToString() ?? string.Empty,
                        Provincia = r["Provincia"]?.ToString() ?? string.Empty,
                        Departamento = r["Departamento"]?.ToString() ?? string.Empty,
                        Zona = GetColumnValueCaseInsensitive(r, "Zona")
                    };
                }

                // El procedimiento NX_Ubigeo_GetAll acepta el parámetro @ZonaFiltro (opcional)
                List<DbParametro>? parametros = null;
                if (!string.IsNullOrEmpty(zonaFiltro))
                {
                    parametros = new List<DbParametro>
                    {
                        new DbParametro("@ZonaFiltro", SqlDbType.VarChar, ParameterDirection.Input, zonaFiltro, 3)
                    };
                }
                
                return dbData.ObtieneLista("NX_Ubigeo_GetAll", GetItem, parametros);
            });
        }

        private string? GetColumnValueCaseInsensitive(DataRow row, string columnName)
        {
            try
            {
                // Intentar acceder directamente (SQL Server generalmente es case-insensitive para nombres de columna)
                if (row.Table.Columns.Contains(columnName))
                {
                    var value = row[columnName];
                    return value == DBNull.Value ? null : value?.ToString();
                }
                
                // Si no se encuentra con el caso exacto, buscar case-insensitive en todas las columnas
                foreach (DataColumn col in row.Table.Columns)
                {
                    if (string.Equals(col.ColumnName, columnName, StringComparison.OrdinalIgnoreCase))
                    {
                        var value = row[col.ColumnName];
                        return value == DBNull.Value ? null : value?.ToString();
                    }
                }
            }
            catch
            {
                // Si hay algún error, retornar null
            }
            return null;
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


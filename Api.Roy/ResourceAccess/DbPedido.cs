namespace ApiRoy.ResourceAccess
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using ApiRoy.ResourceAccess.Database;
    using ApiRoy.Utils;
    using Microsoft.Data.SqlClient;
    using System.Collections.Generic;
    using System.Data;
    using System.Globalization;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Net.Http;
    using System.Text;
    using System.Text.RegularExpressions;

    public class DbPedido : IDbPedido
    {
        private readonly DBManager dbData;
        private static IConfiguration _StaticConfig { get; set; } = null!;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<DbPedido> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        private string _currentDatabaseName = string.Empty;
        private static bool _informacionEmpresasRegistrada = false;
        private static readonly object _lockObject = new object();

        public DbPedido(IConfiguration config, IWebHostEnvironment environment, ILogger<DbPedido> logger, IHttpClientFactory httpClientFactory)
        {
            _StaticConfig = config;
            this._environment = environment;
            this._logger = logger;
            _httpClientFactory = httpClientFactory;
            string? connString;
            if (this._environment.IsDevelopment())
            {
                connString = _StaticConfig.GetConnectionString("DevConnStringDbData") ?? throw new InvalidOperationException("DevConnStringDbData no está configurado");
            }
            else
            {
                connString = _StaticConfig.GetConnectionString("OrgConnStringDbData") ?? throw new InvalidOperationException("OrgConnStringDbData no está configurado");
            }
            
            dbData = new DBManager(connString);
            
            // Obtener el nombre de la base de datos actual desde la connection string
            _currentDatabaseName = ExtractDatabaseName(connString);
            
            // Obtener y registrar información detallada de empresas y bases de datos (solo una vez)
            if (!_informacionEmpresasRegistrada)
            {
                lock (_lockObject)
                {
                    if (!_informacionEmpresasRegistrada)
                    {
                        RegistrarInformacionEmpresasYBasesDatos();
                        _informacionEmpresasRegistrada = true;
                    }
                }
            }
        }

        public Task<List<EcPedidos>> GetPedidos(EcFiltroPedido f, string usuario, int numPag, int allReg, int cantFilas)
        {

            EcPedidos GetItem(DataRow r)
            {
                return new EcPedidos()
                {
                    NumPedido = r["NUM_PED"].ToString() ?? string.Empty,
                    FechaPedido = r["FEC_PED"].ToString() ?? string.Empty,
                    RucCliente = r["RUC_CLI"].ToString() ?? string.Empty,
                    DesCliente = r["DES_CLI"].ToString() ?? string.Empty,
                    DirCliente = r["DIR_CLI"].ToString() ?? string.Empty,
                    Moneda = r["MONEDA"].ToString() ?? string.Empty,
                    AbrMoneda = r["ABR_MONEDA"].ToString() ?? string.Empty,
                    CodVendedor = Convert.ToInt32(r["CDG_VEND"]),
                    Subtotal = Convert.ToDouble(r["IMP_STOT"]),
                    Igv = Convert.ToDouble(r["IMP_IGV"]),
                    Total = Convert.ToDouble(r["IMP_TTOT"]),
                    Estado = r["SWT_PED"].ToString() ?? string.Empty,
                    TotalPagina = Convert.ToInt32(r["TOTALPAGINAS"]),
                    TotalReg = Convert.ToInt32(r["TOTAL"]),
                    Item = Convert.ToInt32(r["ITEM"]),
                    OrdenCompra = r["ORDEN_COMPRA"].ToString(),
                    Factura = r["FACTURA"].ToString(),
                    Observaciones = r["OBSERVACIONES"].ToString()
                };
            }

            try
            {
                // Obtener el nombre de la BD de login
                string loginDbName = GetLoginDatabaseName();
                
                DateTime? dateInicio = (f.FechaInicio != null && !String.IsNullOrEmpty(f.FechaInicio))
                    ? DateTime.ParseExact(f.FechaInicio, "dd/MM/yyyy", CultureInfo.CurrentCulture) : DateTime.MinValue;
                DateTime? dateFin = (f.FechaFinal != null && !String.IsNullOrEmpty(f.FechaFinal))
                    ? DateTime.ParseExact(f.FechaFinal, "dd/MM/yyyy", CultureInfo.CurrentCulture) : DateTime.MaxValue;
                var parametros = new List<DbParametro>()
                {
                     new DbParametro("@ID_USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                     new DbParametro("@BUSQUEDA", SqlDbType.VarChar, ParameterDirection.Input, f.Busqueda ?? string.Empty),
                     new DbParametro("@NUM_PAGINA", SqlDbType.Int, ParameterDirection.Input, numPag),
                     new DbParametro("@ALL_REG", SqlDbType.Int, ParameterDirection.Input, allReg),
                     new DbParametro("@CANT_FILAS", SqlDbType.Int, ParameterDirection.Input, cantFilas),
                     new DbParametro("@DATE_START", SqlDbType.Date, ParameterDirection.Input, dateInicio),
                     new DbParametro("@DATE_END", SqlDbType.Date, ParameterDirection.Input, dateFin),
                     new DbParametro("@ESTADO", SqlDbType.Char, ParameterDirection.Input, f.Estado ?? string.Empty),
                     new DbParametro("@BD_LOGIN", SqlDbType.VarChar, ParameterDirection.Input, loginDbName),
                };

                Func<DataRow, EcPedidos> GetItemDelegate = GetItem;
                return Task.FromResult(dbData.ObtieneLista("USP_CONSULTA_PEDIDOS", GetItemDelegate, parametros));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public Task<EcPedidos?> GetPedido(string usuario, string operacion)
        {
            EcPedidos GetItem(DataRow r)
            {
                return new EcPedidos()
                {
                    NumPedido = r["NUM_PED"].ToString() ?? string.Empty,
                    FechaPedido = r["FEC_PED"].ToString() ?? string.Empty,
                    RucCliente = r["RUC_CLI"].ToString() ?? string.Empty,
                    DesCliente = r["DES_CLI"].ToString() ?? string.Empty,
                    DirCliente = r["DIR_CLI"].ToString() ?? string.Empty,
                    Moneda = r["MONEDA"].ToString() ?? string.Empty,
                    AbrMoneda = r["ABR_MONEDA"].ToString() ?? string.Empty,
                    CodVendedor = Convert.ToInt32(r["CDG_VEND"]),
                    Subtotal = Convert.ToDouble(r["IMP_STOT"]),
                    Igv = Convert.ToDouble(r["IMP_IGV"]),
                    Total = Convert.ToDouble(r["IMP_TTOT"]),
                    Estado = r["SWT_PED"].ToString() ?? string.Empty,
                    TotalPagina = 1,
                    TotalReg = 1,
                    Item = Convert.ToInt32(r["ITEM"]),
                    OrdenCompra = r["ORDEN_COMPRA"].ToString(),
                    Factura = r["FACTURA"].ToString(),
                    Observaciones = r["OBSERVACIONES"].ToString(),
                    Condicion = r["CONDICION_PED"]?.ToString(),
                    HoraPedido = r["HORA_PED"]?.ToString(),
                    MontoLetras = r["MONTO_LETRAS_PED"]?.ToString(),
                    NombreVendedor = r["NOMBRE_VEND"]?.ToString(),
                    CondicionCli = r["CONDICION_CLI"]?.ToString(),
                    DirPed = r["DIR_PED"]?.ToString(),
                    TelefonoCli = r["TEL_CLI"]?.ToString(),
                    TelefonoCliAux = r["TEL_CLI_AUX"]?.ToString(),
                    UbigeoCli = r["UBIGEO_CLI"]?.ToString()
                };
            }

            try
            {
                // Obtener el nombre de la BD de login
                string loginDbName = GetLoginDatabaseName();
                
                var parametros = new List<DbParametro>()
                {
                     new DbParametro("@ID_USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                     new DbParametro("@OPERACION", SqlDbType.VarChar, ParameterDirection.Input, operacion),
                     new DbParametro("@BD_LOGIN", SqlDbType.VarChar, ParameterDirection.Input, loginDbName)
                };

                Func<DataRow, EcPedidos> GetItemDelegate = GetItem;
                var lista = dbData.ObtieneLista("USP_CONSULTA_PEDIDO", GetItemDelegate, parametros);
                return Task.FromResult<EcPedidos?>(lista.FirstOrDefault());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public Task<List<EcCondicion>> ObtenerCondicion(string usuario)
        {
            try
            {
                EcCondicion GetItem(DataRow r)
                {

                    return new EcCondicion()
                    {
                        Codigo = r["CONDICION"].ToString() ?? string.Empty,
                        Descripcion = r["DESCRIPCION"].ToString() ?? string.Empty
                    };

                }
                // Obtener el nombre de la BD de login
                string loginDbName = GetLoginDatabaseName();
                
                var parametros = new List<DbParametro>
                {
                    new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                    new DbParametro("@BD_LOGIN", SqlDbType.VarChar, ParameterDirection.Input, loginDbName),
                };
                Func<DataRow, EcCondicion> GetItemDelegate = GetItem;

                var result = dbData.ObtieneLista("USP_CONDICION", GetItemDelegate, parametros);
                return Task.FromResult(result);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public Task<List<EcUbigeo>> ObtenerUbigeos(string usuario, string busqueda)
        {
            try
            {
                EcUbigeo GetItem(DataRow r)
                {

                    return new EcUbigeo()
                    {
                        Ubigeo = r["UBIGEO"].ToString() ?? string.Empty,
                        Departamento = r["DEPARTAMENTO"].ToString() ?? string.Empty,
                        Distrito = r["DISTRITO"].ToString() ?? string.Empty,
                        Provincia = r["PROVINCIA"].ToString() ?? string.Empty,
                    };

                }
                // Obtener el nombre de la BD de login
                string loginDbName = GetLoginDatabaseName();
                
                var parametros = new List<DbParametro>
                {
                    new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                    new DbParametro("@BUSQUEDA", SqlDbType.VarChar, ParameterDirection.Input, busqueda),
                    new DbParametro("@BD_LOGIN", SqlDbType.VarChar, ParameterDirection.Input, loginDbName)
                };
                Func<DataRow, EcUbigeo> GetItemDelegate = GetItem;

                var result = dbData.ObtieneLista("USP_CONSULTA_UBIGEO", GetItemDelegate, parametros);
                return Task.FromResult(result);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public Task<int> CrearCliente(string usuario, EcNuevoCliente cliente)
        {
            try
            {
                // Obtener el vendedor del usuario desde SUP001 en la BD de LOGIN (no BD de datos)
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
                
                // Obtener el vendedor desde la BD de login (SUP001 está en BK00/ROE00, no en BK01/ROE01)
                decimal vendedor = 0;
                try
                {
                    using (var loginConnection = new SqlConnection(loginDbConnString))
                    {
                        loginConnection.Open();
                        string vendedorQuery = $"SELECT TOP(1) VENDEDOR FROM {loginDbName}.DBO.SUP001 WHERE ALIAS = @USUARIO";
                        using (var command = new SqlCommand(vendedorQuery, loginConnection))
                        {
                            command.Parameters.AddWithValue("@USUARIO", usuario);
                            var result = command.ExecuteScalar();
                            if (result != null && result != DBNull.Value)
                            {
                                vendedor = Convert.ToDecimal(result);
                                _logger.LogInformation("CrearCliente - Vendedor obtenido desde BD Login ({LoginDb}): {Vendedor} para usuario: {Usuario}", loginDbName, vendedor, usuario);
                            }
                            else
                            {
                                _logger.LogError("CrearCliente - No se encontró vendedor para usuario: {Usuario} en BD Login: {LoginDb}", usuario, loginDbName);
                                throw new Exception($"No se encontró información del vendedor para el usuario: {usuario}");
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al obtener vendedor desde BD Login para usuario: {Usuario}", usuario);
                    throw new Exception($"Error al obtener vendedor: {ex.Message}", ex);
                }

                // Llamar al SP con el vendedor obtenido
                var parametros = new List<DbParametro>()
                {
                     new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                     new DbParametro("@RAZON", SqlDbType.VarChar, ParameterDirection.Input, cliente.Razon),
                     new DbParametro("@RUC", SqlDbType.VarChar, ParameterDirection.Input, cliente.Ruc),
                     new DbParametro("@DIRECCION", SqlDbType.VarChar, ParameterDirection.Input, cliente.Direccion),
                     new DbParametro("@TELEFONO", SqlDbType.VarChar, ParameterDirection.Input, cliente.Telefono),
                     new DbParametro("@CIUDAD", SqlDbType.VarChar, ParameterDirection.Input, cliente.Ciudad),
                     new DbParametro("@CONTACTO", SqlDbType.VarChar, ParameterDirection.Input, cliente.Contacto),
                     new DbParametro("@TELEFONO_CONTACTO", SqlDbType.VarChar, ParameterDirection.Input, cliente.TelefonoContacto),
                     new DbParametro("@CORREO", SqlDbType.VarChar, ParameterDirection.Input, cliente.Correo),
                     new DbParametro("@UBIGEO", SqlDbType.VarChar, ParameterDirection.Input, cliente.Ubigeo),
                     new DbParametro("@CONDICION", SqlDbType.VarChar, ParameterDirection.Input, cliente.Condicion),
                     new DbParametro("@TIPO_DOCUMENTO", SqlDbType.VarChar, ParameterDirection.Input, cliente.TipoDocumento),
                     new DbParametro("@VENDEDOR", SqlDbType.Decimal, ParameterDirection.Input, vendedor)
                };

                _logger.LogInformation("CrearCliente - Llamando a USP_CREAR_CLIENTE con {ParamCount} parámetros, Vendedor: {Vendedor}", parametros.Count, vendedor);
                var resultado = dbData.ObtieneNQ("USP_CREAR_CLIENTE", parametros);
                _logger.LogInformation("CrearCliente - SP ejecutado exitosamente, filas afectadas: {Resultado}", resultado);
                return Task.FromResult(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en CrearCliente para usuario: {Usuario}", usuario);
                throw new Exception(ex.Message, ex);
            }
        }


        public Task<List<EcStockProductos>> GetStockProductos(EcFiltroProducto f, string usuario, string rucCliente, int numPag, int allReg, int cantFilas)
        {
            EcStockProductos GetItem(DataRow r)
            {
                return new EcStockProductos()
                {
                    CodProducto = Convert.ToInt32(r["CDG_PROD"]),
                    NombProducto = r["DES_PROD"].ToString() ?? string.Empty,
                    Stock = Convert.ToDouble(r["STK_ACT"]),
                    Reservado = -Convert.ToDouble(r["STK_RES"]),
                    Almacen = Convert.ToInt32(r["ALMACEN"]),
                    TotalPagina = Convert.ToInt32(r["TOTALPAGINAS"]),
                    TotalReg = Convert.ToInt32(r["TOTAL"]),
                    Item = Convert.ToInt32(r["ITEM"]),
                    Precio1 = Convert.ToDouble(r["PRECIO1"]),
                    Precio2 = Convert.ToDouble(r["PRECIO2"]),
                    Precio3 = Convert.ToDouble(r["PRECIO3"]),
                    Precio4 = Convert.ToDouble(r["PRECIO4"]),
                    Precio5 = Convert.ToDouble(r["PRECIO5"]),
                    Correlacion1 = Convert.ToDouble(r["CORRELACION1"]),
                    Correlacion2 = Convert.ToDouble(r["CORRELACION2"]),
                    Correlacion3 = Convert.ToDouble(r["CORRELACION3"]),
                    Correlacion4 = Convert.ToDouble(r["CORRELACION4"]),
                    Correlacion5 = Convert.ToDouble(r["CORRELACION5"]),
                    UsaImpuesto = Convert.ToBoolean(r["USA_IMPUESTO"]),
                    Impuesto = Convert.ToDouble(r["IMPUESTO"]),
                    PrecioEditable = Convert.ToBoolean(r["PRECIO_EDITABLE"])
                };
            }
            try
            {
                // Obtener el nombre de la BD de login
                string loginDbName = GetLoginDatabaseName();
                
                var parametros = new List<DbParametro>()
                {
                     new DbParametro("@RUC_CLIENTE", SqlDbType.VarChar, ParameterDirection.Input, rucCliente),
                     new DbParametro("@PRODUCTO", SqlDbType.VarChar, ParameterDirection.Input, f.Producto ?? string.Empty),
                     new DbParametro("@CLASES", SqlDbType.VarChar, ParameterDirection.Input, f.Clases ?? string.Empty),
                     new DbParametro("@ID_ALMACEN", SqlDbType.Int, ParameterDirection.Input, f.CodAlmacen ?? 0),
                     new DbParametro("@NUM_PAGINA", SqlDbType.Int, ParameterDirection.Input, numPag),
                     new DbParametro("@ALL_REG", SqlDbType.Int, ParameterDirection.Input, allReg),
                     new DbParametro("@CANT_FILAS", SqlDbType.Int, ParameterDirection.Input, cantFilas),
                     new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                     new DbParametro("@BD_LOGIN", SqlDbType.VarChar, ParameterDirection.Input, loginDbName),
                };

                Func<DataRow, EcStockProductos> GetItemDelegate = GetItem;
                return Task.FromResult(dbData.ObtieneLista("USP_STOCK_PRODUCTOS", GetItemDelegate, parametros));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }


        public Task<List<EcProductoPedido>> GetPedidoProductos(string usuario, string operacion)
        {
            EcProductoPedido GetItem(DataRow r)
            {
                return new EcProductoPedido()
                {
                    CodProducto = r["IDPRODUCTO"].ToString(),
                    Cantidad = Convert.ToDouble(r["CANTIDAD"]),
                    Precio = Convert.ToDouble(r["PRECIO"]),
                    Monto = Convert.ToDouble(r["MONTO"]),
                    Impuesto = Convert.ToDouble(r["IMPUESTO"]),
                    Base = Convert.ToDouble(r["BASE"]),
                    Tipo = r["TIPO"].ToString(),
                    Almacen = r["ALMACEN"].ToString(),
                    CodAlmacen = Convert.ToInt32(r["COD_ALMACEN"]),
                    Descripcion = r["DESCRIPCION"].ToString(),
                    Sku = r["CODIGO_BARRA"].ToString()
                };
            }
            try
            {
                // Obtener el nombre de la BD de login
                string loginDbName = GetLoginDatabaseName();
                
                var parametros = new List<DbParametro>()
                {
                     new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                     new DbParametro("@OPERACION", SqlDbType.VarChar, ParameterDirection.Input, operacion),
                     new DbParametro("@BD_LOGIN", SqlDbType.VarChar, ParameterDirection.Input, loginDbName)
                };

                Func<DataRow, EcProductoPedido> GetItemDelegate = GetItem;
                return Task.FromResult(dbData.ObtieneLista("USP_CONSULTA_PRODUCTOS_PEDIDO", GetItemDelegate, parametros));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public Task<List<EcCliente>> GetClientes(string usuario, string criterio)
        {
            EcCliente GetItem(DataRow r)
            {
                return new EcCliente()
                {
                    RucCliente = r["RUC"].ToString(),
                    ValueSelect = r["DESCRIPCION"].ToString(),
                    Vendedor = Convert.ToInt32(r["IDVENDEDOR"]),
                    Precio = r["PRECIO"].ToString()
                };
            }
            try
            {
                // Obtener el nombre de la BD de login
                string loginDbName = GetLoginDatabaseName();
                
                var parametros = new List<DbParametro>()
                {
                     new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                     new DbParametro("@CRITERIO", SqlDbType.VarChar, ParameterDirection.Input, criterio),
                     new DbParametro("@BD_LOGIN", SqlDbType.VarChar, ParameterDirection.Input, loginDbName),
                };

                Func<DataRow, EcCliente> GetItemDelegate = GetItem;
                return Task.FromResult(dbData.ObtieneLista("USP_SESION_CLIENTES", GetItemDelegate, parametros));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public Task<List<EcTipoDoc>> GetTiposDocumento(string usuario)
        {
            EcTipoDoc GetItem(DataRow r)
            {
                return new EcTipoDoc()
                {
                    Id = Convert.ToInt32(r["ID"]),
                    Descripcion = r["DESCRIPCION"].ToString() ?? string.Empty,
                    Tipo = r["TIPO"].ToString() ?? string.Empty
                };
            }
            try
            {
                var parametros = new List<DbParametro>()
                {
                     new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                };

                Func<DataRow, EcTipoDoc> GetItemDelegate = GetItem;
                return Task.FromResult(dbData.ObtieneLista("USP_SESION_DOCUMENTOS", GetItemDelegate, parametros));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public Task<List<EcSelect>> GetMonedas()
        {
            EcSelect GetItem(DataRow r)
            {
                return new EcSelect()
                {
                    Id = r["NUM_ITEM"].ToString(),
                    Abr = r["DES_ITEM"].ToString(),
                    Value = r["ABR_ITEM"].ToString()
                };
            }
            try
            {
                // Obtener el nombre de la BD de login
                string loginDbName = GetLoginDatabaseName();
                
                var parametros = new List<DbParametro>()
                {
                    new DbParametro("@BD_LOGIN", SqlDbType.VarChar, ParameterDirection.Input, loginDbName)
                };

                Func<DataRow, EcSelect> GetItemDelegate = GetItem;
                return Task.FromResult(dbData.ObtieneLista("USP_SESION_MONEDAS", GetItemDelegate, parametros));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task<bool> SavePedido(string usuario, string maquina, EcNuevoPedido pedido)
        {
            _logger.LogInformation("=== INICIO SavePedido ===");
            _logger.LogInformation("Usuario: {Usuario}, Maquina: {Maquina}", usuario, maquina);
            _logger.LogInformation("Pedido - RUC: {Ruc}, Precio: {Precio}, Moneda: {Moneda}", pedido.Ruc, pedido.Precio, pedido.Moneda);
            _logger.LogInformation("Pedido - Subtotal: {Subtotal}, IGV: {Igv}, Total: {Total}", pedido.Subtotal, pedido.Igv, pedido.Total);
            _logger.LogInformation("Pedido - Productos: {Count} items", pedido.Productos?.Count ?? 0);
            
            if (pedido.Productos != null)
            {
                foreach (var p in pedido.Productos)
                {
                    _logger.LogInformation("  Producto - CodProd: {CodProd}, Cant: {Cant}, PreUnit: {PreUnit}, ImpTot: {ImpTot}, Almacen: {Almacen}", 
                        p.CodProd, p.CantProd, p.PreUnit, p.ImpTot, p.Almacen);
                }
            }

            using (var connection = dbData.DbConn.conn)
            {
                await connection.OpenAsync();
                _logger.LogInformation("Conexión abierta exitosamente - Base de datos: {DatabaseName}", _currentDatabaseName);
                
                // Usar la base de datos actual de la conexión (no hardcodeada)
                string currentDb = _currentDatabaseName;
                if (string.IsNullOrEmpty(currentDb))
                {
                    throw new InvalidOperationException("No se pudo determinar el nombre de la base de datos actual");
                }
                
                // Obtener información del usuario desde la BD de login (SUP001 está en BK00/ROE00, no en BK01/ROE01)
                _logger.LogInformation("Obteniendo información del usuario desde BD de login...");
                var (empresaDefecto, empresasDisponibles, vendedorUsuario) = ObtenerInfoUsuarioDesdeLogin(usuario);
                string codEmpresa = empresaDefecto;
                _logger.LogInformation("Usando base de datos: {CurrentDb}", currentDb);

                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        _logger.LogInformation("Transacción iniciada");
                        var data = new Dictionary<string, object>();
                        _logger.LogInformation("Empresa obtenida desde BD Login: {CodEmpresa}, Empresas disponibles: {Empresas}", codEmpresa, empresasDisponibles);

                        // Validar que el código de empresa esté en la lista de empresas disponibles del usuario
                        if (string.IsNullOrEmpty(codEmpresa))
                        {
                            _logger.LogError("Código de empresa vacío para usuario: {Usuario}", usuario);
                            throw new Exception($"No se pudo obtener el código de empresa para el usuario: {usuario}");
                        }

                        // Obtener tabla correspondiente dinámicamente
                        // Si el código termina en 1, usar empresa01Table; si termina en 2, usar empresa02Table, etc.
                        // Por ahora mantenemos la lógica original pero validamos contra empresas disponibles
                        bool empresaValida = false;
                        if (!string.IsNullOrEmpty(empresasDisponibles))
                        {
                            var empresasList = empresasDisponibles.Split(';', StringSplitOptions.RemoveEmptyEntries);
                            empresaValida = empresasList.Any(e => e.Trim() == codEmpresa);
                        }

                        if (!empresaValida && !string.IsNullOrEmpty(empresasDisponibles))
                        {
                            _logger.LogError("Empresa no válida. Código: '{CodEmpresa}', Empresas disponibles: '{Empresas}' para usuario: {Usuario}", 
                                codEmpresa, empresasDisponibles, usuario);
                            throw new Exception($"Empresa '{codEmpresa}' no está disponible para el usuario. Empresas disponibles: {empresasDisponibles}");
                        }

                        // Usar siempre la base de datos actual (no hardcodeada)
                        _logger.LogInformation("Buscando cliente con RUC: {Ruc} en base de datos {CurrentDb}", pedido.Ruc, currentDb);
                        string clienteQuery = $"SELECT TOP(1) IDAUXILIAR, RAZON, RUC, DIRECCION FROM {currentDb}.DBO.CUE001 WHERE RUC = @RUC;";
                        using (var command = new SqlCommand(clienteQuery, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@RUC", pedido.Ruc);
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                if (await reader.ReadAsync())
                                {
                                    data.Add("cliente_auxiliar", reader.GetDecimal(reader.GetOrdinal("IDAUXILIAR")));
                                    data.Add("cliente_razon", reader.GetString(reader.GetOrdinal("RAZON")));
                                    data.Add("cliente_ruc", reader.GetString(reader.GetOrdinal("RUC")));
                                    data.Add("cliente_direccion", reader.GetString(reader.GetOrdinal("DIRECCION")));
                                    _logger.LogInformation("Cliente encontrado: {Razon}", data["cliente_razon"]);
                                }
                                else
                                {
                                    _logger.LogWarning("Cliente NO encontrado con RUC: {Ruc}", pedido.Ruc);
                                }
                            }
                        }
                        string docQuery = $"SELECT TOP(1) CORRELATIVO, TRANSACCION FROM {currentDb}.DBO.INV007 WHERE IDDOCUMENTO = 13;";
                        using (var command = new SqlCommand(docQuery, connection, transaction))
                        {
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                if (await reader.ReadAsync())
                                {
                                    data.Add("doc_correlativo", reader.GetDecimal(reader.GetOrdinal("CORRELATIVO")));
                                    data.Add("doc_transaccion", reader.GetString(reader.GetOrdinal("TRANSACCION")));
                                }
                            }
                        }

                        // Usar la información del usuario obtenida desde la BD de login
                        data.Add("user_empresa", codEmpresa);
                        data.Add("user_alias", usuario);
                        data.Add("user_vendedor", vendedorUsuario);
                        _logger.LogInformation("Información del usuario agregada al diccionario: Empresa={Empresa}, Vendedor={Vendedor}", codEmpresa, vendedorUsuario);
                        
                        // Obtener el impuesto de la empresa desde SUP003 en la BD de login (no BD de datos)
                        decimal empresaIgv = ObtenerImpuestoEmpresaDesdeLogin(codEmpresa);
                        data.Add("empresa_igv", empresaIgv);
                        _logger.LogInformation("Impuesto IGV obtenido desde BD Login para empresa {Empresa}: {Igv}", codEmpresa, empresaIgv);
                        decimal? doc_correlativo = (decimal?)data.GetValueOrDefault("doc_correlativo") + 1;
                        string correlativo = doc_correlativo!.ToString()!.PadLeft(7, '0');
                        _logger.LogInformation("Correlativo generado: {Correlativo}", correlativo);
                        
                        string precioEnTexto = Currency.ConvertirMontoATexto(pedido.Total);
                        var fechaActual = DateTime.Now.Date;
                        var horaActual = DateTime.Now.ToString("hh:mm tt");
                        
                        _logger.LogInformation("Insertando en PED009...");
                        string insertPed009Query = $@"
    INSERT INTO {currentDb}.DBO.PED009 (
        IDDOCUMENTO, OPERACION, TRANSACCION, REFERENCIA, AUXILIAR, NOMBRE, RUC, DIRECCION,
        USUARIO, IDVENDEDOR, TASA, OBSERVACIONES, BASE, IMPUESTO, TOTAL, ORDEN_COMPRA, MONTO_LETRAS, MONEDA,
        FECHA, VENCE, HORA, MAQUINA, TASA_DOLAR
    )
    VALUES (
        @IDDOCUMENTO, @OPERACION, @TRANSACCION, @REFERENCIA, @AUXILIAR, @NOMBRE, @RUC, @DIRECCION,
        @USUARIO, @IDVENDEDOR, @TASA, @OBSERVACIONES, @BASE, @IMPUESTO, @TOTAL, @ORDEN_COMPRA, @MONTO_LETRAS, @MONEDA,
        @FECHA, @VENCE, @HORA, @MAQUINA, @TASA_DOLAR
    );";

                        using (var command = new SqlCommand(insertPed009Query, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@IDDOCUMENTO", 13);
                            command.Parameters.AddWithValue("@OPERACION", correlativo ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@TRANSACCION", data.GetValueOrDefault("doc_transaccion") ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@REFERENCIA", correlativo ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@AUXILIAR", data.GetValueOrDefault("cliente_auxiliar") ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@NOMBRE", data.GetValueOrDefault("cliente_razon") ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@RUC", data.GetValueOrDefault("cliente_ruc") ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@DIRECCION", data.GetValueOrDefault("cliente_direccion") ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@USUARIO", usuario.ToUpper() ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@IDVENDEDOR", data.GetValueOrDefault("user_vendedor") ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@TASA", data.GetValueOrDefault("empresa_igv") ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@OBSERVACIONES", pedido.Observaciones ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@BASE", pedido.Subtotal);
                            command.Parameters.AddWithValue("@IMPUESTO", pedido.Igv);
                            command.Parameters.AddWithValue("@TOTAL", pedido.Total);
                            command.Parameters.AddWithValue("@ORDEN_COMPRA", pedido.Oc ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@MONTO_LETRAS", precioEnTexto);
                            command.Parameters.AddWithValue("@MONEDA", pedido.Moneda ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@FECHA", fechaActual);
                            command.Parameters.AddWithValue("@VENCE", fechaActual);
                            command.Parameters.AddWithValue("@HORA", horaActual);
                            command.Parameters.AddWithValue("@MAQUINA", "web");
                            command.Parameters.AddWithValue("@TASA_DOLAR", 1.00);
                            await command.ExecuteNonQueryAsync();
                            _logger.LogInformation("PED009 insertado exitosamente");
                        }

                        _logger.LogInformation("Insertando {Count} productos en PED008...", pedido.Productos.Count);
                        string insertPed008Query = $@"
        INSERT INTO {currentDb}.DBO.PED008 (
            IDDOCUMENTO, OPERACION, TRANSACCION, IDPRODUCTO, IDALMACEN, CANTIDAD, MONTO,
            IMPUESTO, PRECIO, BASE, FECHA, DESCRIPCION
        )
        VALUES (
            @IDDOCUMENTO, @OPERACION, @TRANSACCION, @IDPRODUCTO, @IDALMACEN, @CANTIDAD, @MONTO,
            @IMPUESTO, @PRECIO, @BASE, @FECHA, @DESCRIPCION
        ); UPDATE {currentDb}.DBO.INV006 SET RESERVADO = RESERVADO - @CANTIDAD WHERE IDPRODUCTO = @IDPRODUCTO;";
                        foreach (var producto in pedido.Productos)
                        {
                            using (var command = new SqlCommand(insertPed008Query, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@IDDOCUMENTO", 13);
                                command.Parameters.AddWithValue("@OPERACION", correlativo ?? (object)DBNull.Value);
                                command.Parameters.AddWithValue("@TRANSACCION", data.GetValueOrDefault("doc_transaccion") ?? (object)DBNull.Value);
                                command.Parameters.AddWithValue("@IDPRODUCTO", producto.CodProd);
                                command.Parameters.AddWithValue("@IDALMACEN", producto.Almacen);
                                command.Parameters.AddWithValue("@CANTIDAD", producto.CantProd);
                                command.Parameters.AddWithValue("@MONTO", producto.ImpTot);
                                command.Parameters.AddWithValue("@IMPUESTO", producto.ImpTot - producto.PreTot);
                                command.Parameters.AddWithValue("@PRECIO", producto.ImpUnit);
                                command.Parameters.AddWithValue("@BASE", producto.PreTot);
                                command.Parameters.AddWithValue("@FECHA", fechaActual);
                                command.Parameters.AddWithValue("@DESCRIPCION", producto.Descripcion);
                                await command.ExecuteNonQueryAsync();
                            }
                        }
                        string increaseQuery = $@"
    UPDATE {currentDb}.DBO.INV007 SET CORRELATIVO = CORRELATIVO + 1 WHERE IDDOCUMENTO = 13;";

                        using (var command = new SqlCommand(increaseQuery, connection, transaction))
                        {
                            await command.ExecuteNonQueryAsync();
                            _logger.LogInformation("Correlativo incrementado en INV007");
                        }
                        
                        transaction.Commit();
                        _logger.LogInformation("=== PEDIDO GUARDADO EXITOSAMENTE - Operación: {Correlativo} ===", correlativo);
                        return true;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "ERROR en SavePedido - Rollback ejecutado. Mensaje: {Message}, Inner: {Inner}", 
                            ex.Message, ex.InnerException?.Message);
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }

        public async Task<bool> UpdatePedido(string usuario, string operacion, EcActualizarPedido pedido)
        {

            using (var connection = dbData.DbConn.conn)
            {
                await connection.OpenAsync();
                
                // Usar la base de datos actual de la conexión (no hardcodeada)
                string currentDb = _currentDatabaseName;
                if (string.IsNullOrEmpty(currentDb))
                {
                    throw new InvalidOperationException("No se pudo determinar el nombre de la base de datos actual");
                }
                
                // Obtener información del usuario desde la BD de login (SUP001 está en BK00/ROE00, no en BK01/ROE01)
                _logger.LogInformation("UpdatePedido - Obteniendo información del usuario desde BD de login...");
                var (empresaDefecto, empresasDisponibles, vendedorUsuario) = ObtenerInfoUsuarioDesdeLogin(usuario);
                string codEmpresa = empresaDefecto;
                _logger.LogInformation("UpdatePedido - Usando base de datos: {CurrentDb}", currentDb);

                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var data = new Dictionary<string, object>();
                        data.Add("user_vendedor", vendedorUsuario);
                        _logger.LogInformation("UpdatePedido - Empresa obtenida desde BD Login: {CodEmpresa}, Empresas disponibles: {Empresas}", codEmpresa, empresasDisponibles);

                        // Validar que el código de empresa esté en la lista de empresas disponibles del usuario
                        if (string.IsNullOrEmpty(codEmpresa))
                        {
                            _logger.LogError("UpdatePedido - Código de empresa vacío para usuario: {Usuario}", usuario);
                            throw new Exception($"No se pudo obtener el código de empresa para el usuario: {usuario}");
                        }

                        // Validar contra empresas disponibles
                        bool empresaValida = false;
                        if (!string.IsNullOrEmpty(empresasDisponibles))
                        {
                            var empresasList = empresasDisponibles.Split(';', StringSplitOptions.RemoveEmptyEntries);
                            empresaValida = empresasList.Any(e => e.Trim() == codEmpresa);
                        }

                        if (!empresaValida && !string.IsNullOrEmpty(empresasDisponibles))
                        {
                            _logger.LogError("UpdatePedido - Empresa no válida. Código: '{CodEmpresa}', Empresas disponibles: '{Empresas}' para usuario: {Usuario}", 
                                codEmpresa, empresasDisponibles, usuario);
                            throw new Exception($"Empresa '{codEmpresa}' no está disponible para el usuario. Empresas disponibles: {empresasDisponibles}");
                        }

                        // Usar siempre la base de datos actual (no hardcodeada)
                        string precioEnTexto = Currency.ConvertirMontoATexto(pedido.Total);
                        string insertPed009Query = $@"
    UPDATE {currentDb}.DBO.PED009 SET OBSERVACIONES = @OBSERVACIONES, BASE = @BASE, IMPUESTO = @IMPUESTO, TOTAL = @TOTAL, ORDEN_COMPRA = @ORDEN_COMPRA, MONTO_LETRAS = @MONTO_LETRAS
	WHERE IDVENDEDOR = @IDVENDEDOR AND OPERACION = @OPERACION;
";

                        using (var command = new SqlCommand(insertPed009Query, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@OPERACION", operacion);
                            command.Parameters.AddWithValue("@IDVENDEDOR", data.GetValueOrDefault("user_vendedor") ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@OBSERVACIONES", pedido.Observaciones ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@BASE", pedido.Subtotal);
                            command.Parameters.AddWithValue("@IMPUESTO", pedido.Igv);
                            command.Parameters.AddWithValue("@TOTAL", pedido.Total);
                            command.Parameters.AddWithValue("@ORDEN_COMPRA", pedido.Oc ?? (object)DBNull.Value);
                            command.Parameters.AddWithValue("@MONTO_LETRAS", precioEnTexto);
                            await command.ExecuteNonQueryAsync();
                        }

                        string restoreReservationsQuery = $@"
                        UPDATE INV006
                        SET RESERVADO = INV006.RESERVADO + PED008.CANTIDAD
                        FROM {currentDb}.DBO.INV006 AS INV006
                        INNER JOIN {currentDb}.DBO.PED008 AS PED008
                        ON INV006.IDPRODUCTO = PED008.IDPRODUCTO WHERE PED008.OPERACION = @OPERACION;";
                        using (var command = new SqlCommand(restoreReservationsQuery, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@OPERACION", operacion);
                            await command.ExecuteNonQueryAsync();
                        }

                        string deletePed08Query = $@"DELETE FROM {currentDb}.DBO.PED008 WHERE OPERACION=@OPERACION;";
                        using (var command = new SqlCommand(deletePed08Query, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@OPERACION", operacion);
                            await command.ExecuteNonQueryAsync();
                        }

                        string insertPed008Query = $@"
        INSERT INTO {currentDb}.DBO.PED008 (
            IDDOCUMENTO, OPERACION, TRANSACCION, IDPRODUCTO, IDALMACEN, CANTIDAD, MONTO,
            IMPUESTO, PRECIO, BASE, FECHA, DESCRIPCION
        )
        VALUES (
            @IDDOCUMENTO, @OPERACION, @TRANSACCION, @IDPRODUCTO, @IDALMACEN, @CANTIDAD, @MONTO,
            @IMPUESTO, @PRECIO, @BASE, (SELECT FECHA FROM {currentDb}.DBO.PED009 WHERE OPERACION = @OPERACION), @DESCRIPCION
        ); UPDATE {currentDb}.DBO.INV006 SET RESERVADO = RESERVADO - @CANTIDAD WHERE IDPRODUCTO = @IDPRODUCTO;";
                        foreach (var producto in pedido.Productos)
                        {
                            using (var command = new SqlCommand(insertPed008Query, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@IDDOCUMENTO", 13);
                                command.Parameters.AddWithValue("@OPERACION", operacion);
                                command.Parameters.AddWithValue("@TRANSACCION", "PED");
                                command.Parameters.AddWithValue("@IDPRODUCTO", producto.CodProd);
                                command.Parameters.AddWithValue("@IDALMACEN", producto.Almacen);
                                command.Parameters.AddWithValue("@CANTIDAD", producto.CantProd);
                                command.Parameters.AddWithValue("@MONTO", producto.ImpTot);
                                command.Parameters.AddWithValue("@IMPUESTO", producto.ImpTot - producto.PreTot);
                                command.Parameters.AddWithValue("@PRECIO", producto.ImpUnit);
                                command.Parameters.AddWithValue("@BASE", producto.PreTot);
                                command.Parameters.AddWithValue("@DESCRIPCION", producto.Descripcion);
                                await command.ExecuteNonQueryAsync();
                            }
                        }
                        transaction.Commit();
                        return true;
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }
        public Task<List<EcHistoricoPedidoCabecera>> GetHistoricoPedidosCabecera(
            DateTime? fechaInicio = null,
            DateTime? fechaFin = null,
            int? vendedorId = null)
        {
            try
            {
                EcHistoricoPedidoCabecera GetItem(DataRow r)
                {
                    var ubigeo = r.GetString("UBIGEO");
                    var zona = r.GetString("ZONA");
                    
                    return new EcHistoricoPedidoCabecera
                    {
                        Vendedor = r.GetString("VENDEDOR"),
                        Operacion = r.GetInt("OPERACION"),
                        Fecha = r.GetDateTime("FECHA"),
                        Cliente = r.GetString("CLIENTE"),
                        Referencia = r.GetString("REFERENCIA"),
                        Total = r.GetDecimal("TOTAL"),
                        Simbolo = r.GetString("SIMBOLO"),
                        Guia = r.GetString("GUIA"),
                        Factura = r.GetString("FACTURA"),
                        Estado = r.GetString("ESTADO"),
                        AceptadaPorLaSunat = r.GetString("ACEPTADA_POR_LA_SUNAT"),
                        Anu = r.GetBool("ANU"),
                        Orginal = r.GetDecimal("ORGINAL"),
                        Despachada = r.GetDecimal("DESPACHADA"),
                        Ubigeo = string.IsNullOrEmpty(ubigeo) ? null : ubigeo,
                        Zona = string.IsNullOrEmpty(zona) ? null : zona
                    };
                }

                var parametros = new List<DbParametro>
        {
            new DbParametro("@FECHAINICIO", SqlDbType.DateTime, ParameterDirection.Input, (object?)fechaInicio ?? DBNull.Value),
            new DbParametro("@FECHAFIN", SqlDbType.DateTime, ParameterDirection.Input, (object?)fechaFin ?? DBNull.Value),
            new DbParametro("@IDVENDEDOR", SqlDbType.Int, ParameterDirection.Input, (object?)vendedorId ?? DBNull.Value)
        };

                var result = dbData.ObtieneLista("SP_HISTORICO_ORDEN_PEDIDO_CABECERA", GetItem, parametros);

                return Task.FromResult(result);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener cabeceras del histórico de pedidos", ex);
            }
        }

        public Task<List<EcHistoricoPedidoCabecera>> GetHistoricoPedidosPorZona(
            DateTime? fechaInicio = null,
            DateTime? fechaFin = null,
            int? vendedorId = null,
            bool? conDespacho = null)
        {
            try
            {
                EcHistoricoPedidoCabecera GetItem(DataRow r)
                {
                    var ubigeo = r.GetString("UBIGEO");
                    var zona = r.GetString("ZONA");
                    
                    return new EcHistoricoPedidoCabecera
                    {
                        Vendedor = r.GetString("VENDEDOR"),
                        Operacion = r.GetInt("OPERACION"),
                        Fecha = r.GetDateTime("FECHA"),
                        Cliente = r.GetString("CLIENTE"),
                        Ruc = r.GetString("RUC"),
                        Referencia = r.GetString("REFERENCIA"),
                        Total = r.GetDecimal("TOTAL"),
                        Simbolo = r.GetString("SIMBOLO"),
                        Guia = r.GetString("GUIA"),
                        Factura = r.GetString("FACTURA"),
                        Estado = r.GetString("ESTADO"),
                        AceptadaPorLaSunat = r.GetString("ACEPTADA_POR_LA_SUNAT"),
                        Anu = r.GetBool("ANU"),
                        Orginal = r.GetDecimal("ORGINAL"),
                        Despachada = r.GetDecimal("DESPACHADA"),
                        Ubigeo = string.IsNullOrEmpty(ubigeo) ? null : ubigeo,
                        Zona = string.IsNullOrEmpty(zona) ? null : zona
                    };
                }

                var parametros = new List<DbParametro>
        {
            new DbParametro("@FECHAINICIO", SqlDbType.DateTime, ParameterDirection.Input, (object?)fechaInicio ?? DBNull.Value),
            new DbParametro("@FECHAFIN", SqlDbType.DateTime, ParameterDirection.Input, (object?)fechaFin ?? DBNull.Value),
            new DbParametro("@IDVENDEDOR", SqlDbType.Int, ParameterDirection.Input, (object?)vendedorId ?? DBNull.Value),
            new DbParametro("@CONDESPACHO", SqlDbType.Bit, ParameterDirection.Input, (object?)conDespacho ?? DBNull.Value)
        };

                var result = dbData.ObtieneLista("SP_HISTORICO_ORDEN_PEDIDO_POR_ZONA", GetItem, parametros);

                return Task.FromResult(result);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener pedidos por zona", ex);
            }
        }


        public Task<List<EcHistoricoPedidoDetalle>> GetHistoricoPedidosDetalle(int nroOperacion)
        {
            try
            {
                EcHistoricoPedidoDetalle GetItem(DataRow r)
                {
                    return new EcHistoricoPedidoDetalle
                    {
                        IdProducto = r.GetInt("IDPRODUCTO"),
                        CodigoBarra = r.GetString("CODIGO_BARRA"),
                        Descripcion = r.GetString("DESCRIPCION"),
                        Cantidad = r.GetDecimal("CANTIDAD"),
                        Medida = r.GetString("MEDIDA"),
                        CantidadDespachada = r.GetDecimal("CANTIDAD_DESPACHADA"),
                        Unitario = r.GetDecimal("UNITARIO"),
                        Total = r.GetDecimal("TOTAL"),
                        Descuento = r.GetDecimal("DESCUENTO"),
                        Utilidad = r.GetDecimal("UTILIDAD"),
                        Porcentaje = r.GetDecimal("PORCENTAJE")
                    };
                }


                var parametros = new List<DbParametro>
        {
            new DbParametro("@NROOPERACION", SqlDbType.Int, ParameterDirection.Input, nroOperacion)
        };

                Func<DataRow, EcHistoricoPedidoDetalle> GetItemDelegate = GetItem;

                var result = dbData.ObtieneLista("SP_HISTORICO_ORDEN_PEDIDO_CABECERA_X_DETALLE", GetItemDelegate, parametros);
                return Task.FromResult(result);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener detalle del pedido", ex);
            }
        }

        public Task<List<EcFiltroVendedor>> GetVendedores()
        {
            try
            {
                EcFiltroVendedor MapearVendedor(DataRow r) => new EcFiltroVendedor
                {
                    Vendedor = r.GetInt("IDVENDEDOR"),
                    Nombre = r.GetString("NOMBRE"),
                    Comision = r.GetDecimal("COMISION")
                };

                var result = dbData.ObtieneLista("SP_GET_VENDEDORES_FILTRADOS", MapearVendedor, null);
                return Task.FromResult(result);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los vendedores en acceso a datos", ex);
            }
        }

        public async Task<bool> ValidarRucExiste(string ruc)
        {
            try
            {
                // Extraer dinámicamente el nombre de la base de datos desde la connection string
                string connString;
                if (_environment.IsDevelopment())
                {
                    connString = _StaticConfig.GetConnectionString("DevConnStringDbData") ?? throw new InvalidOperationException("DevConnStringDbData no está configurado");
                }
                else
                {
                    connString = _StaticConfig.GetConnectionString("OrgConnStringDbData") ?? throw new InvalidOperationException("OrgConnStringDbData no está configurado");
                }

                string databaseName = ExtractDatabaseName(connString);
                if (string.IsNullOrEmpty(databaseName))
                {
                    throw new InvalidOperationException("No se pudo extraer el nombre de la base de datos desde la connection string");
                }

                _logger.LogDebug("ValidarRucExiste - BD: {Database}", databaseName);

                // Usar la misma conexión que se usa en otros métodos
                using (var connection = dbData.DbConn.conn)
                {
                    await connection.OpenAsync();
                    
                    // Consultar solo en la base de datos actual (no generar automáticamente una segunda BD)
                    string query = $@"
                        SELECT COUNT(1) as Existe 
                        FROM {databaseName}.DBO.CUE001 
                        WHERE RUC = @RUC";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@RUC", ruc);
                        var result = await command.ExecuteScalarAsync();
                        var existe = Convert.ToInt32(result) > 0;
                        _logger.LogInformation("Validación RUC {Ruc} en BD {Database}: {Existe}", ruc, databaseName, existe ? "EXISTE" : "NO EXISTE");
                        return existe;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar si el RUC existe: {Ruc}", ruc);
                throw new Exception($"Error al validar RUC: {ex.Message}", ex);
            }
        }

        public async Task<EcClienteApiResponse?> ObtenerDatosClientePorRuc(string ruc)
        {
            try
            {
                string connString;
                if (_environment.IsDevelopment())
                {
                    connString = _StaticConfig.GetConnectionString("DevConnStringDbData") ?? throw new InvalidOperationException("DevConnStringDbData no está configurado");
                }
                else
                {
                    connString = _StaticConfig.GetConnectionString("OrgConnStringDbData") ?? throw new InvalidOperationException("OrgConnStringDbData no está configurado");
                }

                string databaseName = ExtractDatabaseName(connString);
                if (string.IsNullOrEmpty(databaseName))
                {
                    throw new InvalidOperationException("No se pudo extraer el nombre de la base de datos desde la connection string");
                }

                using (var connection = new SqlConnection(connString))
                {
                    await connection.OpenAsync();
                    
                    string query = $@"
                        SELECT TOP 1 
                            RAZON, 
                            DIRECCION, 
                            CIUDAD,
                            UBIGEO,
                            TELEFONO,
                            CONTACTO
                        FROM {databaseName}.DBO.CUE001 
                        WHERE RUC = @RUC";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@RUC", ruc);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                return new EcClienteApiResponse
                                {
                                    RazonSocial = reader["RAZON"]?.ToString(),
                                    Direccion = reader["DIRECCION"]?.ToString(),
                                    Distrito = reader["CIUDAD"]?.ToString(),
                                    Ubigeo = reader["UBIGEO"]?.ToString(),
                                    Telefono = reader["TELEFONO"]?.ToString(),
                                    Contacto = reader["CONTACTO"]?.ToString()
                                };
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener datos del cliente por RUC: {Ruc}", ruc);
                return null;
            }
        }

        public async Task<EcClienteApiResponse?> ObtenerDatosClientePorDni(string dni)
        {
            try
            {
                string connString;
                if (_environment.IsDevelopment())
                {
                    connString = _StaticConfig.GetConnectionString("DevConnStringDbData") ?? throw new InvalidOperationException("DevConnStringDbData no está configurado");
                }
                else
                {
                    connString = _StaticConfig.GetConnectionString("OrgConnStringDbData") ?? throw new InvalidOperationException("OrgConnStringDbData no está configurado");
                }

                string databaseName = ExtractDatabaseName(connString);
                if (string.IsNullOrEmpty(databaseName))
                {
                    throw new InvalidOperationException("No se pudo extraer el nombre de la base de datos desde la connection string");
                }

                using (var connection = new SqlConnection(connString))
                {
                    await connection.OpenAsync();
                    
                    string query = $@"
                        SELECT TOP 1 
                            RAZON, 
                            DIRECCION, 
                            CIUDAD,
                            UBIGEO,
                            TELEFONO,
                            CONTACTO
                        FROM {databaseName}.DBO.CUE001 
                        WHERE RUC = @DNI";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@DNI", dni);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                return new EcClienteApiResponse
                                {
                                    Nombre = reader["RAZON"]?.ToString(),
                                    Direccion = reader["DIRECCION"]?.ToString(),
                                    Distrito = reader["CIUDAD"]?.ToString(),
                                    Ubigeo = reader["UBIGEO"]?.ToString(),
                                    Telefono = reader["TELEFONO"]?.ToString(),
                                    Contacto = reader["CONTACTO"]?.ToString()
                                };
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener datos del cliente por DNI: {Dni}", dni);
                return null;
            }
        }

        private string ExtractDatabaseName(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
                return string.Empty;
            
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

        /// <summary>
        /// Registra las empresas a las que tiene acceso un usuario específico
        /// </summary>
        public void RegistrarEmpresasUsuario(string usuario)
        {
            if (string.IsNullOrEmpty(usuario))
                return;
                
            RegistrarInformacionEmpresasYBasesDatos(usuario);
        }

        /// <summary>
        /// Obtiene y registra información detallada de las empresas y sus bases de datos
        /// Si se proporciona un usuario, solo muestra las empresas a las que tiene acceso
        /// Este método es thread-safe
        /// </summary>
        private void RegistrarInformacionEmpresasYBasesDatos(string? usuario = null)
        {
            try
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
                    _logger.LogWarning("DbPedido inicializado - No se pudo determinar la BD de login/configuración. BD de datos: {DatabaseName}", _currentDatabaseName);
                    return;
                }
                
                bool esDesarrollo = _environment.IsDevelopment();
                
                // Obtener empresas disponibles para el usuario (si se proporciona)
                HashSet<string> empresasUsuario = new HashSet<string>();
                if (!string.IsNullOrEmpty(usuario))
                {
                    try
                    {
                        string userQuery = $"SELECT TOP(1) EMPRESAS FROM {loginDbName}.DBO.SUP001 WHERE ALIAS = @USUARIO";
                        using (var userConnection = new SqlConnection(loginDbConnString))
                        {
                            userConnection.Open();
                            using (var userCommand = new SqlCommand(userQuery, userConnection))
                            {
                                userCommand.Parameters.AddWithValue("@USUARIO", usuario);
                                var empresasStr = userCommand.ExecuteScalar()?.ToString() ?? "";
                                if (!string.IsNullOrEmpty(empresasStr))
                                {
                                    var empresasList = empresasStr.Split(';', StringSplitOptions.RemoveEmptyEntries);
                                    foreach (var emp in empresasList)
                                    {
                                        empresasUsuario.Add(emp.Trim());
                                    }
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "No se pudo obtener empresas del usuario {Usuario}, mostrando todas las empresas", usuario);
                    }
                }
                
                // Obtener empresas desde SUP002 con sus bases de datos configuradas
                var empresasInfo = new List<(string codigo, string nombre, string servidor, string puerto, string bdLogin, string bdDatos, bool configurada)>();
                
                using (var loginConnection = new SqlConnection(loginDbConnString))
                {
                    loginConnection.Open();
                    
                    // Obtener empresas desde SUP002 con sus configuraciones de BD
                    string empresasQuery;
                    if (esDesarrollo)
                    {
                        empresasQuery = $@"
                            SELECT 
                                CODIGO, 
                                EMPRESA,
                                BD_DESARROLLO_SERVER,
                                DB_DESARROLLO_PORT,
                                BD_DESARROLLO_LOGIN,
                                BD_DESARROLLO_DATOS
                            FROM {loginDbName}.DBO.SUP002 
                            ORDER BY CODIGO";
                    }
                    else
                    {
                        empresasQuery = $@"
                            SELECT 
                                CODIGO, 
                                EMPRESA,
                                BD_PRODUCCION_SERVER,
                                BD_PRODUCCION_PORT,
                                BD_PRODUCCION_LOGIN,
                                BD_PRODUCCION_DATOS
                            FROM {loginDbName}.DBO.SUP002 
                            ORDER BY CODIGO";
                    }
                    
                    using (var command = new SqlCommand(empresasQuery, loginConnection))
                    {
                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                string codigoEmpresa = reader["CODIGO"]?.ToString() ?? string.Empty;
                                
                                // Si hay un usuario, filtrar solo las empresas a las que tiene acceso
                                if (!string.IsNullOrEmpty(usuario) && empresasUsuario.Count > 0)
                                {
                                    if (!empresasUsuario.Contains(codigoEmpresa))
                                    {
                                        continue; // Saltar esta empresa, el usuario no tiene acceso
                                    }
                                }
                                
                                string nombreEmpresa = reader["EMPRESA"]?.ToString() ?? string.Empty;
                                
                                if (string.IsNullOrEmpty(nombreEmpresa))
                                {
                                    nombreEmpresa = $"Empresa {codigoEmpresa}";
                                }
                                
                                // Obtener servidor y puerto según el ambiente
                                string servidor = esDesarrollo 
                                    ? reader["BD_DESARROLLO_SERVER"]?.ToString() ?? string.Empty
                                    : reader["BD_PRODUCCION_SERVER"]?.ToString() ?? string.Empty;
                                
                                string puerto = esDesarrollo
                                    ? reader["DB_DESARROLLO_PORT"]?.ToString() ?? string.Empty
                                    : reader["BD_PRODUCCION_PORT"]?.ToString() ?? string.Empty;
                                
                                // Obtener las BDs según el ambiente
                                string bdLogin = esDesarrollo 
                                    ? reader["BD_DESARROLLO_LOGIN"]?.ToString() ?? string.Empty
                                    : reader["BD_PRODUCCION_LOGIN"]?.ToString() ?? string.Empty;
                                
                                string bdDatos = esDesarrollo
                                    ? reader["BD_DESARROLLO_DATOS"]?.ToString() ?? string.Empty
                                    : reader["BD_PRODUCCION_DATOS"]?.ToString() ?? string.Empty;
                                
                                // Verificar si las BDs están configuradas (no null/vacías)
                                bool configurada = !string.IsNullOrEmpty(bdLogin) && !string.IsNullOrEmpty(bdDatos);
                                
                                empresasInfo.Add((codigoEmpresa, nombreEmpresa, servidor, puerto, bdLogin, bdDatos, configurada));
                            }
                        }
                    }
                }
                
                // Registrar información en el log
                if (empresasInfo.Count == 0)
                {
                    _logger.LogWarning("DbPedido inicializado - No se encontraron empresas registradas. BD Login/Configuración: {LoginDb}, BD Datos: {DataDb}", loginDbName, _currentDatabaseName);
                }
                else
                {
                    string titulo = !string.IsNullOrEmpty(usuario) 
                        ? $"=== DbPedido - Información de Empresas del Usuario: {usuario} ==="
                        : "=== DbPedido inicializado - Información de Empresas y Bases de Datos ===";
                    _logger.LogInformation(titulo);
                    
                    foreach (var empresa in empresasInfo)
                    {
                        // Limitar nombre a 10 caracteres
                        string nombreCorto = empresa.nombre.Length > 10 
                            ? empresa.nombre.Substring(0, 10) 
                            : empresa.nombre;
                        
                        string servidorInfo = !string.IsNullOrEmpty(empresa.servidor) 
                            ? (!string.IsNullOrEmpty(empresa.puerto) ? $"{empresa.servidor}:{empresa.puerto}" : empresa.servidor)
                            : "No configurado";
                        
                        if (empresa.configurada)
                        {
                            _logger.LogInformation("Empresa: {Codigo}-{Nombre} - Server {Servidor} - BD Login: {BdLogin}, BD Datos: {BdDatos}", 
                                empresa.codigo, nombreCorto, servidorInfo, empresa.bdLogin, empresa.bdDatos);
                        }
                        else
                        {
                            if (string.IsNullOrEmpty(empresa.bdLogin) && string.IsNullOrEmpty(empresa.bdDatos))
                            {
                                _logger.LogWarning("Empresa: {Codigo}-{Nombre} - SIN BD CONFIGURADA", 
                                    empresa.codigo, nombreCorto);
                            }
                            else
                            {
                                _logger.LogWarning("Empresa: {Codigo}-{Nombre} - Server {Servidor} - BD Login: {BdLogin}, BD Datos: {BdDatos} - SIN BD CONFIGURADA", 
                                    empresa.codigo, nombreCorto, servidorInfo, empresa.bdLogin ?? "NULL", empresa.bdDatos ?? "NULL");
                            }
                        }
                    }
                    
                    _logger.LogInformation("=== Fin de información de empresas ===");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener información de empresas y bases de datos. BD actual: {DatabaseName}", _currentDatabaseName);
                _logger.LogInformation("DbPedido inicializado - Base de datos actual: {DatabaseName}", _currentDatabaseName);
            }
        }

        /// <summary>
        /// Obtiene el impuesto/IGV de la empresa desde SUP003 en la BD de login
        /// </summary>
        private decimal ObtenerImpuestoEmpresaDesdeLogin(string empresa)
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
            
            using (var loginConnection = new SqlConnection(loginDbConnString))
            {
                loginConnection.Open();
                string impuestoQuery = $"SELECT TOP(1) IMPUESTO FROM {loginDbName}.DBO.SUP003 WHERE EMPRESA = @EMPRESA";
                using (var command = new SqlCommand(impuestoQuery, loginConnection))
                {
                    command.Parameters.AddWithValue("@EMPRESA", empresa);
                    var result = command.ExecuteScalar();
                    if (result != null && result != DBNull.Value)
                    {
                        decimal impuesto = Convert.ToDecimal(result);
                        _logger.LogInformation("ObtenerImpuestoEmpresaDesdeLogin - Empresa: {Empresa}, Impuesto: {Impuesto}", empresa, impuesto);
                        return impuesto;
                    }
                    else
                    {
                        _logger.LogWarning("ObtenerImpuestoEmpresaDesdeLogin - No se encontró impuesto para empresa: {Empresa} en BD Login: {LoginDb}", empresa, loginDbName);
                        return 0; // Default
                    }
                }
            }
        }

        /// <summary>
        /// Obtiene información del usuario desde SUP001 en la BD de login
        /// </summary>
        private (string empresaDefecto, string empresas, decimal vendedor) ObtenerInfoUsuarioDesdeLogin(string usuario)
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
            
            using (var loginConnection = new SqlConnection(loginDbConnString))
            {
                loginConnection.Open();
                string userQuery = $"SELECT TOP(1) EMPRESA_DEFECTO, EMPRESAS, VENDEDOR FROM {loginDbName}.DBO.SUP001 WHERE ALIAS = @USUARIO";
                using (var command = new SqlCommand(userQuery, loginConnection))
                {
                    command.Parameters.AddWithValue("@USUARIO", usuario);
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            string empresaDefecto = reader.GetString(reader.GetOrdinal("EMPRESA_DEFECTO"));
                            string empresas = reader["EMPRESAS"]?.ToString() ?? "";
                            decimal vendedor = reader.GetDecimal(reader.GetOrdinal("VENDEDOR"));
                            
                            _logger.LogInformation("ObtenerInfoUsuarioDesdeLogin - Usuario: {Usuario}, Empresa: {Empresa}, Empresas: {Empresas}, Vendedor: {Vendedor}", 
                                usuario, empresaDefecto, empresas, vendedor);
                            
                            return (empresaDefecto, empresas, vendedor);
                        }
                        else
                        {
                            throw new Exception($"No se encontró información del usuario: {usuario} en la BD de login");
                        }
                    }
                }
            }
        }


        public async Task<EcClienteApiResponse?> ConsultarClienteApi(string ruc)
        {
            // Extraer solo dígitos del RUC
            var rucLimpio = new string(ruc.Where(char.IsDigit).ToArray());
            
            if (string.IsNullOrEmpty(rucLimpio) || rucLimpio.Length != 11)
            {
                _logger.LogWarning("RUC inválido: {Ruc}. Debe tener 11 dígitos.", ruc);
                return null;
            }

            EcClienteApiResponse? resultado = null;
            
            // Usar el flujo normal: proveedor principal primero, luego alternativos
            var proveedoresFallidos = new List<string>();
            resultado = await ConsultarRucConProveedorAsync(rucLimpio, "principal");
            
            // Si APIPERU retorna null (por ejemplo, límite alcanzado) o falla, agregarlo a la lista y intentar con alternativos
            if (resultado == null || string.IsNullOrEmpty(resultado.RazonSocial))
            {
                proveedoresFallidos.Add("APIPERU");
                _logger.LogInformation("Proveedor principal (APIPERU) no disponible o falló, intentando con proveedores alternativos para RUC {Ruc}", rucLimpio);
                resultado = await ConsultarRucConProveedorAlternativoAsync(rucLimpio, proveedoresFallidos);
            }
            
            return resultado;
        }

        private async Task<EcClienteApiResponse?> ConsultarRucConProveedorAsync(string ruc, string proveedor = "principal")
        {
            try
            {
                // Obtener configuración del proveedor
                var apiUrl = _StaticConfig["SunatReniec:ApiUrl"] ?? "https://apiperu.dev/api/";
                var apiToken = Environment.GetEnvironmentVariable("APIPERU_TOKEN") 
                    ?? _StaticConfig["SunatReniec:ApiToken"] 
                    ?? _StaticConfig["ExternalApi:ClienteApi:Token"]
                    ?? "";

                if (string.IsNullOrEmpty(apiToken) || apiToken == "CONFIGURAR_TOKEN_API")
                {
                    _logger.LogWarning("APIPERU_TOKEN no está configurado. Las consultas a SUNAT pueden fallar.");
                    return null;
                }
                
                // Crear un HttpClient temporal para este proveedor específico
                using var httpClient = new HttpClient();
                httpClient.BaseAddress = new Uri(apiUrl);
                httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                httpClient.Timeout = TimeSpan.FromSeconds(30);
                
                if (!string.IsNullOrEmpty(apiToken))
                {
                    httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiToken}");
                }

                // Preparar el body con el RUC en formato JSON
                var requestBody = new { ruc = ruc };
                var jsonContent = System.Text.Json.JsonSerializer.Serialize(requestBody);
                var requestContent = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json");

                // Realizar la petición POST según la documentación de apiperu.dev
                var response = await httpClient.PostAsync("ruc", requestContent);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Error al consultar RUC {Ruc}: {StatusCode}. Respuesta: {Content}", ruc, response.StatusCode, errorContent);
                    
                    // Intentar parsear el mensaje del JSON de error
                    string? mensajeError = null;
                    bool esLimiteAlcanzado = false;
                    try
                    {
                        if (!string.IsNullOrWhiteSpace(errorContent))
                        {
                            var errorDoc = System.Text.Json.JsonDocument.Parse(errorContent);
                            var errorRoot = errorDoc.RootElement;
                            if (errorRoot.TryGetProperty("message", out var msgProp))
                            {
                                mensajeError = msgProp.GetString();
                                // Detectar si es un error de límite alcanzado
                                if (!string.IsNullOrEmpty(mensajeError) && 
                                    (mensajeError.Contains("límite", StringComparison.OrdinalIgnoreCase) || 
                                     mensajeError.Contains("limit", StringComparison.OrdinalIgnoreCase)))
                                {
                                    esLimiteAlcanzado = true;
                                    _logger.LogWarning("APIPERU.dev ha alcanzado el límite de consultas mensuales. Intentando con proveedores alternativos.");
                                }
                            }
                        }
                    }
                    catch
                    {
                        // Si no se puede parsear, usar mensaje por defecto
                    }
                    
                    // Si no hay mensaje en el JSON, usar mensajes descriptivos según el código de estado
                    if (string.IsNullOrWhiteSpace(mensajeError))
                    {
                        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized || response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                        {
                            mensajeError = "Error de autenticación o límite alcanzado con APIPERU.dev. Se intentará con proveedores alternativos.";
                            esLimiteAlcanzado = true; // Asumir que podría ser límite si es 403
                        }
                    }
                    
                    // Si es un error de límite, retornar null para que se intente con proveedores alternativos
                    if (esLimiteAlcanzado && response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                    {
                        _logger.LogInformation("APIPERU.dev alcanzó el límite de consultas. Continuando con proveedores alternativos.");
                        return null; // Retornar null para que el flujo principal intente con alternativos
                    }
                    
                    return null;
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                
                // Verificar que el contenido no esté vacío
                if (string.IsNullOrWhiteSpace(responseContent))
                {
                    return null;
                }

                try
                {
                    var jsonDoc = System.Text.Json.JsonDocument.Parse(responseContent);
                    var root = jsonDoc.RootElement;

                    // Verificar si existe la propiedad "success"
                    var success = root.TryGetProperty("success", out var successProp) 
                        ? successProp.GetBoolean() 
                        : false;

                    if (!success)
                    {
                        return null;
                    }

                    // Parsear respuesta de apiperu.dev
                    var data = root.TryGetProperty("data", out var dataProp) ? dataProp : root;
                    
                    return new EcClienteApiResponse
                    {
                        RazonSocial = data.TryGetProperty("nombre_o_razon_social", out var razon) ? razon.GetString() : null,
                        Direccion = data.TryGetProperty("direccion_completa", out var dir) ? dir.GetString() : null,
                        Distrito = data.TryGetProperty("distrito", out var dist) ? dist.GetString() : null,
                        Provincia = data.TryGetProperty("provincia", out var prov) ? prov.GetString() : null,
                        Departamento = data.TryGetProperty("departamento", out var dep) ? dep.GetString() : null,
                        Estado = data.TryGetProperty("estado", out var est) ? est.GetString() : null,
                        Condicion = data.TryGetProperty("condicion", out var cond) ? cond.GetString() : null,
                        APIproveedor = "APIPERU"
                    };
                }
                catch (System.Text.Json.JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "Error al parsear JSON de SUNAT. Contenido: {Content}", responseContent);
                    return null;
                }
            }
            catch (System.Net.Http.HttpRequestException httpEx)
            {
                _logger.LogError(httpEx, "Error de conexión al consultar RUC {Ruc}", ruc);
                return null;
            }
            catch (TaskCanceledException timeoutEx)
            {
                _logger.LogError(timeoutEx, "Timeout al consultar RUC {Ruc}", ruc);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al consultar RUC {Ruc}", ruc);
                return null;
            }
        }

        private async Task<EcClienteApiResponse?> ConsultarRucConProveedorAlternativoAsync(string ruc, List<string>? proveedoresFallidosPrevios = null)
        {
            // Lista de proveedores alternativos a probar
            var proveedoresAlternativos = new[]
            {
                new { Name = "GRAPH_PERU", Url = "https://graphperu.daustinn.com/api/query/", Token = "", RequiereToken = false },
                new { Name = "MIGO", Url = "https://api.migo.pe/api/v1/ruc/", Token = _StaticConfig["SunatReniec:ApiTokenMigo"] ?? "", RequiereToken = true },
                new { Name = "APIS.NET.PE", Url = "https://api.apis.net.pe/v1/ruc/", Token = _StaticConfig["SunatReniec:ApiTokenApisNetPe"] ?? "", RequiereToken = true },
            };

            var proveedoresIntentados = proveedoresFallidosPrevios ?? new List<string>();

            foreach (var proveedor in proveedoresAlternativos)
            {
                // Si requiere token y no está configurado, saltar este proveedor
                if (proveedor.RequiereToken && string.IsNullOrEmpty(proveedor.Token))
                {
                    _logger.LogInformation("Token para {ProveedorName} no configurado, omitiendo.", proveedor.Name);
                    continue;
                }

                // Agregar a la lista de proveedores intentados
                proveedoresIntentados.Add(proveedor.Name);

                try
                {
                    _logger.LogInformation("Intentando consultar RUC {Ruc} con proveedor alternativo {ProveedorName}...", ruc, proveedor.Name);
                    
                    using var httpClient = new HttpClient();
                    httpClient.BaseAddress = new Uri(proveedor.Url);
                    httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                    httpClient.Timeout = TimeSpan.FromSeconds(10);
                    
                    // Solo agregar Authorization si hay token
                    if (!string.IsNullOrEmpty(proveedor.Token))
                    {
                        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {proveedor.Token}");
                    }
                    
                    // Intentar GET primero (algunos proveedores usan GET)
                    var response = await httpClient.GetAsync($"{ruc}");
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync();
                        var resultado = ParsearRespuestaRuc(content, proveedor.Url);
                        if (resultado != null && !string.IsNullOrEmpty(resultado.RazonSocial))
                        {
                            resultado.APIproveedor = proveedor.Name;
                            _logger.LogInformation("RUC {Ruc} consultado exitosamente con proveedor alternativo: {ProveedorName}", ruc, proveedor.Name);
                            return resultado;
                        }
                    }
                    else
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        _logger.LogWarning("Error al consultar RUC {Ruc} con {ProveedorName}: {StatusCode}. Respuesta: {Content}", 
                            ruc, proveedor.Name, response.StatusCode, errorContent?.Substring(0, Math.Min(200, errorContent?.Length ?? 0)));
                    }
                }
                catch (System.Net.Http.HttpRequestException httpEx)
                {
                    _logger.LogWarning(httpEx, "Error de conexión al consultar RUC {Ruc} con {ProveedorName}", ruc, proveedor.Name);
                    // Continuar con el siguiente proveedor
                }
                catch (TaskCanceledException timeoutEx)
                {
                    _logger.LogWarning(timeoutEx, "Timeout al consultar RUC {Ruc} con {ProveedorName}", ruc, proveedor.Name);
                    // Continuar con el siguiente proveedor
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error al consultar RUC con proveedor alternativo {ProveedorName}", proveedor.Name);
                    // Continuar con el siguiente proveedor
                }
            }

            _logger.LogWarning("No se pudo consultar RUC {Ruc} con ningún proveedor alternativo disponible.", ruc);
            return null;
        }

        private EcClienteApiResponse? ParsearRespuestaRuc(string jsonContent, string proveedorUrl)
        {
            try
            {
                var jsonDoc = System.Text.Json.JsonDocument.Parse(jsonContent);
                var root = jsonDoc.RootElement;

                // Detectar el formato de respuesta según el proveedor
                if (proveedorUrl.Contains("migo.pe"))
                {
                    // Formato de MIGO
                    return new EcClienteApiResponse
                    {
                        RazonSocial = root.TryGetProperty("razon_social", out var razon) ? razon.GetString() : null,
                        Direccion = root.TryGetProperty("direccion", out var dir) ? dir.GetString() : null,
                        Distrito = root.TryGetProperty("distrito", out var dist) ? dist.GetString() : null,
                        Provincia = root.TryGetProperty("provincia", out var prov) ? prov.GetString() : null,
                        Departamento = root.TryGetProperty("departamento", out var dep) ? dep.GetString() : null,
                        Estado = root.TryGetProperty("estado", out var est) ? est.GetString() : null,
                        Condicion = root.TryGetProperty("condicion", out var cond) ? cond.GetString() : null,
                    };
                }
                else if (proveedorUrl.Contains("apis.net.pe") || proveedorUrl.Contains("api.apis.net.pe"))
                {
                    // Formato de APIS.net.pe
                    var tieneNombre = root.TryGetProperty("nombre", out var nombreProp) || root.TryGetProperty("razonSocial", out var razonSocialProp);
                    if (!tieneNombre)
                    {
                        return null;
                    }
                    
                    return new EcClienteApiResponse
                    {
                        RazonSocial = root.TryGetProperty("razonSocial", out var razonSocial) 
                            ? razonSocial.GetString() 
                            : root.TryGetProperty("nombre", out var nombre) ? nombre.GetString() : null,
                        Direccion = root.TryGetProperty("direccion", out var dir) ? dir.GetString() : null,
                        Distrito = root.TryGetProperty("distrito", out var dist) ? dist.GetString() : null,
                        Provincia = root.TryGetProperty("provincia", out var prov) ? prov.GetString() : null,
                        Departamento = root.TryGetProperty("departamento", out var dep) ? dep.GetString() : null,
                        Estado = root.TryGetProperty("estado", out var est) ? est.GetString() : null,
                        Condicion = root.TryGetProperty("condicion", out var cond) ? cond.GetString() : null,
                    };
                }
                else if (proveedorUrl.Contains("graphperu.daustinn.com"))
                {
                    // Formato de Graph Perú
                    var tieneName = root.TryGetProperty("name", out var nameProp);
                    
                    // Si no tiene "name" directamente, puede estar en "business" (formato GraphQL)
                    if (!tieneName && root.TryGetProperty("business", out var businessProp))
                    {
                        var business = businessProp;
                        tieneName = business.TryGetProperty("name", out nameProp);
                        
                        return new EcClienteApiResponse
                        {
                            RazonSocial = business.TryGetProperty("name", out var nameBusiness) ? nameBusiness.GetString() : null,
                            Direccion = business.TryGetProperty("address", out var addressBusiness) ? addressBusiness.GetString() : null,
                            Distrito = business.TryGetProperty("district", out var districtBusiness) ? districtBusiness.GetString() : null,
                            Provincia = business.TryGetProperty("province", out var provinceBusiness) ? provinceBusiness.GetString() : null,
                            Departamento = business.TryGetProperty("region", out var regionBusiness) ? regionBusiness.GetString() : null,
                            Estado = business.TryGetProperty("state", out var stateBusiness) ? stateBusiness.GetString() : null,
                            Condicion = business.TryGetProperty("condition", out var conditionBusiness) ? conditionBusiness.GetString() : null,
                        };
                    }
                    
                    // Formato REST API directo
                    if (!tieneName)
                    {
                        return null;
                    }
                    
                    return new EcClienteApiResponse
                    {
                        RazonSocial = root.TryGetProperty("name", out var nameRest) ? nameRest.GetString() : null,
                        Direccion = root.TryGetProperty("address", out var addressRest) ? addressRest.GetString() : null,
                        Distrito = root.TryGetProperty("district", out var districtRest) ? districtRest.GetString() : null,
                        Provincia = root.TryGetProperty("province", out var provinceRest) ? provinceRest.GetString() : null,
                        Departamento = root.TryGetProperty("region", out var regionRest) ? regionRest.GetString() : null,
                        Estado = root.TryGetProperty("state", out var stateRest) ? stateRest.GetString() : null,
                        Condicion = root.TryGetProperty("condition", out var conditionRest) ? conditionRest.GetString() : null,
                    };
                }
                else
                {
                    // Formato genérico (apiperu.dev)
                    var success = root.TryGetProperty("success", out var successProp) && successProp.GetBoolean();
                    if (!success)
                    {
                        return null;
                    }
                    
                    var data = root.TryGetProperty("data", out var dataProp) ? dataProp : root;
                    
                    return new EcClienteApiResponse
                    {
                        RazonSocial = data.TryGetProperty("nombre_o_razon_social", out var razon) ? razon.GetString() : null,
                        Direccion = data.TryGetProperty("direccion_completa", out var dir) ? dir.GetString() : null,
                        Distrito = data.TryGetProperty("distrito", out var dist) ? dist.GetString() : null,
                        Provincia = data.TryGetProperty("provincia", out var prov) ? prov.GetString() : null,
                        Departamento = data.TryGetProperty("departamento", out var dep) ? dep.GetString() : null,
                        Estado = data.TryGetProperty("estado", out var est) ? est.GetString() : null,
                        Condicion = data.TryGetProperty("condicion", out var cond) ? cond.GetString() : null,
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al parsear respuesta de RUC del proveedor {Proveedor}", proveedorUrl);
                return null;
            }
        }

        public async Task<bool> ValidarDniExiste(string dni)
        {
            try
            {
                // Extraer dinámicamente el nombre de la base de datos desde la connection string
                string connString;
                if (_environment.IsDevelopment())
                {
                    connString = _StaticConfig.GetConnectionString("DevConnStringDbData") ?? throw new InvalidOperationException("DevConnStringDbData no está configurado");
                }
                else
                {
                    connString = _StaticConfig.GetConnectionString("OrgConnStringDbData") ?? throw new InvalidOperationException("OrgConnStringDbData no está configurado");
                }

                string databaseName = ExtractDatabaseName(connString);
                if (string.IsNullOrEmpty(databaseName))
                {
                    throw new InvalidOperationException("No se pudo extraer el nombre de la base de datos desde la connection string");
                }

                _logger.LogDebug("ValidarDniExiste - BD: {Database}", databaseName);

                // Usar la misma conexión que se usa en otros métodos
                using (var connection = dbData.DbConn.conn)
                {
                    await connection.OpenAsync();
                    
                    // Consultar solo en la base de datos actual
                    string query = $@"
                        SELECT COUNT(1) as Existe 
                        FROM {databaseName}.DBO.CUE001 
                        WHERE RUC = @DNI";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@DNI", dni);
                        var result = await command.ExecuteScalarAsync();
                        var existe = Convert.ToInt32(result) > 0;
                        _logger.LogInformation("Validación DNI {Dni} en BD {Database}: {Existe}", dni, databaseName, existe ? "EXISTE" : "NO EXISTE");
                        return existe;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar si el DNI existe: {Dni}", dni);
                throw new Exception($"Error al validar DNI: {ex.Message}", ex);
            }
        }

        public async Task<EcClienteApiResponse?> ConsultarClienteApiPorDni(string dni)
        {
            // Extraer solo dígitos del DNI
            var dniLimpio = new string(dni.Where(char.IsDigit).ToArray());
            
            if (string.IsNullOrEmpty(dniLimpio) || dniLimpio.Length != 8)
            {
                _logger.LogWarning("DNI inválido: {Dni}. Debe tener 8 dígitos.", dni);
                return null;
            }

            EcClienteApiResponse? resultado = null;
            
            // Usar el flujo normal: proveedor principal primero, luego alternativos
            var proveedoresFallidos = new List<string>();
            resultado = await ConsultarDniConProveedorAsync(dniLimpio, "principal");
            
            // Si APIPERU retorna null (por ejemplo, límite alcanzado) o falla, agregarlo a la lista y intentar con alternativos
            if (resultado == null || string.IsNullOrEmpty(resultado.Nombre))
            {
                proveedoresFallidos.Add("APIPERU");
                _logger.LogInformation("Proveedor principal (APIPERU) no disponible o falló, intentando con proveedores alternativos para DNI {Dni}", dniLimpio);
                resultado = await ConsultarDniConProveedorAlternativoAsync(dniLimpio, proveedoresFallidos);
            }
            
            return resultado;
        }

        private async Task<EcClienteApiResponse?> ConsultarDniConProveedorAsync(string dni, string proveedor = "principal")
        {
            try
            {
                // Obtener configuración del proveedor
                var apiUrl = _StaticConfig["SunatReniec:ApiUrl"] ?? "https://apiperu.dev/api/";
                var apiToken = Environment.GetEnvironmentVariable("APIPERU_TOKEN") 
                    ?? _StaticConfig["SunatReniec:ApiToken"] 
                    ?? _StaticConfig["ExternalApi:ClienteApi:Token"]
                    ?? "";

                if (string.IsNullOrEmpty(apiToken) || apiToken == "CONFIGURAR_TOKEN_API")
                {
                    _logger.LogWarning("APIPERU_TOKEN no está configurado. Las consultas a RENIEC pueden fallar.");
                    return null;
                }
                
                // Crear un HttpClient temporal para este proveedor específico
                using var httpClient = new HttpClient();
                httpClient.BaseAddress = new Uri(apiUrl);
                httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                httpClient.Timeout = TimeSpan.FromSeconds(30);
                
                if (!string.IsNullOrEmpty(apiToken))
                {
                    httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiToken}");
                }

                _logger.LogInformation("Consultando API de RENIEC para DNI: {Dni}", dni);

                // Para DNI se usa GET según Trace_ERP
                var response = await httpClient.GetAsync($"dni/{dni}");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Error al consultar DNI {Dni}: {StatusCode}. Respuesta: {Content}", dni, response.StatusCode, errorContent);
                    
                    // Detectar si es un error de límite alcanzado
                    bool esLimiteAlcanzado = false;
                    try
                    {
                        if (!string.IsNullOrWhiteSpace(errorContent))
                        {
                            var errorDoc = System.Text.Json.JsonDocument.Parse(errorContent);
                            var errorRoot = errorDoc.RootElement;
                            if (errorRoot.TryGetProperty("message", out var msgProp))
                            {
                                var mensajeError = msgProp.GetString();
                                if (!string.IsNullOrEmpty(mensajeError) && 
                                    (mensajeError.Contains("límite", StringComparison.OrdinalIgnoreCase) || 
                                     mensajeError.Contains("limit", StringComparison.OrdinalIgnoreCase)))
                                {
                                    esLimiteAlcanzado = true;
                                    _logger.LogWarning("APIPERU.dev ha alcanzado el límite de consultas mensuales. Intentando con proveedores alternativos.");
                                }
                            }
                        }
                    }
                    catch
                    {
                        // Si no se puede parsear, continuar
                    }
                    
                    if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized || response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                    {
                        esLimiteAlcanzado = true;
                    }
                    
                    if (esLimiteAlcanzado && response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                    {
                        _logger.LogInformation("APIPERU.dev alcanzó el límite de consultas. Continuando con proveedores alternativos.");
                        return null;
                    }
                    
                    return null;
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (string.IsNullOrWhiteSpace(responseContent))
                {
                    _logger.LogWarning("La respuesta de RENIEC está vacía para DNI: {Dni}", dni);
                    return null;
                }

                _logger.LogDebug("Respuesta del API: {Response}", responseContent);

                try
                {
                    var jsonDoc = System.Text.Json.JsonDocument.Parse(responseContent);
                    var root = jsonDoc.RootElement;

                    var success = root.TryGetProperty("success", out var successProp) 
                        ? successProp.GetBoolean() 
                        : false;

                    if (!success)
                    {
                        var message = root.TryGetProperty("message", out var msg) ? msg.GetString() : "Error desconocido";
                        _logger.LogWarning("API retornó success=false para DNI {Dni}: {Message}", dni, message);
                        return null;
                    }

                    // Extraer datos del objeto "data"
                    if (!root.TryGetProperty("data", out var data))
                    {
                        _logger.LogWarning("La respuesta del API no contiene 'data' para DNI: {Dni}", dni);
                        return null;
                    }

                    var clienteApi = new EcClienteApiResponse
                    {
                        Nombre = data.TryGetProperty("nombre_completo", out var nombre) ? nombre.GetString() : null,
                        Direccion = data.TryGetProperty("direccion_completa", out var dir) ? dir.GetString() : null,
                        Distrito = data.TryGetProperty("distrito", out var dist) ? dist.GetString() : null,
                        Provincia = data.TryGetProperty("provincia", out var prov) ? prov.GetString() : null,
                        Departamento = data.TryGetProperty("departamento", out var dep) ? dep.GetString() : null,
                        APIproveedor = "APIPERU"
                    };

                    _logger.LogInformation("Datos del cliente obtenidos del API para DNI: {Dni}", dni);
                    return clienteApi;
                }
                catch (System.Text.Json.JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "Error al parsear JSON de RENIEC. Contenido: {Content}", responseContent);
                    return null;
                }
            }
            catch (System.Net.Http.HttpRequestException httpEx)
            {
                _logger.LogError(httpEx, "Error de conexión al consultar DNI {Dni}", dni);
                return null;
            }
            catch (TaskCanceledException timeoutEx)
            {
                _logger.LogError(timeoutEx, "Timeout al consultar DNI {Dni}", dni);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al consultar API de cliente para DNI: {Dni}", dni);
                return null;
            }
        }

        private async Task<EcClienteApiResponse?> ConsultarDniConProveedorAlternativoAsync(string dni, List<string>? proveedoresFallidosPrevios = null)
        {
            // Lista de proveedores alternativos a probar (que soporten DNI)
            var proveedoresAlternativos = new[]
            {
                new { Name = "GRAPH_PERU", Url = "https://graphperu.daustinn.com/api/query/", Token = "", RequiereToken = false },
                new { Name = "APIS.NET.PE", Url = "https://api.apis.net.pe/v1/dni/", Token = _StaticConfig["SunatReniec:ApiTokenApisNetPe"] ?? "", RequiereToken = true },
                new { Name = "MIGO", Url = "https://api.migo.pe/api/v1/dni/", Token = _StaticConfig["SunatReniec:ApiTokenMigo"] ?? "", RequiereToken = true },
            };

            var proveedoresIntentados = proveedoresFallidosPrevios ?? new List<string>();

            foreach (var proveedor in proveedoresAlternativos)
            {
                // Si requiere token y no está configurado, saltar este proveedor
                if (proveedor.RequiereToken && string.IsNullOrEmpty(proveedor.Token))
                {
                    _logger.LogInformation("Token para {ProveedorName} no configurado, omitiendo.", proveedor.Name);
                    continue;
                }

                // Agregar a la lista de proveedores intentados
                proveedoresIntentados.Add(proveedor.Name);

                try
                {
                    _logger.LogInformation("Intentando consultar DNI {Dni} con proveedor alternativo {ProveedorName}...", dni, proveedor.Name);
                    
                    using var httpClient = new HttpClient();
                    httpClient.BaseAddress = new Uri(proveedor.Url);
                    httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                    httpClient.Timeout = TimeSpan.FromSeconds(10);
                    
                    // Solo agregar Authorization si hay token
                    if (!string.IsNullOrEmpty(proveedor.Token))
                    {
                        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {proveedor.Token}");
                    }
                    
                    // Intentar GET primero (algunos proveedores usan GET)
                    var response = await httpClient.GetAsync($"{dni}");
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync();
                        var resultado = ParsearRespuestaDni(content, proveedor.Url);
                        if (resultado != null && !string.IsNullOrEmpty(resultado.Nombre))
                        {
                            resultado.APIproveedor = proveedor.Name;
                            _logger.LogInformation("DNI {Dni} consultado exitosamente con proveedor alternativo: {ProveedorName}", dni, proveedor.Name);
                            return resultado;
                        }
                    }
                    else
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        _logger.LogWarning("Error al consultar DNI {Dni} con {ProveedorName}: {StatusCode}. Respuesta: {Content}", 
                            dni, proveedor.Name, response.StatusCode, errorContent?.Substring(0, Math.Min(200, errorContent?.Length ?? 0)));
                    }
                }
                catch (System.Net.Http.HttpRequestException httpEx)
                {
                    _logger.LogWarning(httpEx, "Error de conexión al consultar DNI {Dni} con {ProveedorName}", dni, proveedor.Name);
                    // Continuar con el siguiente proveedor
                }
                catch (TaskCanceledException timeoutEx)
                {
                    _logger.LogWarning(timeoutEx, "Timeout al consultar DNI {Dni} con {ProveedorName}", dni, proveedor.Name);
                    // Continuar con el siguiente proveedor
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error al consultar DNI con proveedor alternativo {ProveedorName}", proveedor.Name);
                    // Continuar con el siguiente proveedor
                }
            }

            _logger.LogWarning("No se pudo consultar DNI {Dni} con ningún proveedor alternativo disponible.", dni);
            return null;
        }

        private EcClienteApiResponse? ParsearRespuestaDni(string jsonContent, string proveedorUrl)
        {
            try
            {
                var jsonDoc = System.Text.Json.JsonDocument.Parse(jsonContent);
                var root = jsonDoc.RootElement;

                // Detectar el formato de respuesta según el proveedor
                if (proveedorUrl.Contains("graphperu.daustinn.com"))
                {
                    // Formato de Graph Perú para DNI
                    var tieneNombre = root.TryGetProperty("name", out var _) || 
                                     root.TryGetProperty("fullName", out var _) ||
                                     root.TryGetProperty("nombreCompleto", out var _);
                    
                    // Si no tiene "name" directamente, puede estar en "person" (formato GraphQL)
                    if (!tieneNombre && root.TryGetProperty("person", out var personProp))
                    {
                        var person = personProp;
                        tieneNombre = person.TryGetProperty("name", out var _) || 
                                     person.TryGetProperty("fullName", out var _) ||
                                     person.TryGetProperty("nombreCompleto", out var _);
                        
                        return new EcClienteApiResponse
                        {
                            Nombre = person.TryGetProperty("name", out var namePerson) 
                                ? namePerson.GetString() 
                                : person.TryGetProperty("fullName", out var fullNamePerson) 
                                    ? fullNamePerson.GetString() 
                                    : person.TryGetProperty("nombreCompleto", out var nombreCompletoPerson) 
                                        ? nombreCompletoPerson.GetString() 
                                        : null,
                            Direccion = person.TryGetProperty("address", out var addressPerson) ? addressPerson.GetString() : null,
                            Distrito = person.TryGetProperty("district", out var districtPerson) ? districtPerson.GetString() : null,
                            Provincia = person.TryGetProperty("province", out var provincePerson) ? provincePerson.GetString() : null,
                            Departamento = person.TryGetProperty("region", out var regionPerson) ? regionPerson.GetString() : null,
                        };
                    }
                    
                    // Formato REST API directo
                    if (!tieneNombre)
                    {
                        return null;
                    }
                    
                    return new EcClienteApiResponse
                    {
                        Nombre = root.TryGetProperty("name", out var nameRest) 
                            ? nameRest.GetString() 
                            : root.TryGetProperty("fullName", out var fullNameRest) 
                                ? fullNameRest.GetString() 
                                : root.TryGetProperty("nombreCompleto", out var nombreCompletoRest) 
                                    ? nombreCompletoRest.GetString() 
                                    : null,
                        Direccion = root.TryGetProperty("address", out var addressRest) ? addressRest.GetString() : null,
                        Distrito = root.TryGetProperty("district", out var districtRest) ? districtRest.GetString() : null,
                        Provincia = root.TryGetProperty("province", out var provinceRest) ? provinceRest.GetString() : null,
                        Departamento = root.TryGetProperty("region", out var regionRest) ? regionRest.GetString() : null,
                    };
                }
                else if (proveedorUrl.Contains("apis.net.pe") || proveedorUrl.Contains("api.apis.net.pe"))
                {
                    // Formato de APIS.net.pe para DNI
                    // Verificar si tiene algún campo de nombre
                    var tieneNombre = root.TryGetProperty("nombres", out var _) || 
                                     root.TryGetProperty("nombre", out var _) ||
                                     root.TryGetProperty("nombreCompleto", out var _);
                    
                    if (!tieneNombre)
                    {
                        return null;
                    }
                    
                    // Construir nombre completo
                    string? nombreCompleto = null;
                    if (root.TryGetProperty("nombres", out var nombres) && root.TryGetProperty("apellidoPaterno", out var apPaterno) && root.TryGetProperty("apellidoMaterno", out var apMaterno))
                    {
                        var nom = nombres.GetString() ?? "";
                        var apPat = apPaterno.GetString() ?? "";
                        var apMat = apMaterno.GetString() ?? "";
                        nombreCompleto = $"{nom} {apPat} {apMat}".Trim();
                    }
                    else if (root.TryGetProperty("nombreCompleto", out var nombreCompletoJson))
                    {
                        nombreCompleto = nombreCompletoJson.GetString();
                    }
                    else if (root.TryGetProperty("nombre", out var nombreJson))
                    {
                        nombreCompleto = nombreJson.GetString();
                    }
                    
                    return new EcClienteApiResponse
                    {
                        Nombre = nombreCompleto,
                        Direccion = root.TryGetProperty("direccion", out var dir) ? dir.GetString() : null,
                        Distrito = root.TryGetProperty("distrito", out var dist) ? dist.GetString() : null,
                        Provincia = root.TryGetProperty("provincia", out var prov) ? prov.GetString() : null,
                        Departamento = root.TryGetProperty("departamento", out var dep) ? dep.GetString() : null,
                    };
                }
                else if (proveedorUrl.Contains("migo.pe"))
                {
                    // Formato de MIGO para DNI
                    return new EcClienteApiResponse
                    {
                        Nombre = root.TryGetProperty("nombres", out var nombres) 
                            ? (root.TryGetProperty("apellido_paterno", out var apPaterno) && root.TryGetProperty("apellido_materno", out var apMaterno)
                                ? $"{nombres.GetString()} {apPaterno.GetString()} {apMaterno.GetString()}".Trim()
                                : nombres.GetString())
                            : root.TryGetProperty("nombre_completo", out var nombreCompleto) ? nombreCompleto.GetString() : null,
                        Direccion = root.TryGetProperty("direccion", out var dir) ? dir.GetString() : null,
                        Distrito = root.TryGetProperty("distrito", out var dist) ? dist.GetString() : null,
                        Provincia = root.TryGetProperty("provincia", out var prov) ? prov.GetString() : null,
                        Departamento = root.TryGetProperty("departamento", out var dep) ? dep.GetString() : null,
                    };
                }
                else
                {
                    // Formato genérico (apiperu.dev)
                    var success = root.TryGetProperty("success", out var successProp) && successProp.GetBoolean();
                    if (!success)
                    {
                        return null;
                    }
                    
                    var data = root.TryGetProperty("data", out var dataProp) ? dataProp : root;
                    
                    return new EcClienteApiResponse
                    {
                        Nombre = data.TryGetProperty("nombre_completo", out var nombre) ? nombre.GetString() : null,
                        Direccion = data.TryGetProperty("direccion_completa", out var dir) ? dir.GetString() : null,
                        Distrito = data.TryGetProperty("distrito", out var dist) ? dist.GetString() : null,
                        Provincia = data.TryGetProperty("provincia", out var prov) ? prov.GetString() : null,
                        Departamento = data.TryGetProperty("departamento", out var dep) ? dep.GetString() : null,
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al parsear respuesta de DNI del proveedor {Proveedor}", proveedorUrl);
                return null;
            }
        }
    }
}

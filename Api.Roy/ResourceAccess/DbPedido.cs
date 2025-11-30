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
    using System.Threading.Tasks;

    public class DbPedido : IDbPedido
    {
        private readonly DBManager dbData;
        private static IConfiguration _StaticConfig { get; set; } = null!;
        private readonly IWebHostEnvironment _environment;

        public DbPedido(IConfiguration config, IWebHostEnvironment environment)
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
                var parametros = new List<DbParametro>()
                {
                     new DbParametro("@ID_USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                     new DbParametro("@OPERACION", SqlDbType.VarChar, ParameterDirection.Input, operacion)
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
                var parametros = new List<DbParametro>
                {
                    new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
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
                var parametros = new List<DbParametro>
                {
                    new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                    new DbParametro("@BUSQUEDA", SqlDbType.VarChar, ParameterDirection.Input, busqueda)
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
                     new DbParametro("@TIPO_DOCUMENTO", SqlDbType.VarChar, ParameterDirection.Input, cliente.TipoDocumento)
                };

                var resultado = dbData.ObtieneNQ("USP_CREAR_CLIENTE", parametros);
                return Task.FromResult(resultado);
            }
            catch (Exception ex)
            {
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
                var parametros = new List<DbParametro>()
                {
                     new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                     new DbParametro("@OPERACION", SqlDbType.VarChar, ParameterDirection.Input, operacion)
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
                var parametros = new List<DbParametro>()
                {
                     new DbParametro("@USUARIO", SqlDbType.VarChar, ParameterDirection.Input, usuario),
                     new DbParametro("@CRITERIO", SqlDbType.VarChar, ParameterDirection.Input, criterio),
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

                Func<DataRow, EcSelect> GetItemDelegate = GetItem;
                return Task.FromResult(dbData.ObtieneLista("USP_SESION_MONEDAS", GetItemDelegate));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task<bool> SavePedido(string usuario, string maquina, EcNuevoPedido pedido)
        {

            using (var connection = dbData.DbConn.conn)
            {
                await connection.OpenAsync();
                string userTable, empresa01Table, empresa02Table, codEmpresa = "", dataTable;
                if (this._environment.IsDevelopment())
                {
                    userTable = "PEDIDOS00";
                    empresa01Table = "PEDIDOS01";
                    empresa02Table = "PEDIDOS02";
                }
                else
                {
                    userTable = "ROE00";
                    empresa01Table = "ROE01";
                    empresa02Table = "ROE02";
                }

                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var data = new Dictionary<string, object>();
                        string uEmpresaQuery = $"SELECT EMPRESA_DEFECTO FROM {userTable}.DBO.SUP001 WHERE ALIAS LIKE @USUARIO;";
                        using (var command = new SqlCommand(uEmpresaQuery, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@USUARIO", usuario);
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                if (await reader.ReadAsync())
                                {
                                    codEmpresa = reader.GetString(reader.GetOrdinal("EMPRESA_DEFECTO"));
                                }
                            }
                        }

                        if (codEmpresa == "01")
                        {
                            dataTable = empresa01Table;
                        }
                        else if (codEmpresa == "02")
                        {
                            dataTable = empresa02Table;
                        }
                        else
                        {
                            throw new Exception("Empresa no válida");
                        }
                        string clienteQuery = $"SELECT TOP(1) IDAUXILIAR, RAZON, RUC, DIRECCION FROM {dataTable}.DBO.CUE001 WHERE RUC = @RUC;";
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
                                }
                            }
                        }
                        string docQuery = $"SELECT TOP(1) CORRELATIVO, TRANSACCION FROM {dataTable}.DBO.INV007 WHERE IDDOCUMENTO = 13;";
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

                        string userQuery = $"SELECT TOP(1) EMPRESA_DEFECTO, ALIAS, VENDEDOR FROM {userTable}.DBO.SUP001 WHERE ALIAS = @USUARIO";
                        using (var command = new SqlCommand(userQuery, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@USUARIO", usuario);
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                if (await reader.ReadAsync())
                                {
                                    data.Add("user_empresa", reader.GetString(reader.GetOrdinal("EMPRESA_DEFECTO")));
                                    data.Add("user_alias", reader.GetString(reader.GetOrdinal("ALIAS")));
                                    data.Add("user_vendedor", reader.GetDecimal(reader.GetOrdinal("VENDEDOR")));
                                }
                            }
                        }
                        string empresaQuery = $"SELECT TOP(1) IMPUESTO FROM {userTable}.DBO.SUP003 WHERE EMPRESA = @EMPRESA;";
                        using (var command = new SqlCommand(empresaQuery, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@EMPRESA", data.GetValueOrDefault("user_empresa"));
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                if (await reader.ReadAsync())
                                {
                                    data.Add("empresa_igv", reader.GetDecimal(reader.GetOrdinal("IMPUESTO")));
                                }
                            }
                        }
                        decimal? doc_correlativo = (decimal?)data.GetValueOrDefault("doc_correlativo") + 1;
                        string correlativo = doc_correlativo!.ToString()!.PadLeft(7, '0');
                        string precioEnTexto = Currency.ConvertirMontoATexto(pedido.Total);
                        var fechaActual = DateTime.Now.Date;
                        var horaActual = DateTime.Now.ToString("hh:mm tt");
                        string insertPed009Query = $@"
    INSERT INTO {dataTable}.DBO.PED009 (
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
                        }

                        string insertPed008Query = $@"
        INSERT INTO {dataTable}.DBO.PED008 (
            IDDOCUMENTO, OPERACION, TRANSACCION, IDPRODUCTO, IDALMACEN, CANTIDAD, MONTO,
            IMPUESTO, PRECIO, BASE, FECHA, DESCRIPCION
        )
        VALUES (
            @IDDOCUMENTO, @OPERACION, @TRANSACCION, @IDPRODUCTO, @IDALMACEN, @CANTIDAD, @MONTO,
            @IMPUESTO, @PRECIO, @BASE, @FECHA, @DESCRIPCION
        ); UPDATE {dataTable}.DBO.INV006 SET RESERVADO = RESERVADO - @CANTIDAD WHERE IDPRODUCTO = @IDPRODUCTO;";
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
    UPDATE {dataTable}.DBO.INV007 SET CORRELATIVO = CORRELATIVO + 1 WHERE IDDOCUMENTO = 13;";

                        using (var command = new SqlCommand(increaseQuery, connection, transaction))
                        {
                            await command.ExecuteNonQueryAsync();
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

        public async Task<bool> UpdatePedido(string usuario, string operacion, EcActualizarPedido pedido)
        {

            using (var connection = dbData.DbConn.conn)
            {
                await connection.OpenAsync();
                string userTable, empresa01Table, empresa02Table, codEmpresa = "", dataTable;
                if (this._environment.IsDevelopment())
                {
                    userTable = "PEDIDOS00";
                    empresa01Table = "PEDIDOS01";
                    empresa02Table = "PEDIDOS02";
                }
                else
                {
                    userTable = "ROE00";
                    empresa01Table = "ROE01";
                    empresa02Table = "ROE02";
                }

                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var data = new Dictionary<string, object>();
                        string uEmpresaQuery = $"SELECT EMPRESA_DEFECTO, VENDEDOR FROM {userTable}.DBO.SUP001 WHERE ALIAS LIKE @USUARIO;";
                        using (var command = new SqlCommand(uEmpresaQuery, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@USUARIO", usuario);
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                if (await reader.ReadAsync())
                                {
                                    codEmpresa = reader.GetString(reader.GetOrdinal("EMPRESA_DEFECTO"));
                                    data.Add("user_vendedor", reader.GetDecimal(reader.GetOrdinal("VENDEDOR")));
                                }
                            }
                        }

                        if (codEmpresa == "01")
                        {
                            dataTable = empresa01Table;
                        }
                        else if (codEmpresa == "02")
                        {
                            dataTable = empresa02Table;
                        }
                        else
                        {
                            throw new Exception("Empresa no válida");
                        }
                        string precioEnTexto = Currency.ConvertirMontoATexto(pedido.Total);
                        string insertPed009Query = $@"
    UPDATE {dataTable}.DBO.PED009 SET OBSERVACIONES = @OBSERVACIONES, BASE = @BASE, IMPUESTO = @IMPUESTO, TOTAL = @TOTAL, ORDEN_COMPRA = @ORDEN_COMPRA, MONTO_LETRAS = @MONTO_LETRAS
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
                        FROM {dataTable}.DBO.INV006 AS INV006
                        INNER JOIN {dataTable}.DBO.PED008 AS PED008
                        ON INV006.IDPRODUCTO = PED008.IDPRODUCTO WHERE PED008.OPERACION = @OPERACION;";
                        using (var command = new SqlCommand(restoreReservationsQuery, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@OPERACION", operacion);
                            await command.ExecuteNonQueryAsync();
                        }

                        string deletePed08Query = $@"DELETE FROM {dataTable}.DBO.PED008 WHERE OPERACION=@OPERACION;";
                        using (var command = new SqlCommand(deletePed08Query, connection, transaction))
                        {
                            command.Parameters.AddWithValue("@OPERACION", operacion);
                            await command.ExecuteNonQueryAsync();
                        }

                        string insertPed008Query = $@"
        INSERT INTO {dataTable}.DBO.PED008 (
            IDDOCUMENTO, OPERACION, TRANSACCION, IDPRODUCTO, IDALMACEN, CANTIDAD, MONTO,
            IMPUESTO, PRECIO, BASE, FECHA, DESCRIPCION
        )
        VALUES (
            @IDDOCUMENTO, @OPERACION, @TRANSACCION, @IDPRODUCTO, @IDALMACEN, @CANTIDAD, @MONTO,
            @IMPUESTO, @PRECIO, @BASE, (SELECT FECHA FROM {dataTable}.DBO.PED009 WHERE OPERACION = @OPERACION), @DESCRIPCION
        ); UPDATE {dataTable}.DBO.INV006 SET RESERVADO = RESERVADO - @CANTIDAD WHERE IDPRODUCTO = @IDPRODUCTO;";
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
                        Despachada = r.GetDecimal("DESPACHADA")
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


    }
}

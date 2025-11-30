using ApiRoy.Contracts;
using ApiRoy.Models;
using ApiRoy.ResourceAccess.Database;
using ApiRoy.Utils;
using System.Data;
using System.Xml.Linq;

namespace ApiRoy.ResourceAccess
{
    public class DbReporte : IDbReporte
    {
        private readonly DBManager dbData;
        private static IConfiguration _StaticConfig { get; set; } = null!;
        private readonly IWebHostEnvironment _environment;
        public DbReporte(IConfiguration config, IWebHostEnvironment environment)
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
        public Task<List<EcProductoDto>> GetProductoReport()
        {
            EcProductoDto GetItem(DataRow r)
            {
                return new EcProductoDto()
                {
                    Codigo = r.GetInt("CODIGO"),
                    Descripcion = r.GetString("DESCRIPCION"),
                    DescripcionClase = r.GetString("CLASE"),
                    DescripcionMarca = r.GetString("MARCA"),
                    DescripcionUDM = r.GetString("UDM"),
                    DescripcionDepartamento = r.GetString("DEPARTAMENTO"),
                    DesctipcionVersion = r.GetString("VERSION"),
                    DescripcionTipoMercaderia = r.GetString("TIPO_MERCADERIA"),
                    Codigo_de_Barra_SKU = r.GetString("CODIGO_DE_BARRA_SKU"),
                    Empaque = r.GetInt("EMPAQUE"),
                    Peso_Unitario = r.GetDouble("PESO_UNITARIO"),
                    Porc_Comision = r.GetDouble("PORC_COMISION"),
                    Ubicacion = r.GetString("UBICACION"),
                    Codigo_Sunat = r.GetString("CODIGO_SUNAT"),
                    Costo_de_Compra = r.GetDouble("COSTO_DE_COMPRA"),
                    Soles = r.GetDouble("SOLES"),
                    Existencia = r.GetDouble("EXISTENCIA"),
                    Costo_Promedio = r.GetDouble("COSTO_PROMEDIO"),
                    Ultima_Compra = r.GetDouble("ULTIMA_COMPRA"),
                    Costo_Dolar = r.GetDouble("COSTO_DOLAR"),
                    Tipo_IGV = r.GetDouble("TIPO_IGV"),
                    Stock_Maximo = r.GetDouble("STOCK_MAXIMO"),
                    Sock_Minimo = r.GetDouble("STOCK_MINIMO"),
                    Ultimo_Inventario = r.GetDateTime("ULTIMO_INVENTARIO"),
                    Tipo_Existencia = r.GetString("TIPO_EXISTENCIA"),
                    Unitario = r.GetDouble("UNITARIO"),
                    Cat_B = r.GetDouble("CAT_B"),
                    Cat_A = r.GetDouble("CAT_A"),
                    Personalizado = r.GetString("PERSONALIZADO"),
                    Disponible = r.GetString("DISPONIBLE"),
                    Estado = r.GetString("Estado")
                };
            }
            try
            {

                Func<DataRow, EcProductoDto> GetItemDelegate = GetItem;
                return Task.FromResult(dbData.ObtieneLista("USP_GET_REPORTE_PRODUCTO", GetItemDelegate));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public Task<List<EcProveedorDpto>> GetProveedorReport()
        {
            EcProveedorDpto GetItem(DataRow r)
            {
                return new EcProveedorDpto()
                {
                    Tipo_Doc = r.GetString("TIPO_DOC"),
                    Ruc = r.GetString("RUC"),
                    RazonSocial = r.GetString("RAZON_SOCIAL"),
                    DireccionFiscal = r.GetString("DIRECCION_FISCAL"),
                    Telefono = r.GetString("TELEFONO"),
                    RamaGremio = r.GetString("RAMA_GREMIO"),
                    TipoGasto = r.GetString("TIPO_GASTO"),
                    Ubigeo = r.GetString("UBIGEO"),
                    Correo = r.GetString("CORREO"),
                    PersonaContacto = r.GetString("PERSONA_DE_CONTACTO"),
                    Vendedor = r.GetString("VENDEDOR"),
                    Dias_Credito = r.GetInt("DIAS_CREDITO"),
                    Limite_Credito = r.GetDouble("LIMITE_CREDITO"),
                    NotasAdicionales = r.GetString("NOTAS_ADICIONALES"),
                    ClaseAuxiliar = r.GetString("CLASE_AUXILIAR"),
                    GrupoAuxiliar = r.GetString("GRUPO_AUXILIAR"),
                    CentroCosto = r.GetString("CENTRO_COSTO"),
                    PaginaWeb = r.GetString("PAGINA_WEB"),
                    PrecioVenta = r.GetString("PRECIO_VENTA"),
                    FechaIngreso = r.GetDateTime("FECHA_INGRESO"), 
                    Condicion = r.GetString("CONDICION"),
                    Banco = r.GetString("BANCO"),
                    Cuenta = r.GetString("CUENTA"),
                    TitularCuenta = r.GetString("TITULAR_DE_LA_CUENTA"),
                    Estado = r.GetString("Estado")
                };
            }
            try
            {

                Func<DataRow, EcProveedorDpto> GetItemDelegate = GetItem;
                return Task.FromResult(dbData.ObtieneLista("USP_GET_REPORTE_PROVEEDOR", GetItemDelegate));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}




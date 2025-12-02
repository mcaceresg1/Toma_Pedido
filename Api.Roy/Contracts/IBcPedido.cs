namespace ApiRoy.Contracts
{
    using ApiRoy.Models;

    public interface IBcPedido
    {
        Task<List<EcPedidos>> GetPedidos(EcFiltroPedido f, string usuario, int numPag, int allReg, int cantFilas);
        Task<EcPedidos?> GetPedido(string usuario, string operacion);
        Task<List<EcProductoPedido>> GetPedidoProductos(string usuario, string operacion);
        Task<EcConfiguracion> GetConfigEmpresa();
        Task<List<EcCliente>> GetClientes(string usuario, string criterio);
        Task<List<EcCondicion>> ObtenerCondicion(string usuario);
        Task<List<EcUbigeo>> ObtenerUbigeos(string usuario, string busqueda);
        Task<int> CrearCliente(string usuario, EcNuevoCliente cliente);
        Task<List<EcStockProductos>> GetStockProductos(EcFiltroProducto f, string usuario, string rucCliente, int numPag, int allReg, int cantFilas);
        Task<List<EcSelect>> GetMonedas();
        Task<List<EcTipoDoc>> GetTiposDocumento(string usuario);
        Task<bool> SavePedido(string usuario, string maquina, EcNuevoPedido pedido);
        Task<bool> UpdatePedido(string usuario, string operacion, EcActualizarPedido pedido);
        Task<List<EcHistoricoPedidoCabecera>> GetHistoricoPedidos(DateTime? fechaInicio = null,DateTime? fechaFin = null,int? idVendedor = null);
        Task<List<EcHistoricoPedidoCabecera>> GetHistoricoPedidosPorZona(DateTime? fechaInicio = null, DateTime? fechaFin = null, int? vendedorId = null, bool? conDespacho = null);
        Task<List<EcFiltroVendedor>> GetVendedores();





    }
}

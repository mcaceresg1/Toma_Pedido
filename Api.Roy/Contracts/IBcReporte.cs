using ApiRoy.Models;

namespace ApiRoy.Contracts
{
    public interface IBcReporte
    {
        Task<List<EcProductoDto>> GetProductosReport();
        Task<List<EcProveedorDpto>> GetProveedorReport();
    }
}

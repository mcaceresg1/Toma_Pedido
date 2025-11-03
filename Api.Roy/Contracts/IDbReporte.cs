using ApiRoy.Models;

namespace ApiRoy.Contracts
{
    public interface IDbReporte
    {
        Task<List<EcProductoDto>> GetProductoReport();
        Task<List<EcProveedorDpto>> GetProveedorReport();
    }
}

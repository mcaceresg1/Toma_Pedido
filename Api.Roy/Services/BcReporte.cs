using ApiRoy.Contracts;
using ApiRoy.Models;
using ApiRoy.ResourceAccess;

namespace ApiRoy.Services
{
    public class BcReporte : IBcReporte
    {
        private readonly IDbReporte _dbReporte;

        private static object _lockObject = new object();

        public BcReporte(IDbReporte dbReporte)
        {
            _dbReporte = dbReporte;
        }

        public async Task<List<EcProductoDto>> GetProductosReport()
        {
            try
            {
                var response = await _dbReporte.GetProductoReport();
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<EcProveedorDpto>> GetProveedorReport()
        {
            try
            {
                var response = await _dbReporte.GetProveedorReport();
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}

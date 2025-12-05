namespace ApiRoy.Services
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;

    public class BcUbigeo : IBcUbigeo
    {
        private readonly IDbUbigeo _dbUbigeo;

        public BcUbigeo(IDbUbigeo dbUbigeo)
        {
            _dbUbigeo = dbUbigeo;
        }

        public async Task<List<EcUbigeo>> GetAll(string usuario, string? zonaFiltro = null)
        {
            try
            {
                return await _dbUbigeo.GetAll(usuario, zonaFiltro);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<string>> GetByZona(string zonaCodigo, string usuario)
        {
            try
            {
                return await _dbUbigeo.GetByZona(zonaCodigo, usuario);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<string> SetByZona(string zonaCodigo, List<string> ubigeos, string usuario)
        {
            try
            {
                return await _dbUbigeo.SetByZona(zonaCodigo, ubigeos, usuario);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}


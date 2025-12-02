namespace ApiRoy.Services
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;

    public class BcZona : IBcZona
    {
        private readonly IDbZona _dbZona;

        public BcZona(IDbZona dbZona)
        {
            _dbZona = dbZona;
        }

        public async Task<List<EcZona>> GetAll(string usuario)
        {
            try
            {
                return await _dbZona.GetAll(usuario);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<EcZona?> GetByCodigo(string zonaCodigo, string usuario)
        {
            try
            {
                return await _dbZona.GetByCodigo(zonaCodigo, usuario);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<string> Create(EcZonaCreateDto zona, string usuario)
        {
            try
            {
                return await _dbZona.Create(zona, usuario);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<string> Update(string zonaCodigo, EcZonaUpdateDto zona, string usuario)
        {
            try
            {
                return await _dbZona.Update(zonaCodigo, zona, usuario);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<string> Delete(string zonaCodigo, string usuario)
        {
            try
            {
                return await _dbZona.Delete(zonaCodigo, usuario);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}


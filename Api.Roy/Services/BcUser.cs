namespace ApiRoy.Services
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;

    public class BcUser : IBcUser
    {
        private readonly IDbUser _dbUser;
        public BcUser(IDbUser db)
        {
            _dbUser = db;
        }

        public string GetConnectionDetails()
        {
            try
            {
                var response = _dbUser.GetConnectionDetails();
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener la información de la conexión.", ex);
            }
        }

        public async Task<EcUsuario> GetUser(string user)
        {
            try
            {
                var response = await _dbUser.GetUser(user);
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el usuario por nombre de usuario.", ex);
            }
        }

        public async Task<List<EcEmpresa>> ObtenerEmpresas(string usuario)
        {
            try
            {
                var res = await _dbUser.ObtenerEmpresas(usuario);
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task CambiarEmpresa(string usuario, string codigo)
        {
            try
            {
                await _dbUser.CambiarEmpresa(usuario, codigo);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task<EcEmpresa> ObtenerEmpresa(string usuario)
        {
            try
            {
                var res = await _dbUser.ObtenerEmpresa(usuario);
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}

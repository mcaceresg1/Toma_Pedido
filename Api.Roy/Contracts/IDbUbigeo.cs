namespace ApiRoy.Contracts
{
    using ApiRoy.Models;

    public interface IDbUbigeo
    {
        Task<List<EcUbigeo>> GetAll(string usuario, string? zonaFiltro = null);
        Task<List<string>> GetByZona(string zonaCodigo, string usuario);
        Task<string> SetByZona(string zonaCodigo, List<string> ubigeos, string usuario);
    }
}


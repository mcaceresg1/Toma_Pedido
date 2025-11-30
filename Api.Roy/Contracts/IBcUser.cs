namespace ApiRoy.Contracts
{
    using ApiRoy.Models;

    public interface IBcUser
    {
        Task<EcUsuario?> GetUser(string user);
        Task<List<EcEmpresa>> ObtenerEmpresas(string usuario);
        Task<EcEmpresa> ObtenerEmpresa(string usuario);
        Task CambiarEmpresa(string usuario, string codigo);
        string GetConnectionDetails();
    }
}

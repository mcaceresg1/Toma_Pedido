namespace ApiRoy.Contracts
{
    using ApiRoy.Models;

    public interface IDbZona
    {
        Task<List<EcZona>> GetAll(string usuario);
        Task<EcZona?> GetByCodigo(string zonaCodigo, string usuario);
        Task<string> Create(EcZonaCreateDto zona, string usuario);
        Task<string> Update(string zonaCodigo, EcZonaUpdateDto zona, string usuario);
        Task<string> Delete(string zonaCodigo, string usuario);
    }
}


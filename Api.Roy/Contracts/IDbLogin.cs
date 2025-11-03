namespace ApiRoy.Contracts
{
    using ApiRoy.Models;

    public interface IDbLogin
    {
        Task<EcLoginResult?> Login(EcLogin login);

    }
}

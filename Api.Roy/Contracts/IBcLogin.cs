namespace ApiRoy.Contracts
{
    using ApiRoy.Models;

    public interface IBcLogin
    {
        Task<EcLoginResult?> Login(EcLogin login);

    }
}

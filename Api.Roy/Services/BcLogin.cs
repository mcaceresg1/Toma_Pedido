namespace ApiRoy.Services
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;

    public class BcLogin : IBcLogin
    {
        private readonly IDbLogin _dbLogin;
        public BcLogin(IDbLogin db)
        {
            _dbLogin = db;
        }

        public async Task<EcLoginResult?> Login(EcLogin ecLogin)
        {
            try
            {
                
                var res = await _dbLogin.Login(ecLogin);
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}

namespace ApiRoy.ResourceAccess.Database
{
    using Microsoft.Data.SqlClient;
    using System.Data;
    public class DbParametro
    {
        private readonly SqlParameter parametro;
        public SqlParameter Parametro
        {
            get { return parametro; }
        }

        #region Constructor

        public DbParametro(string nombreParametro, SqlDbType tipoParametro)
            => parametro = new SqlParameter(nombreParametro, tipoParametro);

        public DbParametro(string nombreParametro, SqlDbType tipoParametro, ParameterDirection direccionParametro)
            => parametro = new SqlParameter(nombreParametro, tipoParametro) { Direction = direccionParametro };

        public DbParametro(string nombreParametro, SqlDbType tipoParametro, ParameterDirection direccionParametro, object valorParametro)
            => parametro = new SqlParameter(nombreParametro, tipoParametro) { Direction = direccionParametro, Value = valorParametro };

        public DbParametro(string nombreParametro, SqlDbType tipoParametro, ParameterDirection direccionParametro, object valorParametro, int longitudParametro)
            => parametro = new SqlParameter(nombreParametro, tipoParametro, longitudParametro) { Direction = direccionParametro, Value = valorParametro };

        public DbParametro(string nombreParametro, SqlDbType tipoParametro, ParameterDirection direccionParametro, object valorParametro, int longitudParametro, byte precisionParametro)
            => parametro = new SqlParameter(nombreParametro, tipoParametro, longitudParametro) { Direction = direccionParametro, Precision = precisionParametro, Value = valorParametro };

        #endregion
    }
}

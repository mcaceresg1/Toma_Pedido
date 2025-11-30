using System.Data.Common;
using System.Data;

namespace ApiRoy.ResourceAccess.Database
{
    public class DBManager
    {
        public readonly DbConnection DbConn;

        public DBManager(string cadenaConexion)
        {
            DbConn = new DbConnection(cadenaConexion);
        }

        /// <summary>
        /// Ejecuta un commando SQL y regresa una tabla de resultados
        /// </summary>
        /// <typeparam name="T">Clase de parametro</typeparam>
        /// <param name="SP">Procedimiento almacenado</param>
        /// <param name="recuperador">Función para procesar los DataRows regresados</param>
        /// <param name="args">Lista de parametros SQL</param>
        /// <returns>Lista de objetos</returns>
        public List<T> ObtieneLista<T>(string SP, Func<DataRow, T> recuperador, List<DbParametro>? args = null)
        {
            List<T> ls = new List<T>();

            try
            {
                DataTable? dt;

                if (args != null)
                    dt = DbConn.EjecutarDataTable(SP, args);
                else
                    dt = DbConn.EjecutarDataTable(SP);

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow r in dt.Rows)
                    {
                        var item = recuperador(r);
                        if (item != null)
                        {
                            ls.Add(item);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new ArgumentNullException(ex.Message, ex);
            }

            return ls;
        }

        /// <summary>
        /// Ejecuta un comando SQL y regresa el número de filas afectadas
        /// </summary>
        /// <param name="SP">Procedimiento almacenado</param>
        /// <param name="args">Lista de parametros SQL</param>
        /// <returns>Numero de filas afectadas</returns>
        public int ObtieneNQ(string SP, List<DbParametro>? args = null)
        {
            try
            {
                return DbConn.EjecutarNonQuery(SP, args ?? new List<DbParametro>());
            }
            catch (Exception ex)
            {
                throw new ArgumentNullException(ex.Message, ex);
            }
        }

        /// <summary>
        /// Ejecuta un comando SQL y regresa un resultado numerico
        /// </summary>
        /// <param name="SP">Procedimiento almacenado</param>
        /// <param name="param">Lista de parametros SQL</param>
        /// <returns>Valor numérico</returns>
        public object? ObtieneScalar(string SP, List<DbParametro> param)
        {
            try
            {
                return DbConn.EjecutarScalar(SP, param);
            }
            catch (Exception ex)
            {
                throw new ArgumentNullException(ex.Message, ex);
            }
        }

        /// <summary>
        /// Ejecuta un comando SQL y regresa un resultado numerico
        /// </summary>
        /// <param name="SP">Procedimiento almacenado</param>
        /// <param name="param">Lista de parametros SQL</param>
        /// <returns>Valor numérico</returns>
        public object? ObtieneScalar(string SP)
        {
            try
            {
                return DbConn.EjecutarScalar(SP);
            }
            catch (Exception ex)
            {
                throw new ArgumentNullException(ex.Message, ex);
            }
        }

        /// <summary>
        /// Ejecuta un commando SQL y regresa una colección de tablas de resultados
        /// </summary>
        /// <typeparam name="T">Clase de parametro</typeparam>
        /// <param name="SP">Procedimiento almacenado</param>
        /// <param name="recuperador">Función para procesar los DataRows regresados</param>
        /// <param name="args">Lista de parametros SQL</param>
        /// <returns>Lista de objetos</returns>
        public T ObtieneDataSet<T>(string SP, Func<DataSet, T> recuperador, List<DbParametro>? args = null)
        {
            try
            {
                DataSet? ds;

                if (args != null)
                    ds = DbConn.EjecutarDataSet(SP, args);
                else
                    ds = DbConn.EjecutarDataSet(SP);

                if (ds == null)
                    throw new InvalidOperationException("DataSet returned null");

                return recuperador(ds);
            }
            catch (Exception ex)
            {
                throw new ArgumentNullException(ex.Message, ex);
            }
        }
    }
}

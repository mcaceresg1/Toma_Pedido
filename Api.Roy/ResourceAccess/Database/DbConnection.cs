namespace ApiRoy.ResourceAccess.Database
{
    using System.Data;
    using Microsoft.Data.SqlClient;

    public class DbConnection : IDisposable
    {

        #region Dispose
        private bool disposedValue = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {

                disposedValue = true;
            }
        }
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        #endregion

        private string cadCon { get; set; }

        private SqlCommand cmd { get; set; }

        public SqlConnection conn { get; set; }

        private SqlDataAdapter da { get; set; }

        public DbConnection(string cadenaConexion)
        {
            cadCon = cadenaConexion;
            conn = new SqlConnection(cadCon);
        }

        public DataTable EjecutarDataTable(string storedProcedure)
        {
            cmd = new SqlCommand(storedProcedure, conn);
            cmd.CommandTimeout = 90;
            cmd.CommandType = CommandType.StoredProcedure;
            DataTable dt = new DataTable();

            try
            {
                conn.Open();
                da = new SqlDataAdapter(cmd);
                da.Fill(dt);
            }
            catch (Exception ex)
            {
                conn.Close();
                throw new InvalidOperationException(ex.Message, ex);
            }
            finally
            {
                conn.Close();
            }
            return dt;
        }

        public DataTable EjecutarDataTable(string storedProcedure, List<DbParametro> lsParametros)
        {
            DataTable dt = new DataTable();
            cmd = new SqlCommand(storedProcedure, conn);
            // Setear CommandTimeout desde la cadena de conexión
            cmd.CommandTimeout = 90;
            cmd.CommandType = CommandType.StoredProcedure;

            foreach (DbParametro parametro in lsParametros)
            {
                NormalizarParametro(parametro.Parametro);
                cmd.Parameters.Add(parametro.Parametro);
            }

            try
            {
                conn.Open();
                da = new SqlDataAdapter(cmd);
                da.Fill(dt);
            }
            catch (Exception ex)
            {
                conn.Close();
                throw new InvalidOperationException(ex.Message, ex);
            }
            finally
            { conn.Close(); }

            return dt;
        }

        public DataSet EjecutarDataSet(string storedProcedure)
        {
            cmd = new SqlCommand(storedProcedure, conn);
            cmd.CommandType = CommandType.StoredProcedure;
            DataSet ds = new DataSet();

            try
            {
                conn.Open();
                da = new SqlDataAdapter(cmd);
                da.Fill(ds);
            }
            catch (Exception ex)
            {
                conn.Close();
                throw new InvalidOperationException(ex.Message, ex);
            }
            finally
            {
                conn.Close();
            }
            return ds;
        }

        public DataSet EjecutarDataSet(string storedProcedure, List<DbParametro> lsParametros)
        {
            DataSet dt = new DataSet();
            cmd = new SqlCommand(storedProcedure, conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 90;

            foreach (DbParametro parametro in lsParametros)
            {
                NormalizarParametro(parametro.Parametro);
                cmd.Parameters.Add(parametro.Parametro);
            }

            try
            {
                conn.Open();
                da = new SqlDataAdapter(cmd);
                da.Fill(dt);
            }
            catch (Exception ex)
            {
                conn.Close();
                throw new InvalidOperationException(ex.Message, ex);
            }
            finally
            { conn.Close(); }

            return dt;
        }

        /// <summary>
        /// Ejecuta el comando ExecuteNonQuery y devuelve el numero de filas afectadas
        /// </summary>
        /// <param name="storedProcedure">Stored Procedure que se va a ejecutar</param>
        /// <returns>Devuelve el numero de filas afectadas</returns>
        public int EjecutarNonQuery(string storedProcedure)
        {
            cmd = new SqlCommand(storedProcedure, conn);
            cmd.CommandType = CommandType.StoredProcedure;
            int res = 0;
            try
            {
                conn.Open();
                res = cmd.ExecuteNonQuery();
                conn.Close();
            }
            catch (Exception ex)
            {
                conn.Close();
                throw new InvalidOperationException(ex.Message, ex);
            }
            finally
            { conn.Close(); }

            return res;
        }

        /// <summary>
        /// Ejecuta el comando ExecuteNonQuery y devuelve el numero de filas afectadas
        /// </summary>
        /// <param name="storedProcedure">Stored Procedure que se va a ejecutar</param>
        /// <param name="lsParametros">Lista de parametros requeridos</param>
        /// <returns>Devuelve el numero de filas afectadas</returns>
        public int EjecutarNonQuery(string storedProcedure, List<DbParametro> lsParametros)
        {
            int res = 0;
            cmd = new SqlCommand(storedProcedure, conn);
            cmd.CommandType = CommandType.StoredProcedure;

            foreach (DbParametro parametro in lsParametros)
            {
                NormalizarParametro(parametro.Parametro);
                cmd.Parameters.Add(parametro.Parametro);
            }

            try
            {
                conn.Open();
                res = cmd.ExecuteNonQuery();
                conn.Close();
            }
            catch (Exception ex)
            {
                conn.Close();
                throw new InvalidOperationException(ex.Message, ex);
            }
            finally
            { conn.Close(); }

            return res;
        }

        public object EjecutarScalar(string storedProcedure)
        {
            object res = null;
            cmd = new SqlCommand(storedProcedure, conn);

            try
            {
                conn.Open();
                res = cmd.ExecuteScalar();
                conn.Close();
            }
            catch (Exception ex)
            {
                conn.Close();
                throw new ArgumentNullException(ex.Message, ex);
            }
            finally
            { conn.Close(); }
            return res;
        }

        public object EjecutarScalar(string storedProcedure, List<DbParametro> lsParametros)
        {
            object res = null;
            cmd = new SqlCommand(storedProcedure, conn);
            cmd.CommandType = CommandType.StoredProcedure;

            foreach (DbParametro parametro in lsParametros)
            {
                NormalizarParametro(parametro.Parametro);
                cmd.Parameters.Add(parametro.Parametro);
            }

            try
            {
                conn.Open();
                res = cmd.ExecuteScalar();
                conn.Close();
            }
            catch (Exception ex)
            {
                conn.Close();
                throw new ArgumentNullException(ex.Message, ex);
            }
            finally
            { conn.Close(); }

            return res;
        }

        private void NormalizarParametro(SqlParameter parametro)
        {
            try
            {
                if (parametro.Value == null)
                {
                    switch (parametro.SqlDbType)
                    {
                        case SqlDbType.BigInt:
                            parametro.Value = 0;
                            break;
                        case SqlDbType.Binary:
                            break;
                        case SqlDbType.Bit:
                            parametro.Value = 0;
                            break;
                        case SqlDbType.Char:
                            break;
                        case SqlDbType.DateTime:
                            parametro.Value = DateTime.Now;
                            break;
                        case SqlDbType.Decimal:
                            parametro.Value = 0;
                            break;
                        case SqlDbType.Float:
                            parametro.Value = 0;
                            break;
                        case SqlDbType.Image:
                            break;
                        case SqlDbType.Int:
                            parametro.Value = 0;
                            break;
                        case SqlDbType.Money:
                            parametro.Value = 0;
                            break;
                        case SqlDbType.NChar:
                            break;
                        case SqlDbType.NText:
                            parametro.Value = "";
                            break;
                        case SqlDbType.NVarChar:
                            parametro.Value = "";
                            break;
                        case SqlDbType.Real:
                            parametro.Value = 0;
                            break;
                        case SqlDbType.UniqueIdentifier:
                            break;
                        case SqlDbType.SmallDateTime:
                            parametro.Value = DateTime.Now;
                            break;
                        case SqlDbType.SmallInt:
                            parametro.Value = 0;
                            break;
                        case SqlDbType.SmallMoney:
                            parametro.Value = 0;
                            break;
                        case SqlDbType.Text:
                            parametro.Value = "";
                            break;
                        case SqlDbType.Timestamp:
                            break;
                        case SqlDbType.TinyInt:
                            break;
                        case SqlDbType.VarBinary:
                            break;
                        case SqlDbType.VarChar:
                            parametro.Value = "";
                            break;
                        case SqlDbType.Variant:
                            break;
                        case SqlDbType.Xml:
                            break;
                        case SqlDbType.Udt:
                            break;
                        case SqlDbType.Structured:
                            break;
                        case SqlDbType.Date:
                            parametro.Value = DateTime.Now;
                            break;
                        case SqlDbType.Time:
                            parametro.Value = DateTime.Now.TimeOfDay;
                            break;
                        case SqlDbType.DateTime2:
                            parametro.Value = DateTime.Now;
                            break;
                        case SqlDbType.DateTimeOffset:
                            break;
                        default:
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        /// <summary>
        /// Ejecuta un procedimiento almacenado y retorna una lista con los resultados, con
        /// base en el tipo asignado a la función de transformación.
        /// </summary>
        /// <typeparam name="T">Clase de parametro.</typeparam>
        /// <param name="SP">Nombre del rrocedimiento almacenado</param>
        /// <param name="recuperador">Función para procesar los DataRows regresados</param>
        /// <param name="args">Lista de parametros SQL.</param>
        /// <returns>Lista de instancias.</returns>
        public List<T> StoreProcedureToList<T>(string SP, Func<DataRow, T> recuperador, List<DbParametro> args = null)
        {
            List<T> ls = new List<T>();

            try
            {
                DataTable dt = null;

                if (args != null)
                {
                    dt = this.EjecutarDataTable(SP, args);
                }
                else
                {
                    dt = this.EjecutarDataTable(SP);
                }

                if (dt.Rows.Count > 0)
                {
                    foreach (DataRow r in dt.Rows)
                    {
                        ls.Add(recuperador(r));
                    }
                }
            }
            catch (Exception ex)
            {
                throw new ArgumentNullException(ex.Message, ex);
            }

            return ls;
        }
    }
}

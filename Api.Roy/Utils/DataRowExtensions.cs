using System;
using System.Data;

namespace ApiRoy.Utils
{
    public static class DataRowExtensions
    {
        public static string GetString(this DataRow row, string column)
        {
            if (!row.Table.Columns.Contains(column) || row.IsNull(column))
                return string.Empty;

            return row[column].ToString() ?? string.Empty;
        }

        public static int GetInt(this DataRow row, string column)
        {
            if (!row.Table.Columns.Contains(column) || row.IsNull(column))
                return 0;

            if (int.TryParse(row[column].ToString(), out int result))
                return result;

            return 0;
        }

        public static double GetDouble(this DataRow row, string column)
        {
            if (!row.Table.Columns.Contains(column) || row.IsNull(column))
                return 0;

            if (double.TryParse(row[column].ToString(), out double result))
                return result;

            return 0;
        }

        public static DateTime GetDateTime(this DataRow row, string column)
        {
            if (!row.Table.Columns.Contains(column) || row.IsNull(column))
                return DateTime.MinValue;

            if (DateTime.TryParse(row[column].ToString(), out DateTime result))
                return result;

            return DateTime.MinValue;
        }

        public static bool GetBool(this DataRow row, string column)
        {
            if (!row.Table.Columns.Contains(column) || row.IsNull(column))
                return false;

            if (bool.TryParse(row[column].ToString(), out bool result))
                return result;

            return false;
        }

        public static decimal GetDecimal(this DataRow row, string column)
        {
            if (!row.Table.Columns.Contains(column) || row.IsNull(column))
                return 0;

            if (decimal.TryParse(row[column].ToString(), out decimal result))
                return result;

            return 0;
        }

    }
}

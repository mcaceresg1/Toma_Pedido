namespace ApiRoy.Models
{
    public class EcFiltros
    {
        public string? CodLocal { get; set; }
        public string? FechaDesde { get; set; }
        public string? FechaHasta { get; set; }
    }

    public class EcFiltroProducto
    {
        public string? Producto { get; set; }
        public int? CodAlmacen { get; set; }
        public string? Clases { get; set; }
    }
    public class EcFiltroVendedor
    {
        public int Vendedor { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal Comision { get; set; }
    }


}

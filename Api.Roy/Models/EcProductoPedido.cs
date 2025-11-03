
namespace ApiRoy.Models
{
    public class EcProductoPedido
    {
        public string? CodProducto { get; set; }
        public double? Cantidad { get; set; }
        public double? Precio { get; set; }
        public double? Impuesto { get; set; }
        public double? Base { get; set; }
        public double? Monto { get; set; }
        public string? Tipo { get; set; }
        public string? Almacen { get; set; }
        public int? CodAlmacen { get; set; }
        public string? Descripcion { get; set; }
        public string? Sku { get; set; }
    }

    public class EcStockProductos
    {
        public int? CodProducto { get; set; }
        public string? NombProducto { get; set; }
        public double? Stock { get; set; }
        public double? Reservado { get; set; }
        public int? Almacen { get; set; }
        public double? Precio1 { get; set; }
        public double? Precio2 { get; set; }
        public double? Precio3 { get; set; }
        public double? Precio4 { get; set; }
        public double? Precio5 { get; set; }
        public double? Correlacion1 { get; set; }
        public double? Correlacion2 { get; set; }
        public double? Correlacion3 { get; set; }
        public double? Correlacion4 { get; set; }
        public double? Correlacion5 { get; set; }
        public bool UsaImpuesto { get; set; }
        public bool PrecioEditable { get; set; }
        public double? Impuesto { get; set; }
        //Paginación
        public int TotalPagina { get; set; }
        public int TotalReg { get; set; }
        public int Item { get; set; }
    }

    public class EcNuevoPedidoProducto
    {
        public int CodProd { get; set; }
        public double CantProd { get; set; }
        public double PreUnit { get; set; }
        public double Igv { get; set; }
        public double PreTot { get; set; }
        public int NumSec { get; set; }
        public double ImpUnit { get; set; }
        public double ImpTot { get; set; }
        public int Almacen { get; set; }
        public string Descripcion { get; set; } = string.Empty;
    }
}
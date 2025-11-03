namespace ApiRoy.Models
{
    public class EcHistoricoPedidoDetalle
    {
        public int IdProducto { get; set; }
        public string CodigoBarra { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public decimal Cantidad { get; set; }
        public string Medida { get; set; } = string.Empty;
        public decimal CantidadDespachada { get; set; }
        public decimal Unitario { get; set; }
        public decimal Total { get; set; }
        public decimal Descuento { get; set; }
        public decimal Utilidad { get; set; }
        public decimal Porcentaje { get; set; }
    }


}

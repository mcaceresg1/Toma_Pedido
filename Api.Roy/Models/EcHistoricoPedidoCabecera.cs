namespace ApiRoy.Models
{
    public class EcHistoricoPedidoCabecera
    {
        public string Vendedor { get; set; } = string.Empty;
        public int Operacion { get; set; }
        public DateTime Fecha { get; set; }
        public string Cliente { get; set; } = string.Empty;
        public string? Ruc { get; set; }
        public string Referencia { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public string Simbolo { get; set; } = string.Empty;
        public string Guia { get; set; } = string.Empty;
        public string Factura { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string AceptadaPorLaSunat { get; set; } = string.Empty;
        public bool Anu { get; set; }
        public decimal Orginal { get; set; }
        public decimal Despachada { get; set; }
        public string? Ubigeo { get; set; }
        public string? Zona { get; set; }

        public List<EcHistoricoPedidoDetalle> Detalles { get; set; } = new();
    }

}

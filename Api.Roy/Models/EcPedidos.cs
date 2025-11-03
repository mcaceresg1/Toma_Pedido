namespace ApiRoy.Models
{
    public class EcPedidos
    {
        public string NumPedido { get; set; } = string.Empty;
        public string FechaPedido { get; set; } = string.Empty;
        public string? HoraPedido { get; set; }
        public string? Condicion { get; set; }
        public string? MontoLetras { get; set; }
        public string? NombreVendedor { get; set; }
        public string RucCliente { get; set; } = string.Empty;
        public string DesCliente { get; set; } = string.Empty;
        public string DirCliente { get; set; } = string.Empty;
        public string Moneda { get; set; } = string.Empty;
        public string AbrMoneda { get; set; } = string.Empty;
        public int CodVendedor { get; set; }
        public double Subtotal { get; set; }
        public double Igv { get; set; }
        public double Total { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string? CondicionCli { get; set; }
        public string? DirPed { get; set; }
        public string? TelefonoCli { get; set; }
        public string? TelefonoCliAux { get; set; }
        public string? UbigeoCli { get; set; }
        //Paginación
        public int TotalPagina { get; set; }
        public int TotalReg { get; set; }
        public int Item { get; set; }
        public string? OrdenCompra { get; set; }
        public string? Factura { get; set; }
        public string? Observaciones { get; set; }
    }
}

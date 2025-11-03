namespace ApiRoy.Models
{
    public class EcEmpresa
    {
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public bool PrecioUsaImpuesto { get; set; }
        public string? Ruc { get; set; }
        public string? NombrePrecio1 { get; set; }
        public string? NombrePrecio2 { get; set; }
        public string? NombrePrecio3 { get; set; }
        public string? NombrePrecio4 { get; set; }
        public string? NombrePrecio5 { get; set; }
        public string? DetallesPago { get; set; }
    }
}
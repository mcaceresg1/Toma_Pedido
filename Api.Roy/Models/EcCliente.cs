namespace ApiRoy.Models
{
    public class EcCliente
    {
        public string? RucCliente { get; set; }
        public string? ValueSelect { get; set; }
        public int? Vendedor { get; set; }
        public string? Precio { get; set; }
    }

    public class EcNuevoCliente
    {
        public string Razon { get; set; } = string.Empty;
        public string Ruc { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Ciudad { get; set; } = string.Empty;
        public string Contacto { get; set; } = string.Empty;
        public string TelefonoContacto { get; set; } = string.Empty;
        public string TipoDocumento { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Ubigeo { get; set; } = string.Empty;
        public string Condicion { get; set; } = string.Empty;
    }
}

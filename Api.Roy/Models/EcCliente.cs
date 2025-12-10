using System.ComponentModel.DataAnnotations;

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
        [Required(ErrorMessage = "La razón social es requerida")]
        public string Razon { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "El RUC es requerido")]
        [RegularExpression(@"^\d{11}$", ErrorMessage = "El RUC debe tener exactamente 11 dígitos numéricos")]
        public string Ruc { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "La dirección es requerida")]
        public string Direccion { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "El teléfono es requerido")]
        public string Telefono { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "La ciudad es requerida")]
        public string Ciudad { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "El contacto es requerido")]
        public string Contacto { get; set; } = string.Empty;
        
        public string TelefonoContacto { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "El tipo de documento es requerido")]
        public string TipoDocumento { get; set; } = string.Empty;
        
        public string Correo { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "El ubigeo es requerido")]
        public string Ubigeo { get; set; } = string.Empty;
        
        public string Condicion { get; set; } = string.Empty;
    }
}

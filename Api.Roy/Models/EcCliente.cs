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
        
        [Required(ErrorMessage = "El documento es requerido")]
        [RegularExpression(@"^[\d\w]{1,20}$", ErrorMessage = "El documento debe tener entre 1 y 20 caracteres alfanuméricos")]
        public string Ruc { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "La dirección es requerida")]
        public string Direccion { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "El teléfono es requerido")]
        public string Telefono { get; set; } = string.Empty;
        
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

    public class EcClienteApiResponse
    {
        public string? RazonSocial { get; set; } // Para RUC
        public string? Nombre { get; set; } // Para DNI (nombre_completo)
        public string? NombreComercial { get; set; }
        public string? Direccion { get; set; }
        public string? Distrito { get; set; }
        public string? Provincia { get; set; }
        public string? Departamento { get; set; }
        public string? Ubigeo { get; set; }
        public string? Estado { get; set; }
        public string? Condicion { get; set; }
        public string? Telefono { get; set; } // Teléfono del cliente
        public string? Contacto { get; set; } // Contacto del cliente
        [System.Text.Json.Serialization.JsonPropertyName("APIproveedor")]
        public string? APIproveedor { get; set; } // Indica qué proveedor se usó (APIPERU, MIGO, GRAPH_PERU, etc.)
    }

    public class EcConsultaClienteResponse
    {
        public bool ExisteEnBD { get; set; }
        public EcClienteApiResponse? DatosApi { get; set; }
        public string? Mensaje { get; set; }
    }
}

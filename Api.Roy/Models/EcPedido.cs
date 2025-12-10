using System.ComponentModel.DataAnnotations;

namespace ApiRoy.Models
{
    public class EcNuevoPedido
    {
        [Required(ErrorMessage = "El RUC es requerido")]
        [RegularExpression(@"^\d{11}$", ErrorMessage = "El RUC debe tener 11 dígitos")]
        public string Ruc { get; set; } = string.Empty;
        
        public string? Precio { get; set; }
        public int? Moneda { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "El subtotal debe ser mayor o igual a 0")]
        public double Subtotal { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "El IGV debe ser mayor o igual a 0")]
        public double Igv { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "El total debe ser mayor o igual a 0")]
        public double Total { get; set; }
        
        [Required(ErrorMessage = "Debe incluir al menos un producto")]
        [MinLength(1, ErrorMessage = "Debe incluir al menos un producto")]
        public List<EcNuevoPedidoProducto> Productos { get; set; } = new();
        
        [StringLength(500, ErrorMessage = "Las observaciones no pueden exceder 500 caracteres")]
        public string? Observaciones { get; set; }
        
        [StringLength(50, ErrorMessage = "La OC no puede exceder 50 caracteres")]
        public string? Oc { get; set; }
    }

    public class EcActualizarPedido
    {
        [Range(0, double.MaxValue, ErrorMessage = "El subtotal debe ser mayor o igual a 0")]
        public double Subtotal { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "El IGV debe ser mayor o igual a 0")]
        public double Igv { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "El total debe ser mayor o igual a 0")]
        public double Total { get; set; }
        
        [Required(ErrorMessage = "Debe incluir al menos un producto")]
        [MinLength(1, ErrorMessage = "Debe incluir al menos un producto")]
        public List<EcNuevoPedidoProducto> Productos { get; set; } = new();
        
        [StringLength(500, ErrorMessage = "Las observaciones no pueden exceder 500 caracteres")]
        public string? Observaciones { get; set; }
        
        [StringLength(50, ErrorMessage = "La OC no puede exceder 50 caracteres")]
        public string? Oc { get; set; }
    }
}
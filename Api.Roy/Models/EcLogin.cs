using System.ComponentModel.DataAnnotations;

namespace ApiRoy.Models
{
    public class EcLogin
    {
        [Required(ErrorMessage = "El usuario es requerido")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "El usuario debe tener entre 3 y 50 caracteres")]
        public string Usuario { get; set; } = null!;
        
        [Required(ErrorMessage = "La contraseña es requerida")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "La contraseña debe tener entre 1 y 100 caracteres")]
        public string Clave { get; set; } = null!;
    }
}

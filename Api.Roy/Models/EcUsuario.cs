namespace ApiRoy.Models
{
    public class EcUsuario
    {
        public int? CodVendedor { get; set; }
        public int? CodUsuario { get; set; }
        public string? NombreUsuario { get; set; }
        public string? Alias { get; set; }
        public string? Empresas { get; set; }
        public string? EmpresaDefecto { get; set; }
        public bool EditaPrecio { get; set; }
        public bool FuncionesEspeciales { get; set; }
        public string? PreciosPermitidos { get; set; }
    }
}

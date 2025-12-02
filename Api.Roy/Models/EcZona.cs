namespace ApiRoy.Models
{
    public class EcZona
    {
        public string ZonaCodigo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string? Corto { get; set; }
    }

    public class EcZonaCreateDto
    {
        public string ZonaCodigo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string? Corto { get; set; }
    }

    public class EcZonaUpdateDto
    {
        public string Descripcion { get; set; } = string.Empty;
        public string? Corto { get; set; }
    }
}


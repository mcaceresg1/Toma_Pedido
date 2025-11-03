namespace ApiRoy.Models
{
    public class EcProveedorDpto
    {
        public string Tipo_Doc { get; set; } = string.Empty;
        public string Ruc { get; set; } = string.Empty;
        public string RazonSocial { get; set; } = string.Empty;
        public string DireccionFiscal { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string RamaGremio { get; set; } = string.Empty;
        public string TipoGasto { get; set; } = string.Empty;
        public string Ubigeo { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string PersonaContacto { get; set; } = string.Empty;
        public string Vendedor { get; set; } = string.Empty;
        public int Dias_Credito { get; set; }
        public double Limite_Credito { get; set; }
        public string NotasAdicionales { get; set; } = string.Empty;
        public string ClaseAuxiliar { get; set; } = string.Empty;
        public string GrupoAuxiliar { get; set; } = string.Empty;
        public string CentroCosto { get; set; } = string.Empty;
        public string PaginaWeb { get; set; } = string.Empty;
        public string PrecioVenta { get; set; } = string.Empty;
        public DateTime FechaIngreso { get; set; }
        public string Condicion { get; set; } = string.Empty;
        public string Banco { get; set; } = string.Empty;
        public string Cuenta { get; set; } = string.Empty;
        public string TitularCuenta { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;

    }
}

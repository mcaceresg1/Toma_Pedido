namespace ApiRoy.Models
{
   
    public class EcProductoDto
    {
        public int Codigo { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string DescripcionClase { get;set; } = string.Empty;
        public string DescripcionMarca { get; set; } = string.Empty;
        public string DescripcionUDM { get; set; } = string.Empty;
        public string DescripcionDepartamento { get; set; } = string.Empty;
        public string DesctipcionVersion { get; set; } = string.Empty;
        public string DescripcionTipoMercaderia { get; set; } = string.Empty;
        public string Codigo_de_Barra_SKU { get; set; } = string.Empty;
        public int Empaque { get; set; }
        public double Peso_Unitario { get; set; }
        public double Porc_Comision { get; set; }
        public string Ubicacion { get; set; } = string.Empty;
        public string Codigo_Sunat { get; set; } = string.Empty;
        public double Costo_de_Compra { get; set; }
        public double Soles { get; set; }
        public double Existencia { get; set; }
        public double Costo_Promedio { get; set; }
        public double Ultima_Compra { get; set; }
        public double Costo_Dolar { get; set; }
        public double Tipo_IGV { get; set; }
        public double Stock_Maximo { get; set; }
        public double Sock_Minimo { get; set; }
        public DateTime Ultimo_Inventario { get; set; }
        public string Tipo_Existencia { get; set; } = string.Empty;
        public double Unitario { get; set; }
        public double Cat_B {  get; set; }
        public double Cat_A { get; set; }
        public string Personalizado { get; set; } = string.Empty;
        public string Disponible { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;

    }

}

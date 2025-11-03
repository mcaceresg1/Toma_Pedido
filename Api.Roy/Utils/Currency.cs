namespace ApiRoy.Utils
{
    public class Currency
    {
        private static readonly string[] Unidades = {
        "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
        "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete",
        "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés",
        "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"
    };

        private static readonly string[] Decenas = {
        "", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"
    };

        private static readonly string[] Centenas = {
        "", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos",
        "setecientos", "ochocientos", "novecientos"
    };

        public static string ConvertirMontoATexto(double numero)
        {
            if (numero < 0)
                return "menos " + ConvertirMontoATexto(-numero);
            if (numero == 0)
                return "cero con 00/100.-";

            long entero = (long)numero;
            int centavos = (int)Math.Round((numero - entero) * 100); // Cambiado a Math.Round

            if (centavos == 100) // Si los centavos son 100, se incrementa el entero
            {
                entero++;
                centavos = 0;
            }

            string letras = ConvertirEntero(entero);
            return $"{letras} con {centavos:D2}/100.-";
        }

        private static string ConvertirEntero(long numero)
        {
            if (numero == 0)
                return "cero";

            if (numero == 100)
                return "cien";

            if (numero < 100)
                return ConvertirMenorCien(numero);

            if (numero < 1000)
                return ConvertirMenorMil(numero);

            if (numero < 1000000)
                return ConvertirMillones(numero);

            throw new ArgumentOutOfRangeException("Número fuera de rango");
        }

        private static string ConvertirMenorCien(long numero)
        {
            if (numero < 30)
                return Unidades[numero];

            int decena = (int)(numero / 10);
            int unidad = (int)(numero % 10);
            return Decenas[decena] + (unidad > 0 ? " y " + Unidades[unidad] : "");
        }

        private static string ConvertirMenorMil(long numero)
        {
            int centena = (int)(numero / 100);
            int resto = (int)(numero % 100);
            return Centenas[centena] + (resto > 0 ? " " + ConvertirMenorCien(resto) : "");
        }

        private static string ConvertirMillones(long numero)
        {
            long millones = numero / 1000;
            long resto = numero % 1000;
            return ConvertirEntero(millones) + " mil" + (resto > 0 ? " " + ConvertirMenorMil(resto) : "");
        }
    }
}

export type Usuario = {
  codVendedor?: number;
  codUsuario: number;
  nombreUsuario?: string;
  alias?: string;
  empresas?: string;
  empresaDefecto?: string;
  editaPrecio: boolean;
  funcionesEspeciales: boolean;
  preciosPermitidos: string;
  permisos?: string[];
};

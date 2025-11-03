export type Cliente = {
  rucCliente: string;
  valueSelect: string;
  vendedor: number;
  precio: string;
};

export interface NuevoCliente {
  razon?: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
  contacto?: string;
  telefonoContacto?: string;
  correo?: string;
  ubigeo?: string;
  condicion?: string;
}

export type NuevoClienteRespuesta = {
  ok: boolean;
  message: string;
};

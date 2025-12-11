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

export interface ClienteApiResponse {
  razonSocial?: string; // Para RUC
  nombre?: string; // Para DNI (nombre_completo)
  nombreComercial?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  ubigeo?: string;
  estado?: string;
  condicion?: string;
  telefono?: string; // Teléfono del cliente
  contacto?: string; // Contacto del cliente
}

export interface ConsultaClienteResponse {
  existeEnBD: boolean;
  datosApi?: ClienteApiResponse;
  mensaje?: string;
}
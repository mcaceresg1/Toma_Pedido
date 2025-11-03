export interface Ubigeo {
  ubigeo: string;
  distrito: string;
  departamento: string;
  provincia: string;
}

export interface ModalUbigeoData {
  seleccionarUbigeo: (ubigeo: Ubigeo) => void;
}

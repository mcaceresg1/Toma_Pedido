export interface Ubigeo {
  ubigeo: string;
  distrito: string;
  departamento: string;
  provincia: string;
  zona?: string;
}

export interface ModalUbigeoData {
  seleccionarUbigeo: (ubigeo: Ubigeo) => void;
  filtroInicial?: string; // Filtro inicial para la búsqueda de ubigeo
}

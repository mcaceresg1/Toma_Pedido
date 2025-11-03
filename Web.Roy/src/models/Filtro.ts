export type FiltroPedidos = {
  busqueda: string;
  fechaInicio?: string;
  fechaFinal?: string;
  estado?: string;
};

export type FiltroProducto = {
  producto: string;
  codAlmacen?: number;
  clases?: string;
};

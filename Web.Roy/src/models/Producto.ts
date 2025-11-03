export type StockProducto = {
  codProducto: string;
  nombProducto: string;
  stock: number;
  reservado: number;
  almacen: number;
  precio1: number;
  precio2: number;
  precio3: number;
  precio4: string;
  precio5: string;
  correlacion1: number;
  correlacion2: number;
  correlacion3: number;
  correlacion4: string;
  correlacion5: string;
  totalPagina: number;
  totalReg: number;
  item: number;
  usaImpuesto: boolean;
  impuesto: number;
  precioEditable: boolean;
};

export type StockProductoReserva = StockProducto & {
  reservando_local: number;
  enLista: number;
  disponible: number;
  precio: number;
};

export type ModalStockData = {
  rucCliente: string;
  listaPrecio: string;
  agregarProducto: (producto: StockProductoReserva, cantidad: number) => void;
};

export type ProductoAgregado = {
  codProducto: string;
  descProducto: string;
  precio: number;
  cantidad: number;
  importe: number;
  igv: number;
  almacen: number;
};

export type ProductoNuevoPedido = {
  codProd: string;
  cantProd: number;
  preUnit: number;
  igv: number;
  preTot: number;
  numSec: number;
  impUnit: number;
  impTot: number;
  almacen: number;
  descripcion: string;
};

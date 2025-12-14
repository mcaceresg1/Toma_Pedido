import { ProductoNuevoPedido } from './Producto';

export type Pedido = {
  numPedido: string;
  fechaPedido: string;
  rucCliente: string;
  desCliente: string;
  dirCliente: string;
  moneda: string;
  abrMoneda: string;
  codVendedor: number;
  subtotal: number;
  igv: number;
  total: number;
  estado: string;
  totalPagina: number;
  totalReg: number;
  item: number;
  ordenCompra: string;
  factura: string;
  observaciones: string;
  condicion?: string;
  horaPedido?: string;
  montoLetras?: string;
  nombreVendedor?: string;
  condicionCli?: string;
  dirPed?: string;
  telefonoCli?: string;
  telefonoCliAux?: string;
  ubigeoCli?: string;
};

export type ProductoPedido = {
  codProducto: string;
  cantidad: number;
  precio: number;
  monto: number;
  tipo: string;
  almacen: number;
  descripcion: string;
  impuesto: number;
  base: number;
  codAlmacen: number;
  sku?: string;
};

export type NuevoPedido = {
  ruc: string;
  precio: string;
  moneda: string;
  subtotal: number;
  igv: number;
  total: number;
  productos: ProductoNuevoPedido[];
  observaciones: string;
  oc: string;
};

export type NuevoPedidoRespuesta = {
  ok: boolean;
  message: string;
};

export type ActualizarPedido = {
  subtotal: number;
  igv: number;
  total: number;
  productos: ProductoNuevoPedido[];
  observaciones: string;
  oc: string;
};

export interface HistoricoPedidoDetalle {
  idProducto: number;
  codigoBarra: string;
  descripcion: string;
  cantidad: number;
  medida: string;
  cantidadDespachada: number;
  unitario: number;
  total: number;
  descuento: number;
  utilidad: number;
  porcentaje: number;
}

export interface HistoricoPedidoCabecera {
  vendedor: string;
  operacion: number;
  fecha: string; // DateTime viene como string ISO, luego puedes convertir si quieres
  cliente: string;
  ruc?: string;
  referencia: string;
  total: number;
  simbolo: string;
  guia: string;
  factura: string;
  estado: string;
  aceptadaPorLaSunat: string;
  anu: boolean;
  orginal: number;
  despachada: number;
  detalles: HistoricoPedidoDetalle[];
  ubigeo?: string;
  zona?: string;
}


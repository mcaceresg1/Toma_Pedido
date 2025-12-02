import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ActualizarPedido,
  HistoricoPedidoCabecera,
  NuevoPedido,
  NuevoPedidoRespuesta,
  Pedido,
  ProductoPedido,
  HistoricoPedidoDetalle,
} from '../../../../models/Pedido';
import { FiltroPedidos, FiltroProducto } from '../../../../models/Filtro';
import {
  Cliente,
  NuevoCliente,
  NuevoClienteRespuesta,
} from '../../../../models/Cliente';
import { isNil, isEmpty } from 'lodash';
import { Moneda } from '../../../../models/Moneda';
import { StockProducto } from '../../../../models/Producto';
import { Condicion } from '../../../../models/Condicion';
import { Ubigeo } from '../../../../models/Ubigeo';
import { TipoDocumento } from '../../../../models/TipoDocumento';
import { Vendedor } from '../../../../models/Vendedor';
@Injectable({
  providedIn: 'root',
})
export class VentasService {
  private readonly URL = environment.api;
  reservas = signal<Map<string, number>>(new Map());
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  getIgv(): Observable<any> {
    const url = `${this.URL}pedidos/GetConfigEmpresa`;
    return this.http.get<any>(url);
  }

  getSelectProductos(): Observable<any> {
    const url = `${this.URL}pedidos/GetProductos`;
    return this.http.get<any>(url);
  }

  // getAllClientes(): Observable<any> {
  //   const url  = `${this.URL}pedidos/GetClientes`;
  //   return this.http.get<any>(url)
  // }
  separarReserva(producto: StockProducto, cantidad: number) {
    const map = this.reservas();
    map.set(producto.codProducto, cantidad);
    this.reservas.set(map);
  }

  resetReservas() {
    this.reservas.set(new Map());
  }

  listClientes = [
    {
      rucCliente: '123456789',
      valueSelect: 'Cliente 1',
      desc: 'Cliente 1',
      dir: '',
    },
    {
      rucCliente: '987654321',
      valueSelect: 'Cliente 2',
      desc: 'Cliente 2',
      dir: '',
    },
    {
      rucCliente: '456123789',
      valueSelect: 'Cliente 3',
      desc: 'Cliente 3',
      dir: '',
    },
  ];

  getSearchClientes(query: string): Observable<Cliente[]> {
    let url = `${this.URL}pedidos/GetClientes`;
    if (!isNil(query) && !isEmpty(query)) url += `?criterio=${query}`;
    return this.http.get<Cliente[]>(url);
    // console.log(this.listClientes);
    // return of(this.listClientes);
  }

  getSearchUbigeo(query: string): Observable<Ubigeo[]> {
    let url = `${this.URL}pedidos/BuscarUbigeo`;
    if (!isNil(query) && !isEmpty(query)) url += `?busqueda=${query}`;
    return this.http.get<Ubigeo[]>(url);
  }

  getCondiciones(): Observable<Condicion[]> {
    const url = `${this.URL}pedidos/GetCondicion`;
    return this.http.get<Condicion[]>(url);
  }

  crearCliente(cliente: NuevoCliente): Observable<NuevoClienteRespuesta> {
    let url = `${this.URL}pedidos/CrearCliente`;
    return this.http.post<NuevoClienteRespuesta>(url, cliente);
  }

  getMonedas(): Observable<Moneda[]> {
    const url = `${this.URL}pedidos/GetMonedas`;
    return this.http.get<Moneda[]>(url);
    // switch (tipo) {
    //   case 'MON':
    //     return of([
    //       { id: 'USD', value: 'Dólar Estadounidense' },
    //       { id: 'EUR', value: 'Euro' },
    //       { id: 'PEN', value: 'Sol Peruano' },
    //       { id: 'JPY', value: 'Yen Japonés' },
    //       { id: 'GBP', value: 'Libra Esterlina' },
    //       { id: 'CAD', value: 'Dólar Canadiense' },
    //       { id: 'AUD', value: 'Dólar Australiano' },
    //       { id: 'CNY', value: 'Yuan Chino' },
    //       { id: 'BRL', value: 'Real Brasileño' },
    //       { id: 'MXN', value: 'Peso Mexicano' },
    //     ]);
    //   default:
    //     return of(
    //       Array.from({ length: 50 }, (_, i) => ({
    //         id: `LIS${i.toString().padStart(2, '0')}`, // Ejemplo: LIS01, LIS02...
    //         value: `$${(Math.random() * 100).toFixed(2)}`,
    //       }))
    //     );
    // }
  }
  getTiposDocumento(): Observable<TipoDocumento[]> {
    const url = `${this.URL}pedidos/GetTiposDocumento`;
    return this.http.get<TipoDocumento[]>(url);
  }
  // prodPreciosData = Array.from({ length: 50 }, (_, i) => ({
  //   codProducto: `PROD${i.toString().padStart(3, '0')}`, // Ejemplo: PROD001, PROD002...
  //   unmProducto: `Unidad ${i}`, // Unidad de medida
  //   descProducto: `Descripción del producto ${i}`,
  //   precSoles: Math.random() * 100, // Precio en soles aleatorio
  //   precDolares: Math.random() * 30, // Precio
  // }));
  // getProdPrecios(codListaPrecios: string): Observable<any> {
  // const url = `${this.URL}pedidos/GetProdListaPrecios?codListaPrecios=${codListaPrecios}`;
  // return this.http.get<any>(url);
  //   return of(this.prodPreciosData);
  // }

  // stockPrueba = Array.from({ length: 50 }, (_, i) => ({
  //   codProducto: `P${i.toString().padStart(3, '0')}`, // Ejemplo: P001, P002...
  //   nombProducto: `Producto ${i}`,
  //   stock: Math.floor(Math.random() * 100), // Stock aleatorio entre 0 y 99
  //   almacen: `Almacén ${Math.ceil(i / 10)}`, // Distribuye en 5 almacenes
  // }));

  getAllStock(
    filtro: FiltroProducto,
    rucCliente: string,
    numPag: number,
    cantFilas: number
  ): Observable<StockProducto[]> {
    const url = `${this.URL}pedidos/GetStockProductos?rucCliente=${rucCliente}&numPag=${numPag}&allReg=0&cantFilas=${cantFilas}`;
    return this.http.post<StockProducto[]>(url, filtro);

    // let lista: any[];
    // console.log(filtro);

    // if (!!filtro.producto) {
    //   lista = this.stockPrueba.filter(
    //     (it) => it.codProducto.toLowerCase() === filtro.producto.toLowerCase()
    //   );
    // } else {
    //   const inicio = (numPag - 1) * cantFilas;
    //   const fin = inicio + cantFilas;
    //   lista = this.stockPrueba.slice(inicio, fin);
    // }
    // (lista[0] as any).totalReg = this.stockPrueba.length;

    // // Extraer el segmento correspondiente
    // return of(lista);
  }

  //TODO: Remover prueba
  // dataPrueba = Array.from({ length: 3 }, (_, i) => ({
  //   numPedido: `PED-${String(i + 1).padStart(3, '0')}`,
  //   fechaPedido: `2024-12-${String((i % 31) + 1).padStart(2, '0')}`,
  //   rucCliente: `20${Math.floor(10000000 + Math.random() * 90000000)}`,
  //   desCliente: `Cliente ${i + 1} S.A.`,
  //   dirCliente: i % 2 === 0 ? `Calle Ejemplo ${i + 1}, Ciudad Ejemplo` : null,
  //   moneda: i % 3 === 0 ? 'S/' : '$',
  //   subtotal: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
  //   igv: parseFloat((Math.random() * 200).toFixed(2)),
  //   total: parseFloat((Math.random() * 1200 + 200).toFixed(2)),
  //   nombEstado: ['Pendiente', 'Facturado', 'Enviado'][i % 3],
  //   classEstado: ['estado-pendiente', 'estado-facturado', 'estado-enviado'][
  //     i % 3
  //   ],
  //   estado: ['0', '1'][i % 2],
  //   detallePedido: [],
  // }));

  getAllPedidos(
    filtro: FiltroPedidos,
    numPag: number,
    cantFilas: number
  ): Observable<Pedido[]> {
    const url = `${this.URL}pedidos/GetPedidos?numPag=${numPag}&allReg=0&cantFilas=${cantFilas}`;

    return this.http.post<Pedido[]>(url, filtro);
    // let lista: any[];

    // if (!!filtro.busqueda) {
    //   lista = this.dataPrueba.filter(
    //     (it) =>
    //       it.numPedido.toLowerCase() === filtro.busqueda.toLowerCase() ||
    //       it.rucCliente.toLowerCase() === filtro.busqueda.toLowerCase() ||
    //       it.desCliente.toLowerCase() === filtro.busqueda.toLowerCase()
    //   );
    // } else {
    //   const inicio = (numPag - 1) * cantFilas;
    //   const fin = inicio + cantFilas;
    //   lista = this.dataPrueba.slice(inicio, fin);
    // }
    // (lista[0] as any).totalReg = this.dataPrueba.length;

    // // Extraer el segmento correspondiente
    // return of(lista);
  }

  getPedido(operacion: string): Observable<Pedido> {
    const url = `${this.URL}pedidos/GetPedido?operacion=${operacion}`;
    return this.http.post<Pedido>(url, null);
    // const item = this.dataPrueba.filter(
    //   (it) => it.numPedido === numPedido
    // )?.[0];
    // return of(item);
  }

  getPedidoProductos(operacion: string): Observable<ProductoPedido[]> {
    const url = `${this.URL}pedidos/GetPedidoProductos?operacion=${operacion}`;
    return this.http.post<ProductoPedido[]>(url, null);
    // const item = this.dataPrueba.filter(
    //   (it) => it.numPedido === numPedido
    // )?.[0];
    // return of(item);
  }

  savePedido(data: NuevoPedido): Observable<NuevoPedidoRespuesta> {
    const url = `${this.URL}pedidos/SavePedido`;
    return this.http.post<NuevoPedidoRespuesta>(url, data);
    // const cliente = this.listClientes.filter(
    //   (it) => it.rucCliente === data.rucCli
    // )[0];
    // this.dataPrueba.push({
    //   numPedido: `PED-${this.dataPrueba.length + 1}`,
    //   fechaPedido: `2020-12-06`,
    //   rucCliente: data.rucCli,
    //   desCliente: cliente.desc,
    //   dirCliente: cliente.dir,
    //   moneda: data.cdgMon,
    //   subtotal: data.impStot,
    //   igv: data.impTigv,
    //   total: data.impTtot,
    //   nombEstado: 'Pendiente',
    //   classEstado: 'estado-pendiente',
    //   estado: '0',
    //   detallePedido: data.detallePedido.map((it: any) => {
    //     return {
    //       codProducto: it.cdgProd,
    //       descProducto: 'Producto D',
    //       cantidad: it.canPprd,
    //       precio: it.preTot,
    //       importe: it.impTprd,
    //     };
    //   }),
    // });

    // return of({
    //   id: 'success',
    // });
  }
  updatePedido(
    operacion: string,
    data: ActualizarPedido
  ): Observable<NuevoPedidoRespuesta> {
    const url = `${this.URL}pedidos/UpdatePedido/${operacion}`;
    return this.http.put<NuevoPedidoRespuesta>(url, data);
  }

  getHistoricoPedidos(
    fechaInicio: string | null,
    fechaFin: string | null,
    vendedorId: number | null
  ): Observable<HistoricoPedidoCabecera[]> {
    let params = new HttpParams();
  
    // Solo agrega el parámetro si tiene valor
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
  
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }
  
    if (vendedorId && vendedorId !== 0) {
      params = params.set('vendedorId', vendedorId.toString());
    }
  
    return this.http.get<HistoricoPedidoCabecera[]>(`${this.URL}pedidos/GetHistoricoPedidos`, { params });
  }
  
  
  
  
  
  
  

  getHistoricoPedidosPorZona(
    fechaInicio: string | null,
    fechaFin: string | null,
    vendedorId: number | null,
    conDespacho: boolean | null = null
  ): Observable<HistoricoPedidoCabecera[]> {
    let params = new HttpParams();
  
    // Solo agrega el parámetro si tiene valor
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
  
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }
  
    if (vendedorId && vendedorId !== 0) {
      params = params.set('vendedorId', vendedorId.toString());
    }

    if (conDespacho !== null) {
      params = params.set('conDespacho', conDespacho.toString());
    }
  
    return this.http.get<HistoricoPedidoCabecera[]>(`${this.URL}pedidos/GetHistoricoPedidosPorZona`, { params });
  }

  getHistoricoPedidoDetalle(operacion: number): Observable<HistoricoPedidoDetalle[]> {
    const url = `${this.URL}pedidos/GetHistoricoPedidoDetalle?operacion=${operacion}`;
    return this.http.get<HistoricoPedidoDetalle[]>(url);
  }

  getVendedores(): Observable<Vendedor[]> {
    const url = `${this.URL}pedidos/GetVendedores`;
    console.log('URL de la petición:', url);
    return this.http.get<Vendedor[]>(url);
  }
  
  
}  


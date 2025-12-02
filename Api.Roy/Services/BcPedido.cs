namespace ApiRoy.Services
{
    using ApiRoy.Contracts;
    using ApiRoy.Models;
    using System;
    using System.Collections.Generic;

    public class BcPedido : IBcPedido
    {
        private readonly IDbPedido _dbPedido;

        private static readonly object _lockObject = new();

        public BcPedido(IDbPedido dbPedido)
        {
            _dbPedido = dbPedido;
        }

        public async Task<List<EcPedidos>> GetPedidos(EcFiltroPedido f, string usuario, int numPag, int allReg, int cantFilas)
        {
            try
            {
                var response = await _dbPedido.GetPedidos(f, usuario, numPag, allReg, cantFilas);
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<EcStockProductos>> GetStockProductos(EcFiltroProducto f, string usuario, string rucCliente, int numPag, int allReg, int cantFilas)
        {
            try
            {
                var response = await _dbPedido.GetStockProductos(f, usuario, rucCliente, numPag, allReg, cantFilas);
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<EcPedidos?> GetPedido(string usuario, string operacion)
        {
            try
            {
                var response = await _dbPedido.GetPedido(usuario, operacion);
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<EcProductoPedido>> GetPedidoProductos(string usuario, string operacion)
        {
            try
            {
                var response = await _dbPedido.GetPedidoProductos(usuario, operacion);
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        Task<EcConfiguracion> IBcPedido.GetConfigEmpresa()
        {
            throw new NotImplementedException();
        }

        public async Task<List<EcCliente>> GetClientes(string usuario, string criterio)
        {
            try
            {
                var response = await _dbPedido.GetClientes(usuario, criterio);
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task<List<EcCondicion>> ObtenerCondicion(string usuario)
        {
            try
            {
                var res = await _dbPedido.ObtenerCondicion(usuario);
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task<List<EcUbigeo>> ObtenerUbigeos(string usuario, string busqueda)
        {
            try
            {
                var res = await _dbPedido.ObtenerUbigeos(usuario, busqueda);
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task<int> CrearCliente(string usuario, EcNuevoCliente cliente)
        {
            try
            {
                var response = await _dbPedido.CrearCliente(usuario, cliente);
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<EcSelect>> GetMonedas()
        {
            try
            {
                var response = await _dbPedido.GetMonedas();
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task<List<EcTipoDoc>> GetTiposDocumento(string usuario)
        {
            try
            {
                var response = await _dbPedido.GetTiposDocumento(usuario);
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task<bool> SavePedido(string usuario, string maquina, EcNuevoPedido pedido)
        {
            try
            {
                var response = await _dbPedido.SavePedido(usuario, maquina, pedido);
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<bool> UpdatePedido(string usuario, string operacion, EcActualizarPedido pedido)
        {
            try
            {
                var response = await _dbPedido.UpdatePedido(usuario, operacion, pedido);
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        //public async Task<EcResponse> SavePedido(EcPedido f, string usuario)
        //{
        //    EcResponse resp = new EcResponse();
        //    //Obtenemos serie del usuario
        //    var getSerieUsuario = _context.USUARIOS.Where(x => x.COD_USUA == usuario).Select(i => i.SERIE).FirstOrDefault();
        //    var getNumPedido = await SigNumPed(getSerieUsuario);
        //    var getFecha = System.TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time"));
        //    var getHora = getFecha.Hour + ":" + getFecha.Minute + ":" + getFecha.Second;

        //    lock (_lockObject) // Bloquear el código crítico
        //    {
        //        using (var transaction = _context.Database.BeginTransaction())
        //        {
        //            try
        //            {
        //                var getCdgCpag = _context.M_CLIENT.Where(x => x.RUC_CLI == f.RucCli).Select(i => i.CDG_CPAG).FirstOrDefault();

        //                // Guardar M_PEDIDO
        //                M_PEDIDO cabPedido = new M_PEDIDO()
        //                {
        //                    NUM_PED = getNumPedido,
        //                    CDG_VEND = f.CdgVend,     // codigo vendedor
        //                    CDG_CPAG = getCdgCpag == null ? "" : getCdgCpag,// codigo condicion de pago
        //                    CDG_MON = f.CdgMon,      // codigo moneda
        //                    FEC_PED = getFecha,      // fecha del pedido
        //                    IMP_STOT = f.ImpStot,    // importe subtotal
        //                    IMP_TIGV = f.ImpTigv,    // importe igv
        //                    IMP_TDCT = 0,
        //                    IMP_TTOT = f.ImpTtot,    // importe total
        //                    POR_TDCT = 0,
        //                    POR_TIGV = f.PorTigv,    //  porcentaje igv
        //                    OBS_PED = "",
        //                    SWT_PED = "",
        //                    RUC_CLI = f.RucCli,      //  cliente
        //                    SWT_COT = 0,
        //                    SWT_IGV = 1,             // 1 si los precios por item ya incluyen igv
        //                    CDG_USR = usuario,       // el usuario q se loguea
        //                    HOR_USU = getHora,       // hora del pedido
        //                    IMP_ISC = 0,
        //                    CDG_LIST = f.CdgList     // digo lista de precios
        //                };

        //                _context.M_PEDIDO.Add(cabPedido);
        //                _context.SaveChanges();

        //                // Guardar D_PEDIDO
        //                if (f.DetallePedido != null && f.DetallePedido.Any())
        //                {
        //                    foreach (var d in f.DetallePedido)
        //                    {
        //                        D_PEDIDO itemPedido = new D_PEDIDO()
        //                        {
        //                            NUM_PED = getNumPedido,     // numero de pedido
        //                            CDG_PROD = d.CdgProd,       // codigo de producto
        //                            CAN_PPRD = d.CanPprd,       // cantidad de item
        //                            PRE_PPRD = d.PrePprd,       // precio unitario sin igv
        //                            DCT_PPRD = 0,
        //                            DCT_FIC = 0,
        //                            IGV_PPRD = d.IgvPprd,       // porcentaje igv
        //                            IMP_TPRD = d.ImpTprd,       // precio total (PRE_PPRD*CAN_PPRD)
        //                            CAN_DPRD = 0,
        //                            CAN_FPRD = 0,
        //                            OBS_PROD = "",
        //                            PRE_PROM = d.PrePprd,       // precio unitario sin igv
        //                            NUM_SEC = d.NumSec,         // nro de orden del item en el pedido
        //                            PRE_DOL = d.PreDol,         // precio unitario con Igv
        //                            PRE_TOT = d.PreTot,         // precio total con Igv (PRE_DOL*CAN_PPRD)
        //                        };
        //                        _context.D_PEDIDO.Add(itemPedido);
        //                    }

        //                    _context.SaveChanges();
        //                }

        //                // Guardar M_OPPED
        //                M_OPPED oped = new M_OPPED()
        //                {
        //                    NUM_PED = getNumPedido,
        //                    REF1 = "",
        //                    REF2 = "",
        //                    REF3 = "",
        //                    REF4 = "",
        //                    REF5 = 0,
        //                    REF6 = 0,
        //                    REF7 = 0,
        //                    SWT_FACT = ""
        //                };
        //                _context.M_OPPED.Add(oped);
        //                _context.SaveChanges();

        //                // Actualizar ultimo pedido T_DOCCLI
        //                var docCli = _context.T_DOCCLI.FirstOrDefault(x => x.CDG_TDOC == "000" && x.NUM_SER == "001");

        //                if (docCli != null)
        //                {
        //                    docCli.NUM_DOCU = getNumPedido;
        //                    _context.SaveChanges();
        //                }

        //                // Confirmar la transacción si todo se guarda exitosamente
        //                transaction.Commit();
        //                return new EcResponse() { Id = "success", Message = "Registro exitoso" };
        //            }
        //            catch (Exception ex)
        //            {
        //                resp = new EcResponse() { Id = "error", Message = ex.Message };
        //                throw new Exception(ex.Message, ex);
        //            }
        //        }
        //    }
        //}
        public async Task<List<EcHistoricoPedidoCabecera>> GetHistoricoPedidos(
            DateTime? fechaInicio = null,
            DateTime? fechaFin = null,
            int? vendedorId = null)
        {
            try
            {
                var cabeceras = await _dbPedido.GetHistoricoPedidosCabecera(fechaInicio, fechaFin, vendedorId);

                var tareasDetalles = cabeceras.Select(async cabecera =>
                {
                    var detalles = await _dbPedido.GetHistoricoPedidosDetalle(cabecera.Operacion);
                    cabecera.Detalles = detalles ?? new List<EcHistoricoPedidoDetalle>();
                });

                await Task.WhenAll(tareasDetalles);

                return cabeceras;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el histórico de pedidos completo", ex);
            }
        }

        public async Task<List<EcHistoricoPedidoCabecera>> GetHistoricoPedidosPorZona(
            DateTime? fechaInicio = null,
            DateTime? fechaFin = null,
            int? vendedorId = null,
            bool? conDespacho = null)
        {
            try
            {
                // Para pedidos por zona, NO cargamos los detalles
                var cabeceras = await _dbPedido.GetHistoricoPedidosPorZona(fechaInicio, fechaFin, vendedorId, conDespacho);
                return cabeceras;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener pedidos por zona", ex);
            }
        }

        public async Task<List<EcFiltroVendedor>> GetVendedores()
        {
            try
            {
                var response = await _dbPedido.GetVendedores();
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception("Error en capa negocio al obtener vendedores", ex);
            }
        }

    }
}

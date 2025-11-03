using ApiRoy.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiRoy.Controllers
{
    [ApiController]
    [Route("api/reporte")]
    public class ReporteController : Controller
    {
        private readonly IBcReporte _bcReporte;

        public ReporteController(
          IBcReporte bcReporte
          )
        {
            _bcReporte = bcReporte;
        }

        [Authorize]
        [HttpGet]
        [Route("GetProductosReport")]
        public async Task<IActionResult> GetProductosReport()
        {
            try
            {
                var response = await _bcReporte.GetProductosReport();
                return StatusCode(StatusCodes.Status200OK, response);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        [Authorize]
        [HttpGet]
        [Route("GetProveedorReport")]
        public async Task<IActionResult> GetProveedorReport()
        {
            try
            {
                var response = await _bcReporte.GetProveedorReport();
                return StatusCode(StatusCodes.Status200OK, response);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}

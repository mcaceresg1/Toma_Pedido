using System.Net;
using System.Text.Json;

namespace ApiRoy.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Habilitar buffering del request body para permitir múltiples lecturas
                // Esto es necesario cuando HttpLogging u otros middlewares leen el body
                if (context.Request.ContentLength > 0 && 
                    context.Request.ContentType?.Contains("application/json") == true)
                {
                    context.Request.EnableBuffering();
                }
                
                await _next(context);
            }
            catch (Exception exception)
            {
                await HandleExceptionAsync(context, exception);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var errorId = Guid.NewGuid().ToString();
            
            // Obtener información adicional del request para debugging
            var requestPath = context.Request.Path;
            var requestMethod = context.Request.Method;
            var contentType = context.Request.ContentType;
            var contentLength = context.Request.ContentLength;
            
            _logger.LogError(
                exception,
                "Error ID: {ErrorId} - Exception: {ExceptionType} - Message: {Message} - Path: {Path} - Method: {Method} - ContentType: {ContentType} - ContentLength: {ContentLength}",
                errorId,
                exception.GetType().Name,
                exception.Message,
                requestPath,
                requestMethod,
                contentType ?? "N/A",
                contentLength?.ToString() ?? "N/A");

            var statusCode = exception switch
            {
                ArgumentNullException => HttpStatusCode.BadRequest,
                ArgumentException => HttpStatusCode.BadRequest,
                InvalidOperationException => HttpStatusCode.BadRequest,
                UnauthorizedAccessException => HttpStatusCode.Unauthorized,
                KeyNotFoundException => HttpStatusCode.NotFound,
                Microsoft.AspNetCore.Server.Kestrel.Core.BadHttpRequestException => HttpStatusCode.BadRequest,
                _ => HttpStatusCode.InternalServerError
            };
            
            // Mensaje específico para BadHttpRequestException
            string errorMessage = exception.Message;
            if (exception is Microsoft.AspNetCore.Server.Kestrel.Core.BadHttpRequestException badRequestEx)
            {
                if (badRequestEx.Message.Contains("Unexpected end of request content") || 
                    badRequestEx.Message.Contains("Request body too large") ||
                    badRequestEx.Message.Contains("Invalid request"))
                {
                    errorMessage = "La solicitud está incompleta o mal formada. Por favor, verifique que el contenido JSON esté completo.";
                }
            }

            var response = new
            {
                success = false,
                message = statusCode == HttpStatusCode.InternalServerError
                    ? "Ha ocurrido un error interno del servidor"
                    : errorMessage,
                errorId = errorId,
                timestamp = DateTime.UtcNow
            };

            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";

            var jsonResponse = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(jsonResponse);
        }
    }
}


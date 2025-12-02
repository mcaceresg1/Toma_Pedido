using ApiRoy.Contracts;
using ApiRoy.ResourceAccess;
using ApiRoy.Services;
using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;
using Microsoft.Extensions.FileProviders;

namespace ApiRoy
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Configurar Serilog tempranamente
            Log.Logger = new LoggerConfiguration()
                .WriteTo.Console()
                .WriteTo.File("logs/api-.log", rollingInterval: RollingInterval.Day)
                .CreateBootstrapLogger();

            try
            {
                Log.Information("Iniciando aplicación");
                
                var builder = WebApplication.CreateBuilder(args);

                // Agregar Serilog
                builder.Host.UseSerilog((context, services, configuration) => configuration
                    .ReadFrom.Configuration(context.Configuration)
                    .ReadFrom.Services(services)
                    .Enrich.FromLogContext()
                    .WriteTo.Console()
                    .WriteTo.File(
                        path: "logs/api-.log",
                        rollingInterval: RollingInterval.Day,
                        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level:u3}] {Message:lj}{NewLine}{Exception}"));

            // Rate Limiting Configuration
            builder.Services.AddMemoryCache();
            builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
            builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
            builder.Services.AddInMemoryRateLimiting();
            builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

            builder.Services.AddHttpLogging(logging =>
            {
                logging.LoggingFields = HttpLoggingFields.All;

                logging.RequestBodyLogLimit = 4096;
                logging.ResponseBodyLogLimit = 4096;
            });


            // Add services to the container.
            // Configuramos JWT para que las apis se peudan acceder unicamente con el token
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    var secretKey = builder.Configuration["JWT:SECRET_KEY"] ?? throw new InvalidOperationException("JWT:SECRET_KEY no está configurado");
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidIssuer = builder.Configuration["JWT:Issuer"],
                        ValidAudience = builder.Configuration["JWT:Audience"]
                    };
                });


            builder.Services.AddControllers()
                .ConfigureApiBehaviorOptions(options =>
                {
                    // Personalizar respuesta de validación automática
                    options.InvalidModelStateResponseFactory = context =>
                    {
                        var errors = context.ModelState
                            .Where(e => e.Value?.Errors.Count > 0)
                            .Select(e => new
                            {
                                Field = e.Key,
                                Errors = e.Value?.Errors.Select(x => x.ErrorMessage).ToArray()
                            })
                            .ToList();

                        var result = new
                        {
                            success = false,
                            message = "Error de validación",
                            errors = errors,
                            timestamp = DateTime.UtcNow
                        };

                        return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(result);
                    };
                });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(setup =>
            {
                var jwtSecurityScheme = new OpenApiSecurityScheme
                {
                    BearerFormat = "JWT",
                    Name = "JWT Authentication",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = JwtBearerDefaults.AuthenticationScheme,
                    Description = "Colocar Token",

                    Reference = new OpenApiReference
                    {
                        Id = JwtBearerDefaults.AuthenticationScheme,
                        Type = ReferenceType.SecurityScheme
                    }
                };
                setup.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);
                setup.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtSecurityScheme, Array.Empty<string>() }
    });

            });

            //BdContext
            //builder.Services.AddSqlServer<UNIEntities>(builder.Configuration.GetConnectionString("OrgConnString"));

            //Mapeo IBc
            builder.Services.AddScoped<IBcLogin, BcLogin>();
            builder.Services.AddScoped<IBcPedido, BcPedido>();
            builder.Services.AddScoped<IBcUser, BcUser>();
            builder.Services.AddScoped<IBcReporte, BcReporte>();
            builder.Services.AddScoped<IBcZona, BcZona>();
            builder.Services.AddScoped<IBcUbigeo, BcUbigeo>();


            //Mapeo IDb
            builder.Services.AddScoped<IDbLogin, DbLogin>();
            builder.Services.AddScoped<IDbPedido, DbPedido>();
            builder.Services.AddScoped<IDbUser, DbUser>();
            builder.Services.AddScoped<IDbReporte, DbReporte>();
            builder.Services.AddScoped<IDbZona, DbZona>();
            builder.Services.AddScoped<IDbUbigeo, DbUbigeo>();

            // No se necesita registrar el middleware tradicional en Services

            //Health Checks
            string? connString = builder.Environment.IsDevelopment()
                ? builder.Configuration.GetConnectionString("DevConnStringDbLogin")
                : builder.Configuration.GetConnectionString("OrgConnStringDbLogin");
            
            builder.Services.AddHealthChecks()
                .AddSqlServer(connString ?? throw new InvalidOperationException("Connection string not configured"));

            //services cors
            builder.Services.AddCors(p => p.AddPolicy("AllowDevOrigin", policy =>
            {
                policy.WithOrigins("http://localhost:4200", "https://localhost:4200", "http://localhost:8080", "https://localhost:8080")
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials()
                      .SetIsOriginAllowedToAllowWildcardSubdomains();
            }));

            builder.Services.AddCors(p => p.AddPolicy("AllowProdOrigin", policy =>
            {
                policy
                    .WithOrigins("https://tp.nexwork-peru.com", "https://tk.nexwork-peru.com")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            }));

            var app = builder.Build();

            // Swagger solo en desarrollo
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            
            app.UseHttpLogging();
            
            // Global Exception Middleware debe ir primero para capturar todos los errores
            app.UseMiddleware<ApiRoy.Middleware.GlobalExceptionMiddleware>();

            if (app.Environment.IsProduction())
            {
                app.UseHttpsRedirection();
            }
            
            app.UseRouting();
            
            // Configurar archivos estáticos (logos de empresas)
            var publicPath = Path.Combine(Directory.GetCurrentDirectory(), "public");
            if (Directory.Exists(publicPath))
            {
                app.UseStaticFiles(new StaticFileOptions
                {
                    FileProvider = new PhysicalFileProvider(publicPath),
                    RequestPath = "/public"
                });
            }

            // CORS debe ir inmediatamente después de UseRouting
            if (app.Environment.IsProduction())
            {
                app.UseCors("AllowProdOrigin");
            }
            else
            {
                app.UseCors("AllowDevOrigin");
            }

            app.UseAuthentication();
            app.UseAuthorization();
            
            // Enable Rate Limiting Middleware (configurado para ignorar OPTIONS)
            app.UseIpRateLimiting();

            app.MapControllers();
            
            // Health Check Endpoints
            app.MapHealthChecks("/health");
            app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
            {
                Predicate = (check) => check.Tags.Contains("ready")
            });
            app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
            {
                Predicate = (_) => false
            });
            
            // Log de inicio completo
            Log.Information("═══════════════════════════════════════════════════════");
            Log.Information("✅ Backend API iniciado correctamente");
            Log.Information("🌐 URLs disponibles:");
            if (app.Environment.IsDevelopment())
            {
                Log.Information("   HTTP:  http://localhost:5070");
                Log.Information("   HTTPS: https://localhost:7281");
                Log.Information("   📚 Swagger: http://localhost:5070/swagger");
            }
            else
            {
                var appUrls = builder.Configuration["applicationUrl"] ?? "https://apitp.nexwork-peru.com";
                Log.Information("   Producción: {Urls}", appUrls);
            }
            Log.Information("🏥 Health Check: http://localhost:5070/health");
            Log.Information("═══════════════════════════════════════════════════════");
            
            app.Run();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "La aplicación terminó inesperadamente");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }
    }
}

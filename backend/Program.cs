using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Rentravel.Domain.Entities;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;
using System.Security.Claims;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicy = "FrontendPolicy";

// ---- CORS ----
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy.WithOrigins("https://localhost:3000", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// ---- Auth ----
var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>();
if (jwt is null || string.IsNullOrWhiteSpace(jwt.Key) || jwt.Key.Length < 32)
    throw new InvalidOperationException(
        "Jwt:Key tanımlı değil veya 32 karakterden kısa. appsettings.Development.json / appsettings.Production.json içine ekle.");

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton<IPasswordHasher<AdminUser>, PasswordHasher<AdminUser>>();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddSingleton<ImageService>();
builder.Services.AddSingleton<HtmlCleaner>();

builder.Services.AddScoped<MediaItemResolver>();
builder.Services.AddScoped<MediaUsageChecker>();
builder.Services.AddScoped<PriceOwnerChecker>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = "name"
        };
        options.Events = new JwtBearerEvents
        {
            // Token geçerli olsa bile kullanıcı pasife alınmış veya silinmişse reddet
            OnTokenValidated = async context =>
            {
                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                var isActive = Guid.TryParse(context.Principal?.FindFirstValue("sub"), out var userId)
                    && await db.AdminUsers.AnyAsync(x => x.Id == userId && x.IsActive,
                           context.HttpContext.RequestAborted);

                if (!isActive) context.Fail("Kullanıcı pasif veya silinmiş.");
            }
        };
    });

// Varsayılan: her endpoint giriş yapmış kullanıcı ister. Public olanlar .AllowAnonymous() ile açılır.
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Giriş: IP başına dakikada en fazla 5 deneme
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

builder.Services.AddFeatures(typeof(Program).Assembly);
builder.Services.AddOpenApi();

var app = builder.Build();

// await AdminSeeder.SeedAsync(app.Services, app.Configuration);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
}

app.UseHttpsRedirection();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        if (context.Context.Request.Path.StartsWithSegments("/uploads"))
            context.Context.Response.Headers.CacheControl = "public,max-age=31536000,immutable";
    }
});

// CORS middleware mutlaka RateLimiter, Authentication ve Authorization'dan önce çalışmalıdır
app.UseCors(CorsPolicy);

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapFeatures();

app.Run();
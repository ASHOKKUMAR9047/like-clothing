using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using FashionStore.Infrastructure.Data;
using FashionStore.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration (Dual Provider: PostgreSQL for free cloud Neon/Supabase or SQL Server or InMemory)
var provider = builder.Configuration["DatabaseProvider"] ?? "InMemory";
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<FashionStoreDbContext>(options =>
{
    if (provider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(connectionString))
    {
        options.UseNpgsql(connectionString);
    }
    else if (provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(connectionString))
    {
        options.UseSqlServer(connectionString);
    }
    else
    {
        // Safe in-memory database for zero-config local testing and seamless cloud verification
        options.UseInMemoryDatabase("MirayaCoutureDb");
    }
});

// 2. Dependency Injection
builder.Services.AddScoped<IRazorpayPaymentService, RazorpayPaymentService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// 3. Controllers
builder.Services.AddControllers();

// 4. CORS Policy (Dynamic origin allowance - no hardcoded IP addresses)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClientApps", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 5. JWT Authentication
var jwtKey = builder.Configuration["Jwt:SecretKey"] ?? "MirayaCoutureSecretKey2026BespokeLuxuryAtelier998877";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

// 6. Swagger / OpenAPI Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Miraya Couture API",
        Version = "v1",
        Description = "Production-grade RESTful API for Miraya Couture luxury Indian women's fashion platform with Razorpay checkout."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Seed Database at Startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FashionStoreDbContext>();
    await DbInitializer.SeedAsync(dbContext);
}

// 8. HTTP Pipeline
app.UseCors("AllowClientApps");
app.UseStaticFiles();

// Always enable Swagger for QA and front-end integration
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Miraya Couture API v1");
    c.RoutePrefix = "swagger";
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health Check
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    timestamp = DateTimeOffset.UtcNow,
    brand = "LIKE CLOTHING (喜欢) - UPDATE YOUR FASHION",
    version = "1.0.0"
}));

app.Run();

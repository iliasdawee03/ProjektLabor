using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ProjektLabor.Data;
using ProjektLabor.Services;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Accept enum values by their string names in JSON bodies (e.g. "Informatika").
// System.Text.Json by default expects numeric values for enums; enabling
// JsonStringEnumConverter makes model binding accept string names as well.
builder.Services.AddControllers().AddJsonOptions(opts =>
{
    opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();


builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<IJobService, JobService>();



var env = builder.Environment.EnvironmentName;

builder.Services.AddDbContext<AppDbContext>(options =>
{
    string connectionString;
    ServerVersion serverVersion;

    if (env == "DesignTime")
    {
        // Dummy érték csak migráció generáláshoz, nem csatlakozunk valódi DB-hez
        connectionString = "Server=localhost;Port=3306;Database=Dummy;User=dummy;Password=dummy;";
        serverVersion = new MySqlServerVersion(new Version(9, 0, 0));
    }
    else
    {
        connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                      ?? builder.Configuration["ConnectionStrings:DefaultConnection"]
                      ?? throw new InvalidOperationException("DefaultConnection is not configured");

        // Fix MySQL server verzió, hogy ne AutoDetect-tel próbáljon csatlakozni induláskor
        serverVersion = new MySqlServerVersion(new Version(9, 0, 1));
    }

    options.UseMySql(connectionString, serverVersion, mySqlOptions =>
    {
        mySqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(5), null);
        mySqlOptions.SchemaBehavior(MySqlSchemaBehavior.Ignore);
    });
});

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequiredLength = 6;
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var jwtKey = builder.Configuration.GetValue<string>("Jwt:Key") ?? throw new InvalidOperationException("Jwt:Key is not configured");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});
builder.Services.AddAuthorization(options => {
    options.AddPolicy("AdminPolicy", policy => policy.RequireRole("Admin"));
    options.AddPolicy("CompanyPolicy", policy => policy.RequireRole("Company"));
    options.AddPolicy("JobSeekerPolicy", policy => policy.RequireRole("JobSeeker"));
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Project API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter token",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        BearerFormat = "JWT",
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
            new string[] {}
        }
    });
});
var app = builder.Build();

app.UseSwagger();
using (var scope = app.Services.CreateScope())
{
    var dbcontext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Migrate (táblák létrehozása) retry-val – EnsureCreated nem használható migrációk megléte esetén
    const int maxAttempts = 10;
    for (int attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            await dbcontext.Database.MigrateAsync();
            break; // sikerült
        }
        catch (Exception) when (attempt < maxAttempts)
        {
            await Task.Delay(TimeSpan.FromSeconds(5));
        }
    }
    // Seeding: létrehozza szerepköröket, demo felhasználókat és mintákat.
    try
    {
        await DbSeeder.SeedAsync(app.Services);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Seeder hiba – az alkalmazás fut tovább szerepkörök nélkül.");
    }
}

app.UseHttpsRedirection();
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Project API v1"));
app.UseCors("AllowAllOrigins");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
AuthEndpoints.MapAuthEndpoints(app,builder.Configuration);
UserEndpoints.MapUserEndpoints(app);

app.Run();

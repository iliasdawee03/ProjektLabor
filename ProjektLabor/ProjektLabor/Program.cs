using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProjektLabor.Data;
using ProjektLabor.Services;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

using (var scope = app.Services.CreateScope())
{
    var dbcontext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbcontext.Database.Migrate();

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    if (!await roleManager.RoleExistsAsync("Admin"))
        await roleManager.CreateAsync(new IdentityRole("Admin"));
    if (!await roleManager.RoleExistsAsync("Company"))
        await roleManager.CreateAsync(new IdentityRole("Company"));
    if (!await roleManager.RoleExistsAsync("JobSeeker"))
        await roleManager.CreateAsync(new IdentityRole("JobSeeker"));
}

app.UseHttpsRedirection();
UserRegister.MapEndpoint(app);

app.Run();

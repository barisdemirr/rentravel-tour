using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // wwwroot/uploads için

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
using Microsoft.EntityFrameworkCore;
using TraceFlow.API.Models;

namespace TraceFlow.API.Data;

public class TraceFlowDbContext : DbContext
{
    public TraceFlowDbContext(DbContextOptions<TraceFlowDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Shipment> Shipments => Set<Shipment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = Guid.Parse("a1111111-1111-1111-1111-111111111111"),
                SKU = "SKU-SNEAKER-01",
                Name = "Air Runner Pro",
                AvailableQuantity = 50,
                UnitPrice = 120.00m,
                RowVersion = Guid.NewGuid()
            },
            new Product
            {
                Id = Guid.Parse("b2222222-2222-2222-2222-222222222222"),
                SKU = "SKU-JACKET-02",
                Name = "All-Weather Parka",
                AvailableQuantity = 20,
                UnitPrice = 250.00m,
                RowVersion = Guid.NewGuid()
            }
        );
    }
}
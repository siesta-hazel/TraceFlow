using System.ComponentModel.DataAnnotations;

namespace TraceFlow.API.Models;

public enum ShipmentStatus
{
    Pending = 1,
    Dispatched,
    InTransit,
    Delivered,
    Failed
}

public class Shipment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string TrackingNumber { get; set; } = string.Empty;

    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    public int Quantity { get; set; }

    public ShipmentStatus Status { get; set; } = ShipmentStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
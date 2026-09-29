namespace TraceFlow.API.Models;

public record CreateShipmentRequest(Guid ProductId, int Quantity);

public record UpdateShipmentStatusRequest(ShipmentStatus NewStatus);
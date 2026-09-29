using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TraceFlow.API.Data;
using TraceFlow.API.Models;

namespace TraceFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShipmentsController : ControllerBase
{
    private readonly TraceFlowDbContext _context;
    private readonly ILogger<ShipmentsController> _logger;

    public ShipmentsController(TraceFlowDbContext context, ILogger<ShipmentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Shipment>>> GetShipments()
    {
        return await _context.Shipments.Include(s => s.Product).AsNoTracking().ToListAsync();
    }

    [HttpPost]
    public async Task<IActionResult> CreateShipment([FromBody] CreateShipmentRequest request)
    {
        var product = await _context.Products.FindAsync(request.ProductId);
        if (product == null)
            return NotFound("Product not found.");

        if (product.AvailableQuantity < request.Quantity)
            return BadRequest($"Insufficient inventory stock. Available: {product.AvailableQuantity}");

        product.AvailableQuantity -= request.Quantity;

        var shipment = new Shipment
        {
            TrackingNumber = $"TRK-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            ProductId = product.Id,
            Quantity = request.Quantity,
            Status = ShipmentStatus.Pending
        };

        _context.Shipments.Add(shipment);

        try
        {
            await _context.SaveChangesAsync();

            _logger.LogInformation("INVENTORY DEDUCTION: Stock for SKU '{SKU}' reduced by {Qty}. Remaining: {Remaining}. Order Tracking Number: {TrackingNumber}",
                product.SKU, request.Quantity, product.AvailableQuantity, shipment.TrackingNumber);

            return CreatedAtAction(nameof(GetShipments), new { id = shipment.Id }, shipment);
        }
        catch (DbUpdateConcurrencyException)
        {
            _logger.LogWarning("CONCURRENCY CONFLICT: Multiple order requests modified SKU '{SKU}' simultaneously.", product.SKU);
            return Conflict("A inventory update conflict occurred. Please refresh stock and try again.");
        }
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateShipmentStatusRequest request)
    {
        var shipment = await _context.Shipments.FindAsync(id);
        if (shipment == null)
            return NotFound("Shipment not found.");

        var oldStatus = shipment.Status;
        shipment.Status = request.NewStatus;
        shipment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("STATUS UPDATE: Shipment '{TrackingNumber}' transitioned from {OldStatus} to {NewStatus}",
            shipment.TrackingNumber, oldStatus, request.NewStatus);

        return Ok(shipment);
    }
}
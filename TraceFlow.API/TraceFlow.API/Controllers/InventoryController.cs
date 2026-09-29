using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TraceFlow.API.Data;
using TraceFlow.API.Models;

namespace TraceFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly TraceFlowDbContext _context;
        private readonly ILogger<InventoryController> _logger;

        public InventoryController(TraceFlowDbContext context, ILogger<InventoryController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] Product product)
        {
            product.Id = Guid.NewGuid();
            product.RowVersion = Guid.NewGuid();

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("PRODUCT CREATED: SKU {SKU}", product.SKU);
            return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] Product updated)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.Name = updated.Name;
            product.SKU = updated.SKU;
            product.UnitPrice = updated.UnitPrice;
            product.AvailableQuantity = updated.AvailableQuantity;
            product.RowVersion = Guid.NewGuid();

            await _context.SaveChangesAsync();
            _logger.LogInformation("PRODUCT UPDATED: SKU {SKU}", product.SKU);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("PRODUCT DELETED: SKU {SKU}", product.SKU);
            return NoContent();
        }
    }
}
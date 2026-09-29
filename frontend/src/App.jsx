import { useState, useEffect } from 'react';

const API_BASE = "/api";

const STATUS_MAP = {
  0: { label: 'Created', color: 'bg-slate-600 text-slate-200 border-slate-500' },
  1: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  2: { label: 'Processing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  3: { label: 'In-Transit', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  4: { label: 'Delivered', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  5: { label: 'Cancelled', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' }
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    unitPrice: '',
    availableQuantity: ''
  });

  const loadData = async () => {
    try {
      const [resProducts, resShipments] = await Promise.all([
        fetch(`${API_BASE}/inventory`),
        fetch(`${API_BASE}/shipments`)
      ]);

      if (resProducts.ok) setProducts(await resProducts.json());
      if (resShipments.ok) setShipments(await resShipments.json());
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id || product.Id);
      setFormData({
        sku: product.sku || product.SKU || '',
        name: product.name || product.Name || '',
        unitPrice: product.unitPrice ?? product.UnitPrice ?? '',
        availableQuantity: product.availableQuantity ?? product.AvailableQuantity ?? ''
      });
    } else {
      setEditingId(null);
      setFormData({ sku: '', name: '', unitPrice: '', availableQuantity: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      sku: formData.sku,
      name: formData.name,
      unitPrice: parseFloat(formData.unitPrice),
      availableQuantity: parseInt(formData.availableQuantity, 10)
    };

    const url = editingId ? `${API_BASE}/inventory/${editingId}` : `${API_BASE}/inventory`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        handleCloseModal();
        await loadData();
      } else {
        alert("Operation failed. Check server logs.");
      }
    } catch (err) {
      console.error("Form submit error:", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE}/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) await loadData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleFulfillOrder = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (res.ok) await loadData();
    } catch (err) {
      console.error("Order fulfillment error:", err);
    }
  };

  const handleSetInTransit = async (shipmentId) => {
    try {
      const res = await fetch(`${API_BASE}/shipments/${shipmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus: 3 })
      });
      if (res.ok) await loadData();
    } catch (err) {
      console.error("Status patch error:", err);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📦</span>
            <h1 className="text-2xl font-bold tracking-wide">TraceFlow Logistics Center</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-emerald-600 hover:bg-emerald-500 transition-colors text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md flex items-center gap-2"
          >
            <span>+</span> Add Product
          </button>
        </header>

        <section className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Warehouse Stock</h2>
          
          {loading ? (
            <p className="text-slate-400 animate-pulse">Loading inventory...</p>
          ) : products.length === 0 ? (
            <p className="text-slate-400">No inventory found.</p>
          ) : (
            <div className="space-y-3">
              {products.map((p) => {
                const id = p.id || p.Id;
                const sku = p.sku || p.SKU;
                const name = p.name || p.Name;
                const qty = p.availableQuantity ?? p.AvailableQuantity;

                return (
                  <div key={id} className="flex justify-between items-center bg-slate-700/50 border border-slate-600/40 p-3 rounded-lg">
                    <div>
                      <span className="font-bold text-amber-400 font-mono">{sku}</span>
                      <span className="text-slate-300 mx-1">-</span>
                      <span className="font-medium">{name}</span>
                      <span className="ml-2 text-xs text-slate-400 font-mono">(Stock: {qty})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleFulfillOrder(id)} 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-semibold"
                      >
                        Fulfill 1
                      </button>
                      <button 
                        onClick={() => handleOpenModal(p)} 
                        className="bg-slate-600 hover:bg-slate-500 text-slate-200 px-2.5 py-1 rounded text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(id)} 
                        className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded text-xs font-semibold"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Shipment Trackers Section */}
        <section className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Shipment Trackers</h2>
          
          {loading ? (
            <p className="text-slate-400 animate-pulse">Loading shipments...</p>
          ) : shipments.length === 0 ? (
            <p className="text-slate-400">No active orders...</p>
          ) : (
            <div className="space-y-3">
              {shipments.map((s) => {
                const id = s.id || s.Id;
                const trackingNumber = s.trackingNumber || s.TrackingNumber;
                const status = s.status ?? s.Status;
                const badge = STATUS_MAP[status] || { label: `Status: ${status}`, color: 'bg-slate-600 text-slate-200 border-slate-500' };

                return (
                  <div key={id} className="flex justify-between items-center bg-slate-700/50 border border-slate-600/40 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-emerald-400 font-semibold">{trackingNumber}</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    {status !== 3 && status !== 4 && (
                      <button 
                        onClick={() => handleSetInTransit(id)} 
                        className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-md text-xs font-semibold"
                      >
                        Set In-Transit
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">SKU</label>
                <input 
                  type="text" 
                  required 
                  value={formData.sku} 
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Product Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Unit Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formData.unitPrice} 
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Stock</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.availableQuantity} 
                    onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
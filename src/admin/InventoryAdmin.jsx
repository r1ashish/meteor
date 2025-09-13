import React, { useEffect, useState } from 'react';

export default function InventoryAdmin() {
  const [items, setItems] = useState([]);
  const [threshold, setThreshold] = useState(95);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/inventory?lowStock=${threshold}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load inventory');
      setItems(json.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [threshold]);

  async function adjust(id, delta) {
    const res = await fetch('/api/admin/inventory', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ id, delta })
    });
    const json = await res.json();
    if (!json.success) return alert(json.error || 'Adjust failed');
    await load();
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">Inventory</h2>
        <label className="text-sm">Low-stock threshold</label>
        <input type="number" className="border px-2 py-1 w-24"
               value={threshold} onChange={e=>setThreshold(Number(e.target.value))} />
      </div>
      {loading && <div>Loading...</div>}
      {err && <div className="text-red-600">{err}</div>}
      <div className="grid gap-3">
        {items.map(p => (
          <div key={p.id} className="border p-3 rounded flex items-center gap-4">
            <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-600">Stock: {p.stock}</div>
              <div className="text-sm text-gray-600">Category: {p.category}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-2 py-1 border rounded" onClick={()=>adjust(p.id, -1)}>-1</button>
              <button className="px-2 py-1 border rounded" onClick={()=>adjust(p.id, +1)}>+1</button>
              <button className="px-2 py-1 border rounded" onClick={()=>adjust(p.id, +10)}>+10</button>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && <div>No low-stock items</div>}
      </div>
    </div>
  );
}

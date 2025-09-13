import React, { useEffect, useState } from 'react';

export default function InventoryAdmin() {
  const [items, setItems] = useState([]);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    try {
      setLoading(true);
      setErr('');
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
    try {
      const res = await fetch('/api/admin/inventory', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id, delta })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Adjust failed');
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  const filtered = items.filter(p => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-4" id="inventory">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Inventory</h2>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            className="border px-2 py-1 rounded w-24"
            value={threshold}
            onChange={e=>setThreshold(Number(e.target.value))}
            title="Low-stock threshold"
          />
          <input
            type="text"
            className="border px-2 py-1 rounded"
            placeholder="Search title/id/category"
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
          <button onClick={load} className="px-3 py-1 border rounded hover:bg-gray-50">Refresh</button>
        </div>
      </div>

      {err && <div className="text-red-600">{err}</div>}
      {loading && <div>Loading...</div>}

      <div className="grid gap-3">
        {filtered.map(p => (
          <div key={p.id} className="border p-3 rounded flex items-center gap-4">
            <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-600">ID: {p.id}</div>
              <div className="text-sm text-gray-600">Category: {p.category}</div>
              <div className={`text-sm mt-1 ${p.stock <= threshold ? 'text-red-600' : 'text-gray-800'}`}>
                Stock: {p.stock}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-2 py-1 border rounded" onClick={()=>adjust(p.id, -10)}>-10</button>
              <button className="px-2 py-1 border rounded" onClick={()=>adjust(p.id, -1)}>-1</button>
              <button className="px-2 py-1 border rounded" onClick={()=>adjust(p.id, +1)}>+1</button>
              <button className="px-2 py-1 border rounded" onClick={()=>adjust(p.id, +10)}>+10</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="text-sm text-gray-600">No items at or below threshold.</div>
        )}
      </div>
    </div>
  );
}

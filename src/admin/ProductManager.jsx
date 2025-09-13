import React, { useEffect, useState } from 'react';

export default function ProductManager() {
  const [data, setData]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]     = useState('');
  const [form, setForm]   = useState({
    id: '',
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    category: ''
  });

  async function load() {
    try {
      setLoading(true);
      setErr('');
      const res = await fetch('/api/products');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load products');
      setData(json.data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); },[]);

  async function createProduct(e) {
    e.preventDefault();
    setErr('');
    const body = {
      id: form.id || `prod-${Date.now()}`,
      title: form.title,
      description: form.description,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice || form.price),
      discount: '',
      image: form.image,
      stock: 100,
      category: form.category || 'general',
      status: 'active',
      tags: []
    };
    try {
      const res = await fetch('/api/products', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Create failed');
      setForm({ id:'', title:'', description:'', price:'', originalPrice:'', image:'', category:'' });
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function adjustStock(id, delta) {
    try {
      const res = await fetch('/api/admin/inventory', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id, delta })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Stock update failed');
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="p-6 space-y-6" id="products">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Manager</h1>
        <button onClick={load} className="px-3 py-1 border rounded hover:bg-gray-50">Refresh</button>
      </div>

      {err && <div className="text-red-600">{err}</div>}

      <form onSubmit={createProduct} className="grid grid-cols-1 md:grid-cols-3 gap-3 border p-4 rounded bg-white/70">
        <input className="border px-3 py-2 rounded" placeholder="ID (optional)" value={form.id} onChange={e=>setForm(f=>({...f, id:e.target.value}))}/>
        <input className="border px-3 py-2 rounded" placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} required/>
        <input className="border px-3 py-2 rounded" placeholder="Category" value={form.category} onChange={e=>setForm(f=>({...f, category:e.target.value}))}/>
        <input className="border px-3 py-2 rounded md:col-span-3" placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f, description:e.target.value}))}/>
        <input className="border px-3 py-2 rounded" placeholder="Price" type="number" value={form.price} onChange={e=>setForm(f=>({...f, price:e.target.value}))} required/>
        <input className="border px-3 py-2 rounded" placeholder="Original Price" type="number" value={form.originalPrice} onChange={e=>setForm(f=>({...f, originalPrice:e.target.value}))}/>
        <input className="border px-3 py-2 rounded md:col-span-3" placeholder="Image URL" value={form.image} onChange={e=>setForm(f=>({...f, image:e.target.value}))}/>
        <button className="px-4 py-2 bg-black text-white rounded md:col-span-3 hover:opacity-90">Add Product</button>
      </form>

      {loading && <div>Loading...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map(p => (
          <div key={p.id} className="border rounded p-4 flex gap-4 items-center">
            <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-600">₹ {p.price} <span className="line-through">₹ {p.originalPrice}</span></div>
              <div className="text-xs">{p.category}</div>
              <div className="text-sm mt-1">Stock: {p.stock}</div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="px-2 py-1 border rounded" onClick={()=>adjustStock(p.id, -1)}>-1</button>
              <button className="px-2 py-1 border rounded" onClick={()=>adjustStock(p.id, +1)}>+1</button>
              <button className="px-2 py-1 border rounded" onClick={()=>adjustStock(p.id, +10)}>+10</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

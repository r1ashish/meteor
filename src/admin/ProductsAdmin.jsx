import React, { useEffect, useState } from 'react';

export default function ProductsAdmin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/products');
    const json = await res.json();
    setData(json.data || []);
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Products</h2>
      {loading && <div>Loading...</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map(p => (
          <div key={p.id} className="border p-3 rounded flex gap-3 items-center">
            <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-600">₹ {p.price} <span className="line-through">₹ {p.originalPrice}</span></div>
              <div className="text-xs text-green-700">{p.discount}</div>
              <div className="text-sm">Stock: {p.stock}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
